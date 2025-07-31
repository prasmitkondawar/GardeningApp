package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleAddPlant(c *gin.Context) {
	// You can uncomment JWT handling if needed:
	/*
	   jwtToken := c.GetHeader("JWT_Token")
	   if jwtToken == "" {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
	       return
	   }

	   userID, err := ExtractIDFromJWT(jwtToken)
	   if err != nil {
	       c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
	       return
	   }
	   fmt.Println("User ID from JWT:", userID)
	*/

	// Define input struct accepting image_url and other plant fields
	type AddPlantRequest struct {
		ImageURL       string `json:"image_url" binding:"required"`
		PlantName      string `json:"plant_name"`
		ScientificName string `json:"scientific_name"`
		Species        string `json:"species"`
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
	msg, err := Handler.AddPlant(
		1, // user_id
		req.PlantName,
		req.ScientificName,
		req.Species,
		req.ImageURL, // image URL instead of binary data
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

func ExtractIDFromJWT(jwtToken string) (int, error) {
	return 1, nil
}

func FetchPlants(c *gin.Context) {
	jwtToken := c.GetHeader("JWT_Token")
	if jwtToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	// Extract UUID from JWT
	id, err := ExtractIDFromJWT(jwtToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	print(id)

	plants, err := Handler.FetchPlants(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plants": plants})

}

func HandleCanAddPlant(c *gin.Context) {
	// You can uncomment JWT handling if needed:
	/*
	   jwtToken := c.GetHeader("JWT_Token")
	   if jwtToken == "" {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
	       return
	   }

	   userID, err := ExtractIDFromJWT(jwtToken)
	   if err != nil {
	       c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
	       return
	   }
	   fmt.Println("User ID from JWT:", userID)
	*/
	msg, err := Handler.LengthPlants(
		1,
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
