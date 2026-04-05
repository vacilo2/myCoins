import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@theme/index';

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return <MaterialCommunityIcons name={name as any} size={24} color={color} />;
}

function FABButton() {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/new-transaction');
  }

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress} activeOpacity={0.85}>
      <MaterialCommunityIcons name="plus" size={28} color={colors.text.inverse} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-variant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ color }) => <TabBarIcon name="swap-horizontal" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarButton: () => <FABButton />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => <TabBarIcon name="chart-bar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
