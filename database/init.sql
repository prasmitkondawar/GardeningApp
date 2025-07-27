CREATE table Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password_hash VARCHAR(75),
    email VARCHAR(75),
    auth_provider VARCHAR(50),
    auth_provider_id INTEGER,
    stripe_customer_id VARCHAR(100)
);

CREATE TABLE Plants (
    plant_id SERIAL PRIMARY KEY,
    plant_name VARCHAR(75),
    scientific_name VARCHAR(100),
    species VARCHAR(100),
    image_url VARCHAR(100),
    user_id INTEGER REFERENCES Users(id),
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Schedule (
    schedule_id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES Plants(plant_id),
    user_id INTEGER REFERENCES Users(id),
    task_type VARCHAR(50),
    scheduled_date DATE,
    is_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE PlantHealth (
    health_id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES Plants(plant_id),
    health_score INTEGER,
    scan_date TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    diagnosis TEXT,
    image_url TEXT
);

CREATE TABLE PlantCareHistory (
    history_id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES Plants(plant_id),
    user_id INTEGER REFERENCES Users(id),
    action VARCHAR(50),
    action_date TIMESTAMP DEFAULT NOW(),
    notes TEXT
);