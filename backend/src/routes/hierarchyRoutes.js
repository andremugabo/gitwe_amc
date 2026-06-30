const express = require('express');
const router = express.Router();
const { getHierarchy } = require('../controllers/hierarchyController');

router.get('/', getHierarchy);

module.exports = router;
