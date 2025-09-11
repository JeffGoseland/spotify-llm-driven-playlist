#!/usr/bin/env python3
"""
Setup script for Spotify Playlist Generator
"""

import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def create_env_file():
    """Create .env file from template"""
    if os.path.exists('.env'):
        print("✅ .env file already exists")
        return True
    
    if not os.path.exists('.env.example'):
        print("❌ .env.example file not found")
        return False
    
    try:
        with open('.env.example', 'r') as src, open('.env', 'w') as dst:
            dst.write(src.read())
        print("✅ Created .env file from template")
        print("⚠️  Please edit .env file with your Spotify credentials")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def check_env_variables():
    """Check if environment variables are set"""
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ['SPOTIPY_CLIENT_ID', 'SPOTIPY_CLIENT_SECRET']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var) or os.getenv(var) == f'your_{var.lower()}_here':
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing or incomplete environment variables: {', '.join(missing_vars)}")
        print("Please edit .env file with your Spotify credentials")
        return False
    
    print("✅ Environment variables configured")
    return True

def main():
    """Main setup function"""
    print("🎵 Spotify Playlist Generator Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        sys.exit(1)
    
    # Check environment variables
    env_configured = check_env_variables()
    
    print("\n" + "=" * 40)
    if env_configured:
        print("🎉 Setup complete! You can now run the application:")
        print("   python app.py")
    else:
        print("⚠️  Setup partially complete. Please configure your .env file:")
        print("   1. Get your Spotify Client ID and Secret from https://developer.spotify.com/dashboard")
        print("   2. Edit .env file with your credentials")
        print("   3. Run: python app.py")

if __name__ == "__main__":
    main()
