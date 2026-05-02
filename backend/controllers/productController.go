package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
)

func AllProduct(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))

	return c.JSON(models.Paginate(databases.DB,&models.Product{},page))
}

func AllProducts(c *fiber.Ctx) error {
	var products []models.Product

	databases.DB.Find(&products)
	return c.JSON(products)
}

func CreateProduct(c *fiber.Ctx) error {
	var product models.Product

	c.BodyParser(&product)

	databases.DB.Create(&product)

	return c.JSON(product)
}

func GetProduct(c *fiber.Ctx) error {

	id,_ := strconv.Atoi(c.Params("id"))

	var product models.Product

	databases.DB.First(&product,id)

	return c.JSON(product)
}

func UpdateProduct(c *fiber.Ctx) error {

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}

	var data models.UpdateProduct
	c.BodyParser(&data)


	var product models.Product
	databases.DB.First(&product, id)

	if data.Title != nil {
		product.Title = *data.Title
	}

	if data.Slug != nil {
		product.Slug = *data.Slug
	}

	if data.Description != nil {
		product.Description = *data.Description
	}

	if data.Price != nil {
		product.Price = *data.Price
	}

	if data.Stock != nil {
		product.Stock = *data.Stock
	}

	if data.Images != nil {
		product.Images = *data.Images
	}

	if data.Colors != nil {
		product.Colors = *data.Colors
	}

	if data.Attributes != nil {
		product.Attributes = *data.Attributes
	}

	if data.CategoryID != nil {
		product.CategoryID = *data.CategoryID
	}

	if data.SKU != nil {
		product.SKU = *data.SKU
	}

	if data.IsActive != nil {
		product.IsActive = *data.IsActive
	}

	if err := databases.DB.Model(&product).Updates(product).Error; err != nil {
	return fiber.NewError(fiber.StatusInternalServerError, err.Error())
}

	return c.JSON(product)
}



func DeleteProduct(c *fiber.Ctx) error {
	id,_:=strconv.Atoi(c.Params("id"))

	var product models.Product

	databases.DB.First(&product,id)

	databases.DB.Unscoped().Delete(&product)

	return c.JSON(fiber.Map{
		"message":"success delete product",
	})
}