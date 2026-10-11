CREATE DATABASE IF NOT EXISTS havenly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE havenly;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS properties (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  city VARCHAR(80) NOT NULL,
  area VARCHAR(120) NOT NULL,
  price INT UNSIGNED NOT NULL,
  gender ENUM('Female','Male','Co-ed') NOT NULL DEFAULT 'Co-ed',
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  review_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  images_json JSON NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_property_search (city, price, gender, is_active)
);
CREATE TABLE IF NOT EXISTS amenities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id INT UNSIGNED NOT NULL,
  amenity_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (property_id, amenity_id),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS interested_users (
  user_id INT UNSIGNED NOT NULL,
  property_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

INSERT IGNORE INTO amenities (name) VALUES ('High-speed Wi-Fi'),('Meals included'),('Laundry'),('Housekeeping'),('Study room'),('AC'),('Power backup'),('CCTV'),('Gym'),('Common lounge'),('24/7 security'),('Furnished rooms');
INSERT IGNORE INTO properties (id,name,city,area,price,gender,rating,review_count,description,image_url,images_json,is_featured) VALUES
(1,'The Fern House','Bengaluru','Indiranagar',14500,'Female',4.9,128,'A light-filled, thoughtfully run home tucked into Indiranagar. Find your rhythm in the quiet study nook, unwind in the leafy lounge, and walk to cafés and the metro in minutes.','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"]',1),
(2,'Sunday at Home','Pune','Koregaon Park',12000,'Co-ed',4.8,96,'A warm, easygoing home for curious people. Settle into a bright room, share home-cooked meals, and find your people in one of Pune’s most walkable neighbourhoods.','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"]',1),
(3,'Little Olive Living','Hyderabad','Gachibowli',10500,'Female',4.7,84,'A calm corner close to campus and the city buzz. Little Olive keeps the essentials thoughtful: fresh meals, a clean shared space, and room to make the place your own.','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"]',1),
(4,'The Good Room','Delhi','Hauz Khas',16500,'Co-ed',4.8,72,'For the days full of plans and the evenings that need a slower pace. Bright rooms, a sunny common area, and good connections to Delhi’s colleges and metro.','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"]',0),
(5,'Mango Tree House','Mumbai','Powai',19000,'Male',4.6,63,'A friendly, fully furnished base in Powai, with easy access to campus, transit, and everything you need for the week. Come home to a little more breathing room.','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"]',0),
(6,'Daybreak Residency','Bengaluru','Koramangala',13500,'Male',4.5,51,'A practical, welcoming home near the places you’ll go most. There’s a quiet place to study, a comfortable lounge to recharge, and someone around to help with the everyday.','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"]',0),
(7,'The Banyan Stay','Pune','Viman Nagar',9800,'Male',4.6,47,'A no-fuss, well-kept stay in a neighbourhood with everything close by. Good Wi-Fi, reliable meals, and a welcoming common room make settling in feel easy.','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"]',0),
(8,'Blue Door House','Hyderabad','Madhapur',15000,'Co-ed',4.7,39,'A cheerful, secure home with bright shared spaces and room to switch off after a full day. Find a private corner when you need one and good company when you don’t.','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85','["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"]',0);

INSERT IGNORE INTO property_amenities (property_id,amenity_id)
SELECT p.id,a.id FROM properties p JOIN amenities a ON a.name IN ('High-speed Wi-Fi','Meals included','Laundry','Housekeeping','Study room','Power backup','24/7 security','Furnished rooms') WHERE p.id IN (1,2,3,4,5,6,7,8);
INSERT IGNORE INTO property_amenities (property_id,amenity_id)
SELECT p.id,a.id FROM properties p JOIN amenities a ON a.name IN ('AC','CCTV','Common lounge') WHERE p.id IN (1,2,3,4,5,6,7,8);
