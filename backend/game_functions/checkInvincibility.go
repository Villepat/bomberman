package game_functions

import "time"

func CheckInvincibility(player Player) bool {
	if player.LastHit.Add(5 * time.Second).Before(time.Now()) {
		return false
	} else {
		return true
	}
}
