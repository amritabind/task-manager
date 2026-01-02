const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasks');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware); // Protect all task routes

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
