package models

import "gorm.io/gorm"

// models/favorite.go
type Favorite struct {
    gorm.Model
    UserID    uint    `gorm:"not null;index:idx_user_product,unique" json:"user_id"`
    ProductID uint    `gorm:"not null;index:idx_user_product,unique" json:"product_id"`
	
    User      User    `gorm:"foreignKey:UserID" json:"-"`
    Product   Product `gorm:"foreignKey:ProductID" json:"-"`
}