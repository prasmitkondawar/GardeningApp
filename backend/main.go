package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

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
		log.Fatal("Error loading .env file")
	}

	// Check if OPENAI_API_KEY is set
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("❌ OPENAI_API_KEY is not set in .env file")
	} else if apiKey == "your_openai_api_key_here" {
		fmt.Println("⚠️  Please replace 'your_openai_api_key_here' with your actual OpenAI API key in the .env file")
	} else {
		fmt.Println("✅ OPENAI_API_KEY is set correctly")
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

	// Commenting out undefined handlers for now
	// router.POST("/add-plant", HandleAddPlant)
	// router.GET("/fetch-plants", HandleFetchPlants)
	// router.GET("/fetch-schedule", HandleFetchSchedule)
	// router.POST("/update-plant-pet-name", HandleUpdatePlantPetName)
	// router.POST("/complete-schedule", HandleCompleteSchedule)
	// router.POST("/delete-plant", HandleDeletePlant)

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
		port = "8080" // Changed default port to 8080 to avoid conflicts
	}
	router.Run("0.0.0.0:" + port)

}
