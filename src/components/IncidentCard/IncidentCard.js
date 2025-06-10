import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

export default function IncidentCard({ item, onPress, onResolve }) {
  const dataHora = new Date(`${item.data}T${item.hora}`);
  const formatada = dataHora.toLocaleString('pt-BR');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        item.tipo_incidente === 'fire' && styles.fireCard,
        item.status === 'resolvido' && styles.resolvedCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.incidentType}>{item.tipo_incidente.toUpperCase()}</Text>
        <View style={item.status === 'resolvido' ? styles.resolvedBadge : styles.activeBadge}>
          <Text style={styles.badgeText}>
            {item.status === 'resolvido' ? 'RESOLVIDO' : 'ACTIVO'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Confidence:</Text>
          <Text style={styles.detailValue}>
            {item.confianca != null ? `${(item.confianca * 100).toFixed(1)}%` : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatada}</Text>
        </View>
      </View>

      {item.status !== 'resolvido' && (
        <TouchableOpacity style={styles.resolveButton} onPress={onResolve}>
          <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
