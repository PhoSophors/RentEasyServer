const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const User = require("../models/userModel"); // Assuming you have a User model

// CREATE NEW ROLE ===========================================================
exports.createNewRole = async (req, res) => {
  const { name } = req.body;
  try {
    // required fields
    if (!name) {
      return res.status(400).json({ message: "Name or role required" });
    }

    // Check if the role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = new Role({ name });
    await role.save();
    res.status(201).json({ message: "Role created successfully", role });
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD PERMISSION TO ROLE =====================================================
exports.createNewPermission = async (req, res) => {
  const { name } = req.body;
  try {
    // required fields
    if (!name) {
      return res.status(400).json({ message: "Name or permissions required" });
    }

    // Check if the permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    const permission = new Permission({ name });
    await permission.save();
    res
      .status(201)
      .json({ message: "Permission created successfully", permission });
  } catch (err) {
    console.error("Error creating permission:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD USER ROLE =============================================================
exports.addUserRole = async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Initialize user.roles as an array if it is not already
    if (!Array.isArray(user.roles)) {
      user.roles = [];
    }

    // Check if the role is already added to the user
    if (user.roles.includes(roleId)) {
      return res.status(400).json({ message: "Role already added to user" });
    }

    user.roles.push(roleId);
    await user.save();

    res.status(200).json({ message: "Role added to user successfully", user });
  } catch (err) {
    console.error("Error adding role to user:", err);
    res.status(500).json({ message: "Server error" });
  }
}; // <-- Added missing closing brace

// ADD PERMISSION TO ROLE =====================================================
exports.addPermissionToRole = async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    // required fields
    if (!roleId || !permissionId) {
      return res.status(400).json({ message: "Role or permission required" });
    }

    // Check if the role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Check if the permission is already added to the role
    if (role.permissions.includes(permissionId)) {
      return res
        .status(400)
        .json({ message: "Permission already added to role" });
    }

    role.permissions.push(permissionId);
    await role.save();
    res
      .status(200)
      .json({ message: "Permission added to role successfully", role });
  } catch (err) {
    console.error("Error adding permission to role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REMOVE PERMISSION FROM ROLE =================================================
exports.removePermissionFromRole = async (req, res) => {
  const { roleId, permissionId } = req.body;
  try {
    // required fields
    if (!roleId || !permissionId) {
      return res.status(400).json({ message: "Role or permission required" });
    }

    // Check if the role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if the permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Check if the permission is already added to the role
    if (!role.permissions.includes(permissionId)) {
      return res.status(400).json({ message: "Permission not added to role" });
    }

    role.permissions = role.permissions.filter(
      (perm) => perm.toString() !== permissionId
    );
    await role.save();
    res
      .status(200)
      .json({ message: "Permission removed from role successfully", role });
  } catch (err) {
    console.error("Error removing permission from role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ROLE ===============================================================
exports.deleteRole = async (req, res) => {
  const { roleId } = req.body;
  try {
    // required fields
    if (!roleId) {
      return res.status(400).json({ message: "roleId required" });
    }

    // Check if the role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.deleteOne();
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE PERMISSION ===============================================================
exports.deletePermission = async (req, res) => {
  const { permissionId } = req.body;
  try {
    // required fields
    if (!permissionId) {
      return res.status(400).json({ message: "permissionId required" });
    }

    // Check if the permission exists
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    await permission.deleteOne();
    res.status(200).json({ 
      message: "Permission deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting permission:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ROLES =============================================================
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");

    // Get role count
    const roleCount = await Role.countDocuments();

    res.status(200).json({
      roleCount: roleCount,
      roles: roles,
    });
  } catch (err) {
    console.error("Error getting roles:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL PERMISSIONS ========================================================
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();

    // Get permission count
    const permissionCount = await Permission.countDocuments();

    res.status(200).json({
      permissionsCount: permissionCount,
      permissions: permissions,
    });
  } catch (err) {
    console.error("Error getting permissions:", err);
    res.status(500).json({ message: "Server error" });
  }
};
