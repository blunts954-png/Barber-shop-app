import { View, Text, StyleSheet } from 'react-native';

export default function LoyaltyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loyalty Program</Text>
      <View style={styles.card}>
        <Text style={styles.tierLabel}>Current Tier</Text>
        <Text style={styles.tier}>Bronze</Text>
        <Text style={styles.points}>0 Points</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  tierLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tier: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  points: {
    fontSize: 18,
    color: '#0ea5e9',
  },
});
