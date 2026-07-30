import ShippingRule from '../models/ShippingRule.js';

const normalizeDistrict = (district) => {
  if (typeof district !== 'string') {
    return '';
  }

  return district.trim().toLowerCase();
};

const matchesDistrict = (rule, district) => {
  if (!Array.isArray(rule.districts) || rule.districts.length === 0) {
    return rule.isDefault;
  }

  const normalizedDistrict = normalizeDistrict(district);

  return rule.districts.some(
    (item) => normalizeDistrict(item) === normalizedDistrict
  );
};

const matchesOrderAmount = (rule, subtotal) => {
  if (subtotal < rule.minimumOrderAmount) {
    return false;
  }

  if (
    rule.maximumOrderAmount !== null &&
    rule.maximumOrderAmount !== undefined &&
    subtotal > rule.maximumOrderAmount
  ) {
    return false;
  }

  return true;
};

export const calculateShipping = async ({
  district,
  subtotal,
}) => {
  const numericSubtotal = Number(subtotal);

  if (!district || typeof district !== 'string') {
    const error = new Error('Delivery district is required');
    error.statusCode = 400;
    throw error;
  }

  if (
    Number.isNaN(numericSubtotal) ||
    numericSubtotal < 0
  ) {
    const error = new Error('A valid subtotal is required');
    error.statusCode = 400;
    throw error;
  }

  const rules = await ShippingRule.find({
    isActive: true,
  }).sort({
    priority: -1,
    createdAt: 1,
  });

  const districtRule = rules.find(
    (rule) =>
      !rule.isDefault &&
      matchesDistrict(rule, district) &&
      matchesOrderAmount(rule, numericSubtotal)
  );

  const defaultRule = rules.find(
    (rule) =>
      rule.isDefault &&
      matchesOrderAmount(rule, numericSubtotal)
  );

  const selectedRule = districtRule || defaultRule;

  if (!selectedRule) {
    const error = new Error(
      'Shipping is not available for the selected district'
    );

    error.statusCode = 400;
    throw error;
  }

  const qualifiesForFreeShipping =
    selectedRule.freeShippingThreshold !== null &&
    selectedRule.freeShippingThreshold !== undefined &&
    numericSubtotal >= selectedRule.freeShippingThreshold;

  const shippingFee = qualifiesForFreeShipping
    ? 0
    : Number(selectedRule.shippingFee);

  return {
    ruleId: selectedRule._id,
    ruleName: selectedRule.name,
    district: district.trim(),
    shippingFee: Number(shippingFee.toFixed(2)),
    freeShipping: qualifiesForFreeShipping,
    freeShippingThreshold:
      selectedRule.freeShippingThreshold,
    estimatedDeliveryDays: {
      min: selectedRule.estimatedDeliveryDays.min,
      max: selectedRule.estimatedDeliveryDays.max,
    },
  };
};