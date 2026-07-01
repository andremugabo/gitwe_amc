const prisma = require('../utils/prisma');

// @desc    Get all system settings
// @route   GET /api/settings
// @access  Private (All authenticated users to load app title, but admin can see detail)
const getSettings = async (req, res) => {
  try {
    const dbSettings = await prisma.setting.findMany();
    // Convert array of settings to a key-value map
    const settingsMap = {};
    dbSettings.forEach(s => {
      // Parse boolean strings to actual booleans for easier frontend integration
      if (s.value === 'true') {
        settingsMap[s.key] = true;
      } else if (s.value === 'false') {
        settingsMap[s.key] = false;
      } else {
        settingsMap[s.key] = s.value;
      }
    });

    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch settings' });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (UNION_ADMIN)
const updateSettings = async (req, res) => {
  if (req.user.role !== 'UNION_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Union admins only.' });
  }

  const updates = req.body; // e.g. { appName: "Title", enableSms: true }

  try {
    const promises = Object.entries(updates).map(([key, value]) => {
      const stringValue = String(value);
      return prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue }
      });
    });

    await Promise.all(promises);
    res.json({ message: 'System settings saved successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to save settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
