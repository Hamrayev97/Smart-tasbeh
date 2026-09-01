import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const WIDGET_KEY = 'widget_counter_state';

export const pushWidgetState = async (payload) => {
  await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(payload));
  if (Platform.OS === 'android') {
    try {
      const { requestWidgetUpdate } = require('react-native-android-widget');
      requestWidgetUpdate({ widgetName: 'TasbehCounter' });
    } catch (_) {}
  }
};

export const pullWidgetState = async () => {
  const raw = await AsyncStorage.getItem(WIDGET_KEY);
  return raw ? JSON.parse(raw) : null;
};
