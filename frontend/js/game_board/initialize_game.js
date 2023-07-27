// file to handle the sequence of events that occur when the game is initialized
//
// 1. the user clicks the start button
// 2. the start button is removed from the DOM
// 3. a websocket connection is established
// 4. a websocket message is sent to the server
// 5. the server responds with the game board
// 6. the game board is rendered to the DOM
// 7. when multiple users are connected, the game board is updated when the server sends a message
// 8. timer starts
// 9. when the timer reaches 0, the game starts
// 10. the game ends when there is only one player left
// 11. the game board is cleared from the DOM
// 12. the game over screen is rendered to the DOM
import { buildBaseGrid } from "./build_base.js";
import { movePlayer } from "../physics/movement.js";

let timer = 20;
let timer2 = 10;
let playersConnected = 0;
let timerInterval;
let players = [];
let starting = false;

function updateLobbyDisplay() {
  let lobby = document.getElementById("lobby");
  if (!lobby) {
    // Create lobby if it doesn't exist
    lobby = document.createElement("div");
    lobby.id = "lobby";
    document.body.appendChild(lobby);
  }

  lobby.innerHTML = makeLobbyHTML();
}

function startCountdown() {
  clearInterval(timerInterval); // Clear existing interval if any
  timerInterval = setInterval(() => {
    timer--;

    if (timer <= 0) {
      clearInterval(timerInterval);
      // Start the final countdown
      starting = true;
      updateLobbyDisplay();
      finalCountdown();
    }

    updateLobbyDisplay();
  }, 1000);
}

function finalCountdown() {
  clearInterval(timerInterval); // Clear existing interval if any
  timerInterval = setInterval(() => {
    timer2--;

    if (timer2 <= 0) {
      clearInterval(timerInterval);
      // Transition to start the game
      console.log("start game called");
      startGame();
    }

    updateLobbyDisplay();
  }, 1000);
}

async function initializeGame() {
  // remove the start button from the DOM
  let startButton = document.getElementById("start-button");
  startButton.remove();
  let username = document.getElementById("player-name").value;
  let welcomeMessage = document.getElementById("welcome-message");
  welcomeMessage.remove();

  let message = {
    command: "player",
    name: username,
  };

  // establish a websocket connection
  window.webSocketConnection = new WebSocket("ws://localhost:80/ws");
  // send a message to the server
  window.webSocketConnection.onopen = function (event) {
    console.log("WebSocket is open now.");
    window.webSocketConnection.send(JSON.stringify(message));
  };
  window.webSocketConnection.onmessage = async function (event) {
    let receivedMessage = JSON.parse(event.data);
    if (receivedMessage.type === "start") {
      let gameBoard = receivedMessage.data;
      await buildBaseGrid(gameBoard);
      setTimeout(function () {
        requestAnimationFrame(movePlayer);
      }, 1000);
    } else if (receivedMessage.type === "player-connected") {
      console.log("player connected");
      playersConnected = receivedMessage.numberOfConns;
      players = receivedMessage.playerlist;
      console.log(receivedMessage.playerlist);
      console.log(players);
      updateLobbyDisplay();
      if (playersConnected === 2) {
        startCountdown();
      }
    } else if (receivedMessage.type === "player-disconnected") {
      console.log("player disconnected");
      updateLobbyDisplay();
    }
  };
}

function makeLobbyHTML() {
  if (!starting) {
    return `
      <div>
          <h1>Waiting for players...</h1>
          <h2>Players connected: ${playersConnected}</h2>
          <h2>Players: ${players}</h2>
          <h2>Game starts in: ${timer} seconds</h2>
      </div>
      `;
  } else {
    return `
        <div>
            <h1>Game starting...</h1>
            <h2>Players connected: ${playersConnected}</h2>
            <h2>Players: ${players}</h2>
            <h2>Game starts in: ${timer2} seconds</h2>
        </div>
        `;
  }
}

function startGame() {
  console.log("inside start game");
  // Hide lobby display
  let lobby = document.getElementById("lobby");
  console.log(lobby);
  if (lobby) {
    lobby.style.display = "none";
  }
  // check that the websocket connection is open
  if (window.webSocketConnection.readyState === WebSocket.OPEN) {
    // send a message to the server
    let message = {
      command: "start",
    };
    window.webSocketConnection.send(JSON.stringify(message));
  }
}

export { initializeGame };
