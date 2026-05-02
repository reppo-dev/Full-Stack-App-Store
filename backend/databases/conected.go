package databases

import (
	"github.com/reppo/go-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Conect() {

	dsn := "host=localhost user=postgres password=13802002 dbname=mygoapp port=5432 sslmode=disable"
	db , err := gorm.Open(postgres.Open(dsn),&gorm.Config{})

	if err != nil {
		panic("we can not conect in your db")
	}

	DB = db

	db.AutoMigrate(&models.User{},&models.Category{},&models.Tag{},&models.Role{},&models.Product{},&models.Permission{},&models.Order{},&models.OrderItem{},&models.Color{},&models.Favorite{})
}