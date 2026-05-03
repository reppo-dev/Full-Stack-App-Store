package models

import "gorm.io/gorm"


type Message struct {
    gorm.Model
    SenderID    uint   `json:"sender_id"`
    RecipientID uint   `json:"recipient_id"`
    Subject     string `gorm:"type:varchar(200)" json:"subject"`
    Snippet     string `gorm:"type:text" json:"snippet"`
    Body        string `gorm:"type:text" json:"body"`
    IsRead      bool   `gorm:"default:false" json:"is_read"`
    IsStarred   bool   `gorm:"default:false" json:"is_starred"`
    IsImportant bool   `gorm:"default:false" json:"is_important"`
    IsTrashed   bool   `gorm:"default:false" json:"is_trashed"`
    IsDraft     bool   `gorm:"default:false" json:"is_draft"`

    Sender    User    `gorm:"foreignKey:SenderID" json:"sender"`
    Recipient User    `gorm:"foreignKey:RecipientID" json:"-"`
    Labels    []Label `gorm:"many2many:message_labels;" json:"labels"`
}