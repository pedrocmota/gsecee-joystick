let connection
let connected = false
let inFullScreen = false

const openConnection = () => {
  connection = new WebSocket(`ws://${window.location.hostname}/ws`)
  connection.onopen = () => {
    document.getElementById('opening').style.display = 'none'
    document.getElementById('connected').style.display = 'block'
    document.getElementById('unconnected').style.display = 'none'
    connected = true
  }

  connection.onerror = (error) => {
    document.getElementById('opening').style.display = 'none'
    document.getElementById('connected').style.display = 'none'
    document.getElementById('unconnected').style.display = 'block'
    connected = false
    console.error(error)
  }

  connection.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data["vbat"]) {
      const vbat = parseInt(data["vbat"])
      const vbatEle = document.getElementById("battery_part")
      const vbatText = document.getElementById("battery_value_text")
      if (vbat == 0) {
        vbat = 5
      }
      vbatEle.style.width = `calc(${vbat}% - 6px)`;
      vbatText.innerText = `${vbat}%`
      if (vbat < 20) {
        vbatEle.style.backgroundColor = "#c4270c";
      }
      else {
        vbatEle.style.backgroundColor = "#2aa511";
      }
    }
  };
}

const reconnect = () => {
  document.getElementById('opening').style.display = 'block'
  document.getElementById('connected').style.display = 'none'
  document.getElementById('unconnected').style.display = 'none'
  openConnection()
}

openConnection()

const fullScreenToogle = () => {
  if (inFullScreen) {
    document.getElementById('fullscreen').innerHTML = 'Ir tela cheia'
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  } else {
    document.getElementById('fullscreen').innerHTML = 'Sair tela cheia'
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }
  inFullScreen = !inFullScreen
}

let lastSpeed = null
let lastDirection = null

const send_joystick = (velocidade, angulo) => {
  let direcao = null
  if (angulo <= 120 && angulo > 60) {
    direcao = 'cima'
  }
  //superior direito
  if (angulo <= 60 && angulo > 30) {
    direcao = 'superior_direito'
  }
  //direito
  if ((angulo <= 30 && angulo > 0) || (angulo < 360 && angulo > 330)) {
    direcao = 'direita'
  }
  //inferior direito
  if (angulo <= 330 && angulo > 300) {
    direcao = 'inferior_direito'
  }
  //inferior
  if (angulo <= 300 && angulo > 240) {
    direcao = 'inferior'
  }
  //inferior esquerdo
  if (angulo <= 240 && angulo > 210) {
    direcao = 'inferior_esquerdo'
  }
  //esquerdo
  if (angulo <= 210 && angulo > 150) {
    direcao = 'esquerda'
  }
  //superior esquerdo
  if (angulo <= 150 && angulo > 120) {
    direcao = 'superior_esquerdo'
  }
  if (angulo === 0 || velocidade === 0) {
    direcao = 'parado'
  }
  if (connected) {
    if ((lastDirection !== direcao || lastSpeed !== velocidade) && direcao !== null) {
      lastSpeed = velocidade
      lastDirection = direcao
      var data = {
        velocidade: velocidade,
        direcao: direcao
      }
      data = JSON.stringify(data)
      connection.send(data)
    }
  }
}

let rightButton = document.getElementById("rightButton")
let timer = 1
let timerInterval = 0

const sendButton = () => {
  if (connected) {
    var data = {"button": 'button1'}
    data = JSON.stringify(data)
    connection.send(data)
  }
}

rightButton.addEventListener("touchstart", function () {
  timerInterval = setInterval(function () {
    if (timer < 8) {
      timer += 1;
    }
  }, 100);
})

rightButton.addEventListener("touchend", function () {
  let force = parseInt((timer * 255 / 8).toFixed(0))
  clearInterval(timerInterval);
  timer = 1;

  if (connected) {
    var data = {
      button: 'button1',
      force: force
    }
    data = JSON.stringify(data)
    connection.send(data)
  }
})

let canvas_joystick, ctx_joystick, ctx_button

window.addEventListener('load', () => {
  canvas_joystick = document.getElementById('canvas_joystick')
  ctx_joystick = canvas_joystick.getContext('2d')

  resize()

  canvas_joystick.addEventListener('mousedown', startDrawing)
  canvas_joystick.addEventListener('mouseup', stopDrawing)
  canvas_joystick.addEventListener('mousemove', Draw)
  canvas_joystick.addEventListener('touchstart', startDrawing)
  canvas_joystick.addEventListener('touchend', stopDrawing)
  canvas_joystick.addEventListener('touchcancel', stopDrawing)
  canvas_joystick.addEventListener('touchmove', Draw)
  window.addEventListener('resize', resize)
  document.getElementById('speed').innerText = 0
  document.getElementById('angle').innerText = 0
  document.getElementById('button').innerText = 0
})

let width, height, radius, button_size
let origin_joystick = {x: 0, y: 0}
let origin_button = {x: 0, y: 0}
const width_to_radius_ratio = 0.04
const width_to_size_ratio = 0.15
const radius_factor = 7

const resize = () => {
  width = 260
  radius = width_to_radius_ratio * width
  button_size = width_to_size_ratio * width
  height = radius * radius_factor * 2 + 100

  ctx_joystick.canvas.width = width
  ctx_joystick.canvas.height = height
  origin_joystick.x = width / 2
  origin_joystick.y = height / 2
  joystick(origin_joystick.x, origin_joystick.y)
}

const joystick_background = () => {
  ctx_joystick.clearRect(0, 0, canvas_joystick.width, canvas_joystick.height)
  ctx_joystick.beginPath()
  ctx_joystick.arc(origin_joystick.x, origin_joystick.y, radius * radius_factor, 0, Math.PI * 2, true)
  ctx_joystick.fillStyle = '#202023'
  ctx_joystick.fill()
}

const joystick = (x, y) => {
  joystick_background()
  ctx_joystick.beginPath()
  ctx_joystick.arc(x, y, radius * 3, 0, Math.PI * 2, true)
  ctx_joystick.fillStyle = 'lightgray'
  ctx_joystick.fill()
  ctx_joystick.strokeStyle = 'lightgray'
  ctx_joystick.lineWidth = 2
  ctx_joystick.stroke()
}

let coord = {x: 0, y: 0}
let paint = false
let movimento = 0

const getPosition_joystick = event => {
  var mouse_x = event.clientX || event.touches[0].clientX || event.touches[1].clientX
  var mouse_y = event.clientY || event.touches[0].clientY || event.touches[1].clientY
  coord.x = mouse_x - canvas_joystick.offsetLeft
  coord.y = mouse_y - canvas_joystick.offsetTop
}

const in_circle = () => {
  var current_radius = Math.sqrt(
    Math.pow(coord.x - origin_joystick.x, 2) + Math.pow(coord.y - origin_joystick.y, 2)
  )
  if ((radius * radius_factor) >= current_radius) {
    return true
  } else {
    return false
  }
}

const startDrawing = event => {
  paint = true
  getPosition_joystick(event)
  if (in_circle()) {
    joystick(coord.x, coord.y)
    Draw(event)
  }
}

const stopDrawing = () => {
  paint = false
  joystick(origin_joystick.x, origin_joystick.y)
  document.getElementById('speed').innerText = 0
  document.getElementById('angle').innerText = 0
  if (movimento == 1) {
    send_joystick(0, 0)
    movimento = 0
  }
}

const Draw = event => {
  if (paint) {
    getPosition_joystick(event)
    var angle_in_degrees, x, y, speed
    var angle = Math.atan2((coord.y - origin_joystick.y), (coord.x - origin_joystick.x))
    if (in_circle()) {
      x = coord.x - radius / 2
      y = coord.y - radius / 2
    } else {
      x = radius * radius_factor * Math.cos(angle) + origin_joystick.x
      y = radius * radius_factor * Math.sin(angle) + origin_joystick.y
    }

    var speed = Math.round(100 * Math.sqrt(Math.pow(x - origin_joystick.x, 2) + Math.pow(y - origin_joystick.y, 2)) / (radius * radius_factor)) // consider the outer circle
    if (speed > 100) {
      speed = 100
    }

    if (Math.sign(angle) == - 1) {
      angle_in_degrees = Math.round(- angle * 180 / Math.PI)
    }
    else {
      angle_in_degrees = Math.round(360 - angle * 180 / Math.PI)
    }

    joystick(x, y)
    document.getElementById('speed').innerText = speed
    document.getElementById('angle').innerText = angle_in_degrees
    send_joystick(speed, angle_in_degrees);
    movimento = 1
  }
}