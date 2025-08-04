from flask import Flask, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app) # Enables CORS to allow the React frontend to access the API

# Simple function to simulate data and calculate risk
def get_risk_data():
    # Use a fixed list of regions for consistent filtering
    regions = [
        "Bukit Aman", "Cameron Highlands", "Genting Highlands",
        "Fraser's Hill", "Gunung Tahan", "Kuala Lumpur", "Penang",
        "Johor Bahru", "Ipoh", "Kota Kinabalu", "Langkawi", "Malacca"
    ]
    data = []
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

        data.append({
            "regionName": region,
            "rainfallLevel": rainfall,
            "soilSaturation": soil_saturation,
            "slopeAngle": slope_angle,
            "calculatedRiskLevel": risk_level,
            "timestamp": "2025-08-04" # Simulate a fixed date for now
        })
    return data

@app.route('/api/landslide-risk', methods=['GET'])
def landslide_risk():
    return jsonify(get_risk_data())

if __name__ == '__main__':
    app.run(debug=True)