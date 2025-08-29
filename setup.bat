@echo off
echo 🚀 LPG E-commerce App Setup Script
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..
echo ✅ Backend dependencies installed

REM Create environment files
echo 📝 Creating environment files...

REM Frontend .env
if not exist .env (
    echo EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co> .env
    echo EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here>> .env
    echo EXPO_PUBLIC_API_URL=http://localhost:3000>> .env
    echo ✅ Created .env file for frontend
) else (
    echo ℹ️  .env file already exists
)

REM Backend .env
if not exist backend\.env (
    echo SUPABASE_URL=https://your-project.supabase.co> backend\.env
    echo SUPABASE_ANON_KEY=your-anon-key-here>> backend\.env
    echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here>> backend\.env
    echo JWT_SECRET=your-super-secret-jwt-key-here>> backend\.env
    echo JWT_EXPIRES_IN=7d>> backend\.env
    echo PORT=3000>> backend\.env
    echo NODE_ENV=development>> backend\.env
    echo ✅ Created .env file for backend
) else (
    echo ℹ️  backend/.env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Run the SQL migration from supabase-migrations/001_initial_schema.sql
echo 3. Update the .env files with your Supabase credentials
echo 4. Start the development servers:
echo    - Backend: cd backend && npm run dev
echo    - Frontend: npm start
echo.
echo 📖 For detailed instructions, see README.md
echo.
echo Happy coding! 🎉
pause