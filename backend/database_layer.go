package main

import "fmt"

func (handler *DatabaseHandler) AddPlant(
	user_id int,
	plant_name string,
	scientific_name string,
	species string,
	image_url string,
) (string, error) {
	query := `
        INSERT INTO Plants 
        (user_id, plant_name, scientific_name, species, image_url)
        VALUES ($1, $2, $3, $4, $5)
    `
	_, err := handler.Db.Exec(query, user_id, plant_name, scientific_name, species, image_url)
	if err != nil {
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
