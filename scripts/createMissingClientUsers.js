const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Client = require('../models/Client');
const User = require('../models/User');

dotenv.config();

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

const createMissingClientUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Find all clients who have email but don't have a corresponding user
    const clientsWithoutUsers = await Client.find({
      email: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`📋 Found ${clientsWithoutUsers.length} clients with email`);

    const createdUsers = [];
    const skippedUsers = [];

    for (const client of clientsWithoutUsers) {
      try {
        // Check if user already exists for this client
        const existingUser = await User.findOne({ email: client.email });
        
        if (existingUser) {
          console.log(`⚠️  User already exists for ${client.email} - skipping`);
          skippedUsers.push({
            clientName: client.name,
            email: client.email,
            reason: 'User already exists'
          });
          continue;
        }

        // Check if user already exists with clientRef
        const existingUserByRef = await User.findOne({ clientRef: client._id });
        
        if (existingUserByRef) {
          console.log(`⚠️  User already exists for client ${client.name} - skipping`);
          skippedUsers.push({
            clientName: client.name,
            email: client.email,
            reason: 'User already exists with clientRef'
          });
          continue;
        }

        // Generate temporary password
        const tempPassword = generateRandomPassword();
        
        // Create user account
        const userData = {
          name: client.name,
          email: client.email,
          password: tempPassword,
          role: 'CLIENT',
          clientRef: client._id,
          isTemporaryPassword: true,
          isActive: true,
          isDeleted: false
        };

        const user = await User.create(userData);
        
        createdUsers.push({
          clientId: client._id,
          clientName: client.name,
          email: client.email,
          userId: user._id,
          temporaryPassword: tempPassword,
          isTemporaryPassword: true
        });

        console.log(`✅ Created user for ${client.name} (${client.email})`);
        console.log(`   Temporary Password: ${tempPassword}`);
        console.log(`   User ID: ${user._id}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error creating user for ${client.name}:`, error.message);
        skippedUsers.push({
          clientName: client.name,
          email: client.email,
          reason: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${createdUsers.length} user accounts`);
    console.log(`⚠️  Skipped: ${skippedUsers.length} clients`);
    console.log('');

    if (createdUsers.length > 0) {
      console.log('📋 CREATED USER ACCOUNTS:');
      console.log('─'.repeat(60));
      createdUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.clientName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   User ID: ${user.userId}`);
        console.log(`   Temporary Password: ${user.temporaryPassword}`);
        console.log('');
      });
    }

    if (skippedUsers.length > 0) {
      console.log('⚠️  SKIPPED CLIENTS:');
      console.log('─'.repeat(60));
      skippedUsers.forEach((client, index) => {
        console.log(`${index + 1}. ${client.clientName}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Reason: ${client.reason}`);
        console.log('');
      });
    }

    // Create a CSV file with the created user credentials
    if (createdUsers.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      const csvContent = [
        'Client Name,Email,User ID,Temporary Password,Is Temporary Password',
        ...createdUsers.map(user => 
          `"${user.clientName}","${user.email}","${user.userId}","${user.temporaryPassword}","${user.isTemporaryPassword}"`
        )
      ].join('\n');

      const csvPath = path.join(__dirname, '../temp/client-user-credentials.csv');
      
      // Create temp directory if it doesn't exist
      const tempDir = path.dirname(csvPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(csvPath, csvContent);
      console.log(`📁 Credentials saved to: ${csvPath}`);
    }

    console.log('\n🎉 Script completed successfully!');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createMissingClientUsers();
