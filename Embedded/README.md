# Accident Detection System - Sri Lanka

A web-based accident detection system that displays real-time accident locations within Sri Lanka using Firebase and interactive maps.

## Features

- Real-time location tracking
- Accident location display on map
- Automatic notifications for new accidents
- Restricted to Sri Lanka geographical area
- Interactive map with accident markers
- List of recent accidents
- Responsive design for all devices

## Setup Instructions

1. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database
   - Get your Firebase configuration

2. Configure Firebase:
   - Open `app.js`
   - Replace the `firebaseConfig` object with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       databaseURL: "YOUR_DATABASE_URL",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

3. Add your logo:
   - Replace `logo.png` with your application logo
   - Recommended size: 40px height

4. Customize owner information:
   - Open `app.js`
   - Update the `updateOwnerInfo()` function with your details:
   ```javascript
   function updateOwnerInfo() {
       const ownerName = "Your Name";
       const ownerLocation = "Your Location";
       // ...
   }
   ```

5. Run the application:
   - Use a local web server (e.g., Live Server in VS Code)
   - Open `index.html` in your browser

## Firebase Database Structure

The Firebase Realtime Database should have the following structure:

```json
{
  "accidents": {
    "-Nxxxxxxxx": {
      "latitude": 7.8731,
      "longitude": 80.7718,
      "timestamp": 1234567890
    }
  }
}
```

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Firebase Realtime Database
- Leaflet.js for maps
- Bootstrap 5 for UI
- OpenStreetMap for map tiles

## Notes

- The application only displays accidents within Sri Lanka's geographical boundaries
- Location updates every 30 seconds
- Make sure to enable location services in your browser
- The map is restricted to Sri Lanka's boundaries for better focus 