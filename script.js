const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const dataWinningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);
const winningMessage = document.querySelector("[data-winning-message]");
const restartButton = document.querySelector("[data-restart-message]");
const namePlayerMessage = document.querySelector("[data-name-message]");
const startButton = document.querySelector("[data-start-button]");
const resetButton = document.getElementById("reset");

let ws;
let player = "";
let amICircle = false;
let isCircleTurn = false;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const startGame = () => {
  for (const cell of cellElements) {
    cell.classList.remove("x");
    cell.classList.remove("circle");
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  }

  setBoardMoverClass();
  winningMessage.classList.remove("show-winning-message");
};

const getPlayerNameAndStart = () => {
  namePlayerMessage.classList.remove("show-namePlayer");
  player = document.getElementById("playerName").value;
  ws.send(JSON.stringify({ kind: "newPlayer", name: player }));
};

const endGame = (isDraw, winner) => {
  if (isDraw) {
    dataWinningMessageTextElement.innerText = "Empate!";
    return;
  }

  if (winner == player) {
    dataWinningMessageTextElement.innerText = amICircle
      ? `${winner} (O) venceu!`
      : `${winner} (X) venceu!`;
  } else {
    dataWinningMessageTextElement.innerText = amICircle
      ? `${winner} (X) venceu!`
      : `${winner} (O) venceu!`;
  }

  winningMessage.classList.add("show-winning-message");
  swapTurns();
};

const checkForWin = (currentPlayer) => {
  return winningCombinations.some((conbination) => {
    //Se cell tão preenchidas com o mesmo jogador
    return conbination.every((index) => {
      //A cell na position 0 contém o player...
      return cellElements[index].classList.contains(currentPlayer);
    });
  });
};

const checkForDraw = () => {
  return [...cellElements].every((cell) => {
    return cell.classList.contains("x") || cell.classList.contains("circle");
  });
};

const placeMark = (cell, classToAdd) => {
  cell.classList.add(classToAdd);
};

const setBoardMoverClass = () => {
  board.classList.remove("circle");
  board.classList.remove("x");

  if (isCircleTurn) {
    board.classList.add("circle");
  } else {
    board.classList.add("x");
  }
};

//Mudando símbolo
const swapTurns = () => {
  isCircleTurn = !isCircleTurn;

  setBoardMoverClass();
};

const mapCelToMatrix = [
  [0, 0],
  [0, 1],
  [0, 2],

  [1, 0],
  [1, 1],
  [1, 2],

  [2, 0],
  [2, 1],
  [2, 2],
];

let mapMatricToCel = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

const handleMovementFromPlayer = (row, col) => {
  const idx = mapMatricToCel[row][col];
  const cellToUpdate = cellElements[idx];

  const classToAdd = amICircle ? "x" : "circle";
  placeMark(cellToUpdate, classToAdd);
};

const handleClick = (e) => {
  //colocar X ou Circle
  const cell = e.target;
  const classToAdd = isCircleTurn ? "circle" : "x";

  const rowAndCol =
    mapCelToMatrix[Array.from(cell.parentNode.children).indexOf(cell)];

  placeMark(cell, classToAdd);

  ws.send(
    JSON.stringify({
      kind: "movement",
      row: rowAndCol[0],
      col: rowAndCol[1],
      player: player,
    })
  );
};

window.addEventListener("load", () => {
  ws = new WebSocket("ws://44.211.167.143:9999/");
  namePlayerMessage.classList.add("show-namePlayer");

  ws.onopen = function () {};

  ws.onmessage = function (event) {
    let message = JSON.parse(event.data);
    console.log(message);

    if (message.kind == "join") {
      if (message.isX) {
        amICircle = false;
        isCircleTurn = false;
      } else {
        amICircle = true;
        isCircleTurn = true;
      }

      startGame();
    }

    if (message.kind == "movementCompleted") {
      if (message.player == player) {
        return;
      }

      handleMovementFromPlayer(message.row, message.col);
      return;
    }

    if (message.kind == "gameEnd") {
      if (message.draw) {
        endGame(true, null);
        return;
      }

      endGame(false, message.winner);
      return;
    }
  };

  ws.onclose = function () {
    console.log("Connection closed...");
  };
});

restartButton.addEventListener("click", () => {
  player = prompt("Informe seu nome!");
  ws.send(JSON.stringify({ kind: "newPlayer", name: player }));
});

resetButton.addEventListener("click", () => {
  ws.send(JSON.stringify({ kind: "reset" }));
});

startButton.addEventListener("click", getPlayerNameAndStart);
