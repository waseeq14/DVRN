import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fetchPremiumContent } from '../api/premium';

// VB-03: isPremium is a value the client received once at login and cached
// in JS state. This check is the ONLY thing standing between a free account
// and the premium content below - the backend endpoint this calls
// (GET /api/premium) never re-validates isPremium itself, so anyone who gets
// past this branch (patched bundle, Frida hook, etc.) reaches real content.
function PremiumScreen({ isPremium }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isPremium) {
      return;
    }

    fetchPremiumContent()
      .then(setContent)
      .catch(err => setError(err.message));
  }, [isPremium]);

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Premium</Text>
        <Text style={styles.content}>Upgrade to access this feature</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.content}>{content ?? 'Loading premium content...'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  content: {
    textAlign: 'center',
    color: '#555',
  },
  error: {
    textAlign: 'center',
    color: '#c0392b',
  },
});

export default PremiumScreen;
