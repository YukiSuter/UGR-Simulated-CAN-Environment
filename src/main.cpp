#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <CAN.h>

// Define your SSID and password
const char* ssid = "UGR-Simulated-CAN-Environment";
const char* password = "highvoltage25";

AsyncWebServer server(80);  // Create an AsyncWebServer on port 80

#define TX_GPIO_NUM   40
#define RX_GPIO_NUM   41


void setup() {
  Serial.begin(115200);
  
  CAN.setPins (RX_GPIO_NUM, TX_GPIO_NUM);

  if (!LittleFS.begin()) {  // Initialise LittleFS
    Serial.println("An Error has occurred whilst mounting LittleFS");
    return;
  }

  // Configure ESP32 as an access point
  WiFi.softAP(ssid, password);

  Serial.println("Access Point started");
  Serial.print("IP address: ");
  Serial.println(WiFi.softAPIP());

  // Define REST API endpoints
  server.on("/test", HTTP_GET, [](AsyncWebServerRequest *request){
    // Example: Change the behavior of the main program
    Serial.println("Test URL requested");
    request->send(200, "text/plain", "Test Successful;");
  });

  server.on("/api/send_CAN", HTTP_GET, [](AsyncWebServerRequest *request){
    // Example: Change the behavior of the main program
    Serial.println("CAN SEND: ");
    request->send(200, "text/plain", "Test Successful;");
  });

  // Serve the web page
  server.serveStatic("/", LittleFS, "/").setDefaultFile("main.html");

  server.onNotFound([](AsyncWebServerRequest *request) {
    // Respond with 404 for unmatched paths
    Serial.println("Request for unmatched path: " + request->url());
    request->send(404, "text/plain", "Not Found");
  });


  // Start the server
  server.begin();
}

void loop() {
  // Main program logic
}