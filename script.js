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
  resultBox = document.querySelector(".result-box"),
  wonText = resultBox.querySelector(".won-text"),
  replayBtn = resultBox.querySelector("button"),
  close = document.querySelector(".material-icons.close"),
  showLevel = document.querySelector(".play-board .showLevel"),
  showPlayerSign = document.querySelector(".play-board .showPlayerSign"),
  you = document.querySelector(".play-board .you strong"),
  opponent = document.querySelector(".play-board .opponent strong");

let xTurnSound = new Audio("./files/xTurn.wav");
let oTurnSound = new Audio("./files/oTurn.wav");
let gameStartSound = new Audio("./files/gameStart.wav");
let gameWinSound = new Audio("./files/gameWin.wav");
let gameLoseSound = new Audio("./files/gameLose.wav");
let gameTieSound = new Audio("./files/gameTie.wav");

let orgBoard;
let cells;
let boardSize = 3;
let gameMode = "single";
let level = "easy";
let human = "X";
let ai = "O";
let tie = null;
let turn;
let volume = JSON.parse(localStorage.getItem("volume")) ?? true;

let winCombos3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2],
];

let winCombos5 = [
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [6, 7, 8, 9],
  [10, 11, 12, 13],
  [11, 12, 13, 14],
  [10, 11, 12, 13],
  [15, 16, 17, 18],
  [16, 17, 18, 19],
  [21, 22, 23, 24],
  [0, 5, 10, 15],
  [5, 10, 15, 20],
  [1, 6, 11, 16],
  [6, 11, 16, 21],
  [2, 7, 12, 17],
  [7, 12, 17, 22],
  [3, 8, 13, 18],
  [8, 13, 18, 23],
  [4, 9, 14, 19],
  [9, 14, 19, 24],
  [0, 6, 12, 18],
  [6, 12, 18, 24],
  [1, 7, 13, 19],
  [5, 11, 17, 23],
  [4, 8, 12, 16],
  [8, 12, 16, 20],
  [3, 7, 11, 15],
  [9, 13, 17, 21],
];

window.onload = () => {
  document
    .querySelectorAll(".sound")
    .forEach((el) =>
      el.classList.add(volume ? "fa-volume-high" : "fa-volume-xmark")
    );
};

startBtn.addEventListener("click", startGame);

singlePlay.onclick = () => {
  singlePlay.classList.add("active");
  multiPlay.classList.remove("active");
  onlinePlay.classList.remove("active");
  singlePlayDashboard.classList.add("active");
  helperText.classList.add("active");
  gameMode = "single";
  showPlayerSign.style.display = "block";
  document.querySelector(".result-box .player").classList.add("active");
};
multiPlay.onclick = () => {
  multiPlay.classList.add("active");
  singlePlay.classList.remove("active");
  onlinePlay.classList.remove("active");
  singlePlayDashboard.classList.remove("active");
  helperText.classList.remove("active");
  gameMode = "multi";
  turn = "X";
  showPlayerSign.style.display = "none";
  document.querySelector(".result-box .player").classList.remove("active");
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
document.querySelectorAll(".quit").forEach((el) => (el.onclick = reload));

selectLevel.addEventListener("change", (e) => {
  level = e.target.value;
  showLevel.textContent = `Level: ${level}`;
});

selectPlayer.addEventListener("change", (e) => {
  human = e.target.value;
  ai = human === "X" ? "O" : "X";
  you.textContent = human;
  opponent.textContent = ai;
});

selectBoardSize.addEventListener("change", (e) => {
  boardSize = +e.target.value;
  if (boardSize === 5) {
    selectBox.querySelector(".options .level option[value='hard']").remove();
  } else {
    let option = document.createElement("option");
    option.text = "Hard";
    option.value = "hard";
    selectLevel.add(option);
  }
});

function startGame() {
  volume && gameStartSound.play();
  selectBox.classList.add("hide"); //hide select box
  playBoard.classList.add("show"); //show the playboard section

  cells = document.querySelectorAll(
    `.${boardSize === 3 ? "three" : "five"} span`
  );

  document
    .querySelector(`.play-area.${boardSize === 3 ? "three" : "five"}`)
    .classList.add("active");

  document
    .querySelector(`.play-area.${boardSize === 3 ? "five" : "three"}`)
    .classList.remove("active");

  for (let i = 0; i < cells.length; i++) {
    orgBoard = Array.from(Array(cells.length).keys());
    //add onclick attribute in all available span
    cells[i].addEventListener("click", clickedBox, false);
  }

  if (ai === "X") {
    setTimeout(() => {
      move(
        level === "easy"
          ? easyMove()
          : level === "medium"
          ? medMove()
          : bestMove(),
        ai
      );
    }, 0);
  }
}

function clickedBox(el) {
  if (gameMode === "single") {
    move(boardSize === 3 ? el.target.id : getId(el), human);
  } else {
    move(boardSize === 3 ? el.target.id : getId(el), turn);
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
  // console.log(id, player);
  gameStartSound.pause();
  gameStartSound.currentTime = 0;
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
  if (boardSize === 3) {
    document.getElementById(id).innerText = player;
  } else {
    document.querySelector(`._${id}`).innerText = player;
  }
  let winner = checkWin(orgBoard, player);
  if (winner) {
    gameOver(winner);
    return;
  }
  checkTie();
  playBoard.style.pointerEvents = "auto"; //add pointerEvents auto in playboard so user can again click on box
}

function checkWin(board, player) {
  let winner = null;
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);

  if (boardSize === 3) {
    for (let [i, win] of winCombos3.entries()) {
      if (win.every((el) => plays.indexOf(el) > -1)) {
        winner = { i, player };
        break;
      }
    }
  } else {
    for (let [i, win] of winCombos5.entries()) {
      if (win.every((el) => plays.indexOf(el) > -1)) {
        winner = { i, player };
        break;
      }
    }
  }
  return winner;
}

function gameOver(winner) {
  if (boardSize === 3) {
    for (let i of winCombos3[winner.i]) {
      document.getElementById(i).style.color =
        gameMode === "multi"
          ? "green"
          : winner.player === human
          ? "green"
          : "tomato";
    }
  } else {
    for (let i of winCombos5[winner.i]) {
      document.querySelector(`._${i}`).style.color =
        gameMode === "multi"
          ? "green"
          : winner.player === human
          ? "green"
          : "tomato";
    }
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
  let availableSpots = emptySpaces();
  return availableSpots[Math.floor(Math.random() * availableSpots.length)]; //getting random index from array so bot will select random unselected box
}

function medMove() {
  let availableSpots = emptySpaces();

  if (boardSize === 5) {
    let idx = medMoveLevels5(availableSpots, 3);
    if (idx !== false) return idx;

    idx = medMoveLevels5(availableSpots, 2);
    if (idx !== false) return idx;

    idx = medMoveLevels5(availableSpots, 1);
    if (idx !== false) return idx;
  } else {
    let idx = medMoveLevels3(availableSpots, 2);
    if (idx !== false) return idx;

    idx = medMoveLevels3(availableSpots, 1);
    if (idx !== false) return idx;
  }

  return easyMove();
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
replayBtn.onclick = () => {
  if (gameMode === "multi") turn = "X";
  volume && gameStartSound.play();
  document.querySelector(".result-box .player")[0].selected = true;
  if (ai === "X") {
    setTimeout(() => {
      move(
        level === "easy"
          ? easyMove()
          : level === "medium"
          ? medMove()
          : bestMove(),
        ai
      );
    }, 0);
  }
  oTurn.classList.remove("active");
  xTurn.classList.add("active");
  resultBox.classList.remove("show", "lose");
  tie = null;
  for (let i = 0; i < cells.length; i++) {
    orgBoard = Array.from(Array(cells.length).keys());
    cells[i].style.color = "#56baed";
    cells[i].textContent = null;
    cells[i].style.pointerEvents = "auto";
  }
  playBoard.style.pointerEvents = "auto";
};

function reload() {
  window.location.reload();
}

document.querySelectorAll(".sound").forEach(
  (el) =>
    (el.onclick = () => {
      el.classList.add(volume ? "fa-volume-xmark" : "fa-volume-high");
      el.classList.remove(volume ? "fa-volume-high" : "fa-volume-xmark");
      !volume && new Audio("./files/soundOnOff.wav").play();
      localStorage.setItem("volume", !volume);
      volume = !volume;
    })
);

document
  .querySelector(".result-box .player")
  .addEventListener("change", (e) => {
    human = e.target.value;
    ai = human === "X" ? "O" : "X";
    you.textContent = human;
    opponent.textContent = ai;
  });

function medMoveLevels5(availableSpots, level) {
  for (let box of availableSpots) {
    for (let winCombo of winCombos5) {
      if (winCombo.includes(box)) {
        let winCount = 0;
        let chaseCount = 0;
        for (let el of winCombo) {
          if (orgBoard[el] === ai) winCount++;
          if (orgBoard[el] === human) chaseCount++;
        }
        // console.log("winCount", winCount);
        // console.log("chaseCount", chaseCount);
        if (winCount === level) return box;
        if (chaseCount === level) return box;
      }
    }
  }
  return false;
}

function medMoveLevels3(availableSpots, level) {
  for (let box of availableSpots) {
    for (let winCombo of winCombos3) {
      if (winCombo.includes(box)) {
        let winCount = 0;
        let chaseCount = 0;
        for (let el of winCombo) {
          if (orgBoard[el] === ai) winCount++;
          if (orgBoard[el] === human) chaseCount++;
        }
        // console.log("winCount", winCount);
        // console.log("chaseCount", chaseCount);
        if (winCount === level) return box;
        if (chaseCount === level) return box;
      }
    }
  }
  return false;
}

function getId(element) {
  return Number(element.target.className.slice(1));
}
