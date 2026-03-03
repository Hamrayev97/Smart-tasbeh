// Widget sync adapter placeholder.
// Native Android/iOS widget extensions can read from this shared store key.
import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_KEY = 'widget_counter_state';

export const pushWidgetState = async (payload) => {
  await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(payload));
};

export const pullWidgetState = async () => {
  const raw = await AsyncStorage.getItem(WIDGET_KEY);
  return raw ? JSON.parse(raw) : null;
};
