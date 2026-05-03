package models

import "gorm.io/gorm"

type Label struct {
    gorm.Model
    UserID    uint   `gorm:"not null;index:idx_user_label,unique" json:"user_id"`
    Name      string `gorm:"type:varchar(100);not null;index:idx_user_label,unique" json:"name"`
    ColorCode string `gorm:"type:varchar(7);default:'#808080'" json:"color_code"`

    User User `gorm:"foreignKey:UserID" json:"-"`
    Messages []Message `gorm:"many2many:message_labels;" json:"-"`
}