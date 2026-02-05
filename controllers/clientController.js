const Client = require('../models/Client');
const Dealer = require('../models/Dealer');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');

// Helper function to generate random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

// Create client (Admin only)
exports.createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, vatin, placeOfSupply, country, dealerIds } = req.body;

    // Check for existing email if provided
    if (email) {
      const existingClient = await Client.findOne({ email }).lean();
      if (existingClient) {
        return next(new AppError('Client with this email already exists', 400));
      }
      
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        return next(new AppError('User with this email already exists', 400));
      }
    }

    // Verify all dealer IDs exist if provided
    if (dealerIds && dealerIds.length > 0) {
      const dealers = await Dealer.find({ _id: { $in: dealerIds } });
      if (dealers.length !== dealerIds.length) {
        return next(new AppError('One or more dealer IDs are invalid', 400));
      }
    }

    const clientData = {
      name,
      createdBy: req.user._id,
    };

    if (email) clientData.email = email;
    if (phone) clientData.phone = phone;
    if (company) clientData.company = company;
    if (address) clientData.address = address;
    if (vatin) clientData.vatin = vatin;
    if (placeOfSupply) clientData.placeOfSupply = placeOfSupply;
    if (country) clientData.country = country;
    if (dealerIds && dealerIds.length > 0) clientData.dealerIds = dealerIds;

    const client = await Client.create(clientData);

    // Create user account if email is provided
    let userData = null;
    if (email) {
      const tempPassword = "password" + clientData.phone;
      
      userData = {
        name: name,
        email: email,
        password: tempPassword,
        role: 'CLIENT',
        clientRef: client._id,
        isTemporaryPassword: true,
      };

      const user = await User.create(userData);
      
      // Add user credentials to response for admin to share with client
      userData = {
        userId: user._id,
        email: user.email,
        temporaryPassword: tempPassword,
        isTemporaryPassword: true,
      };
    }

    const populatedClient = await Client.findById(client._id)
      .populate('dealerIds', 'dealerCode name shopName email')
      .populate('createdBy', 'name email');

    const responseData = {
      client: populatedClient,
    };

    if (userData) {
      responseData.userCredentials = userData;
    }

    res.status(201).json({
      success: true,
      message: 'Client created successfully' + (userData ? ' and user account generated' : ''),
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// Get all clients (Admin only)
exports.getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const clients = await Client.find(query)
      .populate('dealerIds', 'dealerCode name shopName email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        clients,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalClients: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get client by ID (Admin only)
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('dealerIds', 'dealerCode name shopName email phone location')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// Update client (Admin only)
exports.updateClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, vatin, placeOfSupply, country, dealerIds, isActive } = req.body;

    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Check for existing email if updating
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({ email, _id: { $ne: client._id } });
      if (existingClient) {
        return next(new AppError('Email already in use by another client', 400));
      }
    }

    // Verify dealer IDs if updating
    if (dealerIds && dealerIds.length > 0) {
      const dealers = await Dealer.find({ _id: { $in: dealerIds } });
      if (dealers.length !== dealerIds.length) {
        return next(new AppError('One or more dealer IDs are invalid', 400));
      }
    }

    const updateData = { updatedBy: req.user._id };
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (address !== undefined) updateData.address = address;
    if (vatin !== undefined) updateData.vatin = vatin;
    if (placeOfSupply !== undefined) updateData.placeOfSupply = placeOfSupply;
    if (country !== undefined) updateData.country = country;
    if (dealerIds !== undefined) updateData.dealerIds = dealerIds;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('dealerIds', 'dealerCode name shopName email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient,
    });
  } catch (error) {
    next(error);
  }
};

// Delete client (Admin only - soft delete)
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    client.isDeleted = true;
    client.updatedBy = req.user._id;
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Assign dealers to client (Admin only)
exports.assignDealersToClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { dealerIds } = req.body;

    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return next(new AppError('Please provide an array of dealer IDs', 400));
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Verify all dealer IDs exist
    const dealers = await Dealer.find({ _id: { $in: dealerIds } });
    if (dealers.length !== dealerIds.length) {
      return next(new AppError('One or more dealer IDs are invalid', 400));
    }

    // Add new dealers (avoid duplicates)
    const existingDealerIds = client.dealerIds.map(id => id.toString());
    const newDealerIds = dealerIds.filter(id => !existingDealerIds.includes(id));
    
    client.dealerIds.push(...newDealerIds);
    client.updatedBy = req.user._id;
    await client.save();

    const updatedClient = await Client.findById(clientId)
      .populate('dealerIds', 'dealerCode name shopName email');

    res.status(200).json({
      success: true,
      message: `${newDealerIds.length} dealer(s) assigned to client`,
      data: updatedClient,
    });
  } catch (error) {
    next(error);
  }
};

// Remove dealers from client (Admin only)
exports.removeDealersFromClient = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { dealerIds } = req.body;

    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return next(new AppError('Please provide an array of dealer IDs', 400));
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    // Remove dealers
    client.dealerIds = client.dealerIds.filter(
      id => !dealerIds.includes(id.toString())
    );
    client.updatedBy = req.user._id;
    await client.save();

    const updatedClient = await Client.findById(clientId)
      .populate('dealerIds', 'dealerCode name shopName email');

    res.status(200).json({
      success: true,
      message: 'Dealers removed from client',
      data: updatedClient,
    });
  } catch (error) {
    next(error);
  }
};

// Get clients for a specific dealer (Admin only)
exports.getClientsByDealer = async (req, res, next) => {
  try {
    const { dealerId } = req.params;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const clients = await Client.find({ dealerIds: dealerId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        dealer: {
          dealerId: dealer._id,
          dealerCode: dealer.dealerCode,
          name: dealer.name,
          shopName: dealer.shopName,
        },
        totalClients: clients.length,
        clients,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get client profile (CLIENT role only)
exports.getClientProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'CLIENT') {
      return next(new AppError('Only clients can access their profile', 403));
    }

    const client = await Client.findById(req.user.clientRef)
      .populate('dealerIds', 'dealerCode name shopName email phone')
      .populate('createdBy', 'name email');

    if (!client) {
      return next(new AppError('Client profile not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Client profile retrieved successfully',
      data: {
        client: client,
        user: {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isTemporaryPassword: req.user.isTemporaryPassword,
          lastLogin: req.user.lastLogin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
