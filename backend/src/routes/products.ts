import { Router } from 'express';
import { supabase } from '../config/database';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all products with pagination and filters
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      option,
      is_active = true,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (option) {
      query = query.eq('option', option);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });

    // Apply pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// Create new product (Admin only)
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      description,
      weight,
      price,
      option,
      stock_quantity,
      image_url
    } = req.body;

    // Validate required fields
    if (!name || !weight || !price || !option) {
      return next(createError('Name, weight, price, and option are required', 400));
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        weight,
        price: parseFloat(price),
        option,
        stock_quantity: parseInt(stock_quantity) || 0,
        image_url,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update product (Admin only)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    // Convert numeric fields
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }
    if (updates.stock_quantity) {
      updates.stock_quantity = parseInt(updates.stock_quantity);
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete product (Admin only) - Soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: product,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get product statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const { data: stats, error } = await supabase
      .rpc('get_product_stats');

    if (error) throw error;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;