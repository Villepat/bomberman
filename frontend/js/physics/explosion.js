// File for functions handeling the explosives

function destroyBrick(gameBoard, x, y) {
    // Get the cell
    const cell = gameBoard[x][y];
    // Check if the cell is a brick
    if (cell.type === "brick") {
        // Remove the brick
        cell.type = "empty";
        cell.player = null;
        cell.bomb = null;
        // Remove the brick from the DOM
        const brick = document.getElementById(`cell-${x}-${y}`);
        brick.classList.remove("brick");
        brick.classList.add("cell");
    }
}
