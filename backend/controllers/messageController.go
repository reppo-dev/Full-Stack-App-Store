package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util" // اطمینان حاصل کن که پکیج util حاوی ParseJwt باشد
)

// helper برای گرفتن شناسه کاربر از JWT داخل کوکی
func getUserIDFromCookie(c *fiber.Ctx) (uint, error) {
    cookie := c.Cookies("jwt")
    if cookie == "" {
        return 0, fiber.NewError(fiber.StatusUnauthorized, "توکن احراز هویت موجود نیست")
    }
    idStr, err := util.ParseJwt(cookie)   // بازگشت رشته
    if err != nil {
        return 0, fiber.NewError(fiber.StatusUnauthorized, "توکن نامعتبر یا منقضی")
    }
    // تبدیل رشته به عدد
    id, err := strconv.Atoi(idStr)
    if err != nil {
        return 0, fiber.NewError(fiber.StatusUnauthorized, "شناسهٔ کاربر نامعتبر")
    }
    return uint(id), nil
}

// helper برای بررسی اینکه پیام به کاربر جاری تعلق دارد (گیرنده یا فرستنده باشد)
func messageBelongsToUser(msg models.Message, userID uint) bool {
	return msg.RecipientID == userID || msg.SenderID == userID
}

// ========== ارسال پیام جدید ==========
func CreateMessage(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err // Fiber error with status 401
	}

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

	msg := models.Message{
		SenderID:    userID,
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

// ========== دریافت لیست پیام‌ها ==========
func GetMessages(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	folder := c.Query("folder")
	labelID := c.Query("label_id")

	query := databases.DB.Model(&models.Message{}).
		Preload("Sender").
		Preload("Labels")

	if folder == "sent" {
		query = query.Where("sender_id = ? AND is_draft = false", userID)
	} else if folder == "draft" {
		query = query.Where("sender_id = ? AND is_draft = true", userID)
	} else {
		// پیش‌فرض: inbox (گیرنده = کاربر جاری)
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

// ========== دریافت یک پیام ==========
func GetMessage(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid message ID"})
	}

	var msg models.Message
	if err := databases.DB.Preload("Sender").Preload("Labels").First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	if !msg.IsRead {
		databases.DB.Model(&msg).Update("is_read", true)
	}

	return c.JSON(msg)
}

// ========== تغییر وضعیت ستاره ==========
func ToggleStar(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var msg models.Message
	if err := databases.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	databases.DB.Model(&msg).Update("is_starred", !msg.IsStarred)
	return c.SendStatus(200)
}

// ========== تغییر وضعیت مهم ==========
func ToggleImportant(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var msg models.Message
	if err := databases.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	databases.DB.Model(&msg).Update("is_important", !msg.IsImportant)
	return c.SendStatus(200)
}

// ========== انتقال به زباله‌دان ==========
func MoveToTrash(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var msg models.Message
	if err := databases.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	databases.DB.Model(&msg).Update("is_trashed", true)
	return c.SendStatus(200)
}

// ========== بازگردانی از زباله‌دان ==========
func RestoreMessage(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var msg models.Message
	if err := databases.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	databases.DB.Model(&msg).Update("is_trashed", false)
	return c.SendStatus(200)
}

// ========== حذف دائمی ==========
func DeleteMessage(c *fiber.Ctx) error {
	userID, err := getUserIDFromCookie(c)
	if err != nil {
		return err
	}

	id, _ := strconv.Atoi(c.Params("id"))
	var msg models.Message
	if err := databases.DB.First(&msg, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if !messageBelongsToUser(msg, userID) {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	databases.DB.Unscoped().Delete(&msg)
	return c.SendStatus(204)
}