package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)


func CreateMessage(c *fiber.Ctx) error {
    var input struct {
        RecipientID uint   `json:"recipient_id"`
        Subject     string `json:"subject"`
        Body        string `json:"body"`
        Snippet     string `json:"snippet"`
        IsDraft     bool   `json:"is_draft"`
    }
    if err := c.BodyParser(&input); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
    }

    id,_:= strconv.Atoi(c.Params("id"))


    msg := models.Message{
        SenderID:    uint(id),
        RecipientID: input.RecipientID,
        Subject:     input.Subject,
        Body:        input.Body,
        Snippet:     input.Snippet,
        IsDraft:     input.IsDraft,
        IsRead:      false,
    }

    if err := databases.DB.Create(&msg).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to create message"})
    }

    return c.Status(201).JSON(msg)
}

func GetMessages(c *fiber.Ctx) error {
    folder := c.Query("folder")
    labelID := c.Query("label_id")
    userID ,_:= strconv.Atoi(c.Params("id"))

    query := databases.DB.Model(&models.Message{}).
        Preload("Sender").
        Preload("Labels")

    if folder == "sent" {
        query = query.Where("sender_id = ? AND is_draft = false", userID)
    } else if folder == "draft" {
        query = query.Where("sender_id = ? AND is_draft = true", userID)
    } else {
        query = query.Where("recipient_id = ?", userID)
    }

    switch folder {
    case "starred":
        query = query.Where("is_starred = true")
    case "important":
        query = query.Where("is_important = true")
    case "trash":
        query = query.Where("is_trashed = true")
    default:
        query = query.Where("is_trashed = false")
    }

    if labelID != "" {
        if lid, err := strconv.Atoi(labelID); err == nil {
            query = query.Joins("JOIN message_labels ON message_labels.message_id = messages.id").
                Where("message_labels.label_id = ?", lid)
        }
    }

    var messages []models.Message
    if err := query.Find(&messages).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
    }

    return c.JSON(messages)
}

func GetMessage(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid message ID"})
    }

    var msg models.Message
    if err := databases.DB.Preload("Sender").Preload("Labels").First(&msg, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
    }

    if !msg.IsRead {
        databases.DB.Model(&msg).Update("is_read", true)
    }

    return c.JSON(msg)
}

func ToggleStar(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var msg models.Message
    if err := databases.DB.First(&msg, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
    }
    databases.DB.Model(&msg).Update("is_starred", !msg.IsStarred)
    return c.SendStatus(200)
}

func ToggleImportant(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    var msg models.Message
    if err := databases.DB.First(&msg, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
    }
    databases.DB.Model(&msg).Update("is_important", !msg.IsImportant)
    return c.SendStatus(200)
}

func MoveToTrash(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    databases.DB.Model(&models.Message{}).Where("id = ?", id).Update("is_trashed", true)
    return c.SendStatus(200)
}

func RestoreMessage(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    databases.DB.Model(&models.Message{}).Where("id = ?", id).Update("is_trashed", false)
    return c.SendStatus(200)
}

func DeleteMessage(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    databases.DB.Unscoped().Delete(&models.Message{}, id)
    return c.SendStatus(204)
}