import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function TasbehWidget({ count = 0, dhikr = '' }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A3D0A',
        borderRadius: 16,
        padding: 16,
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={dhikr || 'Smart Tasbeh'}
        style={{ fontSize: 13, fontWeight: '600', color: '#a8dbb8' }}
      />
      <TextWidget
        text={String(count)}
        style={{ fontSize: 48, fontWeight: '800', color: '#ffffff', marginTop: 2, marginBottom: 2 }}
      />
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1a5c2a',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginTop: 4,
        }}
      >
        <TextWidget
          text="Tap to count"
          style={{ fontSize: 11, fontWeight: '600', color: '#c8f0d4' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
