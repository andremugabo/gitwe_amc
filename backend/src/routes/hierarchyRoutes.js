const express = require('express');
const router = express.Router();
const { getHierarchy } = require('../controllers/hierarchyController');

/**
 * @swagger
 * /hierarchy:
 *   get:
 *     summary: Get the full ecclesiastical location hierarchy
 *     description: Returns all unions, fields, districts, and local churches — used for registration and scoped dropdowns.
 *     tags: [Hierarchy]
 *     responses:
 *       200:
 *         description: Hierarchy object with unions, fields, districts, and localChurches arrays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       unionId:
 *                         type: string
 *                 districts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       fieldId:
 *                         type: string
 *                 localChurches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       districtId:
 *                         type: string
 */
router.get('/', getHierarchy);

module.exports = router;
