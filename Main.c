#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <unistd.h>
#include <math.h>
#include <time.h>

// Mock includes for hardware interfaces
#include "wire.h"          // I2C communication
#include "spi.h"           // SPI communication
#include "graphics.h"      // Graphics library replacement
#include "mpu6050.h"       // MPU6050 gyroscope library
#include "serial.h"        // Serial communication
#include "gps.h"           // GPS library
#include "network.h"       // Network communication
#include "firebase.h"      // Firebase API

// Display configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// Hardware pins
#define OLED_MOSI   23
#define OLED_CLK    18
#define OLED_DC     5
#define OLED_CS     15
#define OLED_RESET  4
#define TRIG_PIN    13
#define ECHO_PIN    12
#define BUZZER_PIN  14
#define FIRE_SENSOR_PIN 32

// Network configuration
#define WIFI_SSID "FOE-Student"
#define WIFI_PASSWORD "abcd1234"
#define API_KEY "AIzaSyCQN1puM2Ny15YKu7DFREURCQXtQDe6cB4"
#define DATABASE_URL "https://console.firebase.google.com/u/0/project/accident-detection-syste-ccc2c/database/accident-detection-syste-ccc2c-default-rtdb/data/~2F"
#define ALERT_PHONE_NUMBER "+94705820044"

// Struct definitions to replace Arduino objects
typedef struct {
    int width;
    int height;
    void* spi;
    int dc_pin;
    int reset_pin;
    int cs_pin;
} Display;

typedef struct {
    double latitude;
    double longitude;
    bool isValid;
} GPSData;

typedef struct {
    void* wire;
} MPU;

typedef struct {
    int rx_pin;
    int tx_pin;
} SerialConnection;

typedef struct {
    char* errorReason;
    bool success;
} FirebaseData;

typedef struct {
    char* api_key;
    char* database_url;
} FirebaseConfig;

typedef struct {
    // Empty struct for auth
} FirebaseAuth;

// Global variables
Display display;
MPU mpu;
SerialConnection sim800l;
SerialConnection gpsSerial;
GPSData gps;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Flags
bool smsSent = false;
bool callMade = false;

// Timer for Firebase updates
unsigned long lastFirebaseUpdate = 0;
const long firebaseInterval = 30000; // Update Firebase every 30 seconds

// Function declarations
void setup(void);
void loop(void);
float getDistance(void);
float getTiltAngle(void);
bool isFireDetected(void);
char* getLocationString(void);
void sendSMSAlert(const char* message);
void makeCall(void);
void updateLocationToFirebase(void);
unsigned long millis(void); // Mock function to replace Arduino millis()

// Returns current time in milliseconds
unsigned long millis(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (ts.tv_sec * 1000) + (ts.tv_nsec / 1000000);
}

// Get distance from Ultrasonic sensor
float getDistance(void) {
    digitalWrite(TRIG_PIN, 0);
    usleep(2);
    digitalWrite(TRIG_PIN, 1);
    usleep(10);
    digitalWrite(TRIG_PIN, 0);
    
    long duration = pulseIn(ECHO_PIN, 1);
    return duration * 0.034 / 2.0;
}

// Get tilt angle from MPU6050
float getTiltAngle(void) {
    mpu_update(&mpu);
    return fabs(mpu_getAngleX(&mpu));
}

// Check fire sensor
bool isFireDetected(void) {
    int fireStatus = digitalRead(FIRE_SENSOR_PIN);
    printf("Fire Sensor (DO) State: %d\n", fireStatus);
    return fireStatus == 0;
}

// Get current GPS location as string
char* getLocationString(void) {
    static char location[100];
    
    if (gps.isValid) {
        snprintf(location, sizeof(location), "Location: %.6f, %.6f", 
                 gps.latitude, gps.longitude);
    } else {
        strcpy(location, "Location: Not Available");
    }
    
    return location;
}

// Send SMS alert
void sendSMSAlert(const char* message) {
    printf("Sending SMS Alert...\n");
    serial_println(&sim800l, "AT+CMGF=1");
    usleep(100000);
    
    char cmd[100];
    sprintf(cmd, "AT+CMGS=\"%s\"", ALERT_PHONE_NUMBER);
    serial_println(&sim800l, cmd);
    usleep(100000);
    
    serial_println(&sim800l, message);
    serial_write(&sim800l, 26); // Ctrl+Z
    usleep(5000000);
}

// Make a phone call
void makeCall(void) {
    printf("Making Call Alert...\n");
    
    char cmd[100];
    sprintf(cmd, "ATD%s;", ALERT_PHONE_NUMBER);
    serial_println(&sim800l, cmd);
    usleep(10000000); // Ring 10 sec
    serial_println(&sim800l, "ATH"); // Hang up
}

// Send GPS data to Firebase
void updateLocationToFirebase(void) {
    if (firebase_ready() && gps.isValid) {
        // Create a JSON object for GPS data
        FirebaseJson json;
        firebase_json_set(&json, "latitude", gps.latitude);
        firebase_json_set(&json, "longitude", gps.longitude);
        
        // Current timestamp as node name
        char nodePath[100];
        sprintf(nodePath, "/gps_data/%lu", millis());
        
        // Send data to Firebase
        if (firebase_rtdb_setJSON(&fbdo, nodePath, &json)) {
            printf("GPS location sent to Firebase successfully\n");
        } else {
            printf("Failed to send GPS data to Firebase\n");
            printf("Reason: %s\n", fbdo.errorReason);
        }
    }
}

void setup(void) {
    // Initialize serial communication
    printf("Starting Accident Detection System\n");
    
    // Initialize I2C
    wire_begin();

    // OLED Init
    display.width = SCREEN_WIDTH;
    display.height = SCREEN_HEIGHT;
    display.dc_pin = OLED_DC;
    display.reset_pin = OLED_RESET;
    display.cs_pin = OLED_CS;
    
    if (!display_begin(&display)) {
        printf("SSD1306 failed\n");
        exit(1);
    }

    // Pins setup
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, 0);
    pinMode(FIRE_SENSOR_PIN, INPUT_PULLUP);

    // MPU6050 Init
    mpu_begin(&mpu);
    mpu_calcGyroOffsets(&mpu, true);
    printf("MPU6050 ready\n");

    // GSM and GPS Init
    sim800l.rx_pin = 16;
    sim800l.tx_pin = 17;
    serial_begin(&sim800l, 9600);
    
    gpsSerial.rx_pin = 26;
    gpsSerial.tx_pin = 27;
    serial_begin(&gpsSerial, 9600);
    printf("SIM800L & GPS ready\n");

    // WiFi connection
    wifi_begin(WIFI_SSID, WIFI_PASSWORD);
    printf("Connecting to WiFi");
    
    int attempts = 0;
    while (!wifi_connected() && attempts < 20) {
        usleep(500000);
        printf(".");
        attempts++;
    }
    
    if (wifi_connected()) {
        printf("\nConnected with IP: %s\n", wifi_localIP());
        
        // Firebase configuration
        config.api_key = API_KEY;
        config.database_url = DATABASE_URL;
        
        // Connect to Firebase
        firebase_begin(&config, &auth);
        firebase_reconnectWiFi(true);
        printf("Firebase connected\n");
    } else {
        printf("\nWiFi connection failed\n");
    }

    display_clearDisplay(&display);
}

void loop(void) {
    float distance = getDistance();
    float angle = getTiltAngle();
    bool fireDetected = isFireDetected();

    // Read GPS data
    while (serial_available(&gpsSerial)) {
        char c = serial_read(&gpsSerial);
        gps_encode(&gps, c);
    }

    // Serial debug output
    printf("Tilt: %.2f° | Dist: %.2f cm | Fire: %s",
           angle, distance, fireDetected ? "YES" : "NO");

    if (gps.isValid) {
        printf(" | GPS: %.6f, %.6f\n", gps.latitude, gps.longitude);
    } else {
        printf(" | GPS: Not Available\n");
    }

    // Update Firebase with GPS data periodically
    unsigned long currentMillis = millis();
    if (currentMillis - lastFirebaseUpdate >= firebaseInterval) {
        lastFirebaseUpdate = currentMillis;
        updateLocationToFirebase();
    }

    // OLED display
    display_clearDisplay(&display);
    display_setTextSize(&display, 2);
    display_setTextColor(&display, 1);
    display_setCursor(&display, 10, 10);

    if (fireDetected) {
        display_print(&display, "FIRE ALERT!");
        digitalWrite(BUZZER_PIN, 1);

        if (!smsSent) {
            char msg[200];
            sprintf(msg, "🔥 Fire Detected!\n%s", getLocationString());
            sendSMSAlert(msg);
            smsSent = true;
        }
        if (!callMade) {
            makeCall();
            callMade = true;
        }
    } 
    else if (distance > 0 && distance <= 10) {
        display_print(&display, "Careful!");
        display_setCursor(&display, 10, 30);
        display_print(&display, "Object Close");
        digitalWrite(BUZZER_PIN, 1);
    } 
    else if (distance > 10 && distance <= 20) {
        display_print(&display, "Pedestrian");
        display_setCursor(&display, 10, 30);
        display_print(&display, "Detected");
        digitalWrite(BUZZER_PIN, 0);
    } 
    else {
        display_print(&display, "Safe Zone");
        digitalWrite(BUZZER_PIN, 0);
    }

    if (angle >= 30) {
        display_setCursor(&display, 10, 50);
        display_setTextSize(&display, 1);
        display_print(&display, "Angle: ");
        display_print(&display, angle);
        display_print(&display, " deg");
    }

    display_display(&display);

    // Tilt alert with GPS
    if (angle >= 45 && !fireDetected) {
        if (!smsSent) {
            char msg[200];
            sprintf(msg, "⚠️ High Tilt Detected!\n%s", getLocationString());
            sendSMSAlert(msg);
            smsSent = true;
        }
        if (!callMade) {
            makeCall();
            callMade = true;
        }
    }

    // Reset flags when safe
    if (!fireDetected && angle < 15) {
        smsSent = false;
        callMade = false;
    }

    usleep(500000); // 500ms delay
}

int main(void) {
    setup();
    
    // Main program loop
    while (1) {
        loop();
    }
    
    return 0;
}
