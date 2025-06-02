import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  Button,
} from 'react-native';
import { Audio } from 'expo-av';
import { getIncidents, resolveIncident } from '../api/incidents';
import { io } from 'socket.io-client';

const ALERT_INTERVAL_MINUTES = 5;
const INCIDENT_WINDOW_HOURS = 1;

export default function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
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

  const setupWebSocket = () => {
    socketRef.current = io('http://192.168.0.32:4000');

    socketRef.current.on('connect', () => {
      console.log('Conectado ao servidor de socket');
    });

    socketRef.current.on('novo_incidente', (novoIncidente) => {
      console.log('Novo incidente recebido:', novoIncidente);
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

  const fetchData = async () => {
    try {
      const data = await getIncidents();
      const ordenados = [...data].sort((a, b) => {
        const dtA = new Date(`${a.data}T${a.hora}`);
        const dtB = new Date(`${b.data}T${b.hora}`);
        return dtB - dtA;
      });

      setIncidents(ordenados);
      verificarAlerta(ordenados);
    } catch (error) {
      console.error('Erro ao buscar incidentes:', error);
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
    Alert.alert('🚨 ALERTA DE INCÊNDIO!', 'INCIDENTE DE FOGO DETECTADO!', [{ text: 'OK' }]);

    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Erro ao reproduzir alerta:', error);
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
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível resolver o incidente.');
    }
  };

  const renderItem = ({ item }) => {
    const dataHora = new Date(`${item.data}T${item.hora}`);
    const formatada = dataHora.toLocaleString('pt-BR');

    return (
      <View style={[
        styles.card,
        item.tipo_incidente === 'fire' && styles.fireCard,
        item.status === 'resolvido' && styles.resolvedCard,
      ]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('IncidentDetails', { incident: item })}
        >
          <Text style={styles.text}>STATUS: {item.tipo_incidente.toUpperCase()}</Text>
          <Text style={styles.text}>CONFIANÇA: {(item.confianca * 100).toFixed(1)}%</Text>
          <Text style={styles.text}>DATA: {formatada.toUpperCase()}</Text>
        </TouchableOpacity>

        {item.status !== 'resolvido' && (
          <Button
            title="Marcar como Resolvido"
            onPress={() => marcarComoResolvido(item.id)}
            color="green"
          />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={incidents}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  fireCard: {
    backgroundColor: '#ffdddd',
    borderLeftWidth: 6,
    borderLeftColor: 'red',
  },
  text: {
    fontSize: 19,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
  },
  resolvedCard: {
  backgroundColor: '#ddffdd',
  borderLeftWidth: 6,
  borderLeftColor: 'green',
},
});
