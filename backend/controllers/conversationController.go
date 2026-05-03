package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

// GET /api/conversations/:userID
func GetConversation(c *fiber.Ctx) error {
    // شناسه کاربر جاری (ادمین)
    currentUserID, err := getUserIDFromCookie(c)
    if err != nil {
        return err
    }

    // شناسه کاربر مقابل (مثلاً فرستنده پیام)
    otherUserID, err := strconv.Atoi(c.Params("userID"))
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
    }

    var messages []models.Message
    if err := databases.DB.
        Where(
            "(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)",
            currentUserID, otherUserID, otherUserID, currentUserID,
        ).
        Order("created_at ASC").
        Preload("Sender").
        Preload("Labels").
        Find(&messages).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch conversation"})
    }

    return c.JSON(messages)
}