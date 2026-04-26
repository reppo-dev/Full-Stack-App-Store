package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	Name string `json:"name"`
	Permission []Permission `json:"permission" gorm:"many2many:role_permission"`
}