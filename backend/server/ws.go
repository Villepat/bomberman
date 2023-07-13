package server

import (
	"bomberman-dom/game_functions"
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
	Command    string `json:"command"`
	Text       string `json:"message"`
	Receiver   string `json:"receiver"`
	ReceiverID int    `json:"receiver_id"`
	Sender     string `json:"sender"`
	SenderID   int    `json:"sender_id"`
	Image      string `json:"image"`
	Timestamp  string
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
		log.Println("messageType: ", messageType)
		log.Println(string(p))
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
