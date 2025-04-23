#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MPU6050_tockn.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include <Geohash.h>

// OLED display size
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// SPI Pins for OLED
#define OLED_MOSI   23
#define OLED_CLK    18
#define OLED_DC     5
#define OLED_CS     15
#define OLED_RESET  4

// Ultrasonic Sensor
#define TRIG_PIN 13
#define ECHO_PIN 12

// Buzzer
#define BUZZER_PIN 14

// Fire Sensor
#define FIRE_SENSOR_PIN 32

// WiFi Credentials
#define WIFI_SSID "FOE-Student"
#define WIFI_PASSWORD "abcd@1234"

// Firebase Configuration
#define FIREBASE_HOST "AIzaSyCQN1puM2Ny15YKu7DFREURCQXtQDe6cB4"
#define API_KEY "https://accident-detection-syste-ccc2c-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Firebase objects
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

// OLED Display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &SPI, OLED_DC, OLED_RESET, OLED_CS);

// MPU6050 Gyroscope
MPU6050 mpu(Wire);

// SIM800L GSM
HardwareSerial sim800l(1);  // RX=16, TX=17

// GPS Module
HardwareSerial gpsSerial(2);  // RX=26, TX=27
TinyGPSPlus gps;

// Geohash Generator
Geohash geohashGenerator;

// Flags
bool smsSent = false;
bool callMade = false;

// Timing
unsigned long lastFirebaseUpdate = 0;
const unsigned long firebaseInterval = 10000;  // 10 seconds

void setup() {
  Serial.begin(115200);
  Wire.begin();

  // OLED Init
  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println("SSD1306 failed");
    while (true);
  }

  // Pins setup
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  pinMode(FIRE_SENSOR_PIN, INPUT_PULLUP);

  // MPU6050 Init
  mpu.begin();
  mpu.calcGyroOffsets(true);
  Serial.println("MPU6050 ready");

  // GSM and GPS Init
  sim800l.begin(9600, SERIAL_8N1, 16, 17);
  gpsSerial.begin(9600, SERIAL_8N1, 26, 27);
  Serial.println("SIM800L & GPS ready");

  // WiFi Connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  // Firebase Init
  config.host = FIREBASE_HOST;
  config.api_key = API_KEY;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  display.clearDisplay();
}

String generateGeohash(double lat, double lng) {
  return geohashGenerator.encode(lat, lng, 10).c_str();
}

void sendToFirebase(double lat, double lng) {
  if (Firebase.ready() && millis() - lastFirebaseUpdate >= firebaseInterval) {
    // Generate geohash
    String geoHash = generateGeohash(lat, lng);
    
    // Create JSON payload
    FirebaseJson json;
    json.set("g", geoHash);
    json.set("l/[0]", lat);
    json.set("l/[1]", lng);
    json.set("timestamp", millis());  // Use actual timestamp from GPS/NTP in production

    // Firebase path
    String path = "geofire/";
    path += Firebase.pushId();

    if (Firebase.RTDB.setJSON(&firebaseData, path.c_str(), &json)) {
      Serial.println("Firebase update successful");
      lastFirebaseUpdate = millis();
    } else {
      Serial.println("Firebase error: " + firebaseData.errorReason());
    }
  }
}

float getDistance() {
  digitalWrite(TRIG_PIN, LOW); 
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

float getTiltAngle() {
  mpu.update();
  return abs(mpu.getAngleX());
}

bool isFireDetected() {
  int fireStatus = digitalRead(FIRE_SENSOR_PIN);
  return fireStatus == LOW;
}

String getLocationString() {
  String loc = "";
  if (gps.location.isValid()) {
    loc += "Location: ";
    loc += String(gps.location.lat(), 6);
    loc += ", ";
    loc += String(gps.location.lng(), 6);
  } else {
    loc = "Location: Not Available";
  }
  return loc;
}

void sendSMSAlert(String message) {
  Serial.println("Sending SMS Alert...");
  sim800l.println("AT+CMGF=1");
  delay(100);
  sim800l.print("AT+CMGS=\"");
  sim800l.print("+94705820044");
  sim800l.println("\"");
  delay(100);
  sim800l.println(message);
  sim800l.write(26);
  delay(5000);
}

void makeCall() {
  Serial.println("Making Call Alert...");
  sim800l.print("ATD");
  sim800l.print("+94705820044");
  sim800l.println(";");
  delay(10000);
  sim800l.println("ATH");
}

void loop() {
  float distance = getDistance();
  float angle = getTiltAngle();
  bool fireDetected = isFireDetected();

  // Read GPS data
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        sendToFirebase(gps.location.lat(), gps.location.lng());
      }
    }
  }

  // Display logic
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 10);

  if (fireDetected) {
    display.print("FIRE ALERT!");
    digitalWrite(BUZZER_PIN, HIGH);

    if (!smsSent) {
      String msg = "🔥 Fire Detected!\n" + getLocationString();
      sendSMSAlert(msg);
      smsSent = true;
    }
    if (!callMade) {
      makeCall();
      callMade = true;
    }
  } 
  else if (distance > 0 && distance <= 20) {
    display.print("Careful!");
    display.setCursor(10, 30);
    display.print("Object Close");
    digitalWrite(BUZZER_PIN, HIGH);
  } 
  else if (distance > 20 && distance <= 30) {
    display.print("Object");
    display.setCursor(10, 30);
    display.print("Detected");
    digitalWrite(BUZZER_PIN, LOW);
  } 
  else {
    display.print("Safe Zone");
    digitalWrite(BUZZER_PIN, LOW);
  }

  if (angle >= 30) {
    display.setCursor(10, 50);
    display.setTextSize(1);
    display.print("Angle: ");
    display.print(angle);
    display.print(" deg");
  }

  display.display();

  // Tilt alert
  if (angle >= 45 && !fireDetected) {
    if (!smsSent) {
      String msg = "⚠️ High Tilt Detected!\n" + getLocationString();
      sendSMSAlert(msg);
      smsSent = true;
    }
    if (!callMade) {
      makeCall();
      callMade = true;
    }
  }

  // Reset flags
  if (!fireDetected && angle < 15) {
    smsSent = false;
    callMade = false;
  }

  delay(500);
}