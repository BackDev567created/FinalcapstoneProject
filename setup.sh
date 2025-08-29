#!/bin/bash

echo "🚀 LPG E-commerce App Setup Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..
echo "✅ Backend dependencies installed"

# Create environment files
echo "📝 Creating environment files..."

# Frontend .env
if [ ! -f .env ]; then
    cat > .env << EOL
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:3000
EOL
    echo "✅ Created .env file for frontend"
else
    echo "ℹ️  .env file already exists"
fi

# Backend .env
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOL
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
EOL
    echo "✅ Created .env file for backend"
else
    echo "ℹ️  backend/.env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL migration from supabase-migrations/001_initial_schema.sql"
echo "3. Update the .env files with your Supabase credentials"
echo "4. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: npm start"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "Happy coding! 🎉"