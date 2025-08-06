import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Event {
  id: string;
  time: string;
  title: string;
  date: string; // Added date field to associate events with specific days
}

// Mock events with dates for the week
const mockEvents: Event[] = [
  { id: '1', time: '9:00 AM', title: 'Water plants', date: '2025-08-04' },
  { id: '2', time: '1:00 PM', title: 'Fertilize garden', date: '2025-08-04' },
  { id: '3', time: '5:00 PM', title: 'Prune roses', date: '2025-08-05' },
  { id: '4', time: '10:00 AM', title: 'Plant seeds', date: '2025-08-06' },
  { id: '5', time: '2:00 PM', title: 'Water succulents', date: '2025-08-06' },
  { id: '6', time: '4:00 PM', title: 'Check soil moisture', date: '2025-08-06' },
  { id: '7', time: '11:00 AM', title: 'Harvest tomatoes', date: '2025-08-08' },
  { id: '8', time: '3:00 PM', title: 'Water herbs', date: '2025-08-08' },
];

const CalendarView: React.FC = () => {
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Function to get the current week's dates
  const getCurrentWeekDates = (): string[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    
    // Adjust to get Monday as start of week (1 = Monday, 0 = Sunday)
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(today.getDate() + diff);
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  // Function to get day name from date
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to get events for a specific date
  const getEventsForDate = (date: string): Event[] => {
    return mockEvents.filter(event => event.date === date);
  };

  // In a real app, fetch or filter events for selectedDate
  const eventsForSelectedDate = mockEvents.filter(event => event.date === selectedDate);
  const weekDates = getCurrentWeekDates();

  const renderWeekView = () => (
    <ScrollView style={styles.weekViewContainer}>
      {weekDates.map((date, index) => {
        const dayEvents = getEventsForDate(date);
        const dayName = getDayName(date);
        const dayNumber = new Date(date).getDate();
        const isToday = date === new Date().toISOString().split('T')[0];
        const isSelected = date === selectedDate;
        
        return (
          <View key={date} style={styles.weekDayRow}>
            {/* Left sidebar with day info */}
            <TouchableOpacity 
              style={[
                styles.dayColumn,
                isToday && styles.todayColumn,
                isSelected && styles.selectedColumn
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dayName,
                isToday && styles.todayText,
                isSelected && styles.selectedText
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                isToday && styles.todayText,
                isSelected && styles.selectedText
              ]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
            
            {/* Right side with events */}
            <View style={styles.eventsColumn}>
              {dayEvents.length === 0 ? (
                <View style={styles.noEventsPlaceholder}>
                  <Text style={styles.noEventsText}>No plants to water</Text>
                </View>
              ) : (
                dayEvents.map((event) => (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventText}>{event.time} - {event.title}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'week' && styles.activeButton]}
          onPress={() => setView('week')}
        >
          <Text style={[styles.toggleText, view === 'week' && styles.activeText]}>Week View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'day' && styles.activeButton]}
          onPress={() => setView('day')}
        >
          <Text style={[styles.toggleText, view === 'day' && styles.activeText]}>Day View</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar container */}
      <View style={styles.calendarContainer}>
        {view === 'day' ? (
          <>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#007AFF' },
              }}
              hideExtraDays={true}
              disableMonthChange={true}
              firstDay={1}
              style={{ height: 350 }}
            />
            
            {/* Below calendar: Event list for day view */}
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Events on {selectedDate}</Text>
              {eventsForSelectedDate.length === 0 ? (
                <Text style={styles.noEventsText}>No events for this day</Text>
              ) : (
                <FlatList
                  data={eventsForSelectedDate}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.eventItem}>
                      <Text style={styles.eventText}>{item.time} - {item.title}</Text>
                    </View>
                  )}              
                />
              )}
            </View>
          </>
        ) : (
          renderWeekView()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 32, backgroundColor: '#fff' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  activeButton: { backgroundColor: '#007AFF' },
  toggleText: { color: '#444', fontWeight: '600' },
  activeText: { color: '#fff' },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // New styles for custom week view
  weekViewContainer: {
    flex: 1,
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 2,
    minHeight: 60,
  },
  dayColumn: {
    width: 80,
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  todayColumn: {
    backgroundColor: '#e3f2fd',
  },
  selectedColumn: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  todayText: {
    color: '#1976d2',
  },
  selectedText: {
    color: '#fff',
  },
  eventsColumn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
  },
  noEventsPlaceholder: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  // Updated styles for events and day view
  eventsContainer: {
    marginTop: 16,
    flex: 1,
  },
  eventsTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  noEventsText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
  },
  eventItem: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CalendarView;