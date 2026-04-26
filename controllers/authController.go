package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util"
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


	user.SetPassword(data.Password)

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

func Login(c *fiber.Ctx) error {
	var data models.LoginRequest

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	var user models.User

	databases.DB.Where("email = ?",data.Email).First(&user)

	if user.ID ==0 {
		return c.Status(404).JSON(fiber.Map{
			"message":"user not found",
		})
	}

	err := user.ComperPassword(data.Password)

	if err !=nil {
		return c.Status(404).JSON(fiber.Map{
			"message":"incorect password",
		})
	}

	token , err := util.GenerateJwt(user.ID)

	cookie := fiber.Cookie{
		Name: "jwt",
		Value: token,
		Expires: time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message":"success",
	})
}

func User(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")

	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message":"inviled or expired token",
		})
	}

	id, err := util.ParseJwt(cookie)
	    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "message": "invalid or expired token",
        })
    }
	
	var user models.User

	result := databases.DB.Preload("Role").First(&user,id)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message":"user not found",
		})
	}

	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name: "jwt",
		Value: "",
		Expires: time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)
	return c.JSON(fiber.Map{
		"message":"success log out",
	})
}

func UpdateInfo(c *fiber.Ctx) error {
	var data models.UpdateIfo

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	cookie := c.Cookies("jwt")

	id , err := util.ParseJwt(cookie)
	if err != nil {
		return err
	}

	var user models.User

	databases.DB.Where("id = ?",id).First(&user)

	user.FirstName = data.FirstName
	user.LastName = data.LastName
	user.Email = user.Email

	databases.DB.Save(&user)

	return c.JSON(user)
}

func UpdatePassword(c *fiber.Ctx) error {
	var data models.UpdatePassword

	if err:= c.BodyParser(&data); err!= nil {
		return err
	}

	if data.Password != data.PasswordConfirm {
		return c.JSON(fiber.Map{
			"message":"password not match",
		})
	}

	cookie := c.Cookies("jwt")

	id,err := util.ParseJwt(cookie)
	if err!=nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	var user models.User

	databases.DB.Where("id = ?",id).First(&user)

	user.SetPassword(data.Password)

	databases.DB.Save(&user)

	return c.JSON(user)
}