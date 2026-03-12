import datetime

def calculate_risk(breaches, github_info, gravatar_url):
    """
    Calculate a risk score based on the explicitly requested formula:
    20 × number_of_breaches + 10 × number_of_accounts_found + 5 × profile_image_found
    """
    score = 0
    recommendations = []
    num_accounts_found = 0
    
    # 5 * profile image found
    if gravatar_url:
        score += 5
        num_accounts_found += 1
        recommendations.append("Consider if a public profile image linked to your email is necessary.")
        
    # 10 * number of accounts found
    if github_info:
        score += 10
        num_accounts_found += 1
        recommendations.append("Your GitHub profile is public. Ensure you don't commit sensitive data or expose private emails.")
        
    # 20 * number of breaches
    if breaches and len(breaches) > 0:
        score += (20 * len(breaches))
        recommendations.append("Change compromised passwords immediately across all affected services.")
        recommendations.append("Enable Two-Factor Authentication (2FA) wherever possible.")
        recommendations.append("Use a password manager to maintain unique, strong passwords.")
        
        for breach in breaches:
            # Check if breach is recent (last 3 years) just to add targeted recommendations
            breach_date_str = breach.get("BreachDate")
            if breach_date_str:
                try:
                    breach_date = datetime.datetime.strptime(breach_date_str, "%Y-%m-%d").date()
                    three_years_ago = datetime.date.today() - datetime.timedelta(days=3*365)
                    if breach_date > three_years_ago:
                        recommendations.append(f"Recent breach ({breach['Name']}) detected. Immediate action required.")
                except ValueError:
                    pass
    else:
        # If no breaches found
        recommendations.append("No public breach data found.")
                    
    # Cap score at 100
    score = min(score, 100)
    
    # Determine threat level
    if score >= 61:
        threat_level = "High"
    elif score >= 31:
        threat_level = "Medium"
    else:
        threat_level = "Low"
        
    # Deduplicate recommendations while preserving order
    unique_recommendations = []
    for rec in recommendations:
        if rec not in unique_recommendations:
            unique_recommendations.append(rec)
            
    if not unique_recommendations:
        unique_recommendations.append("Your digital footprint is clean. Keep practicing good online hygiene.")
        
    return {
        "score": score,
        "threat_level": threat_level,
        "recommendations": unique_recommendations
    }
