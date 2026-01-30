const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Dealer = sequelize.define('Dealer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dealerCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'dealer_code',
    set(value) {
      this.setDataValue('dealerCode', value.toUpperCase().trim());
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide dealer name' }
    }
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      is: {
        args: /^[\d\s\-\+\(\)]+$/,
        msg: 'Please provide a valid phone number'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
      notEmpty: { msg: 'Please provide email' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  shopName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'shop_name',
    validate: {
      notEmpty: { msg: 'Please provide shop name' }
    }
  },
  vatRegistration: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'vat_registration',
    validate: {
      notEmpty: { msg: 'Please provide VAT registration number' }
    }
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidLocation(value) {
        if (!value || !value.address || value.latitude === undefined || value.longitude === undefined) {
          throw new Error('Please provide complete location details');
        }
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'created_by'
  }
}, {
  tableName: 'dealers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['dealer_code'] },
    { fields: ['email'] },
    { fields: ['vat_registration'] },
    { fields: ['is_deleted'] }
  ],
  defaultScope: {
    where: {
      isDeleted: false
    }
  },
  scopes: {
    withDeleted: {
      where: {}
    }
  }
});

Dealer.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  values._id = values.id;
  values.createdAt = values.created_at;
  values.updatedAt = values.updated_at;
  delete values.created_at;
  delete values.updated_at;
  
  return values;
};

module.exports = Dealer;
