import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DirectoryScreen from './screens/DirectoryScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import SplashScreen from './screens/SplashScreen';
import CommitteeScreen from './screens/CommitteeScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';

export type Member = {
  id: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
};

export type RootStackParamList = {
  Directory: { viewMode?: 'members' | 'groups' } | undefined;
  MemberDetail: { member: Member };
  QRScanner: undefined;
  Committee: undefined;
  Emergency: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Directory"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Directory" component={DirectoryScreen} />
        <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="Committee" component={CommitteeScreen} />
        <Stack.Screen name="Emergency" component={EmergencyContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
