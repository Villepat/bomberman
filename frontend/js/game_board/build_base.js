// File for building the base grid for the game board

// Function to build the base grid for the game board
function buildBaseGrid(gameBoard) {
  // Generate CSS for grid template
  const n = gameBoard.length;
  const gridTemplate = `repeat(${n}, 0fr)`;

  // Create style element
  const style = document.createElement("style");
  style.textContent = `
        #game-board {
            display: grid;
            grid-template-columns: ${gridTemplate};
            grid-template-rows: ${gridTemplate};
            background-color: #ddd;
            justify-content: center;
        }
        .cell {
            height: 50px;
            width: 50px;
            background-color: green;
            border: 1px solid black;
        }
        .edge {
            background-color: black;
        }
        .brick {
            background-color: black;
        }
        .safe-zone {
            background-color: green;
        }
        .block {
            background-position: center;
            background-size: cover;
            background-image: url("/static/images/brick.png");
        }
        #hud-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          
        }
        #hud {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 20px;
          border: 1px solid black;
          width: 80%;
        }
        
        .player-profile img {

          width: 50px; /* Adjust the width as needed */
          height: 50px; /* Adjust the height as needed */
         
        }
        

        .player-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .player-name {
          font-weight: bold;
          font-size: 16px;
        }
        
        .player-lives {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px; /* Adjust the gap as needed */
        }
        .player-lives img {
          max-width: 30px; /* Set the maximum width for the images */
          max-height: 30px; /* Set the maximum height for the images */
        }

    `;

  // Append style element to document head
  document.head.appendChild(style);

  window.webSocketConnection.send("Hello Server!");

  // Generate grid cells based on the gameBoard data from the server
  for (let y = n - 1; y >= 0; y--) {
    for (let x = 0; x < n; x++) {
      let cell = document.createElement("div");

      // Set cell class based on gameBoard value
      switch (gameBoard[y][x]) {
        case 0:
          cell.classList.add("cell");
          break;
        case 1:
          cell.classList.add("cell", "block");
          break;
        case 2:
          cell.classList.add("cell", "brick");
          break;
        case 3:
          cell.classList.add("cell", "edge");
          break;
      }

      cell.setAttribute("id", `cell-${x}-${y}`);
      document.getElementById("game-board").appendChild(cell);
    }
  }
}
export default buildBaseGrid;
