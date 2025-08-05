from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enables CORS for the React frontend

# Coordinates for each region
REGION_COORDINATES = {
    "Bukit Aman": {"lat": 3.141, "lng": 101.697},
    "Cameron Highlands": {"lat": 4.475, "lng": 101.385},
    "Genting Highlands": {"lat": 3.425, "lng": 101.792},
    "Fraser's Hill": {"lat": 3.704, "lng": 101.737},
    "Gunung Tahan": {"lat": 4.636, "lng": 102.269},
    "Kuala Lumpur": {"lat": 3.139, "lng": 101.687},
    "Penang": {"lat": 5.416, "lng": 100.327},
    "Johor Bahru": {"lat": 1.492, "lng": 103.741},
    "Ipoh": {"lat": 4.598, "lng": 101.090},
    "Kota Kinabalu": {"lat": 5.975, "lng": 116.073},
    "Langkawi": {"lat": 6.353, "lng": 99.799},
    "Malacca": {"lat": 2.196, "lng": 102.251}
}

def get_risk_data():
    """Generates a list of simulated landslide risk data."""
    all_data = []
    
    # We will generate 200 data points to ensure a good amount of data
    for i in range(200):
        region_name, coords = random.choice(list(REGION_COORDINATES.items()))

        # Generate a random timestamp within the last 3 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=3 * 365)
        random_timestamp = start_date + (end_date - start_date) * random.random()
        
        # Simulate sensor readings
        rainfall = random.randint(10, 200)  # in mm
        soil_saturation = random.randint(40, 100)  # in %
        slope_angle = random.randint(15, 50)  # in degrees

        # Simple risk calculation formula
        risk_score = (rainfall * 0.4) + (soil_saturation * 0.4) + (slope_angle * 0.2)
        
        risk_level = "Low"
        if risk_score > 120:
            risk_level = "High"
        elif risk_score > 90:
            risk_level = "Moderate"

        all_data.append({
            "regionName": region_name,
            "rainfallLevel": rainfall,
            "soilSaturation": soil_saturation,
            "slopeAngle": slope_angle,
            "calculatedRiskLevel": risk_level,
            # Format timestamp with microseconds to ensure uniqueness
            "timestamp": random_timestamp.isoformat(), 
            "lat": coords["lat"],
            "lng": coords["lng"]
        })
        
    return all_data

@app.route('/api/landslide-risk', methods=['GET'])
def landslide_risk():
    """API endpoint to get simulated landslide risk data."""
    return jsonify(get_risk_data())

if __name__ == '__main__':
    # Running the app in debug mode is good for development
    app.run(debug=True)