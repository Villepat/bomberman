//import {buildBaseGrid} from "./game_board/build_base.js";
import { destroyBrick } from "./physics/explosion.js";
import { render } from "./framework/myFramework.js";
import { initializeGame } from "./game_board/initialize_game.js";
import { movePlayer } from "./physics/movement.js";

if (window.location.pathname === "/") {
  // render the start page
  const startPage = render({
    tag: "div",
    attrs: { class: "start-page" },
    children: [
      {
        tag: "h1",
        attrs: { class: "start-page__title" },
        children: ["Welcome to Bomberman!"],
      },
      {
        tag: "button",
        attrs: {
          class: "start-page__button",
          id: "start-button",
          type: "button",
        },
        children: ["Start Game"],
      },
    ],
  });
  let welcomeDiv = document.getElementById("welcome-message");
  welcomeDiv.appendChild(startPage);
}

let startButton = document.getElementById("start-button");
if (startButton) {
  // add an onClick event listener to the start button
  startButton.addEventListener("click", async function () {
    //window.webSocketConnection = new WebSocket("ws://localhost:80/ws");
    await initializeGame();
    setTimeout(function () {
      movePlayer();
    }, 1000);
  });
}

// window.webSocketConnection.onopen = function (event) {
//   console.log("WebSocket is open now.");
// };

// window.webSocketConnection.onmessage = function (event) {
//   let gameBoard = JSON.parse(event.data);
//   buildBaseGrid(gameBoard);
// };

// Get the button by its ID
let wsButton = document.getElementById("wsButton");

// Add an event listener to the button
wsButton.addEventListener("click", function () {
  // Define the message to send
  let message = {
    text: "This is a test message",
    // Add other properties to the message as needed
  };

  // Check if the WebSocket is still open before sending a message
  if (window.webSocketConnection.readyState === WebSocket.OPEN) {
    // Send the message through the WebSocket connection
    window.webSocketConnection.send(JSON.stringify(message));
  } else {
    console.log("Can't send message, WebSocket connection is not open");
  }
});

let testingDestroyBrick = true;
if (testingDestroyBrick) {
  // add an onCLick event listener to the board
  document
    .getElementById("game-board")
    .addEventListener("click", function (event) {
      console.log(event.target.id);
      let x = event.target.id.split("-")[1];
      let y = event.target.id.split("-")[2];
      console.log(x, y);
      destroyBrick(x, y);
    });
}
