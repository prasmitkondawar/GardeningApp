package main

import "fmt"

func (handler *DatabaseHandler) AddPlant(
	user_id int,
	plant_name string,
	scientific_name string,
	species string,
	image_url string,
) (string, error) {
	// Step 3: Insert new plant if under limit
	insertQuery := `
        INSERT INTO plants 
        (user_id, plant_name, scientific_name, species, image_url)
        VALUES ($1, $2, $3, $4, $5)
    `
	_, err := handler.Db.Exec(insertQuery, user_id, plant_name, scientific_name, species, image_url)
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
	ImageData      string `json:"image_data"`
	ImageMime      string `json:"image_mime"`
}

func (handler *DatabaseHandler) FetchPlants(user_id int) ([]Plant, error) {
	query :=
		`SELECT plant_id, plant_name, scientific_name, species, image_data, image_mime
	FROM plants
	WHERE user_id = $1`

	rows, err := handler.Db.Query(query, user_id)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch todos: %w", err)
	}
	defer rows.Close()

	var plants []Plant
	for rows.Next() {
		var plant Plant
		err := rows.Scan(&plant.PlantID, &plant.PlantName, &plant.ScientificName, &plant.Species, &plant.ImageData, &plant.ImageMime)
		if err != nil {
			return nil, fmt.Errorf("failed to scan todo: %w", err)
		}
		plants = append(plants, plant)
	}

	return plants, nil
}

func (handler *DatabaseHandler) LengthPlants(user_id int) (bool, error) {
	var count int
	query := "SELECT COUNT(*) FROM plants WHERE user_id = $1"

	err := handler.Db.QueryRow(query, user_id).Scan(&count)
	if err != nil {
		return false, err
	}

	return count < 5, nil
}
