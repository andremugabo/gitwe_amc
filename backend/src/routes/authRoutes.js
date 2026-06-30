const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  getUsersList
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gitwe.org
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful — returns user object with JWT token
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account not verified
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gatete Silas
 *               email:
 *                 type: string
 *                 example: silas@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [UNION_ADMIN, FIELD_SECRETARY, PASTOR, ELDER]
 *                 example: ELDER
 *               phone:
 *                 type: string
 *                 example: "0788123456"
 *               unionId:
 *                 type: string
 *               fieldId:
 *                 type: string
 *               districtId:
 *                 type: string
 *               localChurchId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful — verification email sent
 *       400:
 *         description: User already exists or validation error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify email address with OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 example: silas@gmail.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 */
router.post('/verify', verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: silas@gmail.com
 *     responses:
 *       200:
 *         description: Reset code sent to email
 *       404:
 *         description: No user registered with this email
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using the code received via email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset code
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all system users directory (scoped based on authorization role)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [UNION_ADMIN, FIELD_SECRETARY, PASTOR, ELDER]
 *         description: Filter system users by role type
 *     responses:
 *       200:
 *         description: Scoped list of users
 *       401:
 *         description: Not authorized
 */
router.get('/users', protect, getUsersList);

module.exports = router;
