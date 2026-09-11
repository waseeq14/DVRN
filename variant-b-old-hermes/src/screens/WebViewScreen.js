import { Alert, Button, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '../config/api';

// VB-05: no origin check on event.nativeEvent.url, no schema validation on
// the parsed payload. Any content that ends up loaded in this WebView - the
// real page, a redirect, injected script, whatever - can drive handleAction
// with values entirely of its own choosing.
function handleAction(action, payload) {
  switch (action) {
    case 'SHOW_ALERT':
      Alert.alert(payload?.title, payload?.message);
      break;
    default:
      console.log('WebViewScreen: unknown action', action, payload);
  }
}

function WebViewScreen({ onBack }) {
  const onMessage = event => {
    const data = JSON.parse(event.nativeEvent.data);
    handleAction(data.action, data.payload);
  };

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={onBack} />
      <WebView
        source={{ uri: `${API_BASE_URL}/help` }}
        onMessage={onMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
