// File for functions that has to do with moving a player
export function movePlayer(player) {
  console.log("movePlayer function called");
  let message;

  document.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "ArrowLeft":
        message = {
          command: "move",
          direction: "left",
        };
        break;
      case "ArrowUp":
        message = {
          command: "move",
          direction: "up",
        };
        break;
      case "ArrowRight":
        message = {
          command: "move",
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
      case "Space":
        message = {
          command: "place-bomb",
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
  });

  window.webSocketConnection.onmessage = function (event) {
    let message = JSON.parse(event.data);
    console.log("message: ", message);

    if (message.type === "gameGrid") {
      console.log("gameGrid received");
    } else if (message.type === "player") {
      console.log("player received");
      updatePlayerPosition(message.data);
    } else if (message.type === "bomb") {
      console.log("bomb received");
      updateBombPlacement(message.data);
    } else if (message.type === "explosion") {
      console.log("explosion received");
      updateExplosion(message.data);
    }
  };
}

// hardcoded for player 1
function updatePlayerPosition(player) {
  console.log("player: ", player);
  let playerPositions = document.getElementsByClassName(
    `player-${player.PlayerID}`
  );

  // Assuming there is only one element with "player-1" class
  if (playerPositions.length > 0) {
    let playerPosition = playerPositions[0];
    console.log(playerPosition);
    playerPosition.classList.remove(`player-${player.PlayerID}`);
    playerPosition.classList.add("cell");
  }

  // get the new player position
  console.log(player.GridPosition);
  let newPlayerPosition = document.getElementById(
    `cell-${player.GridPosition[0]}-${player.GridPosition[1]}`
  );
  // replace the player position
  newPlayerPosition.classList.remove("cell");
  newPlayerPosition.classList.add(`player-${player.PlayerID}`);
}

function updateBombPlacement(bomb) {
  console.log("bomb: ", bomb);
  let bombPosition = document.getElementById(
    `cell-${bomb.GridPosition[0]}-${bomb.GridPosition[1]}`
  );

  bombPosition.classList.remove("cell");
  bombPosition.classList.add("bomb");

  // Create an img element for the bomb image
  let bombImg = document.createElement("img");
  bombImg.src = "/static/images/bomb1.png";
  bombImg.classList.add("bomb");

  bombPosition.appendChild(bombImg);

  // Automatically remove the bomb after a predetermined time
  setTimeout(() => {
    bombPosition.removeChild(bombImg);
    bombPosition.classList.remove("bomb");
    bombPosition.classList.add("cell");
  }, bomb.ExplosionTime || 2000); // Assuming the explosion time is 3 seconds (3000ms). Adjust this value as needed.
}

function updateExplosion(explosion) {
  console.log("explosion: ", explosion);

  if (explosion.AffectedCells && explosion.AffectedCells.length > 0) {
    explosion.AffectedCells.forEach((cell) => {
      let explodedCell = document.getElementById(`cell-${cell[0]}-${cell[1]}`);

      if (explodedCell.classList.contains("brick")) {
        explodedCell.classList.remove("brick");
      }
      explodedCell.classList.add("explosion");
      // You may want to remove "explosion" class after some time to make it look like an animation
      setTimeout(() => {
        explodedCell.classList.remove("explosion");
        explodedCell.classList.add("cell");
      }, 500);
    });
  }
}
