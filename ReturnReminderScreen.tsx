// Import necessary libraries and components
import React from 'react';
import { SafeAreaView, Text, FlatList, Button, View, StyleSheet } from 'react-native';
import * as Calendar from 'expo-calendar';
import { transactions } from './utils/transactions';
import { createReminderForTransaction } from './utils/calendarUtils';
import { saveReminderToSupabase } from './utils/supabaseUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from './utils/supabaseUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReturnReminderScreen({ navigation }) {
  // State to store the results of created reminders
  const [reminderResults, setReminderResults] = React.useState<
    { store: string; reminderDate: string }[]
  >([]);

  // Request calendar permissions when the app loads
  React.useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access calendar is required!'); // Notify user if permission is not granted
      }
    })();
  }, []);

  // Function to handle creating reminders for all transactions
  // Updated handleCreateReminders to include itemType
  const handleCreateReminders = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      alert('User not logged in. Please log in again.');
      return;
    }

    const results = await Promise.all(
      transactions.map(async (tx) => {
        if (tx.reminderCreated) {
          return null; // Skip if a reminder has already been created
        }
        try {
          const reminderDate = await createReminderForTransaction(tx); // Create a reminder for the transaction
          if (reminderDate) {
            tx.reminderCreated = true; // Mark reminder as created

            // Save the reminder to Supabase with user association and item type
            await saveReminderToSupabase(userId, tx.store, reminderDate, tx.itemType || null);

            return { store: tx.store, lastReturnDate: reminderDate }; // Return the store and reminder date
          }
          return null; // Return null if no reminder was created
        } catch (error) {
          console.error(`Failed to create reminder for ${tx.store}:`, error); // Log any errors
          return null;
        }
      })
    );

    // Filter out successful reminders and update the state
    const successfulReminders = results.filter((r) => r !== null) as {
      store: string;
      lastReturnDate: string;
    }[];

    setReminderResults(successfulReminders);

    // Notify the user about the created reminders with a styled alert
    if (successfulReminders.length === 0) {
      alert('All reminders have already been created. Nothing new to notify.');
      return;
    }

    alert(
      `Reminders Created!\n\n` +
        successfulReminders
          .map((r) => `\u2022 ${r.store}: Reminder set for ${r.lastReturnDate}`)
          .join('\n')
    );
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to log out...');

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during Supabase logout:', error);
        alert('Failed to log out. Please try again.');
        return;
      }
      console.log('Supabase logout successful.');

      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      console.log('All AsyncStorage data cleared.');

      // Navigate to Login screen
      navigation.navigate('Login');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  React.useLayoutEffect(() => {
    if (navigation?.setOptions) {
      navigation.setOptions({
        headerLeft: () => null, // Remove the back button
      });
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Logout Icon */}
      <MaterialIcons
        name="logout"
        size={24}
        color="black"
        style={{ alignSelf: 'flex-end', margin: 16 }}
        onPress={handleLogout}
      />
      {/* App title */}
      <Text style={styles.title}>Return Reminder</Text>

      {/* List of transactions */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.store}</Text>
            <Text style={styles.itemText}>
              Transaction Date: {item.transactionDate}
            </Text>
            <Text style={styles.itemText}>
              Estimated Return Date: {item.estimatedReturnDate}
            </Text>
            {item.reminderCreated && (
              <Text style={styles.itemText}>Reminder Created</Text> // Indicate if a reminder was created
            )}
          </View>
        )}
      />

      {/* Button to create reminders */}
      <Button title="Create Return Reminders" onPress={handleCreateReminders} />

      {/* Display created reminders */}
      {reminderResults.length > 0 && (
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderTitle}>Created Reminders:</Text>
          {reminderResults.map((result, index) => (
            <Text key={index} style={styles.reminderText}>
              {result.store}: Reminder set for {result.reminderDate}
            </Text>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

// Styles for the app components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 14,
    color: '#555',
  },
  reminderContainer: {
    marginTop: 16,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderText: {
    fontSize: 14,
    color: '#555',
  },
});