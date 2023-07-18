// File for building the base grid for the game board

// Function to build the base grid for the game board
async function buildBaseGrid(gameBoard) {
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

            justify-content: center;
        }
        .cell {
            height: 50px;
            width: 50px;
            background-image: url("/static/images/grass.png");
            background-size: cover;
        }
        .edge {
            background-image: url("/static/images/backgroundbrick1.png");
            background-size: cover;
        }
        .steel {
            background-image: url("/static/images/backgroundbrick1.png");
        }
        .safe-zone {
            background-image: url("/static/images/grass.png");
            background-size: cover;
        }
        .brick {
            background-position: center;
            background-size: cover;
            background-image: url("/static/images/brick2.png");
        }
        .player-1 {
            background-image: url("/static/images/player1.png");
            background-size: cover;
        }
        .player-2 {
            background-image: url("/static/images/player2.png");
            background-size: cover;
        }
        .player-3 {
            background-image: url("/static/images/player3.png");
            background-size: cover;
        }
        .player-4 {
            background-image: url("/static/images/player4.png");
            background-size: cover;
            z-index: 1;
        }
    `;

  // Append style element to document head
  document.head.appendChild(style);

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
          cell.classList.add("cell", "brick");
          break;
        case 2:
          cell.classList.add("cell", "steel");
          break;
        case 3:
          cell.classList.add("cell", "edge");
          break;
        case 4:
          cell.classList.add(
            "cell",
            `starting-cell-1`,
            `player-1`,
          );
          break;
        case 5:
          cell.classList.add(
            "cell",
            `starting-cell-4`,
            `player-4`
          );
          break;
        case 6:
          cell.classList.add(
            "cell",
            `starting-cell-3`,
            `player-3`
          );
          break;
        case 7:
          cell.classList.add(
            "cell",
            `starting-cell-2`,
            `player-2`
          );
          break;
        default:
          cell.classList.add("cell");
          break;
      }

      cell.setAttribute("id", `cell-${x}-${y}`);
      document.getElementById("game-board").appendChild(cell);
    }
  }
}

export { buildBaseGrid };
