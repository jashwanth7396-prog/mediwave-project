import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword, role });

    await AuditLog.create({
      action: 'CREATE',
      module: 'AUTH',
      userId: user._id,
      userName: user.name,
      description: `${user.email} created`,
      // legacy
      user: user._id,
      details: `${user.email} created`
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    await AuditLog.create({
      action: 'LOGIN',
      module: 'AUTH',
      userId: user._id,
      userName: user.name,
      description: `${user.email} logged in`,
      user: user._id,
      details: `${user.email} logged in`
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: 'No user context' });
    const user = await User.findById(userId).select('name email');
    await AuditLog.create({
      action: 'LOGOUT',
      module: 'AUTH',
      userId: userId,
      userName: user?.name || '',
      description: `${user?.email || 'User'} logged out`,
      user: userId,
      details: `${user?.email || 'User'} logged out`
    });
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
