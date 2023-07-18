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
//
import { buildBaseGrid } from "./build_base.js";


function initializeGame() {
    // remove the start button from the DOM
    let startButton = document.getElementById("start-button");
    startButton.remove();
    // add a resign button to the DOM
    let resignButton = document.createElement("button");
    resignButton.setAttribute("id", "resign-button");
    resignButton.setAttribute("type", "button");
    resignButton.innerHTML = "Resign";
    let welcomeDiv = document.getElementById("welcome-message");
    welcomeDiv.appendChild(resignButton);

    
    // add an onClick event listener to the resign button
    resignButton.addEventListener("click", function () {
        window.webSocketConnection.close();
        window.location.reload();
    });
    // establish a websocket connection
    window.webSocketConnection = new WebSocket("ws://localhost:80/ws");
    // send a message to the server
    window.webSocketConnection.onopen = function (event) {
        console.log("WebSocket is open now.");
    };
    // receive a message from the server
    window.webSocketConnection.onmessage = function (event) {
        let gameBoard = JSON.parse(event.data);
        buildBaseGrid(gameBoard);
    };
}

export { initializeGame };
