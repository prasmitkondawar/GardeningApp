package main

import (
	"database/sql"
	"fmt"
	"time"
)

func (handler *DatabaseHandler) AddPlant(
	user_id string,
	plant_name string,
	scientific_name string,
	species string,
	image_url string,
	plant_pet_name string,
	plant_health int,
) (int, error) {
	insertQuery := `
		WITH plant_count AS (
			SELECT COUNT(*) AS count FROM plants WHERE user_id = $1
		),
		insert_if_under_limit AS (
			INSERT INTO plants (user_id, plant_name, scientific_name, species, image_url, plant_pet_name, plant_health)
			SELECT $1, $2, $3, $4, $5, $6, $7
			FROM plant_count
			WHERE plant_count.count < 5
			RETURNING plant_id  -- Assumes 'id' is your PK column
		)
		SELECT plant_id FROM insert_if_under_limit;
	`

	var plantID int // Change type to int if your 'id' is integer
	err := handler.Db.QueryRow(insertQuery, user_id, plant_name, scientific_name, species, image_url, plant_pet_name, plant_health).Scan(&plantID)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return 0, err
	}

	return plantID, nil
}

type Plant struct {
	PlantID        int    `json:"plant_id"`
	PlantName      string `json:"plant_name"`
	ScientificName string `json:"scientific_name"`
	Species        string `json:"species"`
	ImageURL       string `json:"image_url"`
	PlantPetName   string `json:"plant_pet_name"`
	PlantHealth    int    `json:"plant_health"`
}

func (handler *DatabaseHandler) FetchPlants(user_id string) ([]Plant, error) {
	query :=
		`SELECT plant_id, plant_name, scientific_name, species, image_url, plant_pet_name, plant_health
	FROM plants
	WHERE user_id = $1`

	rows, err := handler.Db.Query(query, user_id)
	if err != nil {
		fmt.Println("1", err)
		return nil, fmt.Errorf("failed to fetch plants: %w", err)
	}
	defer rows.Close()

	var plants []Plant
	for rows.Next() {
		var plant Plant
		err := rows.Scan(&plant.PlantID, &plant.PlantName, &plant.ScientificName, &plant.Species, &plant.ImageURL, &plant.PlantPetName, &plant.PlantHealth)
		if err != nil {
			fmt.Println("2", err)
			return nil, fmt.Errorf("failed to scan plant: %w", err)
		}
		plants = append(plants, plant)
	}

	return plants, nil
}

type ScheduleDisplay struct {
	ScheduleID       int       `json:"schedule_id"`
	PlantID          int       `json:"plant_id"`
	PlantPetName     string    `json:"plant_pet_name"`
	WateringDate     time.Time `json:"watering_date"`
	NextWateringDate time.Time `json:"next_watering_date"`
	WaterIsCompleted bool      `json:"water_is_completed"`
}

func (handler *DatabaseHandler) FetchSchedule(user_id string) ([]ScheduleDisplay, error) {
	query :=
		`SELECT schedule_id, plant_id, plant_pet_name, water_is_completed, watering_date, next_watering_date
	FROM schedule
	WHERE user_id = $1
	AND (
		DATE(watering_date) = CURRENT_DATE
		OR
		DATE(next_watering_date) <= CURRENT_DATE
	)
	`

	rows, err := handler.Db.Query(query, user_id)
	if err != nil {
		fmt.Println("1", err)
		return nil, fmt.Errorf("failed to fetch schedules: %w", err)
	}
	defer rows.Close()

	var schedules []ScheduleDisplay
	for rows.Next() {
		var schedule ScheduleDisplay
		err := rows.Scan(&schedule.ScheduleID, &schedule.PlantID, &schedule.PlantPetName, &schedule.WaterIsCompleted, &schedule.WateringDate, &schedule.NextWateringDate)
		if err != nil {
			fmt.Println("2", err)
			return nil, fmt.Errorf("failed to scan schedule: %w", err)
		}
		schedules = append(schedules, schedule)
	}

	return schedules, nil
}

func (handler *DatabaseHandler) LengthPlants(user_id string) (bool, error) {
	var count int
	query := "SELECT COUNT(*) FROM plants WHERE user_id = $1"

	err := handler.Db.QueryRow(query, user_id).Scan(&count)
	if err != nil {
		return false, err
	}

	return count < 5, nil
}

func (handler *DatabaseHandler) UpdatePlantPetName(user_id string, plant_id int, new_pet_name string) (string, error) {
	tx, err := handler.Db.Begin()
	if err != nil {
		return "", fmt.Errorf("failed to begin transaction: %v", err)
	}

	var updatedPetName string

	// Step 1: Update plants table
	updatePlantsQuery := `
        UPDATE plants
        SET plant_pet_name = $3
        WHERE user_id = $1 AND plant_id = $2
        RETURNING plant_pet_name
    `
	err = tx.QueryRow(updatePlantsQuery, user_id, plant_id, new_pet_name).Scan(&updatedPetName)
	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("plant with ID %d not found for user %s", plant_id, user_id)
		}
		return "", fmt.Errorf("error updating plants table: %v", err)
	}

	// Step 2: Update schedule table
	updateScheduleQuery := `
        UPDATE schedule
        SET plant_pet_name = $3
        WHERE user_id = $1 AND plant_id = $2
    `
	_, err = tx.Exec(updateScheduleQuery, user_id, plant_id, new_pet_name)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("error updating schedule table: %v", err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return "", fmt.Errorf("failed to commit transaction: %v", err)
	}

	return updatedPetName, nil
}

func (handler *DatabaseHandler) CompleteWaterSchedule(user_id string, schedule_id int) (string, error) {
	query := `
		WITH previous AS (
			SELECT water_is_completed, water_repeat_every, water_repeat_unit 
			FROM schedule 
			WHERE user_id = $1 AND schedule_id = $2
		)
		UPDATE schedule
			SET 
			water_is_completed = NOT water_is_completed,
			next_watering_date = CASE 
				WHEN (SELECT water_is_completed FROM previous) = false THEN CURRENT_DATE + (SELECT water_repeat_every || ' ' || water_repeat_unit FROM previous)::interval
				ELSE next_watering_date
			END,
			watering_date = CASE
				WHEN (SELECT water_is_completed FROM previous) = false THEN CURRENT_DATE
				ELSE watering_date
			END
		WHERE user_id = $1 AND schedule_id = $2;

    `

	_, err := handler.Db.Exec(query, user_id, schedule_id)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return "Failed to check plant", err
	}

	return "Plant checked successfully", nil
}

type NewSchedule struct {
	ScheduleID       int       `json:"schedule_id"`
	PlantID          int       `json:"plant_id"`
	PlantPetName     string    `json:"plant_pet_name"`
	WaterRepeatEvery int       `json:"water_repeat_every"`
	WaterRepeatUnit  string    `json:"water_repeat_unit"`
	WateringDate     time.Time `json:"water_date"`
}

func (handler *DatabaseHandler) CreateNewSchedule(
	user_id string,
	plant_id int,
	plant_pet_name string,
	water_repeat_every int,
	water_repeat_unit string,
) (string, error) {

	// SQL query: use $6 for string version of water_repeat_every to avoid type conflicts
	query := `
        INSERT INTO schedule (
            user_id,
            plant_id,
            plant_pet_name,
            water_is_completed,
            water_repeat_every,
            water_repeat_unit,
            watering_date,
            next_watering_date
        )

        VALUES ($1, $2, $3, false, $4, $5, CURRENT_DATE, CURRENT_DATE)
    `

	// Execute query with parameters, passing waterRepeatEveryStr as $6
	_, err := handler.Db.Exec(query, user_id, plant_id, plant_pet_name, water_repeat_every, water_repeat_unit)
	if err != nil {
		return "", fmt.Errorf("failed to create schedule: %v", err)
	}

	return "Schedule created successfully", nil
}

func (handler *DatabaseHandler) DeletePlant(user_id string, plant_id int) (string, error) {
	tx, err := handler.Db.Begin()
	if err != nil {
		return "", fmt.Errorf("failed to start transaction: %v", err)
	}

	defer tx.Rollback()

	// Delete from schedule where plant_id matches
	_, err = tx.Exec("DELETE FROM schedule WHERE user_id = $1 AND plant_id = $2", user_id, plant_id)
	if err != nil {
		return "", fmt.Errorf("failed to delete from schedule: %v", err)
	}

	// Delete from plants where user_id and plant_id match
	result, err := tx.Exec("DELETE FROM plants WHERE user_id = $1 AND plant_id = $2", user_id, plant_id)
	if err != nil {
		return "", fmt.Errorf("failed to delete from plants: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return "", fmt.Errorf("unable to check rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return "", fmt.Errorf("no plant found for given user and plant_id")
	}

	err = tx.Commit()
	if err != nil {
		return "", fmt.Errorf("failed to commit transaction: %v", err)
	}

	return "Plant deleted successfully", nil
}

func (handler *DatabaseHandler) UpdatePlantPhoto(user_id string, plant_id int, new_image_path string) (string, error) {
	query := `
        UPDATE plants
        SET image_url = $3
        WHERE user_id = $1 AND plant_id = $2
    `

	// Execute the update query with the parameters
	_, err := handler.Db.Exec(query, user_id, plant_id, new_image_path)
	if err != nil {
		return "", err
	}

	return "Plant photo updated successfully", nil
}
