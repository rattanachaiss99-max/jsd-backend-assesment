const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Field "name" is required and must be a non-empty string'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Field "price" is required and must be a non-negative number'],
      min: [0, 'Field "price" must be a non-negative number']
    },
    quantity: {
      type: Number,
      required: [true, 'Field "quantity" is required'],
      default: 1,
      min: [0, 'Field "quantity" must be a non-negative integer'],
      validate: {
        validator: Number.isInteger,
        message: 'Field "quantity" must be an integer'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Product', productSchema);
