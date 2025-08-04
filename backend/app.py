from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app) # Enables CORS to allow the React frontend to access the API

#Function to generate random dates within a year
def random_date(year):
    start_date = datetime(year,1,1)
    end_date = datetime(year,12,31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_day = start_date + timedelta(days=random_number_of_days)
    return random_day.strftime("%Y-%m-%d")

# Simple function to simulate data and calculate risk
def get_risk_data():
    # Use a fixed list of regions for consistent filtering
    regions = [
        "Bukit Aman", "Cameron Highlands", "Genting Highlands",
        "Fraser's Hill", "Gunung Tahan", "Kuala Lumpur", "Penang",
        "Johor Bahru", "Ipoh", "Kota Kinabalu", "Langkawi", "Malacca"
    ]
    all_data = []
    
    for year in [2023, 2024, 2025]:
        for _ in range(random.randint(5,15)): # Generate 5 to 15 data points per region per year
            for region in regions: # Iterate through fixed regions
                rainfall = random.randint(10, 200) # in mm
                soil_saturation = random.randint(40, 100) # in %
                slope_angle = random.randint(15, 50) # in degrees

                # Simple risk calculation formula
                risk_score = (rainfall * 0.4) + (soil_saturation * 0.4) + (slope_angle * 0.2)

                risk_level = "Low"
                if risk_score > 120:
                    risk_level = "High"
                elif risk_score > 90:
                    risk_level = "Moderate"

                all_data.append({
                    "regionName": region,
                    "rainfallLevel": rainfall,
                    "soilSaturation": soil_saturation,
                    "slopeAngle": slope_angle,
                    "calculatedRiskLevel": risk_level,
                    "timestamp": random_date(year)
                })
    return all_data

@app.route('/api/landslide-risk', methods=['GET'])
def landslide_risk():
    return jsonify(get_risk_data())

if __name__ == '__main__':
    app.run(debug=True)