# 🚀 LPG E-commerce App - Quick Start Guide

## 📋 Pre-flight Checklist

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Supabase account created
- ✅ Database migration completed

## 🗄️ Step 1: Test Database Connection

### Option A: Full System Test (Recommended)
```bash
npm run test:all
```

### Option B: Database Only Test
```bash
npm run test:db
```

### Option C: Manual Test
```bash
node test-connection.js
```

**Expected Output:**
```
🔍 Testing Database Connection...

1. Testing basic connection...
✅ Basic connection successful

2. Checking database tables...
✅ Table 'users' exists and is accessible
✅ Table 'admins' exists and is accessible
✅ Table 'products' exists and is accessible
✅ Table 'orders' exists and is accessible
✅ Table 'order_items' exists and is accessible
✅ Table 'chat_messages' exists and is accessible
✅ Table 'receipts' exists and is accessible
✅ Table 'locations' exists and is accessible
✅ Table 'stock_alerts' exists and is accessible

3. Checking default admin account...
✅ Default admin account found:
   Username: admin
   Password: admin123

4. Testing Row Level Security...
✅ RLS policies are working correctly

5. Testing real-time subscriptions...
✅ Real-time subscription successful

🎉 Database connection test completed!
```

## 🔧 Step 2: Test Backend Server

### Start Backend Server
```bash
cd backend
npm run dev
```

### Test Backend (in new terminal)
```bash
# From project root
npm run test:backend
```

**Expected Output:**
```
🔍 Testing Backend Server Connection...

1. Testing server health...
✅ Server is running and healthy

2. Testing API endpoints...
✅ Products API: Working
✅ Auth API: Protected (requires auth)
✅ Orders API: Protected (requires auth)

3. Testing database connection through API...
✅ Database connection through API: Working
   Found X products

🎉 Backend connection test completed!
```

## 📱 Step 3: Test Frontend App

### Start Frontend App
```bash
npm start
```

### Test in Expo Go or Simulator
1. **Admin Login:**
   - Username: `admin`
   - Password: `admin123`

2. **Customer Registration:**
   - Create new account
   - Browse products
   - Add to cart

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if migration was successful
npm run test:db

# If failed, re-run migration in Supabase:
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase-migrations/001_initial_schema.sql
# 3. Click Run
```

### Backend Server Issues
```bash
# Check if server is running
npm run test:backend

# If failed, start server:
cd backend
npm run dev

# Check for port conflicts (default: 3000)
netstat -ano | findstr :3000
```

### Frontend Issues
```bash
# Clear cache and restart
npx expo start --clear

# Check dependencies
npm install

# Verify Expo CLI
npx expo --version
```

## 🎯 Quick Commands Reference

```bash
# Test everything
npm run test:all

# Test individual components
npm run test:db          # Database only
npm run test:backend     # Backend only

# Start development servers
cd backend && npm run dev    # Backend (Terminal 1)
npm start                    # Frontend (Terminal 2)

# Clear and restart
npx expo start --clear

# Build for production
npx expo build:android
npx expo build:ios
```

## 📊 What Each Test Checks

### Database Test (`test-connection.js`)
- ✅ Supabase connection
- ✅ All required tables exist
- ✅ Default admin account
- ✅ Row Level Security policies
- ✅ Real-time subscriptions

### Backend Test (`test-backend.js`)
- ✅ Server is running
- ✅ API endpoints accessible
- ✅ Database connection through API
- ✅ Authentication middleware

### Full System Test (`test-full-system.js`)
- ✅ All of the above
- ✅ Frontend dependencies
- ✅ Expo configuration
- ✅ File structure integrity

## 🚨 Common Issues & Solutions

### 1. "Table not found" Error
**Solution:** Re-run the database migration in Supabase SQL Editor

### 2. "Server not running" Error
**Solution:** Start backend server with `cd backend && npm run dev`

### 3. "Network request failed" Error
**Solution:** Check API_BASE_URL in environment variables

### 4. "Unable to resolve module" Error
**Solution:** Run `npm install` to install missing dependencies

### 5. "Location permission denied" Error
**Solution:** Grant location permissions in device settings

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Database Test:** All tables accessible, admin account found
2. **Backend Test:** Server running, APIs responding
3. **Frontend Test:** Expo app loads, login works
4. **Full App:** Can login as admin, add products, place orders

## 📞 Need Help?

1. **Check the logs** in your terminal for specific error messages
2. **Verify environment variables** in `.env` files
3. **Test individual components** using the specific test commands
4. **Check Supabase dashboard** for database status
5. **Review README.md** for detailed setup instructions

---

**🎊 Your LPG e-commerce app is ready to test! Happy coding! 🚀**