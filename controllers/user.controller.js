const User = require('../models/User');

// ✅ Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ registeredAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

// ✅ Get a specific user profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

// ✅ Approve or Reject User Registration (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    // const validRoles = ['Admin', 'Intern', 'Professor', 'Viewer'];
    const validRoles = ['Admin', 'Intern', 'Viewer'];
    if (!validRoles.includes(newRole)) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    res.status(200).json({ message: 'User role updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};


// ✅ Delete User (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// ✅ Metrics Count (Admin)
exports.userStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const interns = await User.countDocuments({ role: 'intern' });
    const professors = await User.countDocuments({ role: 'professor' });
    const admins = await User.countDocuments({ role: 'admin' });
    const approved = await User.countDocuments({ isApproved: true });
    const pending = await User.countDocuments({ isApproved: false });

    res.status(200).json({
      totalUsers: total,
      interns,
      professors,
      admins,
      approvedUsers: approved,
      pendingApprovals: pending
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user stats", error });
  }
};
