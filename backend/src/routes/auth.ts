import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { authRateLimiter } from '../middleware/rateLimiter';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    // Check if it's admin login
    if (email === 'admin') {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', email)
        .single();

      if (error || !admin) {
        return next(createError('Invalid credentials', 401));
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return next(createError('Invalid credentials', 401));
      }

      const token = jwt.sign(
        { id: admin.id, role: 'admin', type: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: admin.id,
            username: admin.username,
            role: 'admin'
          }
        }
      });
      return;
    }

    // Regular user login via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return next(createError('Invalid credentials', 401));
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return next(createError('User profile not found', 404));
    }

    const token = jwt.sign(
      { id: authData.user.id, role: profile.role, type: 'user' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile.full_name,
          role: profile.role
        }
      }
    });
  } catch (error) {
    next(createError('Login failed', 500));
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, phone, address } = req.body;

    if (!email || !password || !full_name) {
      return next(createError('Email, password, and full name are required', 400));
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return next(createError(authError?.message || 'Registration failed', 400));
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        address,
        role: 'customer'
      })
      .select()
      .single();

    if (profileError) {
      return next(createError('Failed to create user profile', 500));
    }

    const token = jwt.sign(
      { id: authData.user.id, role: 'customer', type: 'user' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile.full_name,
          role: profile.role
        }
      }
    });
  } catch (error) {
    next(createError('Registration failed', 500));
  }
});

export default router;