const express = require('express');
const router = express.Router();
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  assignDealersToClient,
  removeDealersFromClient,
  getClientsByDealer,
  getClientProfile,
} = require('../controllers/clientController');
const { protect, restrictTo } = require('../middleware/auth');
const { createClientValidation, updateClientValidation, assignDealersValidation } = require('../middleware/validator');

router.use(protect);

// Client profile route - CLIENT role can access their own profile
router.get('/profile', getClientProfile);

// Admin routes
router.use(restrictTo('ADMIN'));

// Client CRUD - Admin only
router.post('/', createClientValidation, createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', updateClientValidation, updateClient);
router.delete('/:id', deleteClient);

// Dealer assignment operations
router.post('/:clientId/assign-dealers', assignDealersValidation, assignDealersToClient);
router.post('/:clientId/remove-dealers', assignDealersValidation, removeDealersFromClient);

// Get clients by dealer
router.get('/dealer/:dealerId', getClientsByDealer);

module.exports = router;
