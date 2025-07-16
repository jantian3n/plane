const Setting = require('../models/setting.model');

// Initialize system settings if they don't exist
exports.initSettings = async () => {
  try {
    // Check if registration setting exists
    const registrationSetting = await Setting.findOne({ key: 'allowRegistration' });
    if (!registrationSetting) {
      // Create registration setting, default to enabled
      await new Setting({
        key: 'allowRegistration',
        value: true,
        description: 'Whether new user registration is allowed'
      }).save();
      console.log('System setting initialized: allowRegistration = true');
    }

    // Add other default settings here as needed
  } catch (error) {
    console.error('Error initializing system settings:', error);
  }
};

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get setting by key
exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.status(200).json({ setting });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update setting
exports.updateSetting = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ message: 'Setting value is required' });
    }

    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    setting.value = value;
    await setting.save();

    res.status(200).json({ 
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};