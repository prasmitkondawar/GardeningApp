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
