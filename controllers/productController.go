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
	id,_ := strconv.Atoi(c.Params("id"))

	var product models.UpdateProduct

	c.BodyParser(&product)

	var productDb models.Product

	databases.DB.First(&productDb,id)

	productDb.Title = product.Title
	productDb.Description = product.Description
	productDb.Price = product.Price
	productDb.Image = product.Image


	databases.DB.Save(&productDb)

	return c.JSON(productDb)
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