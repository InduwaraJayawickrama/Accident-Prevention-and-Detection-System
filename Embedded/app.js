// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQN1puM2Ny15YKu7DFREURCQXtQDe6cB4",
    authDomain: "accident-detection-syste-ccc2c.firebaseapp.com",
    databaseURL: "https://accident-detection-syste-ccc2c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "accident-detection-syste-ccc2c",
    storageBucket: "accident-detection-syste-ccc2c.firebasestorage.app",
    messagingSenderId: "1017909674700",
    appId: "1:1017909674700:web:3a3fc429a1bddb55adb869",
    measurementId: "G-7F6CH15LKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Check Firebase connection status
function checkFirebaseConnection() {
    console.log("Checking Firebase connection...");
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            console.log('Connected to Firebase');
            document.getElementById('locationStatus').innerHTML = '<span class="text-success">✓ Connected to Firebase</span>';
            
            // Check if we can access the geofire path
            checkGeofirePath();
        } else {
            console.log('Not connected to Firebase');
            document.getElementById('locationStatus').innerHTML = '<span class="text-danger">✗ Not connected to Firebase</span>';
        }
    });
}

// Check if we can access the geofire path
function checkGeofirePath() {
    console.log("Checking geofire path...");
    const geofireRef = ref(database, 'geofire');
    
    // Try to read the data once
    get(geofireRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("Geofire data exists:", snapshot.val());
            document.getElementById('locationStatus').innerHTML = '<span class="text-success">✓ Connected to Firebase (Data available)</span>';
        } else {
            console.log("No data at geofire path");
            document.getElementById('locationStatus').innerHTML = '<span class="text-warning">⚠ Connected to Firebase (No data)</span>';
        }
    }).catch((error) => {
        console.error("Error accessing geofire path:", error);
        document.getElementById('locationStatus').innerHTML = '<span class="text-danger">✗ Firebase Error: ' + error.code + '</span>';
    });
}

// Initialize map centered on Sri Lanka
const map = L.map('map').setView([7.8731, 80.7718], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Sri Lanka boundaries
const sriLankaBounds = L.latLngBounds(
    L.latLng(5.916667, 79.516667), // Southwest
    L.latLng(9.851778, 81.878883)  // Northeast
);
map.setMaxBounds(sriLankaBounds);

let currentLocationMarker = null;
let accuracyCircle = null;
let accidentMarkers = {};
let trackingEnabled = false;

// Get current location with better handling
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                // Update location display with more detail
                document.getElementById('currentLat').textContent = lat.toFixed(6);
                document.getElementById('currentLng').textContent = lng.toFixed(6);
                document.getElementById('locationAccuracy').textContent = `±${accuracy.toFixed(1)} meters`;
                document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

                // Update position status
                document.getElementById('locationStatus').innerHTML = '<span class="text-success">✓ Location Active</span>';

                // Update or create current location marker
                if (currentLocationMarker) {
                    currentLocationMarker.setLatLng([lat, lng]);
                } else {
                    currentLocationMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'current-location-marker',
                            html: '<div class="pulse-marker"><i class="fas fa-map-marker-alt"></i></div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    }).addTo(map);
                    
                    currentLocationMarker.bindPopup("<strong>Your Current Location</strong><br>Click 'Center Map' to follow");
                }
                
                // Update accuracy circle
                if (accuracyCircle) {
                    accuracyCircle.setLatLng([lat, lng]);
                    accuracyCircle.setRadius(accuracy);
                } else {
                    accuracyCircle = L.circle([lat, lng], {
                        radius: accuracy,
                        color: '#4285F4',
                        fillColor: '#4285F4',
                        fillOpacity: 0.15,
                        weight: 2
                    }).addTo(map);
                }
                
                // If tracking is enabled, center map on current location
                if (trackingEnabled) {
                    map.setView([lat, lng], map.getZoom());
                }
                
                // Update tracking button text
                updateTrackingButton();
            },
            (error) => {
                console.error('Error getting location:', error);
                document.getElementById('locationStatus').innerHTML = '<span class="text-danger">✗ Location Error</span>';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        showAlert('Location access was denied. Please enable location services in your browser settings.', 'danger');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showAlert('Location information is unavailable. Please try again later.', 'warning');
                        break;
                    case error.TIMEOUT:
                        showAlert('The request to get location timed out. Please try again.', 'warning');
                        break;
                    default:
                        showAlert('An unknown error occurred while getting your location.', 'danger');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        showAlert('Geolocation is not supported by this browser.', 'danger');
    }
}

// Toggle location tracking
function toggleTracking() {
    trackingEnabled = !trackingEnabled;
    
    if (trackingEnabled && currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 14);
    }
    
    updateTrackingButton();
    
    // Save preference to local storage
    localStorage.setItem('trackingEnabled', trackingEnabled);
}

// Update tracking button text
function updateTrackingButton() {
    const button = document.getElementById('trackingButton');
    if (button) {
        if (trackingEnabled) {
            button.innerHTML = '<i class="fas fa-location-arrow"></i> Tracking On';
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary');
        } else {
            button.innerHTML = '<i class="far fa-location-arrow"></i> Track Me';
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline-primary');
        }
    }
}

// Listen for new accidents from Firebase
function listenForAccidents() {
    console.log("Setting up Firebase listener for accidents...");
    const geofireRef = ref(database, 'geofire');
    onValue(geofireRef, (snapshot) => {
        console.log("Firebase data received:", snapshot.val());
        const data = snapshot.val();
        if (data) {
            console.log("Processing accident data:", data);
            // Clear existing accident list (but keep markers for smooth transitions)
            document.getElementById('accidentList').innerHTML = '';
            const previousMarkers = {...accidentMarkers};
            accidentMarkers = {};
            
            let newAccidents = 0;
            const now = Date.now();
            
            // Process each location
            Object.entries(data).forEach(([locationKey, locationData]) => {
                console.log("Processing location:", locationKey, locationData);
                if (locationData.g && locationData.l) {
                    const geohash = locationData.g;
                    const lat = locationData.l[0];
                    const lng = locationData.l[1];
                    
                    // Check if the location is within Sri Lanka (or using test data)
                    if (isWithinSriLanka(lat, lng) || isTestData(lat, lng)) {
                        // Use timestamp from Firebase or create one
                        const timestamp = locationData.timestamp || now;
                        
                        const accident = {
                            latitude: lat,
                            longitude: lng,
                            timestamp: timestamp,
                            geohash: geohash,
                            locationKey: locationKey
                        };
                        
                        // Check if this is a new accident (not in previous markers)
                        const isNew = !previousMarkers[locationKey];
                        
                        if (isNew) {
                            newAccidents++;
                        }
                        
                        addAccidentToMap(accident, locationKey, previousMarkers[locationKey]);
                        addAccidentToList(accident, locationKey, isNew);
                    } else {
                        console.log("Location outside Sri Lanka or test data area:", lat, lng);
                    }
                } else {
                    console.log("Invalid location data format:", locationData);
                }
            });
            
            // Remove old markers that aren't in the new data
            Object.entries(previousMarkers).forEach(([key, marker]) => {
                if (!accidentMarkers[key]) {
                    marker.remove();
                }
            });
            
            // Show notification for new accidents
            if (newAccidents > 0) {
                showNotification(`${newAccidents} new accident${newAccidents > 1 ? 's' : ''} detected!`);
                
                // Play alert sound if enabled
                const alertSound = document.getElementById('alertSound');
                if (alertSound && localStorage.getItem('soundEnabled') !== 'false') {
                    alertSound.play().catch(e => console.log('Sound play failed:', e));
                }
            }
            
            // Update accident counter
            document.getElementById('accidentCounter').textContent = Object.keys(accidentMarkers).length;
        } else {
            console.log("No accident data received from Firebase");
        }
    }, (error) => {
        console.error("Error listening to Firebase:", error);
    });
}

// Add accident marker to map
function addAccidentToMap(accident, accidentId, existingMarker) {
    // If we already have a marker for this accident, update its popup
    if (existingMarker) {
        existingMarker.getPopup().setContent(createAccidentPopupContent(accident));
        accidentMarkers[accidentId] = existingMarker;
        return;
    }
    
    // Calculate how recent the accident is
    const ageInMinutes = (Date.now() - accident.timestamp) / (1000 * 60);
    let markerClass = 'accident-marker';
    
    // Use different marker styles based on accident age
    if (ageInMinutes < 30) {
        markerClass += ' accident-marker-recent';
    } else if (ageInMinutes < 120) {
        markerClass += ' accident-marker-medium';
    } else {
        markerClass += ' accident-marker-old';
    }
    
    const marker = L.marker([accident.latitude, accident.longitude], {
        icon: L.divIcon({
            className: markerClass,
            html: '<div class="accident-icon"><i class="fas fa-car-crash"></i></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }).addTo(map);

    marker.bindPopup(createAccidentPopupContent(accident));
    
    // Add click event to center on accident
    marker.on('click', () => {
        // Disable tracking when manually clicking on an accident
        trackingEnabled = false;
        updateTrackingButton();
    });

    accidentMarkers[accidentId] = marker;
}

// Create accident popup content
function createAccidentPopupContent(accident) {
    const timestamp = new Date(accident.timestamp);
    const timeAgo = getTimeAgo(timestamp);
    
    return `
        <div class="accident-popup">
            <h5><i class="fas fa-exclamation-triangle text-danger"></i> Accident Alert</h5>
            <p><strong>Time:</strong> ${timestamp.toLocaleString()}<br>
            <strong>Reported:</strong> ${timeAgo}<br>
            <strong>Location:</strong> ${accident.latitude.toFixed(6)}, ${accident.longitude.toFixed(6)}</p>
            <button class="btn btn-sm btn-primary navigate-btn" 
                onclick="window.openDirections(${accident.latitude}, ${accident.longitude})">
                <i class="fas fa-directions"></i> Navigate
            </button>
        </div>
    `;
}

// Open directions in Google Maps
window.openDirections = function(lat, lng) {
    if (currentLocationMarker) {
        const origin = currentLocationMarker.getLatLng();
        window.open(`https://www.google.com/maps/dir/${origin.lat},${origin.lng}/${lat},${lng}`, '_blank');
    } else {
        window.open(`https://www.google.com/maps/dir//${lat},${lng}`, '_blank');
    }
};

// Add accident to list
function addAccidentToList(accident, accidentId, isNew) {
    const accidentList = document.getElementById('accidentList');
    const accidentItem = document.createElement('div');
    accidentItem.className = 'accident-item';
    if (isNew) {
        accidentItem.classList.add('new-accident');
    }
    
    const timestamp = new Date(accident.timestamp);
    const timeAgo = getTimeAgo(timestamp);
    
    accidentItem.innerHTML = `
        <div class="accident-time">${timeAgo}</div>
        <div class="accident-location">
            <i class="fas fa-car-crash ${getAgeClass(timestamp)}"></i>
            ${accident.latitude.toFixed(4)}, ${accident.longitude.toFixed(4)}
        </div>
        <div class="accident-actions">
            <button class="btn btn-sm btn-outline-secondary view-btn" title="View on map">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary directions-btn" title="Get directions">
                <i class="fas fa-directions"></i>
            </button>
        </div>
    `;

    // Add click events
    const viewBtn = accidentItem.querySelector('.view-btn');
    viewBtn.addEventListener('click', () => {
        viewAccidentOnMap(accident, accidentId);
    });
    
    const directionsBtn = accidentItem.querySelector('.directions-btn');
    directionsBtn.addEventListener('click', () => {
        window.openDirections(accident.latitude, accident.longitude);
    });
    
    // Add click event to entire item (except buttons)
    accidentItem.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            viewAccidentOnMap(accident, accidentId);
        }
    });

    accidentList.insertBefore(accidentItem, accidentList.firstChild);
    
    // Remove 'new-accident' class after animation
    if (isNew) {
        setTimeout(() => {
            accidentItem.classList.remove('new-accident');
        }, 5000);
    }
}

// View accident on map
function viewAccidentOnMap(accident, accidentId) {
    map.setView([accident.latitude, accident.longitude], 15);
    
    // Open popup for the accident
    if (accidentMarkers[accidentId]) {
        accidentMarkers[accidentId].openPopup();
    }
    
    // Disable tracking when manually viewing an accident
    trackingEnabled = false;
    updateTrackingButton();
    
    // On mobile, scroll back to map
    if (window.innerWidth < 768) {
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    }
}

// Helper function to display time ago
function getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Get CSS class based on accident age
function getAgeClass(timestamp) {
    const ageInMinutes = (Date.now() - timestamp) / (1000 * 60);
    
    if (ageInMinutes < 30) {
        return 'text-danger';
    } else if (ageInMinutes < 120) {
        return 'text-warning';
    } else {
        return 'text-secondary';
    }
}

// Show notification
function showNotification(message) {
    const toastEl = document.getElementById('notificationToast');
    document.getElementById('toastMessage').textContent = message;
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alertsContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertsContainer.innerHTML += alertHtml;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alertEl = document.getElementById(alertId);
        if (alertEl) {
            const bsAlert = new bootstrap.Alert(alertEl);
            bsAlert.close();
        }
    }, 5000);
}

// Check if coordinates are within Sri Lanka
function isWithinSriLanka(lat, lng) {
    return lat >= 5.916667 && lat <= 9.851778 && lng >= 79.516667 && lng <= 81.878883;
}

// Check if coordinates are test data (for development)
function isTestData(lat, lng) {
    // The test data is from New York City (from the provided JSON)
    return (lat > 40.5 && lat < 41.0 && lng > -74.1 && lng < -73.5);
}

// Toggle sound notifications
function toggleSound() {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    localStorage.setItem('soundEnabled', !soundEnabled);
    
    // Update button
    const soundButton = document.getElementById('soundToggle');
    if (soundButton) {
        if (!soundEnabled) {
            soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            soundButton.classList.remove('btn-outline-secondary');
            soundButton.classList.add('btn-outline-success');
            soundButton.title = 'Sound notifications enabled';
        } else {
            soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            soundButton.classList.remove('btn-outline-success');
            soundButton.classList.add('btn-outline-secondary');
            soundButton.title = 'Sound notifications disabled';
        }
    }
    
    // Play test sound if enabling
    if (!soundEnabled) {
        const alertSound = document.getElementById('alertSound');
        if (alertSound) {
            alertSound.volume = 0.5;
            alertSound.play().catch(e => console.log('Test sound play failed:', e));
        }
    }
}

// Update owner information
function updateOwnerInfo() {
    const ownerName = "Your Name"; // Replace with actual owner name
    const ownerLocation = "Colombo, Sri Lanka"; // Replace with actual location
    document.getElementById('ownerName').textContent = `${ownerName}`;
    document.getElementById('ownerLocation').textContent = `${ownerLocation}`;
}

// Initialize the application
function init() {
    // Load preferences from local storage
    trackingEnabled = localStorage.getItem('trackingEnabled') === 'true';
    updateTrackingButton();
    
    // Initialize sound button
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    const soundButton = document.getElementById('soundToggle');
    if (soundButton) {
        if (soundEnabled) {
            soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            soundButton.classList.add('btn-outline-success');
            soundButton.title = 'Sound notifications enabled';
        } else {
            soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            soundButton.classList.add('btn-outline-secondary');
            soundButton.title = 'Sound notifications disabled';
        }
    }
    
    // Set up event listeners
    document.getElementById('trackingButton').addEventListener('click', toggleTracking);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('refreshLocation').addEventListener('click', getCurrentLocation);
    
    // Initialize app
    checkFirebaseConnection();
    getCurrentLocation();
    listenForAccidents();
    updateOwnerInfo();
    
    // Update current location every 30 seconds
    setInterval(getCurrentLocation, 30000);
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);