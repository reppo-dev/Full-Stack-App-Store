package models

type Color struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"type:varchar(50);not null"`
	Code string `gorm:"type:varchar(7)"` // مثل #FFFFFF

	Products []Product `gorm:"many2many:product_colors;"`
}
