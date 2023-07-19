package server

import (
	"bomberman-dom/game_functions"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var gameBoard []byte
var gameGrid [19][19]int
var isGameBoardGenerated bool
var numConnections = 0
var gridMutex = &sync.Mutex{}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type UserConnection struct {
	UserID     int
	Username   string
	Connection *websocket.Conn
}

var Connections = make(map[*websocket.Conn]*UserConnection)
var ConnectionsByName = make(map[string]*websocket.Conn)

type Message struct {
	Command   string `json:"command"`
	Direction string `json:"direction"`
	Timestamp string
}

type Msg struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// function to read the data from the websocket connection
func reader(conn *websocket.Conn) {
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("Failed to close connection: %v", err)
		}
		delete(Connections, conn)

		// Decrement the number of connections.
		numConnections--

		// If there are no more connections, reset the game board.
		if numConnections == 0 {
			isGameBoardGenerated = false
		}
	}()

	// Set up a close handler for the WebSocket connection
	conn.SetCloseHandler(func(code int, text string) error {
		log.Printf("WebSocket closed with code %d and text: %s", code, text)
		delete(Connections, conn) // Remove the connection from the map.
		return nil
	})
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		// Create a map to store the connections by username
		for _, conn := range Connections {
			ConnectionsByName[conn.Username] = conn.Connection
		}
		log.Println("message received: ")
		log.Println("player name: ", Connections[conn].Username)
		log.Println("player id: ", Connections[conn].UserID)
		log.Println("messageType: ", messageType)
		log.Println(string(p))
		if messageType == 1 {
			// get the value of the message
			var msg Message
			err := json.Unmarshal(p, &msg)
			if err != nil {
				log.Println(err)
			}
			log.Println("message: ", msg)
			log.Println("message command: ", msg.Command)
			log.Println("message text: ", msg.Direction)
			if msg.Command == "move" {
				log.Println("move command received")
				MovePlayer(gameGrid, Connections[conn].UserID, msg.Direction)
			} else if msg.Command == "place-bomb" {
				log.Println("place-bomb command received")
				PlaceBomb(&gameGrid, Connections[conn].UserID)
			}
		}
	}
}

// function to set up the websocket endpoint
func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	if numConnections >= 4 {
		log.Println("Connection attempt rejected. Maximum number of connections reached.")
		w.WriteHeader(http.StatusServiceUnavailable) // Or another appropriate status code
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	userconn := &UserConnection{
		UserID:     numConnections + 1,
		Username:   "player " + strconv.Itoa(numConnections+1),
		Connection: ws,
	}
	// Add the connection to the list of active connections.
	Connections[ws] = userconn
	numConnections++ // Increment the number of connections.
	log.Printf("User %s with ID %d successfully connected", userconn.Username, userconn.UserID)
	log.Println("connections: ", Connections)

	//Populate Player struct and initialize Speed, Bombs, Direction, Lives and BombRange.
	//Depending on the ID we also set the coordinates of the player.
	//ID 1 = bottom left corner (1,1)
	//ID 2 = bottom right corner (17,1)
	//ID 3 = top left corner (1,17)
	//ID 4 = top right corner (17,17)
	playerID := userconn.UserID
	player := game_functions.Player{
		PlayerID:  userconn.UserID,
		Name:      userconn.Username,
		Speed:     1,
		Lives:     3,
		Bombs:     100,
		BombRange: 1,
		Direction: "down",
	}
	switch playerID {
	case 1:
		player.GridPosition = [2]int{1, 1}
		player.PixelPosition = [2]int{51, 51}
	case 2:
		player.GridPosition = [2]int{17, 17}
		player.PixelPosition = [2]int{51, 819}
	case 3:
		player.GridPosition = [2]int{1, 17}
		player.PixelPosition = [2]int{819, 51}
	case 4:
		player.GridPosition = [2]int{17, 1}
		player.PixelPosition = [2]int{819, 819}
	}
	//add player to map of players
	game_functions.Players[userconn.UserID] = player
	// log.Println("Players: ", game_functions.Players)
	//Print player info one by one
	for _, player := range game_functions.Players {
		log.Println("Player ID: ", player.PlayerID)
		log.Println("Player Name: ", player.Name)
		log.Println("Player Lives: ", player.Lives)
		log.Println("Player Speed: ", player.Speed)
		log.Println("Player Direction: ", player.Direction)
		log.Println("Player Bombs: ", player.Bombs)
		log.Println("Player Bomb Range: ", player.BombRange)
		log.Println("Player Grid Position: ", player.GridPosition)
		log.Println("Player Pixel Position: ", player.PixelPosition)
	}

	if !isGameBoardGenerated {
		gameGrid, gameBoard, err = game_functions.GenerateGameBoard()
		if err != nil {
			log.Println(err)
		} else {
			isGameBoardGenerated = true
		}
	}

	// Send the game board to the client
	err = ws.WriteMessage(1, gameBoard)
	if err != nil {
		log.Println(err)
	}

	go reader(ws)
}

// function to set up the routes for the websocket server.
func SetupRoutes() {
	http.HandleFunc("/ws", wsEndpoint)
}

// A function that changes the player's direction & position based on data received through the WS
func MovePlayer(gameGrid [19][19]int, playerID int, direction string) {
	//Get the player from the map
	player := game_functions.Players[playerID]

	speed := player.Speed
	lastMove := player.LastMove
	//call isAllowedToMove to check if the player is allowed to move
	if !IsAllowedToMove(speed, lastMove) {
		fmt.Println("Player is not allowed to move yet")
		return
	}

	//Change the player's direction
	player.Direction = direction
	//Change the player's position
	log.Println("Player position before: ", player.GridPosition)
	log.Println("Player pixel position before: ", player.PixelPosition)
	switch direction {
	case "up":
		if player.GridPosition[1] == 17 || !game_functions.CheckBounds(gameGrid, player.GridPosition[0], player.GridPosition[1]+1) {
			break
		}
		player.GridPosition[1]++
		player.PixelPosition[1] += 48
		//update LastMove
		player.LastMove = time.Now()
	case "down":
		if player.GridPosition[1] == 1 || !game_functions.CheckBounds(gameGrid, player.GridPosition[0], player.GridPosition[1]-1) {
			break
		}
		player.GridPosition[1]--
		player.PixelPosition[1] -= 48
		//update LastMove
		player.LastMove = time.Now()
	case "left":
		if player.GridPosition[0] == 1 || !game_functions.CheckBounds(gameGrid, player.GridPosition[0]-1, player.GridPosition[1]) {
			break
		}
		player.GridPosition[0]--
		player.PixelPosition[0] -= 48
		//update LastMove
		player.LastMove = time.Now()
	case "right":
		if player.GridPosition[0] == 17 || !game_functions.CheckBounds(gameGrid, player.GridPosition[0]+1, player.GridPosition[1]) {
			break
		}
		player.GridPosition[0]++
		player.PixelPosition[0] += 48
		//update LastMove
		player.LastMove = time.Now()
	}
	log.Println("Player position after: ", player.GridPosition)
	log.Println("Player pixel position after: ", player.PixelPosition)
	//Update the player in the map
	game_functions.Players[playerID] = player

	playerMsg := Msg{
		Type: "player",
		Data: player,
	}

	//send the updated player to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(playerMsg)
		if err != nil {
			log.Println(err)
		}
	}
}

// A function that receives a players speed and when it was last moved and returns a bool
// if speed is 1, the player can move every 0.5 seconds
// if speed is 2, the player can move every 0.3 seconds
// if speed is 3, the player can move every 0.2 seconds
func IsAllowedToMove(speed int, lastMove time.Time) bool {
	//get the current time
	currentTime := time.Now()
	//get the difference between the current time and the last move
	timeDifference := currentTime.Sub(lastMove)
	fmt.Println("Current time: ", currentTime)
	fmt.Println("Last move: ", lastMove)
	fmt.Println("Time difference: ", timeDifference)
	//if the time difference is less than the allowed time, return false
	switch speed {
	case 1:
		if timeDifference.Seconds() < 0.5 {
			return false
		}
	case 2:
		if timeDifference.Seconds() < 0.35 {
			return false
		}
	case 3:
		if timeDifference.Seconds() < 0.2 {
			return false
		}
	}
	//	fmt.Println("Player is allowed to move")
	return true
}

// A function that places a bomb on the game board
func PlaceBomb(gameGrid *[19][19]int, playerID int) {
	gridMutex.Lock()
	log.Println("Game grid: ", gameGrid)
	// Get the player from the map
	player := game_functions.Players[playerID]
	// CHANGE THIS TO THE CONCURRENT BOMB LIMIT!!!!!!!
	if player.Bombs == 0 {
		log.Println("Player has no bombs left")
		defer gridMutex.Unlock()
		return
	}
	// Check if the player is on a bomb
	if gameGrid[player.GridPosition[0]][player.GridPosition[1]] == 69 {
		log.Println("Player is on a bomb")
		defer gridMutex.Unlock()
		return
	}
	// Check the player's bomb range
	bombRange := player.BombRange
	log.Println("Bomb range: ", bombRange)

	// Place a bomb on the game board
	gameGrid[player.GridPosition[0]][player.GridPosition[1]] = 69
	log.Println("Bomb placed at: ", player.GridPosition)
	// Update the player in the map
	player.Bombs--
	game_functions.Players[playerID] = player

	log.Println("Game grid after bomb placement: ", gameGrid)

	// Prepare bomb message
	bombMsg := Msg{
		Type: "bomb",
		Data: struct {
			GridPosition []int
		}{GridPosition: []int{player.GridPosition[0], player.GridPosition[1]}},
	}

	// Send the bomb message to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(bombMsg)
		if err != nil {
			log.Println(err)
		}
	}

	// Start a timer for the bomb explosion
	go func() {
		timer := time.NewTimer(time.Duration(2) * time.Second)
		<-timer.C
		HandleExplosion(gameGrid, player.GridPosition[0], player.GridPosition[1], bombRange)
	}()

	defer gridMutex.Unlock()

	playerMsg := Msg{
		Type: "player",
		Data: player,
	}

	// Send the updated player to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(playerMsg)
		if err != nil {
			log.Println(err)
		}
	}

	gameGridMsg := Msg{
		Type: "gameGrid",
		Data: gameGrid,
	}

	// Send the updated game board to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(gameGridMsg)
		if err != nil {
			log.Println(err)
		}
	}
}

func HandleExplosion(gameGrid *[19][19]int, x int, y int, bombRange int) {
	gridMutex.Lock()
	log.Println("---------------------BOOOOOOOOOOOOOOOOOOOOM---------------------")
	// Clean the bomb from gameGrid
	gameGrid[x][y] = 0

	// The explosion's affected area is the bomb range in each direction.
	var affectedCells [][]int
	// Handle the bomb explosion here. For now, let's just destroy the destroyable blocks (1 -> 0).
	for i := -bombRange; i <= bombRange; i++ {
		if x+i >= 0 && x+i < 19 && gameGrid[y][x+i] == 1 {
			gameGrid[y][x+i] = 0
			affectedCells = append(affectedCells, []int{x + i, y})
		}
		if y+i >= 0 && y+i < 19 && gameGrid[y+i][x] == 1 {
			gameGrid[y+i][x] = 0
			affectedCells = append(affectedCells, []int{x, y + i})
		}
	}
	gridMutex.Unlock()

	// Log the state of game grid after explosion
	log.Println("Game grid after explosion: ", gameGrid)
	log.Println("Affected cells: ", affectedCells)

	explosionMsg := Msg{
		Type: "explosion",
		Data: struct {
			GameGrid      *[19][19]int
			AffectedCells [][]int
		}{
			GameGrid:      gameGrid,
			AffectedCells: affectedCells,
		},
	}

	//send the updated game board to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(explosionMsg)
		if err != nil {
			log.Println(err)
		}
	}
}
