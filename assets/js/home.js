const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
let currentPlayer = "X";
let j1 = 0,
  j2 = 0,
  empates = 0,
  partidas = 0;
let timer = 0;
const tiempoEl = document.getElementById("tiempo");
const partidasEl = document.getElementById("partidas");
const turnoEl = document.getElementById("turno");
const j1El = document.getElementById("j1");
const j2El = document.getElementById("j2");
const empatesEl = document.getElementById("empates");

// Variables para la animación
let animatingCell = null;
let animationProgress = 0;
let animationDuration = 300; // milisegundos

// Variable para controlar si el juego ha terminado
let gameEnded = false;
let winningLine = null;

function drawGrid() {
  ctx.clearRect(0, 0, 300, 300);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 100, 0);
    ctx.lineTo(i * 100, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * 100);
    ctx.lineTo(300, i * 100);
    ctx.stroke();
  }
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (board[y][x] !== "") {
        drawMark(x, y, board[y][x]);
      }
    }
  }
  
  // Dibujar línea ganadora si existe
  if (winningLine) {
    drawWinningLine();
  }
}

function drawMark(x, y, mark) {
  ctx.font = "60px sans-serif";
  
  // Establecer el color según el tipo de marca
  if (mark === "X") {
    ctx.fillStyle = "#FF4444"; // Rojo para X
  } else {
    ctx.fillStyle = "white"; // Blanco para O
  }
  
  let scale = 1;
  let alpha = 1;
  
  // Si esta celda está siendo animada, aplicar el efecto de escala
  if (animatingCell && animatingCell.x === x && animatingCell.y === y) {
    // Usar una función de easing para una animación más suave
    const easeOutBack = (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    
    scale = easeOutBack(animationProgress);
    alpha = Math.min(1, animationProgress * 2); // Aparece más rápido la opacidad
  }
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  // Aplicar transformación de escala desde el centro de la celda
  const centerX = x * 100 + 50;
  const centerY = y * 100 + 50;
  
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  
  ctx.fillText(mark, x * 100 + 30, y * 100 + 70);
  
  ctx.restore();
}

function drawWinningLine() {
  ctx.save();
  ctx.strokeStyle = "#FFD700"; // Dorado
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  
  let startX, startY, endX, endY;
  
  if (winningLine.type === 'row') {
    startX = 10;
    startY = winningLine.index * 100 + 50;
    endX = 290;
    endY = winningLine.index * 100 + 50;
  } else if (winningLine.type === 'col') {
    startX = winningLine.index * 100 + 50;
    startY = 10;
    endX = winningLine.index * 100 + 50;
    endY = 290;
  } else if (winningLine.type === 'diag') {
    if (winningLine.index === 0) {
      startX = 10; startY = 10;
      endX = 290; endY = 290;
    } else {
      startX = 290; startY = 10;
      endX = 10; endY = 290;
    }
  }
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function animateNewMark(x, y) {
  animatingCell = { x, y };
  animationProgress = 0;
  
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    animationProgress = Math.min(elapsed / animationDuration, 1);
    
    drawGrid();
    
    if (animationProgress < 1) {
      requestAnimationFrame(animate);
    } else {
      animatingCell = null;
    }
  }
  
  requestAnimationFrame(animate);
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 100);
  const y = Math.floor((e.clientY - rect.top) / 100);
  if (board[y][x] === "" && !gameEnded) {
    board[y][x] = currentPlayer;
    
    // Iniciar animación para la nueva marca
    animateNewMark(x, y);
    
    const winResult = checkWin(currentPlayer);
    if (winResult) {
      gameEnded = true;
      winningLine = winResult;
      // Esperar a que termine la animación antes de mostrar el resultado
      setTimeout(() => {
        partidas++;
        partidasEl.textContent = partidas;
        showToast.success(`Jugador ${currentPlayer === "X" ? "#1" : "#2"} gana!`);
        if (currentPlayer === "X") j1++;
        else j2++;
        updateScores();
        drawGrid(); // Redibujar con la línea ganadora
        // No reiniciar automáticamente - el usuario debe usar el botón
      }, animationDuration);
    } else if (checkDraw()) {
      gameEnded = true;
      setTimeout(() => {
        partidas++;
        partidasEl.textContent = partidas;
        showToast.info("Empate!");
        empates++;
        updateScores();
        // No reiniciar automáticamente - el usuario debe usar el botón
      }, animationDuration);
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      updateTurno();
    }
  }
});

function checkWin(p) {
  // Verificar filas
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === p && board[i][1] === p && board[i][2] === p)
      return { type: 'row', index: i };
  }
  // Verificar columnas
  for (let i = 0; i < 3; i++) {
    if (board[0][i] === p && board[1][i] === p && board[2][i] === p)
      return { type: 'col', index: i };
  }
  // Verificar diagonal principal
  if (board[0][0] === p && board[1][1] === p && board[2][2] === p) 
    return { type: 'diag', index: 0 };
  // Verificar diagonal secundaria
  if (board[0][2] === p && board[1][1] === p && board[2][0] === p) 
    return { type: 'diag', index: 1 };
  return false;
}

function checkDraw() {
  return board.flat().every((c) => c !== "");
}

function resetBoard() {
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  currentPlayer = "X";
  gameEnded = false;
  winningLine = null;
  updateTurno();
  drawGrid();
}

function updateTurno() {
  turnoEl.textContent = `Turno: Jugador ${currentPlayer === "X" ? "#1" : "#2"}`;
}

function updateScores() {
  j1El.textContent = j1;
  j2El.textContent = j2;
  empatesEl.textContent = empates;
}

drawGrid();
updateTurno();

// Timer
setInterval(() => {
  timer++;
  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");
  tiempoEl.textContent = `${mins}:${secs}`;
}, 1000);

// Botones
document.querySelector(".button.red").addEventListener("click", () => {
  location.reload();
});
document.querySelectorAll(".button")[0].addEventListener("click", () => {
  resetBoard();
});
