package main

import (
	"fmt"
	"net/http"
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
		ImageURL string `json:"image_url" binding:"required"`
	}

	var req AddPlantRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	fmt.Println("Received image URL:", req.ImageURL)

	// Since image_url is a plain URL string, no decoding needed.
	// Call your DB handler to store the plant data, passing image URL as string.
	// For testing, user_id is hardcoded as 1; replace with extracted userID in prod.
	plant_name := "test_plant_name"
	scientific_name := "test_scientific_name"
	species := "test_species"
	plant_pet_name := "Example Name"

	msg, err := Handler.AddPlant(
		userID, // user_id
		plant_name,
		scientific_name,
		species,
		req.ImageURL, // image URL instead of binary data
		plant_pet_name,
		65,
	)
	if err != nil {
		fmt.Println(msg)
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
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
	fmt.Println("AUTHHEADER", authHeader)
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	fmt.Println("TOKENSTRING", tokenString)
	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	fmt.Println("USERID", userID)
	plants, err := Handler.FetchPlants(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plants": plants})

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

	fmt.Println("Updating plant ID:", plant_id, "with new pet name:", newPetName)

	msg, err := Handler.UpdatePlantPetName(userID, plant_id, newPetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant pet name", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": msg})
}

func HandleUpdatePrevSchedule(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	schedule, err := Handler.GetCompletedPreviousTasks(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Could not fetch completed previous tasks"})
		return
	}

	for _, task := range schedule {
		_, err := Handler.CreateNewSchedule(userID, task.PlantID, task.WaterRepeatEvery, task.WaterRepeatUnit, task.PlantPetName)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Could not create schedule"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func HandleFetchSchedule(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	fmt.Println("AUTHHEADER", authHeader)
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	fmt.Println("TOKENSTRING", tokenString)
	userID, err := ExtractIDFromJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	fmt.Println("USERID", userID)
	plants, err := Handler.FetchSchedule(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plants": plants})
}
