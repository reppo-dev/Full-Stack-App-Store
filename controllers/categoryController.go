package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllCategory(c *fiber.Ctx) error {
	var catergory []models.Category

	databases.DB.Find(&catergory)

	return c.JSON(catergory)
}

func CategoryTree(c *fiber.Ctx) error {

	var categories []models.Category

	databases.DB.
	Preload("Children.Children").
	Preload("Children.Children.Children").
	Where("parent_id IS NULL").
	Find(&categories)

	return c.JSON(categories)
}


func CreateCategory(c *fiber.Ctx) error {
	var categoryData models.CreateCategory

	if err := c.BodyParser(&categoryData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	category := models.Category{
		Slug: categoryData.Slug,
		Name: categoryData.Name,
		ParentID: categoryData.ParentID,
	}

	if err := databases.DB.Create(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create category",
		})
	}

	return c.JSON(category)
}

func UpdateCategory(c *fiber.Ctx) error {

	id,_ := strconv.Atoi(c.Params("id"))

	var upcategory models.CreateCategory

	c.BodyParser(&upcategory)

	var category models.Category

	databases.DB.First(&category,id)

	category.Name = upcategory.Name
	category.Slug = upcategory.Slug
	category.ParentID = upcategory.ParentID

	databases.DB.Save(&category)

	return c.JSON(category)

}

func DeleteCategory(c *fiber.Ctx) error {
	id,_:=strconv.Atoi(c.Params("id"))

	var category models.Category

	databases.DB.Delete(&category,id)

	return c.JSON(fiber.Map{
		"message":"success delete",
	})
}