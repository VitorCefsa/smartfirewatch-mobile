import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IncidentDetailsScreen({ route }) {
  const { incident } = route.params;

  const dataHora = new Date(`${incident.data}T${incident.hora}`);
  const formatada = dataHora.toLocaleString('pt-BR');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Incidente</Text>
      <Text>ID: {incident.id}</Text>
      <Text>Status: {incident.tipo_incidente}</Text>
      <Text>Data: {formatada}</Text>
      <Text>Câmera: {incident.camera_id}</Text>
      <Text>Local: {incident.local}</Text>
      <Text>Confiança: {(incident.confianca * 100).toFixed(1)}%</Text>
      <Text>Imagem: (não disponível)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
