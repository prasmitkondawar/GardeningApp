package main

var image_prompt = `
What plant is this? Please provide: plant name, plant species, and the health of 
the plant on a scale from 1 - 100 with 1 being nearly dead to 100 being in perfect condition.
Additionally, provide information on how many days in between watering it, how much water to water the
plant, how much light the plant requires, and how often to fertilize the plant.
Please reply in this format:
{
  "plant_name": "",
  "species_name": "",
  "health_score": 0,
  "watering_interval_days": 0,
  "water_amount": "",
  "light_requirements": "",
  "fertilizer_frequency": ""
}
`
