#ifndef PWM_H
#define PWM_H

#include <Arduino.h>

const int pwmButton = 0;
const int pwmLeft = 1;
const int pwmRight = 2;

const int buttonLed = 13;
const int reLed = 12;
const int leftEngine = 32;
const int rightEngine = 27;

const double reduceSpeed = 0.10;

void initPWM() {
  ledcSetup(pwmButton, 5000, 8);
  ledcAttachPin(buttonLed, 0);

  ledcSetup(pwmLeft, 5000, 8);
  ledcSetup(pwmRight, 5000, 8);

  ledcAttachPin(leftEngine, 1);
  ledcAttachPin(rightEngine, 2);

  pinMode(reLed, OUTPUT);
}

void setButtonPWM(int value) {
  ledcWrite(0, value);
  delay(500);
  ledcWrite(0, 0);
}

void updateControl(String direcao, int velocidade) {
  if (direcao == "parado") {
    ledcWrite(pwmLeft, 0);
    ledcWrite(pwmRight, 0);
    digitalWrite(reLed, LOW);
  }

  if (direcao == "cima") {
    ledcWrite(pwmLeft, 255 * velocidade / 100);
    ledcWrite(pwmRight, 255 * velocidade / 100);

    digitalWrite(reLed, LOW);
  }
  if (direcao == "inferior" && velocidade > 10) {
    ledcWrite(pwmLeft, 255 * velocidade / 100);
    ledcWrite(pwmRight, 255 * velocidade / 100);

    digitalWrite(reLed, HIGH);
  }

  if (direcao == "esquerda") {
    ledcWrite(pwmLeft, 0);
    ledcWrite(pwmRight, 255 * velocidade / 100);

    digitalWrite(reLed, LOW);
  }
  if (direcao == "direita") {
    ledcWrite(pwmLeft, 255 * velocidade / 100);
    ledcWrite(pwmRight, 0);

    digitalWrite(reLed, LOW);
  }

  if (direcao == "superior_esquerdo") {
    ledcWrite(pwmLeft, (255 * velocidade / 100) * reduceSpeed);
    ledcWrite(pwmRight, (255 * velocidade / 100));

    digitalWrite(reLed, LOW);
  }
  if (direcao == "superior_direito") {
    ledcWrite(pwmLeft, 255 * velocidade / 100);
    ledcWrite(pwmRight, (255 * velocidade / 100) * reduceSpeed);

    digitalWrite(reLed, LOW);
  }

  if (direcao == "inferior_esquerdo" && velocidade > 10) {
    ledcWrite(pwmLeft, (255 * velocidade / 100) * reduceSpeed);
    ledcWrite(pwmRight, (255 * velocidade / 100));

    digitalWrite(reLed, HIGH);
  }
  if (direcao == "inferior_direito" && velocidade > 10) {
    ledcWrite(pwmLeft, 255 * velocidade / 100);
    ledcWrite(pwmRight, (255 * velocidade / 100) * reduceSpeed);

    digitalWrite(reLed, HIGH);
  }
}

#endif