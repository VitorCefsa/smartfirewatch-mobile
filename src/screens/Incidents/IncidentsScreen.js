import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Alert, AppState, SafeAreaView, } from 'react-native';
import { Audio } from 'expo-av';
import { getIncidents, resolveIncident } from '../../api/incidents';
import { io } from 'socket.io-client';
import IncidentCard from '../../components/IncidentCard/IncidentCard';
import styles from './IncidentsScreen.styles';

const ALERT_INTERVAL_MINUTES = 5;
const INCIDENT_WINDOW_HOURS = 1;

export default function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastAlertRef = useRef(null);
  const [sound, setSound] = useState();
  const appState = useRef(AppState.currentState);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;

    const startPolling = () => {
      interval = setInterval(fetchData, 10000);
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    startPolling();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
      if (nextAppState === 'active') {
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, []);

  const setupWebSocket = () => {
    socketRef.current = io('http://192.168.0.32:4000');

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('novo_incidente', (novoIncidente) => {
      console.log('New incident received:', novoIncidente);
      setIncidents(prev => [novoIncidente, ...prev]);

      if (novoIncidente.tipo_incidente === 'fire') {
        const incidentTime = new Date(`${novoIncidente.data}T${novoIncidente.hora}`);
        const agora = new Date();
        const horasDesdeIncidente = (agora - incidentTime) / (1000 * 60 * 60);

        if (horasDesdeIncidente <= INCIDENT_WINDOW_HOURS) {
          emitirAlerta();
        }
      }
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getIncidents();
      const ordenados = [...data].sort((a, b) => {
        const dtA = new Date(`${a.data}T${a.hora}`);
        const dtB = new Date(`${b.data}T${b.hora}`);
        return dtB - dtA;
      });

      setIncidents(ordenados);
      verificarAlerta(ordenados);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const verificarAlerta = (data) => {
    const agora = new Date();

    if (lastAlertRef.current &&
      (agora - lastAlertRef.current) / (1000 * 60) < ALERT_INTERVAL_MINUTES) {
      return;
    }

    const incidenteRecente = data.find(item => {
      if (item.tipo_incidente !== 'fire') return false;

      const dataIncidente = new Date(`${item.data}T${item.hora}`);
      const horasDesdeIncidente = (agora - dataIncidente) / (1000 * 60 * 60);

      return horasDesdeIncidente <= INCIDENT_WINDOW_HOURS && item.status !== 'resolvido';
    });

    if (incidenteRecente) {
      lastAlertRef.current = agora;
      emitirAlerta();
    }
  };

  const emitirAlerta = async () => {
    Alert.alert(
      '🚨 FIRE ALERT!',
      'A FIRE INCIDENT HAS BEEN DETECTED!',
      [{ text: 'OK', style: 'cancel' }]
    );

    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        { shouldPlay: true }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing alert:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const marcarComoResolvido = async (id) => {
    try {
      await resolveIncident(id);
      fetchData();
      Alert.alert('Success', 'Incident marked as resolved');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve incident');
    }
  };

  const renderItem = ({ item }) => (
    <IncidentCard
      item={item}
      onPress={() => navigation.navigate('IncidentDetails', { incident: item })}
      onResolve={() => marcarComoResolvido(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isLoading ? 'Loading incidents...' : 'No incidents found'}
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchData}
      />
    </SafeAreaView>
  );
}
