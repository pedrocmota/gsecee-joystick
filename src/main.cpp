#include <ArduinoJson.h>
#include <pwm.h>
#include <server.h>

void setup() {
  Serial.begin(115200);
  initPWM();
  initServer();
}

void loop() {
  const int jsonSize = JSON_OBJECT_SIZE(1);
  StaticJsonDocument<jsonSize> json;
  json["vbat"] = "50";
  size_t msgSize = measureJson(json);
  char msg[msgSize + 1];
  serializeJson(json, msg, (msgSize + 1));
  msg[msgSize] = 0;
  ws.textAll(msg, msgSize);
  delay(2000);
}