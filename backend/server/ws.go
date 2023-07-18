package server

import (
	"bomberman-dom/game_functions"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var gameBoard []byte
var isGameBoardGenerated bool
var numConnections = 0

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

type Notification struct {
	Type      string `json:"Type"`
	Groupid   int    `json:"Groupid"`
	UserID    int    `json:"UserID"`
	SenderID  int    `json:"Sender"`
	Message   string `json:"Message"`
	Command   string `json:"Command"`
	Timestamp string `json:"Date"`
}

type NotificationResponse struct {
	NotifId  int    `json:"NotifId"`
	UserId   int    `json:"UserId"`
	SenderId int    `json:"SenderId"`
	Groupid  int    `json:"Groupid"`
	Content  string `json:"Content"`
	Read     bool   `json:"Read"`
	Type     string `json:"Type"`
	Date     string `json:"Date"`
	Command  string `json:"Command"`
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

			MovePlayer(Connections[conn].UserID, msg.Direction)

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
		Bombs:     1,
		BombRange: 1,
		Direction: "down",
	}
	switch playerID {
	case 1:
		player.GridPosition = [2]int{1, 1}
		player.PixelPosition = [2]int{51, 51}
	case 2:
		player.GridPosition = [2]int{17, 1}
		player.PixelPosition = [2]int{819, 51}
	case 3:
		player.GridPosition = [2]int{1, 17}
		player.PixelPosition = [2]int{51, 819}
	case 4:
		player.GridPosition = [2]int{17, 17}
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
		_, gameBoard, err = game_functions.GenerateGameBoard()
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
func MovePlayer(playerID int, direction string) {
	//Get the player from the map
	player := game_functions.Players[playerID]
	//Change the player's direction
	player.Direction = direction
	//Change the player's position
	log.Println("Player position before: ", player.GridPosition)
	log.Println("Player pixel position before: ", player.PixelPosition)
	switch direction {
	case "up":
		player.GridPosition[1]++
		player.PixelPosition[1] += 48
	case "down":
		player.GridPosition[1]--
		player.PixelPosition[1] -= 48
	case "left":
		player.GridPosition[0]--
		player.PixelPosition[0] -= 48
	case "right":
		player.GridPosition[0]++
		player.PixelPosition[0] += 48
	}
	log.Println("Player position after: ", player.GridPosition)
	log.Println("Player pixel position after: ", player.PixelPosition)
	//Update the player in the map
	game_functions.Players[playerID] = player

	//send the updated player to all of the clients
	for _, conn := range Connections {
		err := conn.Connection.WriteJSON(game_functions.Players)
		if err != nil {
			log.Println(err)
		}
	}
}
