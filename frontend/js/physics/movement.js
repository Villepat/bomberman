// File for functions that has to do with moving a player
export function movePlayer(player) {
  let message;

  document.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "ArrowLeft":
        message = {
          direction: "left",
        };
        break;
      case "ArrowUp":
        message = {
          direction: "up",
        };
        break;
      case "ArrowRight":
        message = {
          direction: "right",
        };
        break;
      case "ArrowDown":
        //send info through websocket
        message = {
          command: "move",
          direction: "down",
          // Add other properties to the message as needed
        };

        break;
      default:
        // if other key pressed
        break;
    }

    // Check if the WebSocket is still open before sending a message
    if (window.webSocketConnection.readyState === WebSocket.OPEN) {
      // Send the message through the WebSocket connection
      window.webSocketConnection.send(JSON.stringify(message));
    } else {
      console.log("Can't send message, WebSocket connection is not open");
    }

    window.webSocketConnection.onmessage = function (event) {
      // get the updated player position
      let player = JSON.parse(event.data);
      console.log("player: ", player);
      // replace the player position
      updatePlayerPosition(player);
    };
  });
}

// hardcoded for player 1
function updatePlayerPosition(player) {
  let playerPositions = document.getElementsByClassName("player-1");

  // Assuming there is only one element with "player-1" class
  if (playerPositions.length > 0) {
    let playerPosition = playerPositions[0];
    console.log(playerPosition);
    playerPosition.classList.remove("player-1");
    playerPosition.classList.add("cell");
  }

  // get the new player position
  console.log(player[1].GridPosition);
  let newPlayerPosition = document.getElementById(
    `cell-${player[1].GridPosition[0]}-${player[1].GridPosition[1]}`
  );
  // replace the player position
  newPlayerPosition.classList.remove("cell");
  newPlayerPosition.classList.add("player-1");
}
