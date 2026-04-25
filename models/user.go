package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	FirstName string `json:"first_name" gorm:"size:50" `
	LastName string `json:"last_name" gorm:"size:50"`
	Email string `json:"email" gorm:"uniqueIndex;not null"`
	Password string `json:"-" gorm:"not null"`
}

func (user User) Count(db *gorm.DB) int64 {
	var total int64
	db.Model(&User{}).Count(&total)

	return total
}

func (user User) Take(db *gorm.DB,limit int, offset int) interface{} {
	var users []User
	db.Preload("Role").Offset(offset).Limit(limit).Find(&users)

	return users
}