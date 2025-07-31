package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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
	connString := "postgresql://postgres.xrxswewhornndtjpwmkf:mLTwK4TAf9spNhuD@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
	err := InitDatabaseHandler(connString)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.POST("/add-plant", HandleAddPlant)
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

	router.Run("0.0.0.0:8000") // bind explicitly to all interfaces
}
