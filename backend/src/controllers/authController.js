const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const sendEmail = require('../utils/sendEmail');
const { getVerificationTemplate, getPasswordResetTemplate } = require('../utils/emailTemplates');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please verify your email first.',
        email: user.email,
        unverified: true 
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        unionId: user.unionId,
        fieldId: user.fieldId,
        districtId: user.districtId,
        localChurchId: user.localChurchId,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    phone, 
    unionId, 
    fieldId, 
    districtId, 
    localChurchId 
  } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'ELDER',
        phone,
        unionId: unionId || null,
        fieldId: fieldId || null,
        districtId: districtId || null,
        localChurchId: localChurchId || null,
        verificationCode,
        isVerified: false // Needs verification
      }
    });

    // Create system notification log
    await prisma.notification.create({
      data: {
        title: 'Account Verification Code',
        message: `Welcome ${name}! Your verification code is: ${verificationCode}`,
        type: 'EMAIL',
        status: 'SENT',
        recipientId: user.id
      }
    });

    // Send actual email using Gmail transporter
    await sendEmail({
      to: email,
      subject: 'Account Verification Code - Gitwe AMC',
      text: `Welcome ${name}! Your account verification code is: ${verificationCode}. Please enter this code to activate your account.`,
      html: getVerificationTemplate(name, verificationCode)
    });

    res.status(201).json({
      message: 'Registration successful. Verification email sent.',
      email: user.email
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === code) {
      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
          verificationCode: null
        }
      });

      // Audit activity
      await prisma.activity.create({
        data: {
          action: 'USER_VERIFIED',
          description: `User ${user.email} verified their account`,
          userId: user.id
        }
      });

      res.json({
        message: 'Account verified successfully. You can now login.'
      });
    } else {
      res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request forgot password code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { verificationCode: resetCode }
    });

    // Create system notification log
    await prisma.notification.create({
      data: {
        title: 'Password Reset Request',
        message: `Your password reset code is: ${resetCode}`,
        type: 'EMAIL',
        status: 'SENT',
        recipientId: user.id
      }
    });

    // Send actual email using Gmail transporter
    await sendEmail({
      to: email,
      subject: 'Password Reset Request - Gitwe AMC',
      text: `Your password reset code is: ${resetCode}. Enter this code to set a new password.`,
      html: getPasswordResetTemplate(user.name || 'User', resetCode)
    });

    res.json({
      message: 'Reset instructions sent to your email.',
      email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode === code) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          verificationCode: null
        }
      });

      // Audit activity
      await prisma.activity.create({
        data: {
          action: 'PASSWORD_RESET',
          description: `User ${user.email} reset their password`,
          userId: user.id
        }
      });

      res.json({ message: 'Password reset successful. You can now login.' });
    } else {
      res.status(400).json({ message: 'Invalid or expired reset code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      phone: true,
      unionId: true,
      fieldId: true,
      districtId: true,
      localChurchId: true,
      createdAt: true 
    }
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all system users directory (scoped by requester role)
// @route   GET /api/auth/users
// @access  Private
const getUsersList = async (req, res) => {
  try {
    const { role } = req.query;
    let whereClause = {};

    if (role) {
      whereClause.role = role;
    }

    // Role-based hierarchy scoping
    if (req.user.role === 'FIELD_SECRETARY') {
      whereClause.OR = [
        { fieldId: req.user.fieldId },
        { localChurch: { district: { fieldId: req.user.fieldId } } }
      ];
    } else if (req.user.role === 'PASTOR') {
      whereClause.OR = [
        { districtId: req.user.districtId },
        { localChurch: { districtId: req.user.districtId } }
      ];
    } else if (req.user.role === 'ELDER') {
      whereClause.localChurchId = req.user.localChurchId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        unionId: true,
        fieldId: true,
        districtId: true,
        localChurchId: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  getUsersList
};
