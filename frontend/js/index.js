import { render } from "./framework/myFramework.js";
import { initializeGame } from "./game_board/initialize_game.js";
import { movePlayer } from "./physics/movement.js";

if (window.location.pathname === "/") {
  // render the start page
  const startPage = render({
    tag: "div",
    attrs: { class: "container" },
    children: [
      {
        tag: "div",
        attrs: { class: "rectangle" },
        children: [],
      },
      {
        tag: "h1",
        attrs: {},
        children: ["Welcome to the Bomberman!"],
      },
      {
        tag: "div",
        attrs: {},
        children: [
          {
            tag: "p",
            attrs: {},
            children: ["Please enter your name:"],
          },
          {
            tag: "input",
            attrs: {
              class: "player-name-input",
              id: "player-name",
              value: "Player",
            },
            children: ["Please enter your name:"],
          },
          {
            tag: "button",
            attrs: { id: "start-button" },
            children: ["Start Game"],
          },
        ],
      },
      {
        tag: "div",
        attrs: {},
        children: [
          {
            tag: "h2",
            attrs: {},
            children: ["How to play:"],
          },
          {
            tag: "p",
            attrs: {},
            children: [
              "Use the arrow keys or WASD to move your player around the board. press the space bar to drop a bomb.",
            ],
          },
        ],
      },
    ],
  });
  let welcomeDiv = document.getElementById("welcome-message");
  welcomeDiv.appendChild(startPage);
}

let startButton = document.getElementById("start-button");
if (startButton) {
  // add an onClick event listener to the start button
  startButton.addEventListener("click", function () {
    //window.webSocketConnection = new WebSocket("ws://localhost:80/ws");
    initializeGame();
  });
}
