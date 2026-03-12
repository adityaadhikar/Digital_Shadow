import requests
import hashlib
import time

def get_gravatar(email):
    """Check if a Gravatar profile image exists for the given email."""
    # md5 hash of lowercase email
    email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
    # Check if a custom avatar exists. Default '404' returns 404 if not found.
    url = f"https://www.gravatar.com/avatar/{email_hash}?d=404"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return url
    except requests.RequestException:
        pass
    return None

def get_github_info(username):
    """Fetch user information from GitHub API."""
    if not username:
        return None
    
    url = f"https://api.github.com/users/{username}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "public_repos": data.get("public_repos", 0),
                "profile_name": data.get("name"),
                "location": data.get("location"),
                "avatar_url": data.get("avatar_url"),
                "html_url": data.get("html_url")
            }
    except requests.RequestException:
        pass
    return None

def get_breaches(email, is_demo_mode=False):
    """
    Check for data breaches.
    In real scenarios, this might use HaveIBeenPwned API (requires paid key).
    For the hackathon, we use deterministic procedural generation based on the email
    to simulate different results for different emails.
    """
    if is_demo_mode:
        time.sleep(1.5)
        # Seed pseudo-random generation using the email string
        seed_value = sum(ord(c) for c in email.lower())
        
        breaches = []
        
        # Determine number of breaches (0 to 3 based on email)
        num_breaches = seed_value % 4 
        
        possible_breaches = [
            {
                "Name": "GlobalCorp2021",
                "Domain": "globalcorp.com",
                "BreachDate": "2021-08-14",
                "Description": "In 2021, GlobalCorp suffered a breach exposing millions of user records.",
                "DataClasses": ["Email addresses", "Passwords", "Names"]
            },
            {
                "Name": "CloudStorageNet2022",
                "Domain": "cloudstoragenet.net",
                "BreachDate": "2022-11-01",
                "Description": "A misconfigured database exposed user data including names, emails, and phone numbers.",
                "DataClasses": ["Email addresses", "Phone numbers"]
            },
            {
                "Name": "SocialConnect2019",
                "Domain": "socialconnect.io",
                "BreachDate": "2019-02-18",
                "Description": "A massive scrape of public profiles exposed user connections and private emails.",
                "DataClasses": ["Email addresses", "Social connections", "Locations"]
            },
            {
                "Name": "TechForum2023",
                "Domain": "techforum.org",
                "BreachDate": "2023-05-10",
                "Description": "A vulnerability in the forum software allowed attackers to dump the user database.",
                "DataClasses": ["Email addresses", "Passwords", "IP addresses"]
            }
        ]
        
        for i in range(num_breaches):
            # Pick a deterministic index
            index = (seed_value + i) % len(possible_breaches)
            breaches.append(possible_breaches[index])
            
        return breaches
    
    # Without an API key and demo mode off, return empty.
    return []
