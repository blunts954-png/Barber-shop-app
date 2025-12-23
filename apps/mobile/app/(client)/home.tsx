import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ClientHomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <Text style={styles.placeholder}>You have no upcoming appointments</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  placeholder: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 32,
  },
});
