package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleAddPlant(c *gin.Context) {
	// JWT token in header
	jwtToken := c.GetHeader("JWT_Token")
	if jwtToken == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "JWT_Token header is required"})
		return
	}

	// Extract UUID from JWT
	uuid, err := ExtractUUIDFromJWT(jwtToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT"})
		return
	}
	print(uuid)

	// Parse JSON body
	type AddPlantRequest struct {
		Image_URI string `json:"image_file" binding:"required"`
	}

	var req AddPlantRequest
	print(req.Image_URI)
	// if err := c.ShouldBindJSON(&req); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Description is required in JSON body"})
	// 	return
	// }

	// // Call AddToDo method on your global DB handler
	// msg, err := Handler.AddPlant(uuid:)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
	// 	return
	// }

	// // Success response
	// c.JSON(http.StatusOK, gin.H{
	// 	"message": msg,
	// 	"todos":   todos,
	// })
}

func ExtractUUIDFromJWT(jwtToken string) (any, any) {
	panic("unimplemented")
}
