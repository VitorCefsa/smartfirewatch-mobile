import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
} from 'react-native';
import { Audio } from 'expo-av';
import { getIncidents } from '../api/incidents';
import { io } from 'socket.io-client';

const ALERT_INTERVAL_MINUTES = 5; // Intervalo mínimo entre alertas (5 minutos)
const INCIDENT_WINDOW_HOURS = 1; // Janela de tempo para considerar incidentes recentes (1 hora)

export default function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const lastAlertRef = useRef(null);
  const [sound, setSound] = useState();
  const appState = useRef(AppState.currentState);
  const socketRef = useRef(null);

  // Carregamento inicial
  useEffect(() => {
    fetchData();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Configura o WebSocket
  const setupWebSocket = () => {
    socketRef.current = io('http://192.168.0.32:4000');

    socketRef.current.on('connect', () => {
      console.log('Conectado ao servidor de socket');
    });

    socketRef.current.on('novo_incidente', (novoIncidente) => {
      console.log('Novo incidente recebido:', novoIncidente);
      
      // Adiciona o novo incidente no início da lista
      setIncidents(prev => [novoIncidente, ...prev]);
      
      // Verifica se é um incidente de fogo recente
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

  // Polling a cada 10 segundos
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

  // Busca os incidentes
  const fetchData = async () => {
    try {
      const data = await getIncidents();
      
      // Ordena por data/hora decrescente
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

  // Verifica se precisa alertar
  const verificarAlerta = (data) => {
    const agora = new Date();
    
    // Verifica intervalo mínimo entre alertas
    if (lastAlertRef.current && 
        (agora - lastAlertRef.current) / (1000 * 60) < ALERT_INTERVAL_MINUTES) {
      return;
    }

    // Procura por incidentes de fogo recentes
    const incidenteRecente = data.find(item => {
      if (item.tipo_incidente !== 'fire') return false;
      
      const dataIncidente = new Date(`${item.data}T${item.hora}`);
      const horasDesdeIncidente = (agora - dataIncidente) / (1000 * 60 * 60);
      
      return horasDesdeIncidente <= INCIDENT_WINDOW_HOURS;
    });

    if (incidenteRecente) {
      lastAlertRef.current = agora;
      emitirAlerta();
    }
  };

  // Emite o alerta sonoro e visual
  const emitirAlerta = async () => {
    Alert.alert('🚨 Alerta de Incêndio!', 'Incidente de fogo detectado!', [{ text: 'OK' }]);

    try {
      // Para qualquer som que esteja tocando
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Toca o alarme
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Erro ao reproduzir alerta:', error);
    }
  };

  // Limpa o som quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Renderiza cada item da lista
  const renderItem = ({ item }) => {
    const dataHora = new Date(`${item.data}T${item.hora}`);
    const formatada = dataHora.toLocaleString('pt-BR');

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('IncidentDetails', { incident: item })}
      >
        <View style={[
          styles.card,
          item.tipo_incidente === 'fire' && styles.fireCard
        ]}>
          <Text style={styles.title}>Câmera: {item.camera_id}</Text>
          <Text>Status: {item.tipo_incidente}</Text>
          <Text>Confiança: {(item.confianca * 100).toFixed(1)}%</Text>
          <Text>Local: {item.local}</Text>
          <Text>Data: {formatada}</Text>
        </View>
      </TouchableOpacity>
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  fireCard: {
    backgroundColor: '#ffdddd',
    borderLeftWidth: 4,
    borderLeftColor: 'red',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});