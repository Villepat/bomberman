package game_functions

import "log"

func CheckBounds(gameBoard [19][19]int, y, x int) bool {
	if x < 0 || x > 18 || y < 0 || y > 18 {
		log.Println("Out of bounds")
		return false
	}
	//log.Println(gameBoard)
	log.Println("Checking bounds for: ", x, y)
	//log.Println(gameBoard[x][y])
	if gameBoard[x][y] == 1 || gameBoard[x][y] == 2 {
		log.Println("Cell is occupied")
		return false
	}
	return true
}
