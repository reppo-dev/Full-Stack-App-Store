package databases

import (
	"fmt"
	"log"
	"net"
	"os"
	"time"
)

var RedisAvailable bool

// InitRedis attempts to connect to the Redis infrastructure service.
// Per Constitution Principle XXVIII and FR-021, this initialization is non-blocking
// and resilient: failure to connect logs an informative warning and permits the backend to continue running.
func InitRedis() {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	target := fmt.Sprintf("%s:%s", redisHost, redisPort)
	conn, err := net.DialTimeout("tcp", target, 2*time.Second)
	if err != nil {
		RedisAvailable = false
		log.Printf("[WARN] Redis infrastructure service unreachable at %s: %v. Continuing without cache foundation.", target, err)
		return
	}
	defer conn.Close()

	RedisAvailable = true
	log.Printf("[INFO] Redis infrastructure foundation connected at %s.", target)
}

// CloseRedis gracefully closes Redis connections during application shutdown.
func CloseRedis() error {
	RedisAvailable = false
	return nil
}
