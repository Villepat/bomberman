package game_functions

import (
	"encoding/json"
	"log"
	"math/rand"
)

func GenerateGameBoard() ([19][19]int, []byte, error) {
	var gameBoard [19][19]int
	n := len(gameBoard)

	// generate game board
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			switch {
			case isEdge(i, j, n):
				gameBoard[i][j] = 3
			case isSteel(i, j):
				gameBoard[i][j] = 2
			case isSafeZone(i, j, n):
				gameBoard[i][j] = 0
			default:
				gameBoard[i][j] = rand.Intn(2) // randomize bricks and paths 50/50
			}
		}
	}

	// place players in their starting positions
	for i := 1; i < 5; i++ {
		startingPosition := GetStartingPosition(i)
		gameBoard[startingPosition[0]][startingPosition[1]] = i + 3
	}

	// convert gameBoard to json
	jsonmap, err := json.Marshal(gameBoard)
	if err != nil {
		log.Println(err)
		return gameBoard, jsonmap, err
	}

	return gameBoard, jsonmap, nil
}

func isEdge(i, j, n int) bool {
	return i == 0 || j == 0 || i == n-1 || j == n-1
}

func isSteel(i, j int) bool {
	return i%2 == 0 && j%2 == 0
}

func isSafeZone(i, j, n int) bool {
	safeCells := [][2]int{
		{1, 1}, {n - 2, n - 2}, {1, n - 2}, {n - 2, 1},
		{2, 1}, {1, 2}, {n - 3, n - 2}, {n - 2, n - 3},
		{2, n - 2}, {1, n - 3}, {n - 3, 1}, {n - 2, 2},
	}
	for _, cell := range safeCells {
		if i == cell[0] && j == cell[1] {
			return true
		}
	}
	return false
}

// identify the nth players starting position
func GetStartingPosition(n int) [2]int {
	switch n {
	case 1:
		return [2]int{1, 1}
	case 2:
		return [2]int{17, 17}
	case 3:
		return [2]int{1, 17}
	case 4:
		return [2]int{17, 1}
	default:
		return [2]int{0, 0}
	}
}
