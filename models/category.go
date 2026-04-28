package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name     string     `gorm:"type:varchar(120);not null"`
	Slug     string     `gorm:"type:varchar(120);uniqueIndex"`
	ParentID *uint
	Parent   *Category
	Children []Category `gorm:"foreignKey:ParentID"`
}


type CreateCategory struct {
	Slug     string `json:"slug"`
	Name     string `json:"name"`
	ParentID *uint  `json:"parent_id"`
}