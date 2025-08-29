# LPG E-commerce App

A comprehensive mobile-first e-commerce application for LPG (Liquefied Petroleum Gas) products with separate admin and customer interfaces.

## 🚀 Features

### Admin Features
- 📊 **Analytics Dashboard** - Real-time sales analytics with interactive charts
- 📦 **Product Management** - Full CRUD operations with image upload
- 💬 **Chat Management** - Real-time customer communication
- 📋 **Order Management** - View and manage customer orders
- 📈 **Stock Alerts** - Low inventory notifications
- 👥 **Customer Insights** - User analytics and management

### Customer Features
- 🛒 **Product Catalog** - Browse LPG products with search and filters
- 🛍️ **Shopping Cart** - Add/remove items with quantity controls
- 💳 **Payment Options** - COD and GCash payment methods
- 📍 **Delivery Tracking** - Real-time location updates
- 💬 **Customer Support** - Direct chat with admin
- 📱 **Mobile-First** - Optimized for mobile devices

## 🛠️ Tech Stack

### Frontend
- **React Native 0.79.5** with **Expo SDK 53**
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** for navigation
- **Expo Secure Store** for secure token storage
- **Expo Image Picker** for photo uploads
- **React Native Chart Kit** for analytics

### Backend
- **Express.js** with **TypeScript**
- **Supabase** (PostgreSQL + Real-time + Storage)
- **JWT Authentication**
- **bcryptjs** for password hashing
- **Rate Limiting** for security

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account (https://supabase.com)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for setup to complete

2. **Run Database Migration**
   - Open your Supabase project dashboard
   - Go to **SQL Editor**
   - Copy the contents of `supabase-migrations/001_initial_schema.sql`
   - Click **Run** to execute the migration

3. **Get API Credentials**
   - Go to **Settings → API**
   - Copy your **Project URL** and **anon/public key**

### 3. Environment Configuration

#### Frontend Environment (.env in CapstoneProject-main/)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Backend Environment (backend/.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### 5. Test the App

1. **Admin Login**: Use `admin` / `admin123`
2. **Customer Registration**: Create a new customer account
3. **Add Products**: Admin can add LPG products with images
4. **Browse & Order**: Customers can browse and add to cart

## 📱 App Structure

```
CapstoneProject-main/
├── app/                    # React Native Frontend
│   ├── contexts/          # React contexts (Auth, Cart)
│   ├── components/        # Reusable components
│   ├── services/          # API services
│   ├── hooks/            # Custom hooks
│   ├── types/            # Frontend-specific types
│   ├── utils/            # Helper functions
│   ├── screens/          # App screens
│   └── tabs/             # Tab navigation screens
├── backend/               # Express.js API Server
│   ├── src/
│   │   ├── config/       # Database & app config
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, rate limiting
│   │   ├── models/       # Database schemas
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── shared/                # Shared types & constants
│   ├── types/
│   └── constants/
└── supabase-migrations/   # Database migration files
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

### Chat
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/messages` - Send message

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Row Level Security** (RLS) policies in Supabase
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** and sanitization
- **CORS Protection** and security headers
- **Password Hashing** with bcryptjs

## 📊 Database Schema

### Core Tables
- **users** - Customer and admin accounts
- **admins** - Default admin login
- **products** - LPG product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **chat_messages** - Customer-admin communication
- **receipts** - Order receipts
- **locations** - Delivery tracking
- **stock_alerts** - Inventory notifications

## 🚀 Deployment

### Backend (Railway/Render)
```bash
cd backend
npm run build
npm start
```

### Frontend (Expo)
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use Expo Go for development
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your Supabase credentials in `.env` files
   - Ensure the migration was run successfully

2. **Image Upload Issues**
   - Verify camera and media library permissions
   - Check Supabase storage bucket configuration

3. **Authentication Problems**
   - Clear Expo Secure Store: `npx expo install expo-secure-store`
   - Check JWT secret configuration

4. **Chart Display Issues**
   - Ensure `react-native-svg` is properly installed
   - Check chart data format

### Development Tips

- Use `npm run reset-project` to reset the project
- Clear Metro cache: `npx expo start --clear`
- Check logs: `npx expo start --logs`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Happy coding! 🎉**
