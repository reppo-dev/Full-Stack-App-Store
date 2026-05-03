package models

import "gorm.io/gorm"

// models/message.go
type Message struct {
    gorm.Model
    SenderID    uint   `json:"sender_id"`
    RecipientID uint   `json:"recipient_id"`
    Subject     string `gorm:"type:varchar(200)" json:"subject"`
    Snippet     string `gorm:"type:text" json:"snippet"`
    IsRead      bool   `gorm:"default:false" json:"is_read"`

    Sender    User   `gorm:"foreignKey:SenderID" json:"sender"`
    Recipient User   `gorm:"foreignKey:RecipientID" json:"-"`
    Labels    []Label `gorm:"many2many:message_labels;" json:"labels"`
}