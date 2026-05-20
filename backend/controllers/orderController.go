package controllers

import (
	"context"
	"encoding/csv"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/reppo/go-backend/databases"
	"github.com/reppo/go-backend/models"
	"github.com/reppo/go-backend/util"
)

func AllOrder(c *fiber.Ctx) error {
	page,_ := strconv.Atoi(c.Query("page","1"))

	query := databases.DB.Preload("OrderItem")

	return c.JSON(models.Paginate(query,&models.Order{},page))
}


func GetUserOrders(c *fiber.Ctx) error {
    cookie := c.Cookies("jwt")
    userID, err := util.ParseJwt(cookie)
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid or missing token",
        })
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

	var user models.User

	if err := databases.DB.WithContext(ctx).First(&user,userID).Error; err != nil{
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":"User not found",
		})
	}

    var orders []models.Order
    if err := databases.DB.WithContext(ctx).
        Preload("OrderItem").Where("email = ?", user.Email).Find(&orders).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to get orders",
        })
    }

    return c.JSON(orders)
}

func Export(c *fiber.Ctx) error {
	filePath := "./csv/order.csv"

	if err := CreateFile(filePath); err != nil {
		return err
	}

	return c.Download(filePath)
}
func CreateFile(filePath string) error {
	file , err := os.Create(filePath)

	if err != nil {
		return err
	}

	defer file.Close()

	writer := csv.NewWriter(file)

	defer writer.Flush()

	writer.Write([]string{
		"ID","Name","Email","Product Title","Price","Quantity",
	})

	var orders []models.Order

	databases.DB.Preload("OrderItems").Find(&orders)

	for _, order := range orders {
		data := []string{
			strconv.Itoa(int(order.ID)),order.FirstName+ " "+order.LastName , order.Email,"","","",
		}
		err := writer.Write(data)
		if err != nil {
			return err
		}

		for _, orderItem := range order.OrderItem {
			data:= []string{
				"","","",orderItem.ProductTitle,strconv.Itoa(int(orderItem.Price)),strconv.Itoa(int(orderItem.Quantity)),
			}

			if err:= writer.Write(data); err != nil {
				return nil
			}
		}
	}

	return nil
}

type Sales struct {
	Date string `json:"date"`
	Sum  float64 `json:"sum"`
}

func Chart(c *fiber.Ctx) error {
	var sales []Sales

	databases.DB.Raw(`
    	SELECT TO_CHAR(o.created_at, 'YYYY-MM-DD') as date,
           SUM(oi.price * oi.quantity) as sum
    	FROM orders o
    	JOIN order_items oi on o.id = oi.order_id
    	GROUP BY 1
   		ORDER BY 1
	`).Scan(&sales)

	return c.JSON(sales)
}
