// File for functions handeling the explosives
let message;

export function destroyBrick(x, y) {
  // Get the cell
  const cell = document.getElementById(`cell-${x}-${y}`);
  // Check if the cell is a brick
  if (cell.classList.contains("brick")) {
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
    // console.log("destroyBrick");
    // if (window.webSocketConnection.readyState === WebSocket.OPEN) {
    // console.log("destroyBrick message sent");
    // message = {
    // type: "destroyBrick",
    // x: x,
    // y: y,
    //};
    // // Send the message through the WebSocket connection
    // window.webSocketConnection.send(JSON.stringify(message));
    //}
  }
}
