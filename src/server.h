#ifndef SERVER_H
#define SERVER_H

#include <ArduinoJson.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <WiFi.h>

char ssid[] = "GSECEE Joystick";
char *senha = (char *)"12345678";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String htmlText = "";
String cssText = "";
String jsText = "";

void handleWebSocketMessage(void *arg, uint8_t *data, size_t length) {
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  if (info->final && info->index == 0 && info->len == length && info->opcode == WS_TEXT) {
    data[length] = 0;

    const int jsonSize = JSON_OBJECT_SIZE(2);
    StaticJsonDocument<jsonSize> json;
    DeserializationError error = deserializeJson(json, data, length);

    if (json.containsKey("angulo") && json.containsKey("velocidade")) {
      int16_t angulo = json["angulo"];
      int16_t velocidade = json["velocidade"];
      Serial.printf("Angulo: %d  -  Velocidade: %d\n", angulo, velocidade);
    }

    if (json.containsKey("button")) {
      String button = json["button"];
      Serial.printf("Botão: %s\n", button);
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t length) {
  switch (type) {
  case WS_EVT_CONNECT: {
    if (ws.count() == 1) {
      Serial.printf("Cliente WebSocket #%u conectado de %s\n", client->id(), client->remoteIP().toString().c_str());
    } else {
      Serial.printf("Cliente WebSocket #%u de %s foi rejeitado\n", client->id(), client->remoteIP().toString().c_str());
      ws.close(client->id());
    }
    break;
  }
  case WS_EVT_DISCONNECT: {
    Serial.printf("Cliente WebSocket #%u desconectado\n", client->id());
    break;
  }
  case WS_EVT_DATA: {
    handleWebSocketMessage(arg, data, length);
    break;
  }
  case WS_EVT_PONG:
  case WS_EVT_ERROR:
    break;
  }
}

void setupServer() {
  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
  }

  File htmlFile = SPIFFS.open("/index.html");
  while (htmlFile.available()) {
    htmlText += char(htmlFile.read());
  }
  htmlFile.close();

  File cssFile = SPIFFS.open("/styles.css");
  while (cssFile.available()) {
    cssText += char(cssFile.read());
  }
  cssFile.close();

  File jsFile = SPIFFS.open("/core.js");
  while (jsFile.available()) {
    jsText += char(jsFile.read());
  }
  jsFile.close();

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", htmlText.c_str());
  });

  server.on("/styles.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/css", cssText.c_str());
  });

  server.on("/core.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/javascript", jsText.c_str());
  });

  server.on("/logo.png", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/logo.png", "image/png");
  });

  server.on("/favicon.ico", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/favicon.ico", "image/favicon");
  });
}

void initServer() {
  const char *mac = WiFi.macAddress().c_str();
  if (!WiFi.softAP(ssid, senha)) {
    Serial.println("Erro ao iniciao o servidor web");
  }
  String ip = WiFi.softAPIP().toString();
  Serial.println("Servidor iniciado");
  Serial.println("IP de acesso: " + ip);

  setupServer();
  server.begin();
}

#endif