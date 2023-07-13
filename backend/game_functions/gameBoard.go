package game_functions

import (
	"log"
	"math/rand"
)

func GenerateGameBoard() [19][19]int {
	// create a matrix of 19x19 with 0s
	// 0s represent paths
	// 1s represent bricks
	// 2s represent steel
	// 3s represent edges

	var gameBoard [19][19]int

	for i := 0; i < 19; i++ {
		for j := 0; j < 19; j++ {
			if i == 0 || j == 0 || i == 18 || j == 18 {
				gameBoard[i][j] = 3
			} else if i%2 == 0 && j%2 == 0 {
				gameBoard[i][j] = 2
			} else {
				// randomize bricks and paths 50/50
				gameBoard[i][j] = rand.Intn(2)
			}
		}
	}
	log.Println(gameBoard)
	return gameBoard
}
