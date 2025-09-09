package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
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
		log.Println("Warning: Error loading .env file from default location")
		// Try to load from the current directory as fallback
		err = godotenv.Load("./.env")
		if err != nil {
			log.Printf("Error loading ./.env file: %v", err)
		} else {
			log.Println("Successfully loaded .env from ./")
		}
	} else {
		log.Println("Successfully loaded .env from default location")
	}

	// Debug: Print the current working directory
	wd, _ := os.Getwd()
	log.Println("Current working directory:", wd)

	// Debug: Print all environment variables (be careful with sensitive data)
	log.Println("Environment variables:")
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "OPENAI_") || strings.HasPrefix(env, "GIN_") {
			log.Println(env)
		}
	}

	// Debug: Print environment variable status
	log.Println("Environment variables status:")
	log.Println("Current working directory:", os.Getenv("PWD"))
	log.Println("Environment file loaded:", err == nil)
	log.Println("OPENAI_API_KEY set:", os.Getenv("OPENAI_API_KEY") != "")

	// Log environment variables (excluding sensitive ones in production)
	for _, env := range os.Environ() {
		if strings.HasPrefix(env, "OPENAI_") || strings.HasPrefix(env, "GIN_") {
			log.Println(env)
		}
	}

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

	// Test endpoint to verify environment variables
	router.GET("/env-test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"env_loaded": os.Getenv("OPENAI_API_KEY") != "",
			"env_vars": map[string]string{
				"OPENAI_API_KEY": func() string {
					if os.Getenv("OPENAI_API_KEY") != "" {
						return "[REDACTED]"
					}
					return ""
				}(),
				"DATABASE_URL": os.Getenv("DATABASE_URL"),
				"PORT":         os.Getenv("PORT"),
			},
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
