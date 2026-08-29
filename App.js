// App.js — Main entry point
import React from 'react';
import { Platform, StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import initAds from './src/lib/initAds';
import withIAP from './src/lib/withIAP';

if (Platform.OS === 'android') {
  require('react-native-android-widget').registerWidgetTaskHandler(
    require('./src/widget/widgetTaskHandler').widgetTaskHandler
  );
}
import { AppProvider, useApp } from './src/hooks/useAppContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CounterScreen from './src/screens/CounterScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import DhikrListScreen from './src/screens/DhikrListScreen';
import QiblaScreen from './src/screens/QiblaScreen';
import RamadanScreen from './src/screens/RamadanScreen';
import SettingsScreen from './src/screens/SettingsScreen';

initAds();

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { t, theme, colors, darkMode, onboardingDone, completeOnboarding, language, setLanguage } = useApp();

  if (!onboardingDone) {
    return (
      <OnboardingScreen
        initialLanguage={language}
        onLanguageChange={setLanguage}
        onComplete={completeOnboarding}
      />
    );
  }

  const tabBarStyle = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 4,
    paddingBottom: 6,
    height: 62,
  };

  return (
    <>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.surface, shadowColor: 'transparent', elevation: 0, borderBottomColor: colors.border, borderBottomWidth: 1 },
          headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 18 },
          tabBarStyle,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Counter: focused ? 'radio-button-on' : 'radio-button-off',
              Statistics: focused ? 'bar-chart' : 'bar-chart-outline',
              Dhikrs: focused ? 'list' : 'list-outline',
              Qibla: focused ? 'compass' : 'compass-outline',
              Ramadan: focused ? 'moon' : 'moon-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Counter"
          component={CounterScreen}
          options={{
            title: t.counter,
            headerTitle: () => (
              <View>
                <Text style={{ color: theme.primary, fontSize: 18, fontWeight: '800' }}>
                  {t.appName}
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ title: t.statistics, headerTitle: t.statistics }}
        />
        <Tab.Screen
          name="Dhikrs"
          component={DhikrListScreen}
          options={{ title: t.dhikrList, headerTitle: t.dhikrList }}
        />
        <Tab.Screen
          name="Qibla"
          component={QiblaScreen}
          options={{ title: t.qibla, headerTitle: t.qibla }}
        />
        <Tab.Screen
          name="Ramadan"
          component={RamadanScreen}
          options={{ title: t.ramadan, headerTitle: t.ramadan }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t.settings, headerTitle: t.settings }}
        />
      </Tab.Navigator>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default withIAP(App);
