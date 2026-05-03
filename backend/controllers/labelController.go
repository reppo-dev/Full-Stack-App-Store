package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

// POST /api/labels
func CreateLabel(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	var input struct {
		Name      string `json:"name"`
		ColorCode string `json:"color_code"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}
	if input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}

	label := models.Label{
		UserID:    userID,
		Name:      input.Name,
		ColorCode: input.ColorCode,
	}
	if result := databases.DB.Create(&label); result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create label"})
	}
	return c.Status(201).JSON(label)
}

// GET /api/labels
func AllLabelUser(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	var labels []models.Label
	if result := databases.DB.Where("user_id = ?", userID).Find(&labels); result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch labels"})
	}
	return c.JSON(labels)
}

// DELETE /api/labels/:id
func DeleteLabel(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	labelID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid label ID"})
	}

	var label models.Label
	if result := databases.DB.Where("id = ? AND user_id = ?", labelID, userID).First(&label); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "label not found"})
	}

	// remove associations, then delete the label
	databases.DB.Model(&label).Association("Messages").Clear()
	databases.DB.Delete(&label)
	return c.SendStatus(204)
}

// POST /api/messages/:id/labels
func AddLabelToMessage(c *fiber.Ctx) error {
	msgID, _ := strconv.Atoi(c.Params("id"))
	var input struct {
		LabelID uint `json:"label_id"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid input"})
	}

	var msg models.Message
	if err := databases.DB.First(&msg, msgID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "message not found"})
	}
	var label models.Label
	if err := databases.DB.First(&label, input.LabelID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "label not found"})
	}

	if err := databases.DB.Model(&msg).Association("Labels").Append(&label); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to add label"})
	}
	return c.SendStatus(200)
}

// DELETE /api/messages/:id/labels/:labelID
func RemoveLabelFromMessage(c *fiber.Ctx) error {
	msgID, _ := strconv.Atoi(c.Params("id"))
	labelID, _ := strconv.Atoi(c.Params("labelID"))

	var msg models.Message
	databases.DB.First(&msg, msgID)
	var label models.Label
	databases.DB.First(&label, labelID)

	databases.DB.Model(&msg).Association("Labels").Delete(&label)
	return c.SendStatus(200)
}

// GET /api/messages/:id (already in messageController, but this one is unused – can keep or delete)
func GetMessag(c *fiber.Ctx) error {
	msgID := c.Params("id")
	var msg models.Message
	databases.DB.Preload("Labels").First(&msg, msgID)
	return c.JSON(msg)
}

// GET /api/labels/:id/messages
func GetMessagesByLabel(c *fiber.Ctx) error {
	labelID, _ := strconv.Atoi(c.Params("id"))

	var label models.Label
	databases.DB.First(&label, labelID)

	var messages []models.Message
	databases.DB.
		Joins("JOIN message_labels ON message_labels.message_id = messages.id").
		Where("message_labels.label_id = ?", labelID).
		Preload("Sender").
		Preload("Labels").
		Find(&messages)

	return c.JSON(messages)
}