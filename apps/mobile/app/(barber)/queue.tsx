import { View, Text, StyleSheet } from 'react-native';

export default function QueueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk-in Queue</Text>
      <Text style={styles.placeholder}>No walk-ins waiting</Text>
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
  placeholder: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 32,
  },
});
