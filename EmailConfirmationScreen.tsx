import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const EmailConfirmationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Email</Text>
      <Text style={styles.message}>
        A confirmation link has been sent to your email address. Please check your inbox and click the link to verify your email.
      </Text>
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
});

export default EmailConfirmationScreen;