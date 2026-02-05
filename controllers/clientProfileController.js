const Client = require('../models/Client');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// Update client profile
exports.updateClientProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return next(new AppError('Only clients can update their profile', 403));
    }

    const clientId = req.user.clientRef;
    const { name, phone, company, address } = req.body;

    // Find and update client
    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Update client fields
    if (name) client.name = name;
    if (phone) client.phone = phone;
    if (company) client.company = company;
    if (address) client.address = address;

    // Update user name if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name });
    }

    await client.save();

    // Get updated client with populated fields
    const updatedClient = await Client.findById(clientId)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedClient._id,
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        company: updatedClient.company,
        address: updatedClient.address,
        role: 'CLIENT',
        updatedAt: updatedClient.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change client password
exports.changeClientPassword = async (req, res, next) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return next(new AppError('Only clients can change their password', 403));
    }

    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword) {
      return next(new AppError('New password is required', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update password
    user.password = newPassword;
    user.isTemporaryPassword = false;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
