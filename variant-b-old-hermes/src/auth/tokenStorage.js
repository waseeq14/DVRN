// VB-01: session token stored in plain AsyncStorage instead of an encrypted
// store like react-native-keychain. AsyncStorage on Android is not encrypted
// at rest, so this is readable in plaintext by anyone with filesystem access
// (root, adb backup, a rooted emulator).
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveToken(token) {
  await AsyncStorage.setItem('authToken', token);
}

export async function getToken() {
  return AsyncStorage.getItem('authToken');
}
