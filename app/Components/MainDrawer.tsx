  // MainDrawer.tsx
  import React from 'react';
  import { createDrawerNavigator } from '@react-navigation/drawer';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import HomeScreen from '../user/HomeScreen';
  import OrderHistory from '../user/OrderHistory';
  import ChatRoom from '../user/ChatRoom';
  import Profile from '../user/Profile';
  import AdminProfile from '../user/AdminProfile';
  import ShoppingCart from '../user/ShoppingCart';
  import PaymentScreen from '../user/PaymentScreen';
  import EnTypo from 'react-native-vector-icons/Entypo'
  import FontAwesome from 'react-native-vector-icons/FontAwesome'
  import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
  import Logout from './Logout';


  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator()

  const Cart = () => {
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      <Stack.Screen name='ShoppingCart' component={ShoppingCart}/>
      <Stack.Screen name='PaymentScreen' component={PaymentScreen}/>
    </Stack.Navigator>

  }

  const MainDrawer = () => {
    return (
      
      <Drawer.Navigator
        drawerContent={(props) => <Logout {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} 
        options={{ drawerIcon: ({ color, size}) => (
          <EnTypo name='home' size={size} color={color}/>
        ),
      }}
      />
        <Drawer.Screen name="OrderHistory" component={OrderHistory}
        options={{ drawerIcon: ({ color, size}) => (
          <EnTypo name='shopping-cart' size={size} color={color}/>
        ),
      }} />
        <Drawer.Screen name="Profile" component={Profile}
        options={{ drawerIcon: ({ color, size}) => (
          <FontAwesome name='user-circle' size={size} color={color}/>
        ),
      }} />
        <Drawer.Screen name="AdminProfile" component={AdminProfile}
        options={{ drawerIcon: ({ color, size}) => (
          <FontAwesome5 name='user-shield' size={size} color={color}/>
        ),
      }} />
        <Drawer.Screen name="Messenger" component={ChatRoom}
        options={{ drawerIcon: ({ color, size}) => (
          <EnTypo name='chat' size={size} color={color}/>
        ),
      }} />
      </Drawer.Navigator>
    );
  };

  export default MainDrawer;
