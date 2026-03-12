from flask import Flask, request, jsonify, render_template
from osint_services import get_gravatar, get_github_info, get_breaches
from risk_calculator import calculate_risk

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    if not data:
        return jsonify({"error": "Invalid request"}), 400
        
    email = data.get('email', '').strip()
    username = data.get('username', '').strip()
    is_demo_mode = data.get('demo_mode', False)
    
    if not email and not username:
        return jsonify({"error": "Email or Username is required"}), 400
        
    results = {
        "email": email,
        "username": username,
        "gravatar": None,
        "github": None,
        "breaches": [],
        "risk_assessment": {}
    }
    
    # Gather OSINT Data
    if email:
        results["gravatar"] = get_gravatar(email)
        results["breaches"] = get_breaches(email, is_demo_mode=is_demo_mode)
        
    if username:
        results["github"] = get_github_info(username)
        
    # Calculate Risk
    results["risk_assessment"] = calculate_risk(
        results["breaches"], 
        results["github"], 
        results["gravatar"]
    )
    
    return jsonify(results)

if __name__ == '__main__':
    if __name__ == "__main__":
     app.run(host="0.0.0.0", port=5000)
