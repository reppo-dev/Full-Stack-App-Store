package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName string		`json:"first_name" gorm:"size:50" `
	LastName string 		`json:"last_name" gorm:"size:50"`
	Email string 		    `json:"email" gorm:"uniqueIndex;not null"`
	Password string 	    `json:"-" gorm:"not null"`
	RoleID          uint    `json:"role_id"`
    Role            Role    `json:"role" gorm:"foreignKey:RoleId"`
}

type RegisterRequest struct {
    FirstName       string `json:"first_name"`
    LastName        string `json:"last_name"`
    Email           string `json:"email"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"password_confirm"`
}

type LoginRequest struct {
    Email           string `json:"email"`
    Password        string `json:"password"`
}

type UpdateIfo struct {
	FirstName       string `json:"first_name"`
    LastName        string `json:"last_name"`
    Email           string `json:"email"`
}

type UpdatePassword struct{
	Password        string `json:"password"`
    PasswordConfirm string `json:"password_confirm"`
}

type UpdateRequest struct {
    FirstName       string `json:"first_name"`
    LastName        string `json:"last_name"`
    Email           string `json:"email"`
    RoleID          uint   `json:"role_id"`
}


func (user *User) SetPassword(password string) {
	hashpassword,_ := bcrypt.GenerateFromPassword([]byte(password),14)

	user.Password = string(hashpassword)
}

func (user *User) ComperPassword(password string) error {
	return 	bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(password))
}


func (user *User) Count(db *gorm.DB) int64 {
	var total int64
	db.Model(&User{}).Count(&total)

	return total
}

func (user User) Take(db *gorm.DB,limit int, offset int) interface{} {
	var users []User
	db.Preload("Role").Offset(offset).Limit(limit).Find(&users)

	return users
}