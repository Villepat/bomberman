// File for functions handeling the explosives

export function destroyBrick(gameBoard, x, y) {
    // Get the cell
    const cell = document.getElementById(`cell-${x}-${y}`);
    // Check if the cell is a brick
    if (cell.classList.contains("brick")) {
        console.log("This is a brick")
        // Remove the brick
        cell.type = "empty";
        cell.player = null;
        cell.bomb = null;
        // Remove the brick from the DOM
        const brick = document.getElementById(`cell-${x}-${y}`);
        brick.classList.remove("brick");
        // give a 15% chance of spawning a powerup
        if (Math.random() < 0.15) {
            // spawn a powerup
            alert("Powerup spawned");
        }
    }
}
