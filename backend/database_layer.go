package main

import "fmt"

func (handler *DatabaseHandler) AddPlant(
	user_id string,
	plant_name string,
	scientific_name string,
	species string,
	image_url string,
	plant_pet_name string,
	plant_health int,
) (string, error) {
	// Step 3: Insert new plant if under limit
	insertQuery := `
        INSERT INTO plants 
        (user_id, plant_name, scientific_name, species, image_url, plant_pet_name, plant_health)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

	_, err := handler.Db.Exec(insertQuery, user_id, plant_name, scientific_name, species, image_url, plant_pet_name, plant_health)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return "Failed to add plant", err
	}

	return "Plant added successfully", nil
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

func (handler *DatabaseHandler) FetchPlants(user_id int) ([]Plant, error) {
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

func (handler *DatabaseHandler) LengthPlants(user_id string) (bool, error) {
	var count int
	query := "SELECT COUNT(*) FROM plants WHERE user_id = $1"

	err := handler.Db.QueryRow(query, user_id).Scan(&count)
	if err != nil {
		return false, err
	}

	return count < 5, nil
}

func (handler *DatabaseHandler) UpdatePlantPetName(user_id int, plant_id int, new_plant_pet_name string) (string, error) {
	query := "UPDATE plants SET plant_pet_name = $3 WHERE user_id = $1 AND plant_id = $2"

	_, err := handler.Db.Exec(query, user_id, plant_id, new_plant_pet_name)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return "Failed to change plant pet name", err
	}
	return "Changed plant pet name", nil
}

type ScheduleDisplay struct {
	PlantID      int    `json:"plant_id"`
	PlantPetName string `json:"plant_pet_name"`
	IsCompleted  bool   `json:"is_completed"`
}

func (handler *DatabaseHandler) FetchSchedule(user_id int) ([]ScheduleDisplay, error) {
	query := `
    SELECT plant_id, plant_pet_name, water_is_completed
    FROM schedule
    WHERE user_id = $1
    AND due_date = CURRENT_DATE
	`

	rows, err := handler.Db.Query(query, user_id)
	if err != nil {
		fmt.Println("1", err)
		return nil, fmt.Errorf("failed to fetch schedule: %w", err)
	}
	defer rows.Close()

	var total_schedule []ScheduleDisplay
	for rows.Next() {
		var schedule ScheduleDisplay
		err := rows.Scan(&schedule.PlantID, &schedule.PlantPetName, &schedule.IsCompleted)
		if err != nil {
			fmt.Println("2", err)
			return nil, fmt.Errorf("failed to scan plant: %w", err)
		}
		total_schedule = append(total_schedule, schedule)
	}

	return total_schedule, nil
}

func (handler *DatabaseHandler) CompleteWaterSchedule(user_id int, schedule_id int) (string, error) {
	query := `
	UPDATE schedule
	SET water_is_completed = NOT water_is_completed
	WHERE user_id = $1 AND schedule_id = $2
	`

	_, err := handler.Db.Exec(query, user_id, schedule_id)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return "Failed to check plant", err
	}

	return "Plant checked successfully", nil
}

type NewSchedule struct {
	PlantID          int    `json:"plant_id"`
	PlantPetName     string `json:"plant_pet_name"`
	WaterRepeatEvery int    `json:"water_repeat_every"`
	WaterRepeatUnit  string `json:"water_repeat_unit"`
}

func (handler *DatabaseHandler) GetCompletedPreviousTasks(user_id int) (string, error) {
	query := `
	SELECT plant_pet_name, water_repeat_every, water_repeat_unit FROM schedule
	WHERE user_id = $1
	AND is_completed = True
	AND due_date = CURRENT_DATE - INTERVAL '1 day'
	`

	_, err := handler.Db.Exec(query, user_id)
	if err != nil {
		fmt.Println("ERROR inserting plant:", err)
		return "Failed to check plant", err
	}

	return "Plant checked successfully", nil
}

func (handler *DatabaseHandler) CreateNewSchedule(
	user_id int,
	plant_id int,
	water_repeat_every int,
	water_repeat_unit string,
	plant_pet_name string,
) (string, error) {

	// Step 1: Build SQL interval string (e.g., '3 days', '2 weeks')
	// It's safer to pass both values separately to avoid SQL injection
	interval := fmt.Sprintf("%d %s", water_repeat_every, water_repeat_unit)

	// Step 2: Insert into schedule with next due date
	query := `
        INSERT INTO schedule (
            user_id,
            plant_id,
            plant_pet_name,
            due_date,
            is_completed
        )
        VALUES ($1, $2, $3, CURRENT_DATE + $4::interval, false)
    `

	// Step 3: Execute
	_, err := handler.Db.Exec(query, user_id, plant_id, plant_pet_name, interval)
	if err != nil {
		return "", fmt.Errorf("failed to create schedule: %v", err)
	}

	return "Schedule created successfully", nil
}

func (handler *DatabaseHandler) DeletePlant(user_id int, plant_id int) error {
	query := `
        DELETE FROM plants
        WHERE user_id = $1 AND plant_id = $2
    `

	result, err := handler.Db.Exec(query, user_id, plant_id)
	if err != nil {
		return fmt.Errorf("failed to delete plant: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("unable to check rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no plant found for given user and plant_id")
	}

	return nil
}
