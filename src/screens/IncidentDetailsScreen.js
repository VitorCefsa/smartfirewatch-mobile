import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IncidentDetailsScreen({ route }) {
  const { incident } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Incidente</Text>
      <Text>ID: {incident.id}</Text>
      <Text>Status: {incident.status}</Text>
      <Text>Data: {new Date(incident.createdAt).toLocaleString()}</Text>
      <Text>Câmera: {incident.camera?.nome}</Text>
      <Text>Imagem: {incident.imagePath}</Text>
      {/* Pode exibir imagem se quiser: */}
      {/* <Image source={{ uri: 'http://SEU_IP:PORTA/' + incident.imagePath }} style={styles.image} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  image: { width: '100%', height: 200, marginTop: 10 },
});
