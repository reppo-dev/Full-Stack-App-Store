package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func CreateLabel(c *fiber.Ctx) error {
    id , _ := strconv.Atoi(c.Params("id"))

    var input struct{
        Name string `json:"name"`
        ColorCode string `json:"color_code"`
    }

    c.BodyParser(&input)


    label := models.Label{
        UserID: uint(id),
        Name: input.Name,
        ColorCode: input.ColorCode,
    }

    databases.DB.Create(&label)

    return c.JSON(label)
}

func AllLabelUser(c *fiber.Ctx) error {
    id,_ := strconv.Atoi(c.Params("id"))

    var label []models.Label

    databases.DB.Where("user_id = ?",id).Find(&label)

    return c.JSON(label)
}


func AddLabelToMessage(c *fiber.Ctx) error {
    msgId , _ := strconv.Atoi(c.Params("id"))
    var input struct {
        LabelId uint `json:"label_id"`
    }

    var message models.Message

    databases.DB.First(&message,msgId)

    var label models.Label

    databases.DB.First(&label,input.LabelId)

    databases.DB.Model(&message).Association("Labels").Append(&label)

    return c.SendStatus(200)
}


func RemoveLabelFromMessage(c *fiber.Ctx) error {
    msgId , _ := strconv.Atoi(c.Params("id"))
    labelID, _ := strconv.Atoi(c.Params("label_id"))

    var msg models.Message
    databases.DB.First(&msg,msgId)

    var label models.Label
    databases.DB.First(&label,labelID)

    databases.DB.Model(&msg).Association("Labels").Delete(&label)

    return c.SendStatus(200)
}

func GetMessage(c *fiber.Ctx) error {
    msgId := c.Params("id")

    var msg models.Message

    databases.DB.Preload("Labels").First(&msg,msgId)

    return c.JSON(msg)
}



func GetMessagesByLabel(c *fiber.Ctx) error {
    labelID, _ := strconv.Atoi(c.Params("id"))

    var label models.Label
    databases.DB.First(&label, labelID)
	var messages []models.Message
     databases.DB.
        Joins("JOIN message_labels ON message_labels.message_id = messages.id").
        Where("message_labels.label_id = ?", labelID).
        Preload("Labels").
        Find(&messages)


    return c.JSON(messages)
}