// File for functions that has to do with moving a player
export function movePlayer(player) {
  console.log("movePlayer function called");
  let message;

  document.addEventListener("keydown", function (event) {
     // Prevent scrolling for Arrow keys and Space
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
    switch (event.code) {
      case "ArrowLeft":
      case "KeyA":
        message = {
          command: "move",
          direction: "left",
        };
        break;
      case "ArrowUp":
      case "KeyW":
        message = {
          command: "move",
          direction: "up",
        };
        break;
      case "ArrowRight":
      case "KeyD":
        message = {
          command: "move",
          direction: "right",
        };
        break;
      case "ArrowDown":
      case "KeyS":
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
      console.log("Sending message", message);
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
      updateLife(message.data);
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
    //remove powerup classes in case you picked one up
    playerPosition.classList.remove("speedy");
    playerPosition.classList.remove("bombAmountIncrease");
    playerPosition.classList.remove("bombRangeIncrease");
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

  let isExploding = false;

  // Timer to switch between bomb images
  setInterval(() => {
    isExploding = !isExploding;
    bombImg.src = isExploding
      ? "/static/images/bomb3.png"
      : "/static/images/bomb1.png";
  }, 450);

  // Automatically remove the bomb after a predetermined time
  setTimeout(() => {
    bombPosition.removeChild(bombImg);
    bombPosition.classList.remove("bomb");
    bombPosition.classList.add("cell");

    // Create an img element for the first explosion image
    let explosionImg1 = document.createElement("img");
    explosionImg1.src = "/static/images/explosion1.png";
    explosionImg1.classList.add("explosion-image");
    bombPosition.appendChild(explosionImg1);

    // Switch to the second explosion image after a short delay
    setTimeout(() => {
      // Remove the first explosion image
      bombPosition.removeChild(explosionImg1);

      // Create an img element for the second explosion image
      let explosionImg2 = document.createElement("img");
      explosionImg2.src = "/static/images/explosion2.png";
      explosionImg2.classList.add("explosion-image");
      bombPosition.appendChild(explosionImg2);

      // Switch to the third explosion image after another short delay
      setTimeout(() => {
        // Remove the second explosion image
        bombPosition.removeChild(explosionImg2);

        // Create an img element for the third explosion image
        let explosionImg3 = document.createElement("img");
        explosionImg3.src = "/static/images/explosion3.png";
        explosionImg3.classList.add("explosion-image");
        bombPosition.appendChild(explosionImg3);

        // Remove the third explosion image after another short delay
        setTimeout(() => {
          bombPosition.removeChild(explosionImg3);
          // Add back the "cell" class to the cell
          bombPosition.classList.add("cell");
        }, 500); // Adjust this value as needed for the duration of the explosion3 image
      }, 200); // Adjust this value as needed for the delay before the explosion3 image appears
    }, 200); // Adjust this value as needed for the delay before the explosion2 image appears
  }, bomb.ExplosionTime || 2000); // Assuming the explosion time is 2 seconds (2000ms). Adjust this value as needed.
}

function updateExplosion(explosion) {
  // console.log("explosion: ", explosion);
  //console.log("affected cells: ", explosion.AffectedCells);

  if (explosion.AffectedCells && explosion.AffectedCells.length > 0) {
    explosion.AffectedCells.forEach((cell) => {
      let explodedCell = document.getElementById(`cell-${cell[0]}-${cell[1]}`);

      if (explodedCell.classList.contains("brick")) {
        explodedCell.classList.remove("brick");
      }

      if (explodedCell.classList.contains("edge") || explodedCell.classList.contains("steel")) {
        // If the cell is an edge or steel, return early
        return;
      }

        // Create an img element for the explosion image
        const explosionImg = document.createElement("img");
        explosionImg.src = "/static/images/explosion1.png";
        explosionImg.classList.add("explosion-image");
        explodedCell.appendChild(explosionImg);

        let isExploding = false;
        const explosionImages = [
          "/static/images/explosion1.png",
          "/static/images/explosion2.png",
          "/static/images/explosion3.png",
        ];
        let index = 0;

        const switchImage = () => {
          isExploding = !isExploding;
          explosionImg.src = isExploding
            ? explosionImages[index]
            : "/static/images/explosion1.png";
          index++;

          if (index < explosionImages.length) {
            setTimeout(switchImage, 200);
          } else {
            setTimeout(() => {
              explodedCell.removeChild(explosionImg);
              explodedCell.classList.remove("explosion");
              explodedCell.classList.add("cell");
            }, 500);
          }
        };
        console.log("exploded cell: ", cell);
        console.log(
          "exploded cell value: ",
          explosion.GameGrid[cell[1]][cell[0]]
        );
        setTimeout(switchImage, 0); // Start the explosion animation immediately after removing the brick
        //depending on the value in the GameGrid we can determine what type of powerup to spawn

        //switch case that checks the value of the cell in the GameGrid and assigns the correct class if it is a powerup
        switch (explosion.GameGrid[cell[1]][cell[0]]) {
          case 8:
            //assign class ".speedy"
            explodedCell.classList.remove("cell");
            explodedCell.classList.add("speedy");
            console.log("speedy");
            break;
          case 9:
            //assign class ".bombAmountIncrase"
            explodedCell.classList.add("bombAmountIncrease");
            explodedCell.classList.remove("cell");
            console.log("bombAmountIncrease");
            break;
          case 10:
            //assign class ".bombRangeIncrease"
            explodedCell.classList.add("bombRangeIncrease");
            explodedCell.classList.remove("cell");
            console.log("bombRangeIncrease");
            break;
          default:
            break;
        }
        // If the cell is not a brick, just apply the regular explosion animation  
        explodedCell.classList.add("explosion");
        setTimeout(() => {
          explodedCell.classList.remove("explosion");
          explodedCell.classList.add("cell");
        }, 500);
    });
  }
}

// function to remove a life from the player if they get hit by an explosion
function updateLife(player) {
  // set the player lives to the number of lives they have

  console.log("removeLife function called");
  // Find the player's life element
  console.log("playerID: ", player.PlayerID);
  const playerLives = document.getElementById(`player${player.PlayerID}-lives`);
  // get the amount of children in the player's life element
  const playerLivesCount = playerLives.childElementCount;

  if (playerLivesCount > player.Lives) {
    // Remove the last child of the player's life element
    const lastHeart = playerLives.querySelector('.heart:last-child');

    if (lastHeart) {
      playerLives.removeChild(lastHeart);
    }
    if (player.Lives <= 0) {
      console.log("player died");
      let playerEl = document.querySelectorAll('.player-' + player.PlayerID)
      // remove player from board
      playerEl.forEach((el) => {
        el.classList.remove('player-' + player.PlayerID);
        el.classList.add('cell');
      });
    }
  }
}