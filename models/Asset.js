const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fixtureNo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'fixture_no',
    validate: {
      notEmpty: { msg: 'Please provide fixture number' }
    }
  },
  assetNo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'asset_no',
    validate: {
      notEmpty: { msg: 'Please provide asset number' }
    }
  },
  dimension: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidDimension(value) {
        if (!value || !value.length || !value.height || !value.depth) {
          throw new Error('Please provide complete dimension details (length, height, depth)');
        }
      }
    }
  },
  standType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'stand_type',
    validate: {
      notEmpty: { msg: 'Please provide stand type' }
    }
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide brand' }
    }
  },
  dealerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'dealers',
      key: 'id'
    },
    field: 'dealer_id'
  },
  installationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'installation_date',
    validate: {
      isDate: true,
      notInFuture(value) {
        if (new Date(value) > new Date()) {
          throw new Error('Installation date cannot be in the future');
        }
      }
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
        if (value.latitude < -90 || value.latitude > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
        if (value.longitude < -180 || value.longitude > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
      }
    }
  },
  barcodeValue: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'barcode_value',
    set(value) {
      this.setDataValue('barcodeValue', value.toUpperCase());
    }
  },
  barcodeImagePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'barcode_image_path'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'),
    defaultValue: 'ACTIVE',
    allowNull: false
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
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'updated_by'
  }
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['barcode_value'] },
    { fields: ['dealer_id'] },
    { fields: ['fixture_no', 'dealer_id'] },
    { fields: ['brand'] },
    { fields: ['is_deleted'] },
    { fields: ['created_at'] }
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

Asset.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  values.barcodeImageUrl = `${appUrl}/${values.barcodeImagePath || values.barcode_image_path}`;
  
  values._id = values.id;
  values.createdAt = values.created_at;
  values.updatedAt = values.updated_at;
  delete values.created_at;
  delete values.updated_at;
  
  return values;
};

module.exports = Asset;
