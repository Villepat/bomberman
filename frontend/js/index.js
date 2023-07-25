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
  startButton.addEventListener("click", function () {
    //window.webSocketConnection = new WebSocket("ws://localhost:80/ws");
    initializeGame();
    setTimeout(function () {
      requestAnimationFrame(movePlayer);
    }, 1000);
  });
}
