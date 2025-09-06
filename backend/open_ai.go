package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// OpenAI API structures
type OpenAIMessage struct {
	Role    string              `json:"role"`
	Content []OpenAIContentPart `json:"content"`
}

type OpenAIContentPart struct {
	Type     string          `json:"type"`
	Text     string          `json:"text,omitempty"`
	ImageURL *OpenAIImageURL `json:"image_url,omitempty"`
}

type OpenAIImageURL struct {
	URL string `json:"url"`
}

type OpenAIRequest struct {
	Model     string          `json:"model"`
	Messages  []OpenAIMessage `json:"messages"`
	MaxTokens int             `json:"max_tokens"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error,omitempty"`
}

type PlantClassification struct {
	PlantName      string `json:"plant_name"`
	ScientificName string `json:"scientific_name"`
	Species        string `json:"species"`
	Confidence     string `json:"confidence"`
}

// Function to classify plant using OpenAI Vision API
func classifyPlantWithOpenAI(imageURL string, openaiAPIKey string) (*PlantClassification, error) {
	// Create the prompt for plant identification
	prompt := `Analyze this plant image and provide detailed botanical information. 
	Please identify:
	1. Common plant name
	2. Scientific name (genus and species)
	3. Plant species/variety if identifiable
	4. Your confidence level in the identification (High/Medium/Low)
	
	Respond in JSON format like this:
	{
		"plant_name": "Common name of the plant",
		"scientific_name": "Scientific name in binomial nomenclature",
		"species": "Specific species or variety",
		"confidence": "High/Medium/Low"
	}
	
	If you cannot identify the plant, use "Unknown" for the fields and set confidence to "Low".`

	// Prepare the request payload
	requestPayload := OpenAIRequest{
		Model: "gpt-4-vision-preview", // or "gpt-4o" if available
		Messages: []OpenAIMessage{
			{
				Role: "user",
				Content: []OpenAIContentPart{
					{
						Type: "text",
						Text: prompt,
					},
					{
						Type: "image_url",
						ImageURL: &OpenAIImageURL{
							URL: imageURL,
						},
					},
				},
			},
		},
		MaxTokens: 300,
	}

	// Convert to JSON
	jsonData, err := json.Marshal(requestPayload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+openaiAPIKey)

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	// Parse response
	var openaiResp OpenAIResponse
	if err := json.Unmarshal(body, &openaiResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v", err)
	}

	// Check for API errors
	if openaiResp.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", openaiResp.Error.Message)
	}

	// Check if we got a response
	if len(openaiResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	// Extract and parse the JSON content
	content := openaiResp.Choices[0].Message.Content

	// Clean the content - sometimes OpenAI wraps JSON in markdown code blocks
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	// Parse the plant classification
	var classification PlantClassification
	if err := json.Unmarshal([]byte(content), &classification); err != nil {
		// If JSON parsing fails, return default values
		return &PlantClassification{
			PlantName:      "Unknown Plant",
			ScientificName: "Unknown Species",
			Species:        "Unknown",
			Confidence:     "Low",
		}, nil
	}

	return &classification, nil
}
