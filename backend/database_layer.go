package main

func (handler *DatabaseHandler) AddPlant(
	user_id int,
	plant_name string,
	scientific_name string,
	species string,
	image_data string, // assuming base64 or similar encoded string
	image_mime string,
) (string, error) {
	query := `
        INSERT INTO Plants 
        (user_id, plant_name, scientific_name, species, image_data, image_mime)
        VALUES ($1, $2, $3, $4, $5::bytea, $6)
    `
	// Cast image_data to bytea for PostgreSQL; adjust if you use raw bytes instead of string.
	_, err := handler.Db.Exec(query, user_id, plant_name, scientific_name, species, image_data, image_mime)
	if err != nil {
		return "Failed to add plant", err
	}
	return "Plant added successfully", nil
}
