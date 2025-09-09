package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func HandleAddPlant(c *gin.Context) {
	// You can uncomment JWT handling if needed:
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	fmt.Println("User ID from JWT:", userID)

	// Define input struct accepting image_url and other plant fields
	type AddPlantRequest struct {
		ImageURL  string `json:"image_url" binding:"required"`
		PlantName string `json:"plant_pet_name" binding:"required"`
	}

	var req AddPlantRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	fmt.Println("Received image URL:", req.ImageURL)

	openaiAPIKey := os.Getenv("OPENAI_API_KEY")
	log.Println("Debug - HandleAddPlant - OPENAI_API_KEY exists:", openaiAPIKey != "")
	log.Println("Debug - Current working directory:", os.Getenv("PWD"))
	log.Println("Debug - All environment variables:")
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "OPENAI_") || strings.HasPrefix(env, "GIN_") {
			log.Println(env)
		}
	}

	if openaiAPIKey == "" {
		log.Println("Error: OPENAI_API_KEY is not set in environment variables")
	}

	// // Classify the plant using OpenAI
	fmt.Println("Classifying plant with OpenAI...")
	classification, err := classifyPlantWithOpenAI(req.ImageURL, openaiAPIKey)
	if err != nil {
		fmt.Printf("OpenAI classification failed: %v\n", err)
		// Fall back to default values if classification fails
		classification = &PlantClassification{
			PlantName:        "Unknown Plant",
			ScientificName:   "Unknown Species",
			Species:          "Unknown",
			WaterRepeatEvery: 1,
			WaterRepeatUnit:  "day",
			PlantHealth:      100,
		}
	}

	fmt.Printf("Classification result: %+v\n", classification)

	plant_id, err := Handler.AddPlant(
		userID,
		classification.PlantName,      // Use AI-identified name
		classification.ScientificName, // Use AI-identified scientific name
		classification.Species,        // Use AI-identified species
		req.ImageURL,
		req.PlantName,              // Generate a pet name based on the plant name
		classification.PlantHealth, // Default health value
	)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	msg, err := Handler.CreateNewSchedule(userID, plant_id, req.PlantName, classification.WaterRepeatEvery, classification.WaterRepeatUnit)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": msg,
	})
}

func ExtractIDFromJWT(jwtToken string) (string, error) {
	// Parse the JWT without verifying (for demo - for production always verify)
	token, _, err := new(jwt.Parser).ParseUnverified(jwtToken, jwt.MapClaims{})
	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if sub, ok := claims["sub"].(string); ok {
			return sub, nil // This is the Supabase user ID
		}
	}

	return "", fmt.Errorf("user id (sub) not found in token")
}

func HandleFetchPlants(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	plants, err := Handler.FetchPlants(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plants": plants})
}

func HandleFetchSchedule(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	schedules, err := Handler.FetchSchedule(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"schedule": schedules})
}

func HandleCanAddPlant(c *gin.Context) {
	// You can uncomment JWT handling if needed:

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	fmt.Println("User ID from JWT:", userID)

	msg, err := Handler.LengthPlants(
		"1",
	)
	if err != nil {
		fmt.Println(msg)
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"can add plants": msg,
	})
}

func HandleUpdatePlantPetName(c *gin.Context) {
	// You can uncomment JWT handling if needed:
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		print("ERROR", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}

	var request struct {
		PlantID    int    `json:"plant_id" binding:"required"`
		NewPetName string `json:"plant_pet_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	plant_id := request.PlantID
	newPetName := request.NewPetName
	print("TESTING", plant_id, newPetName)

	msg, err := Handler.UpdatePlantPetName(userID, plant_id, newPetName)
	if err != nil {
		print("ERROR", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant pet name", "details": err.Error()})
		return
	}
	print("MSG", msg)

	c.JSON(http.StatusOK, gin.H{"message": msg})
}

func HandleCompleteSchedule(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}

	var request struct {
		ScheduleID       int    `json:"schedule_id" binding:"required"`
		WaterRepeatEvery int    `json:"water_repeat_every" binding:"required"`
		WaterRepeatUnit  string `json:"water_repeat_unit" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	schedule_id := request.ScheduleID
	water_repeat_every := request.WaterRepeatEvery
	water_repeat_unit := request.WaterRepeatUnit

	msg, err := Handler.CompleteWaterSchedule(userID, schedule_id, water_repeat_every, water_repeat_unit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant pet name", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": msg})
}

func HandleDeletePlant(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}

	var request struct {
		PlantID int `json:"plant_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		print(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	plant_id := request.PlantID

	msg, err := Handler.DeletePlant(userID, plant_id)
	if err != nil {
		print(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant pet name", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": msg})
}
