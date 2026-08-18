import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    orderNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    selectedSize: {
      type: String,
      default: "",
      trim: true,
    },

    movementType: {
      type: String,
      enum: [
        "order_decrease",
        "order_restore",
        "manual_increase",
        "manual_decrease",
        "adjustment",
      ],
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    stockBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    stockAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

inventoryMovementSchema.index({
  order: 1,
  product: 1,
  selectedSize: 1,
  movementType: 1,
});

const InventoryMovement = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema,
);

export default InventoryMovement;
