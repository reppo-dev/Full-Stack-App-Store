package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"gorm.io/gorm"
)

func AllRole(c *fiber.Ctx) error {
	var role models.Role

	databases.DB.Find(&role)

	return c.JSON(role)
}

func CreateRole(c *fiber.Ctx) error {
	var roleDto fiber.Map

	err := c.BodyParser(&roleDto)
	if err != err {
		return err
	}

	list := roleDto["permissions"].([]interface{})

	permission := make([]models.Permission,len(list))

	for i,permissionId := range list {
		id,_ := strconv.Atoi(permissionId.(string))

		permission[i] = models.Permission{
			Model:gorm.Model{
				ID: uint(id),
			},
		}
	}

	role := models.Role{
		Name: roleDto["name"].(string),
		Permission: permission,
	}

	databases.DB.Create(&role)

	return c.JSON(role)
}

func GetRole(c *fiber.Ctx) error {
	id,_ := strconv.Atoi(c.Params("id"))

	var role models.Role
	databases.DB.Preload("Permission").First(&role,id)

	return c.JSON(role)
}

type RoleDTO struct {
	Name string `json:"name"`
	Permissions []uint `json:"permissions"`
}

func UpdateRole(c *fiber.Ctx) error {

	id,_ := strconv.Atoi(c.Params("id"))

	var roleDto RoleDTO

	c.BodyParser(&roleDto)

	var role models.Role

	databases.DB.First(&role,id)

	permission := make([]models.Permission,len(roleDto.Permissions))
	for id , pid := range roleDto.Permissions{
		permission[id] = models.Permission{
			Model: gorm.Model{
				ID: pid,
			},
		}
	}

	role.Name = roleDto.Name

	databases.DB.Save(&role)
	databases.DB.Model(&role).Association("Permission").Replace(&permission)

	return c.JSON(role)

}

func DeleteRole(c *fiber.Ctx) error {
	id,_:= strconv.Atoi(c.Params("id"))

	var role models.Role

	databases.DB.First(&role,id)

	databases.DB.Delete(&role)

	return c.JSON(fiber.Map{
		"message":"Delete role success",
	})
}