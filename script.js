//selecting all required elements
const selectBox = document.querySelector(".select-box"),
  startBtn = document.querySelector(".start"),
  coming = document.querySelector(".coming"),
  singlePlay = selectBox.querySelector(".options .singlePlay"),
  multiPlay = selectBox.querySelector(".options .multiPlay"),
  onlinePlay = selectBox.querySelector(".options .onlinePlay"),
  singlePlayDashboard = selectBox.querySelector(
    ".options .singlePlayDashboard"
  ),
  helperText = selectBox.querySelector("small.helperText"),
  selectLevel = selectBox.querySelector(".options .level"),
  selectPlayer = selectBox.querySelector(".options .player"),
  selectBoardSize = selectBox.querySelector(".options .board"),
  playBoard = document.querySelector(".play-board"),
  xTurn = playBoard.querySelector(".xTurn"),
  oTurn = playBoard.querySelector(".oTurn"),
  cells = document.querySelectorAll("section span"),
  resultBox = document.querySelector(".result-box"),
  wonText = resultBox.querySelector(".won-text"),
  replayBtn = resultBox.querySelector("button"),
  close = document.querySelector(".material-icons.close");

let xTurnSound = new Audio("./files/xTurn.wav");
let oTurnSound = new Audio("./files/oTurn.wav");
let gameStartSound = new Audio("./files/gameStart.wav");
let gameWinSound = new Audio("./files/gameWin.wav");
let gameLoseSound = new Audio("./files/gameLose.wav");
let gameTieSound = new Audio("./files/gameTie.wav");

let orgBoard;
let boardSize = 3;
let gameMode = "single";
let level = "easy";
let human = "X";
let ai = "O";
let tie = null;
let turn;
let volume = JSON.parse(localStorage.getItem("volume")) ?? true;

let winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2],
];

window.onload = () => {
  homeSound.classList.add(volume ? "fa-volume-high" : "fa-volume-xmark");
};

startBtn.addEventListener("click", startGame);

singlePlay.onclick = () => {
  singlePlay.classList.add("active");
  multiPlay.classList.remove("active");
  onlinePlay.classList.remove("active");
  singlePlayDashboard.classList.add("active");
  helperText.classList.add("active");
  gameMode = "single";
};
multiPlay.onclick = () => {
  multiPlay.classList.add("active");
  singlePlay.classList.remove("active");
  onlinePlay.classList.remove("active");
  singlePlayDashboard.classList.remove("active");
  helperText.classList.remove("active");
  gameMode = "multi";
  turn = "X";
};
onlinePlay.onclick = () => {
  coming.classList.add("show");
  selectBox.style.pointerEvents = "none";
  onlinePlay.classList.add("active");
  multiPlay.classList.remove("active");
  singlePlay.classList.remove("active");
  singlePlayDashboard.classList.remove("active");
  helperText.classList.remove("active");
  gameMode = "online";
};

close.onclick = reload;
document.querySelector(".quit").onclick = reload;

selectLevel.addEventListener("change", (e) => {
  level = e.target.value;
  console.log(level);
});

selectPlayer.addEventListener("change", (e) => {
  human = e.target.value;
  ai = human === "X" ? "O" : "X";
});

selectBoardSize.addEventListener("change", (e) => {
  if (e.target.value == 5) {
    coming.classList.add("show");
    selectBox.style.pointerEvents = "none";
  } else {
    boardSize = e.target.value;
  }
});
function startGame() {
  playBoardSound.classList.add(volume ? "fa-volume-high" : "fa-volume-xmark");
  volume && gameStartSound.play();
  ox.classList.add("hide"); //hide select box

  playBoard.classList.add("show"); //show the playboard section

  for (let i = 0; i < cells.length; i++) {
    orgBoard = Array.from(Array(9).keys());
    //add onclick attribute in all available span
    cells[i].addEventListener("click", clickedBox, false);
  }
  if (ai === "X") {
    setTimeout(() => {
      move(bestMove(), ai);
    }, 0);
  }
}

function clickedBox(element) {
  if (gameMode === "single") {
    move(element.target.id, human);
  } else {
    move(element.target.id, turn);
    turn = turn === "X" ? "O" : "X";
  }
  if (gameMode === "single" && !tie && !checkWin(orgBoard, human)) {
    playBoard.style.pointerEvents = "none";
    let randomTimeDelay = (Math.random() * 1000 + 200).toFixed(); //generating random number so bot will randomly delay to select unselected box
    setTimeout(() => {
      move(
        level === "easy"
          ? easyMove()
          : level === "medium"
          ? medMove()
          : bestMove(),
        ai
      ); //calling bot function
    }, randomTimeDelay); //passing random delay value
  }
}

function move(id, player) {
  gameStartSound.pause();
  if (volume) player === "X" ? xTurnSound.play() : oTurnSound.play();
  cells[id].style.pointerEvents = "none";
  if (player === "X") {
    xTurn.classList.remove("active");
    oTurn.classList.add("active");
  } else {
    oTurn.classList.remove("active");
    xTurn.classList.add("active");
  }
  orgBoard[id] = player;
  document.getElementById(id).innerText = player;
  let winner = checkWin(orgBoard, player);
  if (winner) {
    gameOver(winner);
    return;
  }
  checkTie();
  console.log("reached");
  playBoard.style.pointerEvents = "auto"; //add pointerEvents auto in playboard so user can again click on box
}

function checkWin(board, player) {
  let winner = null;
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  for (let [i, win] of winCombos.entries()) {
    if (win.every((el) => plays.indexOf(el) > -1)) {
      winner = { i, player };
      break;
    }
  }
  return winner;
}

function gameOver(winner) {
  console.log(winner);
  for (let i of winCombos[winner.i]) {
    document.getElementById(i).style.color =
      gameMode === "multi"
        ? "green"
        : winner.player === human
        ? "green"
        : "tomato";
  }
  playBoard.style.pointerEvents = "none";
  if (gameMode === "multi") {
    declareWinner(`${winner.player} win!`);
  } else {
    declareWinner(
      winner.player === human ? "Hurray, you win!" : "Sorry, you lose!"
    );
  }
}

function declareWinner(who) {
  console.log(who);
  wonText.innerHTML = who;

  setTimeout(() => {
    if (volume)
      who.includes("win")
        ? gameWinSound.play()
        : who.includes("lose")
        ? gameLoseSound.play()
        : gameTieSound.play();
    //after match won by someone then show the result box after 700ms
    resultBox.classList.add("show", who.includes("lose") && "lose");
  }, 500);
}
function easyMove() {
  return emptySpaces()[0];
}
function medMove() {
  let availableSpots = emptySpaces();
  return availableSpots[Math.floor(Math.random() * availableSpots.length)]; //getting random index from array so bot will select random unselected box
}

function bestMove() {
  return minimax(orgBoard, ai).index;
}
function emptySpaces() {
  return orgBoard.filter((s) => typeof s === "number");
}

function checkTie() {
  if (emptySpaces().length === 0) {
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.color = "green";
    }
    playBoard.style.pointerEvents = "none";
    tie = true;
    declareWinner("Tie Game");
  }
}

function minimax(newBoard, player) {
  let availableSpots = emptySpaces(newBoard);
  if (checkWin(newBoard, human)) {
    return { score: -10 };
  } else if (checkWin(newBoard, ai)) {
    return { score: 10 };
  } else if (availableSpots.length === 0) {
    return { score: 0 };
  }
  // an array to collect all the objects
  let moves = [];
  // loop through available spots
  for (let i = 0; i < availableSpots.length; i++) {
    //create an object for each and store the index of that spot
    let move = {};
    move.index = newBoard[availableSpots[i]];
    // set the empty spot to the current player
    newBoard[availableSpots[i]] = player;
    /*collect the score resulted from calling minimax 
      on the opponent of the current player*/
    if (player === ai) {
      let res = minimax(newBoard, human);
      move.score = res.score;
    } else {
      let res = minimax(newBoard, ai);
      move.score = res.score;
    }
    // reset the spot to empty back to original
    newBoard[availableSpots[i]] = move.index;
    // push the object to the array
    moves.push(move);
  }
  // if it is the computer's turn loop over the moves and choose the move with the highest score
  let bestMove;
  if (player === ai) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // else loop over the moves and choose the move with the lowest score
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  // return the chosen move (object) from the moves array
  return moves[bestMove];
}
replayBtn.onclick = reload;

function reload() {
  window.location.reload();
}
let homeSound = document.querySelector(".homeSound");
homeSound.onclick = () => {
  homeSound.classList.add(volume ? "fa-volume-xmark" : "fa-volume-high");
  homeSound.classList.remove(volume ? "fa-volume-high" : "fa-volume-xmark");
  !volume && new Audio("./files/soundOnOff.wav").play();
  localStorage.setItem("volume", !volume);
  volume = !volume;
};

let playBoardSound = document.querySelector(".playBoardSound");
playBoardSound.onclick = () => {
  homeSound.classList.add(volume ? "fa-volume-xmark" : "fa-volume-high");
  homeSound.classList.remove(volume ? "fa-volume-high" : "fa-volume-xmark");

  !volume && new Audio("./files/soundOnOff.wav").play();
  localStorage.setItem("volume", !volume);
  volume = !volume;
};
