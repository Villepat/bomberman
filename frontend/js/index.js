import buildBaseGrid from "./game_board/build_base.js";

const ws = new WebSocket("ws://localhost:80/ws");

ws.addEventListener("open", function (event) {
  console.log("WebSocket connection established");
});

console.log("Hello from index.js");

buildBaseGrid(19);
