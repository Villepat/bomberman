package server

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

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
		var message Message
		err = json.Unmarshal(p, &message)
		if err != nil {
			log.Println(err)
			return
		}

	}
}

// function to set up the websocket endpoint
func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	userconn := &UserConnection{
		UserID:     1,
		Username:   "haha",
		Connection: ws,
	}
	// Add the connection to the list of active connections.
	Connections[ws] = userconn
	log.Printf("User %s with ID %d successfully connected", userconn.Username, userconn.UserID)
	log.Println("connections: ", Connections)
	go reader(ws)
}

// function to set up the routes for the websocket server.
func SetupRoutes() {
	http.HandleFunc("/ws", wsEndpoint)
}
