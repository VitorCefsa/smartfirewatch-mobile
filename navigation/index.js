import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IncidentsScreen from '../screens/IncidentsScreen';
import IncidentDetailsScreen from '../screens/IncidentDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Incidents" component={IncidentsScreen} options={{ title: 'Incidentes' }} />
        <Stack.Screen name="IncidentDetails" component={IncidentDetailsScreen} options={{ title: 'Detalhes do Incidente' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
