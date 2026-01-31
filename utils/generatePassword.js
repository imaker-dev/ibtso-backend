const generateTemporaryPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  let password = '';
  
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '@#$%'[Math.floor(Math.random() * 4)];
  
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const generateDealerCode = (dealerName) => {
  const cleanName = dealerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  const namePrefix = cleanName.substring(0, 4).padEnd(4, 'X');
  
  const randomPart = Math.random().toString(36).substring(2, 12).toUpperCase();
  
  return `${namePrefix}-${randomPart}`;
};

module.exports = { generateTemporaryPassword, generateDealerCode };
