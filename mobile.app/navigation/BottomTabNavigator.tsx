import { Ionicons } from '@expo/vector-icons';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
  BottomTabBarOptions,
} from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import HomeScreen from '../screens/Home';
import ScenesScreen from '../screens/Scenes';
import ConfigScreen from '../screens/Config';

import {
  BottomTabParamList,
  HomeTabParamList,
  ScenesTabParamList,
  ConfigTabParamList,
} from '../types';

import { View, Text } from '../components/Themed';
import { TouchableOpacity } from 'react-native-gesture-handler';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();
export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].background,
        activeBackgroundColor: Colors[colorScheme].tint,
        inactiveBackgroundColor: Colors[colorScheme].secondary,
        inactiveTintColor: Colors[colorScheme].tintSecondary,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="ios-home" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Scenes"
        component={ScenesTabNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="ios-apps" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Config"
        component={ConfigTabNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="ios-settings" color={color} size={size} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string; size: number }) {
  return <Ionicons style={{ marginBottom: -3 }} {...props} />;
}

function TabBar({
  state,
  descriptors,
  navigation,
  activeBackgroundColor,
  inactiveBackgroundColor,
  activeTintColor = 'blue',
  inactiveTintColor = 'red',
}: BottomTabBarProps<BottomTabBarOptions>) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          // Maybe open a modal to access common actions.
          console.log('Long press detected.');
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}
            style={{
              flex: 1,
              width: 90,
              backgroundColor: isFocused
                ? activeBackgroundColor
                : inactiveBackgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                color: isFocused ? activeTintColor : inactiveTintColor,
                focused: isFocused,
                size: 30,
              })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const HomeStack = createStackNavigator<HomeTabParamList>();

function HomeTabNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

const ScenesStack = createStackNavigator<ScenesTabParamList>();

function ScenesTabNavigator() {
  return (
    <ScenesStack.Navigator screenOptions={{ headerShown: false }}>
      <ScenesStack.Screen name="ScenesScreen" component={ScenesScreen} />
    </ScenesStack.Navigator>
  );
}

const ConfigStack = createStackNavigator<ConfigTabParamList>();

function ConfigTabNavigator() {
  return (
    <ConfigStack.Navigator screenOptions={{ headerShown: false }}>
      <ConfigStack.Screen name="ConfigScreen" component={ConfigScreen} />
    </ConfigStack.Navigator>
  );
}
