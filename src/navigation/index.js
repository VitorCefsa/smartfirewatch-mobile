import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IncidentsScreen from '../screens/Incidents/IncidentsScreen';
import IncidentDetailsScreen from '../screens/IncidentDetails/IncidentDetailsScreen';

const Stack = createNativeStackNavigator();

const fireWatchLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e63946',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#2b2d42',
    border: '#e9ecef',
  },
};

const fireWatchDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#ff6b6b',
    background: '#121212',
    card: '#1e1e1e',
    text: '#f8f9fa',
    border: '#333333',
  },
};

const AppNavigator = () => {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? fireWatchDarkTheme : fireWatchLightTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: scheme === 'dark' ? '#0d0d0d' : '#1a1a2e',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen 
          name="Incidents" 
          component={IncidentsScreen} 
          options={{
            title: 'SmartFireWatch',
            headerLargeTitle: true,
            headerRight: () => (
              <MaterialCommunityIcons 
                name="fire-alert" 
                size={24} 
                color="#e63946" 
                style={{ marginRight: 15 }}
              />
            ),
          }} 
        />

        <Stack.Screen 
          name="IncidentDetails" 
          component={IncidentDetailsScreen} 
          options={({ route }) => ({
            title: route.params.incident.tipo_incidente === 'fire' 
              ? '🔥 Fire Alert Details' 
              : '⚠️ Incident Details',
            headerStyle: {
              backgroundColor: route.params.incident.tipo_incidente === 'fire' 
                ? scheme === 'dark' ? '#5c0000' : '#b71c1c'
                : scheme === 'dark' ? '#0d0d0d' : '#1a1a2e',
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;