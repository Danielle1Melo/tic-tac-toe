const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const dataWinningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);
const winningMessage = document.querySelector("[data-winning-message]");
const restartButton = document.querySelector("[data-restart-message]");

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

const endGame = (isDraw) => {
  if (isDraw) {
    dataWinningMessageTextElement.innerText = "Empate!";
  } else {
    dataWinningMessageTextElement.innerText = isCircleTurn
      ? "O venceu!"
      : "X venceu";
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

const handleClick = (e) => {
  //colocar X ou Circle
  const cell = e.target;
  const classToAdd = isCircleTurn ? "circle" : "x";

  placeMark(cell, classToAdd);

  //Verificar vitória
  const isWin = checkForWin(classToAdd);

  //Verificar empate
  const isDraw = checkForDraw();
  if (isWin) {
    endGame(false);
  } else if (isDraw) {
    endGame(true);
  } else {
    //Mudar símbolo
    swapTurns();
  }
};

window.addEventListener("load", () => {
  startGame();

  var ws = new WebSocket("ws://localhost:9999/");

  ws.onopen = function () {
    ws.send("Hi, from the client."); // this works
    console.log("Connection opened...");
  };

  ws.onmessage = function (event) {
    console.log("Message received..." + event.data);
  };

  ws.onclose = function () {
    console.log("Connection closed...");
  };

  ws.send("Hi, from the client."); // doesn't work
  ws.send("Hi, from the client."); // doesn't work
});

//restartButton.addEventListener("click", startGame);
