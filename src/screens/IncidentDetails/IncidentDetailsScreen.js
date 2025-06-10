import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { resolveIncident } from '../../api/incidents';
import styles from './IncidentDetailsScreen.styles';

export default function IncidentDetailsScreen({ route, navigation }) {
  const { incident } = route.params;

  const dataHoraObj = new Date(`${incident.data}T${incident.hora}`);
  const dataHoraFormatada = dataHoraObj.toLocaleString('pt-BR');

  const marcarComoResolvido = async () => {
    try {
      await resolveIncident(incident.id);
      Alert.alert('Resolvido', 'Incidente marcado como resolvido.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível resolver o incidente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes do Incidente</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="ID:" value={incident.id} />
          <DetailRow label="Status:" value={incident.tipo_incidente} />
          <DetailRow label="Data / Hora:" value={dataHoraFormatada} />
          <DetailRow
            label="Confiança:"
            value={incident.confianca != null
              ? `${(incident.confianca * 100).toFixed(2)}%`
              : '—'}
          />
        </View>

        {incident.imagem_base64 ? (
          <View style={styles.imageCard}>
            <Text style={styles.imageLabel}>Imagem capturada:</Text>
            <Image
              source={{ uri: incident.imagem_base64 }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>Imagem não disponível</Text>
          </View>
        )}

        {incident.status !== 'resolvido' && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={marcarComoResolvido}
          >
            <Text style={styles.resolveButtonText}>Marcar como Resolvido</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);
