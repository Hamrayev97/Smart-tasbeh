import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TasbehWidget } from './TasbehWidget';

const WIDGET_KEY = 'widget_counter_state';

const nameToWidget = {
  TasbehCounter: TasbehWidget,
};

export async function widgetTaskHandler(props) {
  const Widget = nameToWidget[props.widgetInfo.widgetName];
  if (!Widget) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const raw = await AsyncStorage.getItem(WIDGET_KEY);
      const state = raw ? JSON.parse(raw) : { count: 0, dhikr: '' };
      props.renderWidget(<Widget count={state.count} dhikr={state.dhikr} />);
      break;
    }
    case 'WIDGET_DELETED':
    default:
      break;
  }
}
