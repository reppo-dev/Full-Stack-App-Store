package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllUsers(c *fiber.Ctx) error {


	page, _ := strconv.Atoi(c.Query("page", "1"))

	return c.JSON(models.Paginate(databases.DB,&models.User{},page))
}

func AllUser(c *fiber.Ctx) error {
	var user []models.User

	databases.DB.Find(&user)

	return c.JSON(user)
}

func CreateUser(c *fiber.Ctx) error {
	var user models.User

	err :=c.BodyParser(&user)

	if err != nil {
		return err
	}

	user.SetPassword(user.Password)

	databases.DB.Create(&user)

	return c.JSON(user)
}

func GetUser(c *fiber.Ctx) error {
	
	id,_ := strconv.Atoi(c.Params("id"))

	var user models.User

	databases.DB.Preload("Role").First(&user,id)

	return c.JSON(user)
}

func UpdateUser(c *fiber.Ctx) error {
	
	id ,_ := strconv.Atoi(c.Params("id"))

	var user models.User

	databases.DB.Preload("Role").First(&user,id)

	var data models.UpdateRequest

	err := c.BodyParser(&data)
	if err != nil {
		return err
	}

	user.FirstName = data.FirstName
	user.LastName = data.LastName
	user.Image = data.Image
	user.PhoneNumber = data.PhoneNumber
	user.Email = data.Email
	
	databases.DB.Save(&user)

	return c.JSON(user)

}

func DeleteUser(c *fiber.Ctx) error {
	
	id,_ := strconv.Atoi(c.Params("id"))

	var user models.User

	databases.DB.First(&user,id)

	databases.DB.Unscoped().Delete(&user)

	return c.JSON(fiber.Map{
		"message":"Delete user success",
	})
}