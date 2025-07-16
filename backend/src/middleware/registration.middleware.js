const Setting = require('../models/setting.model');

exports.checkRegistrationAllowed = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: 'allowRegistration' });
    
    // If setting doesn't exist or is true, allow registration
    if (!setting || setting.value === true) {
      return next();
    }
    
    // Registration is disabled
    return res.status(403).json({ 
      message: 'Registration is currently disabled by the administrator' 
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    next(); // On error, allow the registration to proceed
  }
};