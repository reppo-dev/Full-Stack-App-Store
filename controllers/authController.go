package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	var data models.RegisterRequest

	if err:= c.BodyParser(&data); err!= nil{
		return err
	}

	if data.Password != data.PasswordConfirm {
		return c.Status(400).JSON(fiber.Map{
			"message":"password not confirm",
		})
	}

	var user models.User

	user.FirstName = data.FirstName
	user.LastName = data.LastName
	user.Email = data.Email

	hashpassword, _ := bcrypt.GenerateFromPassword([]byte(data.Password),14)

	user.SetPassword(string(hashpassword))

	databases.DB.Create(&user)

	token, err := util.GenerateJwt(user.ID)
	if err!= nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	cookie := fiber.Cookie{
		Name: "jwt",
		Value: token,
		Expires: time.Now().Add(time.Hour *24),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message":"success",
	})
}