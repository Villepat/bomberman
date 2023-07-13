import buildBaseGrid from "./game_board/build_base.js";

window.webSocketConnection = new WebSocket("ws://localhost:80/ws");

window.webSocketConnection.onopen = function (event) {
  console.log("WebSocket is open now.");
  //   buildBaseGrid(19);
};

window.webSocketConnection.onmessage = function (event) {
  var gameBoard = JSON.parse(event.data);
  buildBaseGrid(gameBoard);
};

// Get the button by its ID
var wsButton = document.getElementById("wsButton");

// Add an event listener to the button
wsButton.addEventListener("click", function () {
  // Define the message to send
  var message = {
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
