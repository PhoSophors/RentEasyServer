const express = require('express');
const { authMiddleware, checkRoleMiddleware } = require('../middleware/authMiddleware');
const roleAndPermissionController = require('../controllers/roleAndPermissionController');

const router = express.Router();

const adminMiddleware = [authMiddleware, checkRoleMiddleware(['admin'])];

router.post('/create-roles', adminMiddleware, roleAndPermissionController.createNewRole);
router.post('/create-permissions', adminMiddleware, roleAndPermissionController.createNewPermission);

router.post('/add-permission-to-role', adminMiddleware, roleAndPermissionController.addPermissionToRole);
router.post('/add-user-role', adminMiddleware, roleAndPermissionController.addUserRole);

router.post('/remove-permission-role', adminMiddleware, roleAndPermissionController.removePermissionFromRole);
router.post('/delete-role', adminMiddleware, roleAndPermissionController.deleteRole);
router.post('/delete-permission', adminMiddleware, roleAndPermissionController.deletePermission);

router.get('/get-all-roles', adminMiddleware, roleAndPermissionController.getAllRoles);
router.get('/get-all-permissions', adminMiddleware, roleAndPermissionController.getAllPermissions);

module.exports = router;