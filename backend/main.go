package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

var Handler *DatabaseHandler

type DatabaseHandler struct {
	Db *sql.DB
}

func InitDatabaseHandler(connString string) error {
	db, err := sql.Open("postgres", connString)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("unable to reach database: %w", err)
	}

	Handler = &DatabaseHandler{Db: db}
	fmt.Println("Connected to the database successfully!")
	return nil
}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file")
	}

	// Debug: Print all environment variables
	log.Println("Environment variables:")
	log.Println("Current working directory:", os.Getenv("PWD"))
	log.Println("Environment file location:", os.Getenv("ENV"))
	log.Println("OPENAI_API_KEY exists:", os.Getenv("OPENAI_API_KEY") != "")
	
	// Print all environment variables (be careful with sensitive data in production)
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "OPENAI") || strings.HasPrefix(env, "GIN") {
			log.Println(env)
		}
	}
	
	// Try to load .env file from the current directory explicitly
	err = godotenv.Load(".env")
	log.Println("After explicit .env load, OPENAI_API_KEY exists:", os.Getenv("OPENAI_API_KEY") != "")

	connString := "postgresql://postgres.xrxswewhornndtjpwmkf:mLTwK4TAf9spNhuD@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
	err = InitDatabaseHandler(connString)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	log.Println("TEST PRINTING")

	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.POST("/add-plant", HandleAddPlant)
	router.GET("/fetch-plants", HandleFetchPlants)
	router.GET("/fetch-schedule", HandleFetchSchedule)
	router.POST("/update-plant-pet-name", HandleUpdatePlantPetName)
	router.POST("/complete-schedule", HandleCompleteSchedule)
	router.POST("/delete-plant", HandleDeletePlant)

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "API is running",
		})
	})

	// Example: simple endpoint to check DB connectivity
	router.GET("/dbcheck", func(c *gin.Context) {
		var now string
		err := Handler.Db.QueryRow("SELECT NOW()").Scan(&now)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"time": now})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000" // fallback for local dev
	}
	router.Run("0.0.0.0:" + port)

}
