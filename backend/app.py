from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({"error": "Missing required fields"}), 400

    # In a real application, you would send an email or save to a database here.
    # For now, we'll just print to console.
    print(f"Received contact form submission:\nName: {name}\nEmail: {email}\nMessage: {message}")

    return jsonify({"message": "Message received successfully!"}), 200

@app.route('/api/projects', methods=['GET'])
def get_projects():
    # In a real app, this might come from a database
    projects = [
        {
            "id": "project-1",
            "title": "Pixel Dungeon",
            "description": "A rogue-like dungeon crawler made with Unity.",
            "techStack": ["Unity", "C#", "Pixel Art"],
            "images": ["/assets/sprites/dungeon_thumb.png"],
            "links": {"demo": "https://example.com", "code": "https://github.com"}
        },
        {
            "id": "project-2",
            "title": "Space Shooter",
            "description": "Retro arcade shooter.",
            "techStack": ["Phaser", "JavaScript"],
            "images": ["/assets/sprites/space_thumb.png"],
            "links": {"demo": "https://example.com", "code": "https://github.com"}
        }
    ]
    return jsonify(projects), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
