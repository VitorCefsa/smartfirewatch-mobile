import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Button,
  Alert
} from 'react-native';
import { resolveIncident } from '../api/incidents';

export default function IncidentDetailsScreen({ route, navigation }) {
  const { incident } = route.params;
  const dataHoraObj = new Date(`${incident.data}T${incident.hora}`);
  const dataHoraFormatada = dataHoraObj.toLocaleString('pt-BR');

  const marcarComoResolvido = async () => {
    try {
      await resolveIncident(incident.id);
      Alert.alert('✅ Resolvido', 'Incidente marcado como resolvido.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível resolver o incidente.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes do Incidente</Text>

      <View style={styles.row}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{incident.id}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{incident.tipo_incidente}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Data / Hora:</Text>
        <Text style={styles.value}>{dataHoraFormatada}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Confiança:</Text>
        <Text style={styles.value}>
          {incident.confianca != null
            ? `${(incident.confianca * 100).toFixed(2)}%`
            : '—'}
        </Text>
      </View>

      {incident.imagem_base64 ? (
        <View style={styles.imageContainer}>
          <Text style={[styles.label, { marginBottom: 8 }]}>
            Imagem capturada:
          </Text>
          <Image
            source={{ uri: incident.imagem_base64 }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Text style={[styles.noImageText, { marginTop: 16 }]}>
          Imagem não disponível
        </Text>
      )}

      {incident.status !== 'resolvido' && (
        <View style={{ marginTop: 24 }}>
          <Button
            title="Marcar como Resolvido"
            onPress={marcarComoResolvido}
            color="green"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#d32f2f',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    width: 110,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  imageContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noImageText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});
