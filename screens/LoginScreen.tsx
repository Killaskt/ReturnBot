import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../utils/supabaseUtils';
import Constants from 'expo-constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  EmailConfirmation: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    console.log('Attempting to sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign-in failed:', error.message);
      setError(error.message);
      Alert.alert('Login Failed', error.message);
    } else {
      console.log('Sign-in successful! Saving session to AsyncStorage.');
      await AsyncStorage.setItem('supabase_session', JSON.stringify(data.session));
      console.log('Session saved to AsyncStorage:', data.session);
      Alert.alert('Login Successful', 'You have successfully logged in!');
      navigation.navigate('ReturnReminder');
    }
  };

  const handleSignUp = async () => {
    try {
      // Dynamically get the IP address of the Metro server or fallback to a hardcoded IP
      const debuggerHost = Constants.manifest?.debuggerHost?.split(':')[0];
      const redirectUrl = debuggerHost
        ? `http://${debuggerHost}:8081/email-confirmation` // Use Metro's correct port (8081)
        : 'http://192.168.68.86:8081/email-confirmation'; // Replace with your Metro server IP
  
      console.log('Debugger Host:', debuggerHost);
      console.log('Redirect URL:', redirectUrl);
  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
  
      if (error) {
        console.error('Sign Up Failed:', error.message);
        setError(error.message);
        Alert.alert('Sign Up Failed', error.message);
      } else {
        console.log('Sign Up Successful:', data);
        Alert.alert('Sign Up Successful', 'Please check your email to confirm your account.');
        navigation.navigate('EmailConfirmation');
      }
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      Alert.alert('Sign Up Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;