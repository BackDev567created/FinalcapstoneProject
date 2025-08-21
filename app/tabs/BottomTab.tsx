import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react'
import Profile from './Profile'
import Orders from './Orders'
import Products from './Products'
import Dashboard from './Dashboard'

type screenType={
    Profile: undefined,
    Orders: undefined,
    Products: undefined,
    Dashboard: undefined
    
}

const Tab = createBottomTabNavigator<screenType>();
const BottomTab = () => {
  return (
    <Tab.Navigator initialRouteName='Dashboard' screenOptions={{ tabBarActiveTintColor: '#0098ff', tabBarInactiveTintColor: 'black', headerShown: false }}>
        <Tab.Screen name='Dashboard' component={Dashboard} options={{ tabBarIcon:({color})=> <MaterialIcons name='dashboard' size={24} color={color}/>}}/>
        <Tab.Screen name='Orders' component={Orders} options={{ tabBarIcon:({color})=> <Entypo name="shopping-cart" size={24} color={color} />}}/>
        <Tab.Screen name='Products' component={Products} options={{ tabBarIcon:({color})=> <MaterialCommunityIcons name="account-multiple-check" size={24} color={color}/>}}/>
        <Tab.Screen name='Profile' component={Profile} options={{ tabBarIcon:({color})=> <FontAwesome name="user" size={24} color={color}/>}}/>
        
    </Tab.Navigator>
  )
}

export default BottomTab