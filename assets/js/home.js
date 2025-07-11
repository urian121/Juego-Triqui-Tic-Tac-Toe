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
        ctx.font = "60px sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText(board[y][x], x * 100 + 30, y * 100 + 70);
      }
    }
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 100);
  const y = Math.floor((e.clientY - rect.top) / 100);
  if (board[y][x] === "") {
    board[y][x] = currentPlayer;
    if (checkWin(currentPlayer)) {
      partidas++;
      partidasEl.textContent = partidas;
      alert(`Jugador ${currentPlayer === "X" ? "#1" : "#2"} gana!`);
      if (currentPlayer === "X") j1++;
      else j2++;
      updateScores();
      resetBoard();
    } else if (checkDraw()) {
      partidas++;
      partidasEl.textContent = partidas;
      alert("Empate!");
      empates++;
      updateScores();
      resetBoard();
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      updateTurno();
    }
    drawGrid();
  }
});

function checkWin(p) {
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === p && board[i][1] === p && board[i][2] === p)
      return true;
    if (board[0][i] === p && board[1][i] === p && board[2][i] === p)
      return true;
  }
  if (board[0][0] === p && board[1][1] === p && board[2][2] === p) return true;
  if (board[0][2] === p && board[1][1] === p && board[2][0] === p) return true;
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
