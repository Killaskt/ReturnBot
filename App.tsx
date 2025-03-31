import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoginScreen from './screens/LoginScreen';
import ReturnReminderScreen from './screens/ReturnReminderScreen';
import { EXPO_SUPABASE_URL, EXPO_SUPABASE_KEY } from '@env';

const supabaseUrl = EXPO_SUPABASE_URL!;
const supabaseKey = EXPO_SUPABASE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for mobile apps
  },
});

const Stack = createStackNavigator();

export default function App() {
  console.log('App is running...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing authentication...');

      // Check AsyncStorage for a saved session
      const savedSession = await AsyncStorage.getItem('supabase_session');
      if (savedSession) {
        console.log('Session retrieved from AsyncStorage:', JSON.parse(savedSession));
        const session = JSON.parse(savedSession);

        // Set the session in Supabase
        const { error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (error) {
          console.error('Error setting session in Supabase:', error);
        } else {
          console.log('Session successfully set in Supabase.');
          setUser(session.user);
          setLoading(false);
          return;
        }
      }

      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        console.log('Session retrieved:', session);
      }
      if (session?.user) {
        console.log('User is logged in:', session.user);
        setUser(session.user);
      } else {
        console.log('No user session found.');
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        console.log('User is logged in:', session.user);
        setUser(session.user);
      } else {
        console.log('User is logged out.');
        setUser(null);
      }
    });

    return () => {
      console.log('Cleaning up auth state change subscription...');
      subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) {
    return null; // Optionally, render a loading spinner here
  }

  console.log('Current user state:', user);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'ReturnReminder' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReturnReminder" component={ReturnReminderScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}