#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include "driver/twai.h"
#include <string>
#include <Arduino_JSON.h>

// Define your SSID and password
const char* ssid = "UGR-Simulated-CAN-Environment";
const char* password = "highvoltage25";

AsyncWebServer server(80);  // Create an AsyncWebServer on port 80
AsyncWebSocket ws("/ws");

// Statuses

bool CAN_monitor = false;


#define CAN_TX_GPIO GPIO_NUM_2  // Use `gpio_num_t` instead of int
#define CAN_RX_GPIO GPIO_NUM_1


twai_general_config_t normalConfig = TWAI_GENERAL_CONFIG_DEFAULT(CAN_TX_GPIO, CAN_RX_GPIO, TWAI_MODE_NORMAL);
  
twai_general_config_t loopbackConfig = TWAI_GENERAL_CONFIG_DEFAULT(
    CAN_TX_GPIO, 
    CAN_RX_GPIO, 
    TWAI_MODE_NO_ACK  // Enables internal loopback mode
);

String twaiToJson(twai_message_t message, String type) {
  JSONVar jsonmessage;
  jsonmessage["type"] = type;
  jsonmessage["body"]["id"] = (message.identifier, HEX);
  jsonmessage["body"]["dataLength"] = message.data_length_code;

  for (int i = 0; i < message.data_length_code; i++) {
      jsonmessage["body"]["data"][i] = message.data[i];
  }

  String jsonstring = JSON.stringify(jsonmessage);

  return jsonstring;
}



void messageTx(uint32_t identifier, uint8_t data_length_code, const uint8_t* data) {
  twai_message_t tx_message;
  tx_message.identifier = identifier;  // Standard 11-bit ID
  tx_message.extd = 0;  // Standard CAN frame (not extended)
  tx_message.rtr = 0;  // Ensure it's a normal data frame
  tx_message.data_length_code = data_length_code;  // Number of data bytes
  memset(tx_message.data, 0, 8);  // Ensure no residual values
  memcpy(tx_message.data, data, data_length_code);

  // Transmit message
  if (twai_transmit(&tx_message, pdMS_TO_TICKS(1000)) == ESP_OK) {
      Serial.println("Message Sent");
      String tx_message_json = twaiToJson(tx_message, "canTx");
      Serial.println("Sending JSON to websockets: "+tx_message_json);
      ws.textAll(tx_message_json);
  } else {
      Serial.println("Failed to send message");
  }
}

twai_message_t checkForMessages() {
  twai_message_t rx_message;
  if (twai_receive(&rx_message, pdMS_TO_TICKS(1000)) == ESP_OK) {
      Serial.print("Received message with ID: 0x");
      Serial.println(rx_message.identifier, HEX);

      return rx_message;
  } else {
      Serial.println("No message received");
      twai_message_t empty_message = {};
      empty_message.identifier = 0xFFFFFFFF;  // Indicate an invalid message
      return empty_message;
  }
}

// WEBSOCKET ======================================
#include <Arduino_JSON.h>

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;

    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
        // Convert received data to a String
        String message = String((char*)data).substring(0, len);

        // Parse JSON
        JSONVar request = JSON.parse(message);

        if (JSON.typeof(request) == "undefined") {
            Serial.println("Parsing failed!");
            return;
        }

        // Ensure message type is "sendCAN"
        if (strcmp((const char*)request["type"], "sendCAN") == 0) {
            // Extract values from JSON
            uint32_t id = (uint32_t)(int)request["content"]["id"];
            uint8_t data_length = (uint8_t)(int)request["content"]["data_length"];

            // Extract data array
            JSONVar jsonData = request["content"]["data"];
            uint8_t can_data[8] = {0}; // Default to zeros (CAN frames are max 8 bytes)

            // Ensure data does not exceed 8 bytes
            for (int i = 0; i < min((int)jsonData.length(), 8); i++) {
                can_data[i] = (uint8_t)(int)jsonData[i];
            }

            Serial.printf("Sending CAN message with data: id=",id," data_length=", data_length, "data=",can_data);

            // Send the CAN message
            messageTx(id, data_length, can_data);
        } else {
            Serial.printf("No matching WebSocket request. Ignoring message: %s\n", message.c_str());
        }
    }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}


// Setup ======================================

void setup() {
  Serial.begin(115200);


  // CAN SETUP ===========================
  Serial.println("Initializing CAN Receiver...");

  // TWAI Configuration for RX only
  twai_general_config_t g_config = normalConfig;
  twai_timing_config_t t_config = TWAI_TIMING_CONFIG_500KBITS();
  twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL(); // Accept all messages

  // Install and start the TWAI driver
  if (twai_driver_install(&g_config, &t_config, &f_config) == ESP_OK) {
      Serial.println("TWAI driver installed");
  } else {
      Serial.println("Failed to install TWAI driver");
      return;
  }

  if (twai_start() == ESP_OK) {
      Serial.println("TWAI driver started");
  } else {
      Serial.println("Failed to start TWAI driver");
      return;
  }

  // ACCESS POINT SETUP ==================

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

  server.on("/api/send_CAN", HTTP_POST, [](AsyncWebServerRequest *request){
    // Example: Change the behavior of the main program
    Serial.println("CAN SEND: ");
    int params = request->params();
    Serial.println(params);
    for (int i = 0; i < params; i++) {
      AsyncWebParameter* p = request->getParam(i);
      Serial.printf("POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
    }
    request->send(200, "text/plain", "Test Successful;");
  });

  // Serve the web page
  server.serveStatic("/", LittleFS, "/").setDefaultFile("main.html");

  server.onNotFound([](AsyncWebServerRequest *request) {
    // Respond with 404 for unmatched paths
    Serial.println("Request for unmatched path: " + request->url());
    request->send(404, "text/plain", "Not Found");
  });

  
  initWebSocket();

  // Start the server
  server.begin();
}


void loop() {
  
  twai_message_t msgcheck = checkForMessages();

  if (msgcheck.identifier < 0xFFFFFFFF) {
    String msgcheck_json = twaiToJson(msgcheck,"canRx");
    Serial.println("Sending JSON to websockets: "+msgcheck_json);
    ws.textAll(msgcheck_json);
  }
  

  delay(500);  // Adjust delay as needed
  
  ws.cleanupClients();
}