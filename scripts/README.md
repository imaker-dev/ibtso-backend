# Client User Creation Scripts

## createMissingClientUsers.js

This script creates user accounts for existing clients who have email addresses but don't have corresponding user accounts yet.

### Purpose

When clients were initially created in the system, they may have been added without user accounts. This script:

1. Finds all clients with email addresses
2. Checks if they already have user accounts
3. Creates user accounts for those without them
4. Generates temporary passwords
5. Outputs credentials for distribution

### Usage

```bash
# Run the script
npm run create-client-users

# Or run directly
node scripts/createMissingClientUsers.js
```

### What the Script Does

1. **Connects to MongoDB** using your environment configuration
2. **Finds all clients** with email addresses
3. **For each client**:
   - Checks if user already exists (by email or clientRef)
   - Skips if user already exists
   - Creates new user with CLIENT role if not exists
   - Generates random temporary password (16 characters, uppercase hex)
   - Links user to client via `clientRef`
   - Sets `isTemporaryPassword: true`

### Output

The script provides:

1. **Console Output**:
   - Progress updates during execution
   - Summary of created vs skipped accounts
   - Detailed list of created user credentials
   - List of skipped clients with reasons

2. **CSV Export**:
   - Saves credentials to `temp/client-user-credentials.csv`
   - Includes: Client Name, Email, User ID, Temporary Password
   - Easy to share with clients or import into other systems

### Example Output

```
🔗 Connected to MongoDB
📋 Found 3 clients with email
✅ Created user for ABC Corporation (admin@abc.com)
   Temporary Password: A1B2C3D4E5F6G7H8
   User ID: 507f1f77bcf86cd799439011

✅ Created user for XYZ Company (contact@xyz.com)
   Temporary Password: 9F8E7D6C5B4A3210
   User ID: 507f1f77bcf86cd799439012

⚠️  User already exists for existing@client.com - skipping

============================================================
📊 SUMMARY
============================================================
✅ Successfully created: 2 user accounts
⚠️  Skipped: 1 clients

📋 CREATED USER ACCOUNTS:
────────────────────────────────────────────────────────────
1. ABC Corporation
   Email: admin@abc.com
   User ID: 507f1f77bcf86cd799439011
   Temporary Password: A1B2C3D4E5F6G7H8

2. XYZ Company
   Email: contact@xyz.com
   User ID: 507f1f77bcf86cd799439012
   Temporary Password: 9F8E7D6C5B4A3210

📁 Credentials saved to: temp/client-user-credentials.csv
🎉 Script completed successfully!
```

### Security Notes

- **Temporary passwords** are randomly generated (16 chars, uppercase hex)
- **Password hashing** is handled automatically by User model
- **Role assignment** is fixed to 'CLIENT' for security
- **isTemporaryPassword flag** is set to require password change on first login

### CSV Format

The exported CSV file has these columns:
- Client Name
- Email  
- User ID
- Temporary Password
- Is Temporary Password

### After Running the Script

1. **Share credentials** with clients (email, temporary password)
2. **Clients should**:
   - Log in with temporary password
   - Be redirected to change password
   - Set their permanent password
3. **Monitor** for any login issues or password reset requests

### Troubleshooting

**Common Issues:**

1. **MongoDB Connection Error**:
   - Check your `.env` file for correct `MONGODB_URI`
   - Ensure MongoDB is running and accessible

2. **Permission Errors**:
   - Ensure the script has write permissions for creating the temp directory
   - Check that the temp directory can be created

3. **Duplicate Users**:
   - Script automatically skips clients who already have users
   - Check the "Skipped" section for details

4. **Missing Emails**:
   - Only clients with email addresses are processed
   - Clients without emails are ignored

### Safety Features

- **Dry Run Logic**: Checks for existing users before creating
- **Error Handling**: Continues processing even if one client fails
- **Detailed Logging**: Clear output for audit trails
- **CSV Backup**: Permanent record of created credentials

### Customization

You can modify the script to:

- Change password generation logic
- Add additional user fields
- Modify role assignments
- Change output formats
- Add email notifications

### Dependencies

The script uses existing project dependencies:
- `mongoose` - Database connection
- `crypto` - Password generation
- `dotenv` - Environment variables
- `fs` - File system operations (built-in)
