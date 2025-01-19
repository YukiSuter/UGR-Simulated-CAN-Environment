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
JSONVar jsonmessage;

#define CAN_TX_GPIO GPIO_NUM_2  // Use `gpio_num_t` instead of int
#define CAN_RX_GPIO GPIO_NUM_1


twai_general_config_t normalConfig = TWAI_GENERAL_CONFIG_DEFAULT(CAN_TX_GPIO, CAN_RX_GPIO, TWAI_MODE_NORMAL);
  
twai_general_config_t loopbackConfig = TWAI_GENERAL_CONFIG_DEFAULT(
    CAN_TX_GPIO, 
    CAN_RX_GPIO, 
    TWAI_MODE_NO_ACK  // Enables internal loopback mode
);

// WEBSOCKET ======================================

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    Serial.printf("Ignoring websocket request: " + WS_TEXT);
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

String rxToJSON(twai_message_t rx_message) {
  jsonmessage["type"] = "canRx";
  jsonmessage["body"]["id"] = (rx_message.identifier, HEX);
  jsonmessage["body"]["dataLength"] = rx_message.data_length_code;

  for (int i = 0; i < rx_message.data_length_code; i++) {
      jsonmessage["body"]["data"][i] = rx_message.data[i];
  }
  String rx_message_json = JSON.stringify(jsonmessage);

  return rx_message_json;
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

// void print_twai_status() {
//     twai_status_info_t status;
//     if (twai_get_status_info(&status) == ESP_OK) {
//         Serial.println("==== TWAI (CAN) Status ====");
//         Serial.print("State: ");
//         switch (status.state) {
//             case TWAI_STATE_STOPPED: Serial.println("Stopped"); break;
//             case TWAI_STATE_RUNNING: Serial.println("Running"); break;
//             case TWAI_STATE_BUS_OFF: Serial.println("Bus Off (error)"); break;
//             case TWAI_STATE_RECOVERING: Serial.println("Recovering from Bus Off"); break;
//         }

//         Serial.print("Messages Received (msgs_to_rx): "); Serial.println(status.msgs_to_rx);
//         Serial.print("Messages Sent (msgs_to_tx): "); Serial.println(status.msgs_to_tx);

//         Serial.print("TX Queue Failed Count: "); Serial.println(status.tx_failed_count);
//         Serial.print("Arbitration Lost Count: "); Serial.println(status.arb_lost_count);
//         Serial.print("Bus Error Count: "); Serial.println(status.bus_error_count);

//         Serial.print("TX Errors: "); Serial.println(status.tx_error_counter);
//         Serial.print("RX Errors: "); Serial.println(status.rx_error_counter);
//     } else {
//         Serial.println("Failed to retrieve TWAI status.");
//     }
// }

void loop() {
  // twai_message_t tx_message;
  // tx_message.identifier = 0x123;  // Standard 11-bit ID
  // tx_message.extd = 0;  // Standard CAN frame (not extended)
  // tx_message.rtr = 0;  // Ensure it's a normal data frame
  // tx_message.data_length_code = 4;  // Number of data bytes
  // memset(tx_message.data, 0, 8);  // Ensure no residual values
  // tx_message.data[0] = 0xAA;
  // tx_message.data[1] = 0xBB;
  // tx_message.data[2] = 0xCC;
  // tx_message.data[3] = 0xDD;

  // // Transmit message
  // if (twai_transmit(&tx_message, pdMS_TO_TICKS(1000)) == ESP_OK) {
  //     Serial.println("Message sent in loopback mode!");
  // } else {
  //     Serial.println("Failed to send message");
  // }

  // Receive message (it should loop back)
  twai_message_t rx_message;
  if (twai_receive(&rx_message, pdMS_TO_TICKS(1000)) == ESP_OK) {
      Serial.print("Received message with ID: 0x");
      Serial.println(rx_message.identifier, HEX);

      Serial.print("Data: ");
      for (int i = 0; i < rx_message.data_length_code; i++) {
          Serial.print(rx_message.data[i]);
          Serial.print(" ");
      }
      String rx_message_json = rxToJSON(rx_message);
      Serial.println("Sending JSON to websockets: "+rx_message_json);
      ws.textAll(rx_message_json);
  } else {
      Serial.println("No message received");
  }
  delay(500);  // Adjust delay as needed
  
  ws.cleanupClients();
}