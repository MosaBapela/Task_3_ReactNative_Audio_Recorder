import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import PlaybackScreen from '../screens/PlaybackScreen';
import RecordingScreen from '../screens/RecordingScreen';
import SettingsScreen from '../screens/SettingsScreen';


export type RootStackParamList = {
  Home: undefined;
  Recording: undefined;
  Playback: { note: any };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="Recording" 
        component={RecordingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Playback" 
        component={PlaybackScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
