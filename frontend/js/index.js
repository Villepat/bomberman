import buildBaseGrid from "./game_board/build_base.js";

window.webSocketConnection = new WebSocket("ws://localhost:80/ws");

window.webSocketConnection.onopen = function (event) {
  console.log("WebSocket is open now.");
  buildBaseGrid(19);
};
