import * as Calendar from 'expo-calendar';
import { Alert } from 'react-native';

// Function to request permissions for Calendar and Reminders
const requestPermissions = async () => {
  // Request Calendar permissions
  const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
  if (calendarStatus !== 'granted') {
    alert('Permission to access the calendar is required!');
    return false;
  }

  // Request Reminders permissions (iOS-specific)
  const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();
  if (remindersStatus !== 'granted') {
    alert('Permission to access reminders is required!');
    return false;
  }

  return true;
};

// Function to create a calendar event for a transaction
export const createReminderForTransaction = async (tx: {
  store: string;
  transactionDate: string;
  returnWindowDays: number;
}) => {
  const hasPermissions = await requestPermissions();
  if (!hasPermissions) {
    return null;
  }

  const calendars = await Calendar.getCalendarsAsync();
  const modifiableCalendars = calendars.filter((c) => c.allowsModifications);

  if (modifiableCalendars.length === 0) {
    alert('No calendars available that allow modifications.');
    return null;
  }

  const selectedCalendarId = modifiableCalendars.length === 1
    ? modifiableCalendars[0].id
    : await new Promise<string | null>((resolve) => {
        Alert.alert(
          'Select Calendar',
          `Choose a calendar to add the event:`,
          modifiableCalendars.map((c) => ({
            text: c.title,
            onPress: () => resolve(c.id),
          })),
          { cancelable: true, onDismiss: () => resolve(null) }
        );
      });

  if (!selectedCalendarId) {
    alert('No calendar selected.');
    return null;
  }

  const returnDate = new Date(tx.transactionDate);
  returnDate.setDate(returnDate.getDate() + tx.returnWindowDays);

  await Calendar.createEventAsync(selectedCalendarId, {
    title: `Last day to return ${tx.store} purchase`,
    startDate: returnDate,
    endDate: new Date(returnDate.getTime() + 30 * 60 * 1000), // 30-minute event
    notes: `Return window ends for your purchase at ${tx.store}`,
    timeZone: 'UTC',
  });

  return returnDate.toISOString().split('T')[0]; // Return the reminder date
};