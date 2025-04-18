from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Simplified CORS setup to allow requests from React frontend
CORS(app, origins=[
    "http://localhost:5173",
    "https://savour-sagee.vercel.app"  # <-- Add your deployed frontend here!
], supports_credentials=True)

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Configure Gemini AI
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.error("Google API Key not found! Please check your .env file.")
    raise ValueError("Google API Key is required")

def get_gemini_response(input_prompt, image_data=None, language="en"):
    """
    Get response from Gemini AI model
    """
    try:
        if language != "en":
            input_prompt += f"\nPlease provide the response in {language} language."
        
        model = genai.GenerativeModel('gemini-1.5-flash-002')
        image = Image.open(io.BytesIO(image_data))
        generation_response = model.generate_content([input_prompt, image])
        
        if generation_response and hasattr(generation_response, 'text'):
            return generation_response.text
        else:
            logger.warning("No valid response generated from Gemini API")
            return "No valid response generated."
            
    except Exception as e:
        logger.error(f"Error in get_gemini_response: {str(e)}")
        raise

def validate_image(image_file):
    """
    Validate the uploaded image file
    """
    if not image_file:
        raise ValueError("No image file provided")
    
    if image_file.filename == '':
        raise ValueError("No selected file")
    
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    if not '.' in image_file.filename or \
       image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        raise ValueError("Invalid file type. Only PNG, JPG, and JPEG are allowed")

@app.route('/analyze_food', methods=['POST', 'OPTIONS'])
def analyze_food():
    """
    Endpoint to analyze food images and return nutritional information
    """
    if request.method == "OPTIONS":
        # Handle preflight CORS
        response = app.make_default_options_response()
        headers = response.headers

        headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided in request'}), 400

        image_file = request.files['image']
        language = request.form.get('language', 'en')

        try:
            validate_image(image_file)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        image_data = image_file.read()

        input_prompt = """
        You are an expert nutritionist. Analyze the food items in the image and provide:
        1. A detailed list of all visible food items
        2. Estimated calories for each item
        3. Total calorie count
        4. Basic nutritional insights

        Format the response as:

        Food Items and Calories:
        1. [Item Name] - [Calories] kcal
        2. [Item Name] - [Calories] kcal
        ...

        Total Calories: [Sum] kcal

        Nutritional Insights:
        • [Key insight about the meal's nutritional value]
        • [Suggestions for improvement if needed]
        """

        response = get_gemini_response(input_prompt, image_data, language)

        return jsonify({
            'status': 'success',
            'response': response
        }), 200

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6001)
