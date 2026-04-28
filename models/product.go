package models

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model

	Title       string  `gorm:"type:varchar(200);not null" json:"title"`
	Slug        string  `gorm:"type:varchar(200);uniqueIndex"`
	Description string  `gorm:"type:text"`

	Price       float64 `gorm:"type:decimal(10,2);not null"`
	Stock       int

	Images     []string `gorm:"serializer:json" json:"images"`
	Colors     []string `gorm:"serializer:json" json:"colors"`
	Attributes map[string]string `gorm:"serializer:json" json:"attributes"`

	CategoryID  uint
	Category   Category
	
	Tags       []Tag `gorm:"many2many:product_tags;"`

	SKU         string  `gorm:"uniqueIndex"`

	IsActive    bool    `gorm:"default:true"`
}

type UpdateProduct struct {
    Title       *string            `json:"title"`
    Slug        *string            `json:"slug"`
    Description *string            `json:"description"`
    Price       *float64           `json:"price"`
    Stock       *int               `json:"stock"`
    Images      *[]string          `json:"images"`
    Colors      *[]string          `json:"colors"`
    Attributes  *map[string]string `json:"attributes"`
    CategoryID  *uint              `json:"category_id"`
    SKU         *string            `json:"sku"`
    IsActive    *bool              `json:"is_active"`
}


func (product *Product) Count(db *gorm.DB) int64 {
	var total int64

	db.Model(&Product{}).Count(&total)

	return total
}

func (product *Product) Take(db *gorm.DB,limit int,offset int) interface{} {
	var products []Product
	db.Offset(offset).Limit(limit).Find(&products)

	return products
}