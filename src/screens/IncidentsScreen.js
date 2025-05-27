import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getIncidents } from '../api/incidents';

export default function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getIncidents();
        setIncidents(data);
      } catch (err) {
        console.error('Erro ao buscar incidentes', err);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('IncidentDetails', { incident: item })}>
      <View style={styles.card}>
        <Text style={styles.title}>Câmera: {item.camera?.nome}</Text>
        <Text>Status: {item.status}</Text>
        <Text>Data: {new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

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
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontWeight: 'bold',
  },
});
