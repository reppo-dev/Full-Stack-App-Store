package cache

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrCacheMiss = errors.New("cache miss")

// Cache defines the key-value caching contract.
type Cache interface {
	Get(ctx context.Context, key string, dest interface{}) error
	Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
}

// RedisCache provides a resilient Redis-backed implementation of Cache.
type RedisCache struct {
	client *redis.Client
}

// NewRedisCache creates a new RedisCache instance.
func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{client: client}
}

// NewNoopCache returns a cache that safely does nothing (for testing or when Redis is offline).
func NewNoopCache() *RedisCache {
	return &RedisCache{client: nil}
}

// Get fetches and unmarshals JSON from Redis. Returns ErrCacheMiss on absence or connection failure.
func (c *RedisCache) Get(ctx context.Context, key string, dest interface{}) error {
	if c.client == nil {
		return ErrCacheMiss
	}

	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		return ErrCacheMiss
	}

	return json.Unmarshal(data, dest)
}

// Set marshals value into JSON and stores in Redis with a TTL.
func (c *RedisCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if c.client == nil {
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, key, data, ttl).Err()
}

// Delete removes one or more keys from Redis.
func (c *RedisCache) Delete(ctx context.Context, keys ...string) error {
	if c.client == nil || len(keys) == 0 {
		return nil
	}

	return c.client.Del(ctx, keys...).Err()
}
