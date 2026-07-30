import User from '../models/User.js';

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (firstName !== undefined) {
      const trimmedFirstName = firstName.trim();

      if (trimmedFirstName.length < 2) {
        res.status(400);
        throw new Error(
          'First name must contain at least 2 characters'
        );
      }

      user.firstName = trimmedFirstName;
    }

    if (lastName !== undefined) {
      const trimmedLastName = lastName.trim();

      if (trimmedLastName.length < 2) {
        res.status(400);
        throw new Error(
          'Last name must contain at least 2 characters'
        );
      }

      user.lastName = trimmedLastName;
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/users/addresses
export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    return res.status(200).json({
      success: true,
      count: user.addresses.length,
      addresses: user.addresses,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/users/addresses
export const addAddress = async (req, res, next) => {
  try {
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      district,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !district
    ) {
      res.status(400);
      throw new Error(
        'Full name, phone, address line 1, city and district are required'
      );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const shouldBeDefault =
      isDefault === true || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      label: label || 'Home',
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || '',
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode?.trim() || '',
      country: country?.trim() || 'Sri Lanka',
      isDefault: shouldBeDefault,
    });

    await user.save();

    const newAddress =
      user.addresses[user.addresses.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/users/addresses/:addressId
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const allowedFields = [
      'label',
      'fullName',
      'phone',
      'addressLine1',
      'addressLine2',
      'city',
      'district',
      'postalCode',
      'country',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] =
          typeof req.body[field] === 'string'
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.district
    ) {
      res.status(400);
      throw new Error(
        'Full name, phone, address line 1, city and district are required'
      );
    }

    if (req.body.isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });

      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/users/addresses/:addressId
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const deletedAddressWasDefault = address.isDefault;

    user.addresses.pull(addressId);

    if (
      deletedAddressWasDefault &&
      user.addresses.length > 0
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/users/addresses/:addressId/default
export const setDefaultAddress = async (
  req,
  res,
  next
) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.isActive) {
  res.status(403);
  throw new Error("Your account has been deactivated");
}

    const address = user.addresses.id(addressId);

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    user.addresses.forEach((item) => {
      item.isDefault =
        item._id.toString() === addressId;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      address,
    });
  } catch (error) {
    return next(error);
  }
};