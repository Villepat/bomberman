// File for building the base grid for the game board

// Function to build the base grid for the game board
function buildBaseGrid(n) {
  // Generate CSS for grid template
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
    `;

  // Append style element to document head
  document.head.appendChild(style);

  window.webSocketConnection.send("Hello Server!");

  // Generate grid cells
  for (let y = n - 1; y >= 0; y--) {
    for (let x = 0; x < n; x++) {
      let cell = document.createElement("div");
      if (y === 0 || y === n - 1 || x === 0 || x === n - 1) {
        cell.classList.add("cell", "edge");
      } else if (x % 2 === 0 && y % 2 === 0) {
        cell.classList.add("cell", "brick");
      } else {
        cell.classList.add("cell");
      }

      if (
        (x === 1 && y === 1) ||
        (x === n - 2 && y === n - 2) ||
        (x === 1 && y === n - 2) ||
        (x === n - 2 && y === 1) ||
        (x === 2 && y === 1) ||
        (x === 1 && y === 2) ||
        (x === n - 3 && y === n - 2) ||
        (x === n - 2 && y === n - 3) ||
        (x === 2 && y === n - 2) ||
        (x === 1 && y === n - 3) ||
        (x === n - 3 && y === 1) ||
        (x === n - 2 && y === 2)
      ) {
        cell.classList.add("safe-zone");
      }

      if (cell.classList == "cell") {
        // give a 50 percent chance of the cell being a breakable brick
        if (Math.random() < 0.5) {
          cell.classList.add("block");
        }
      }

      cell.setAttribute("id", `cell-${x}-${y}`);
      document.getElementById("game-board").appendChild(cell);
    }
  }
}

export default buildBaseGrid;
