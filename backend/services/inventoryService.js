import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const findProductSize = (product, selectedSize = "") => {
  const normalizedSize =
    typeof selectedSize === "string" ? selectedSize.trim() : "";

  if (!normalizedSize) {
    return null;
  }

  return product.sizes.find((size) => size.label === normalizedSize);
};

const decreaseSingleItem = async ({ order, item, performedBy = null }) => {
  const product = await Product.findById(item.product);

  if (!product) {
    throw createServiceError(`Product not found: ${item.name}`, 404);
  }

  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createServiceError(`Invalid quantity for ${item.name}`);
  }

  const selectedSize = item.selectedSize?.trim() || "";

  let stockBefore;
  let stockAfter;

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const size = findProductSize(product, selectedSize);

    if (!size) {
      throw createServiceError(`Selected size is unavailable for ${item.name}`);
    }

    stockBefore = Number(size.stock);

    if (stockBefore < quantity) {
      throw createServiceError(
        `Only ${stockBefore} item(s) of ${item.name} - ${selectedSize} are available`,
      );
    }

    size.stock = stockBefore - quantity;
    stockAfter = size.stock;

    product.stock = product.sizes.reduce(
      (total, currentSize) => total + Number(currentSize.stock || 0),
      0,
    );
  } else {
    stockBefore = Number(product.stock || 0);

    if (stockBefore < quantity) {
      throw createServiceError(
        `Only ${stockBefore} item(s) of ${item.name} are available`,
      );
    }

    product.stock = stockBefore - quantity;
    stockAfter = product.stock;
  }

  await product.save();

  await InventoryMovement.create({
    product: product._id,
    order: order._id,
    orderNumber: order.orderNumber,
    selectedSize,
    movementType: "order_decrease",
    quantity,
    stockBefore,
    stockAfter,
    reason: `Stock decreased for order ${order.orderNumber}`,
    performedBy,
  });
};

const restoreSingleItem = async ({ order, item, performedBy = null }) => {
  const product = await Product.findById(item.product);

  if (!product) {
    throw createServiceError(`Product not found: ${item.name}`, 404);
  }

  const quantity = Number(item.quantity);
  const selectedSize = item.selectedSize?.trim() || "";

  let stockBefore;
  let stockAfter;

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const size = findProductSize(product, selectedSize);

    if (!size) {
      throw createServiceError(`Selected size is unavailable for ${item.name}`);
    }

    stockBefore = Number(size.stock || 0);
    size.stock = stockBefore + quantity;
    stockAfter = size.stock;

    product.stock = product.sizes.reduce(
      (total, currentSize) => total + Number(currentSize.stock || 0),
      0,
    );
  } else {
    stockBefore = Number(product.stock || 0);
    product.stock = stockBefore + quantity;
    stockAfter = product.stock;
  }

  await product.save();

  await InventoryMovement.create({
    product: product._id,
    order: order._id,
    orderNumber: order.orderNumber,
    selectedSize,
    movementType: "order_restore",
    quantity,
    stockBefore,
    stockAfter,
    reason: `Stock restored for order ${order.orderNumber}`,
    performedBy,
  });
};

export const decreaseOrderInventory = async ({ order, performedBy = null }) => {
  if (order.inventoryStatus === "decreased") {
    throw createServiceError(
      "Inventory has already been decreased for this order",
      409,
    );
  }

  if (order.inventoryStatus === "restored") {
    throw createServiceError(
      "Inventory for this order was already restored",
      409,
    );
  }

  for (const item of order.items) {
    await decreaseSingleItem({
      order,
      item,
      performedBy,
    });
  }

  order.inventoryStatus = "decreased";
  order.inventoryUpdatedAt = new Date();

  await order.save();

  return order;
};

export const restoreOrderInventory = async ({ order, performedBy = null }) => {
  if (order.inventoryStatus === "pending") {
    throw createServiceError(
      "Inventory was never decreased for this order",
      400,
    );
  }

  if (order.inventoryStatus === "restored") {
    throw createServiceError(
      "Inventory has already been restored for this order",
      409,
    );
  }

  for (const item of order.items) {
    await restoreSingleItem({
      order,
      item,
      performedBy,
    });
  }

  order.inventoryStatus = "restored";
  order.inventoryUpdatedAt = new Date();

  await order.save();

  return order;
};
