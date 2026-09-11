import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import PremiumScreen from './PremiumScreen';
import WebViewScreen from './WebViewScreen';

type Props = {
  token: string;
  isPremium: boolean;
};

function HomeScreen({ token, isPremium }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  if (showHelp) {
    return <WebViewScreen onBack={() => setShowHelp(false)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logged in</Text>
      <Text style={styles.token}>{token}</Text>
      <Text style={styles.account}>Account: {isPremium ? 'Premium' : 'Free'}</Text>
      <PremiumScreen isPremium={isPremium} />
      <View style={styles.helpButton}>
        <Button title="Help" onPress={() => setShowHelp(true)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  token: {
    textAlign: 'center',
    color: '#555',
  },
  account: {
    textAlign: 'center',
    color: '#555',
    marginTop: 8,
  },
  helpButton: {
    marginTop: 24,
  },
});

export default HomeScreen;
