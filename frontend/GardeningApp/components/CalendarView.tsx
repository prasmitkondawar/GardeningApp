import supabase from '@/config/supabase';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Switch } from 'react-native';

interface Event {
  ScheduleID: number;
  PlantID: number;
  PlantPetName: string;
  WaterIsCompleted: boolean;
  WateringDate: Date;
  
}

const CalendarView: React.FC = () => {
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<Event[]>([]);
  const today = new Date().toISOString().split('T')[0];

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

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Function to get day name from date
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to get events for a specific date
  const getEventsForDate = (date: string): Event[] => {
    return events.filter(event => 
      event.WateringDate && event.WateringDate.toISOString().split('T')[0] === date
    );
  };
  
  // In a real app, fetch or filter events for selectedDate
  const eventsForSelectedDate = events.filter(event =>
    event.WateringDate && event.WateringDate.toISOString().split('T')[0] === selectedDate
  ); 
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
                dayEvents.map(event => (
                  <View key={event.ScheduleID} style={styles.eventItem}>
                    <Text style={styles.eventText}>Water {event.PlantPetName}</Text>
                  </View>
                ))                
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  async function fetchSchedule() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('https://gardeningapp.onrender.com/fetch-schedule', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      console.log(json);
      const data = json.schedule;
      const mappedData = data.map((item: any) => ({
        ScheduleID: item.schedule_id,
        PlantID: item.plant_id,
        PlantPetName: item.plant_pet_name,
        WaterIsCompleted: item.water_is_completed,
        WateringDate: new Date(item.watering_date),
      }));
      setEvents(mappedData);

    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async function updateCompletion(scheduleID: number, newValue: boolean) {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.ScheduleID === scheduleID ? { ...event, WaterIsCompleted: newValue } : event
      )
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('https://gardeningapp.onrender.com/update-completion', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_id: scheduleID,
          water_is_completed: newValue,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  return (
    <View style={styles.container}>
      {/* Toggle buttons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CALENDAR</Text>
      </View>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'day' && styles.activeButton]}
          onPress={() => setView('day')}
        >
          <Text style={[styles.toggleText, view === 'day' && styles.activeText]}>Day View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'week' && styles.activeButton]}
          onPress={() => setView('week')}
        >
          <Text style={[styles.toggleText, view === 'week' && styles.activeText]}>Week View</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar container */}
      <View style={styles.calendarContainer}>
        {view === 'day' ? (
          <>
            {/* Below calendar: Event list for day view */}
            <View style={styles.eventsContainer}>
              {eventsForSelectedDate.length === 0 ? (
                <Text style={styles.noEventsText}>No events for this day</Text>
              ) : (
                <FlatList
                  data={eventsForSelectedDate}
                  keyExtractor={(item) => item.ScheduleID.toString()}
                  renderItem={({ item }) => {
                    const isToday = item.WateringDate.toISOString().split('T')[0] === today;

                    return (
                      <View
                        style={[
                          styles.eventItem,
                          isToday ? styles.todayEventItem : styles.overdueEventItem,
                        ]}
                      >
                      <Switch
                        value={item.WaterIsCompleted}
                        onValueChange={(newValue) => updateCompletion(item.ScheduleID, newValue)}
                        thumbColor={item.WaterIsCompleted ? '#4caf50' : '#f4f3f4'}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        style={{ marginRight: 12 }}
                      />

                        <Text
                          style={[
                            styles.eventText,
                            item.WaterIsCompleted && {
                              textDecorationLine: 'line-through',
                              color: '#8BC34A', // Optional: lighten or change color for completed
                            },
                            !isToday && !item.WaterIsCompleted && styles.overdueEventText,
                          ]}
                        >
                          Water {item.PlantPetName || 'Unknown'}
                        </Text>
                      </View>
                    );
                  }}
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 32,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: '#f3f6fc',
    marginHorizontal: 8,
    elevation: 0,
  },
  activeButton: {
    backgroundColor: '#007AFF',
    elevation: 2,
    shadowColor: '#0163b2',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  toggleText: { color: '#444', fontWeight: '600', fontSize: 15 },
  activeText: { color: '#fff' },
  calendarContainer: { flex: 1, paddingHorizontal: 10 },
  
  weekViewContainer: { flex: 1, paddingTop: 4 },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#bbb',
    shadowOpacity: 0.09,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  dayColumn: {
    width: 70,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafe',
    borderRightWidth: 1,
    borderRightColor: '#f1f4f8',
  },
  todayColumn: {
    backgroundColor: '#e3f1fd',
  },
  selectedColumn: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7a7e87',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a3555',
  },
  todayText: { color: '#1976d2' },
  selectedText: { color: '#fff' },
  eventsColumn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,        // Add horizontal padding to control inside spacing
    paddingVertical: 8,
    borderRadius: 16,
    // No overflow hidden needed typically
  },
  noEventsPlaceholder: {
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    // backgroundColor: '#f7fafe'
  },
  noEventsText: {
    fontStyle: 'italic',
    color: '#bbc1cd',
    fontSize: 14,
    textAlign: 'center',
  },

  // Event pill
  eventItem: {
    backgroundColor: '#4caf50',
    borderRadius: 10,             // Slightly smaller border radius
    paddingVertical: 6,           // Reduce vertical padding
    paddingHorizontal: 16,        // Slightly less horizontal padding
    marginVertical: 4,            // Smaller vertical margin between events
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',         // Full width but constrained by parent
    shadowColor: '#2e7d32',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  
  eventDot: {
    width: 10,                    // Slightly smaller dot
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#388e3c',
    flexShrink: 0,
  },
  
  eventText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },  
  // For day view
  eventsContainer: {
    marginTop: 16,
    flex: 1,
    paddingBottom: 40,
  },
  eventsTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
    color: '#263357',
    letterSpacing: 0.1,
  },
  header: {
    paddingTop: 70, // space for status bar
    paddingBottom: 16,
    backgroundColor: '#ffb6c1', // light blue, change as needed
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C4857',
  },
  dayHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7fafe',
    marginBottom: 10,
  },
  dayHeaderText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#263357',
    textAlign: 'center',
  },
  noEventsWrapper: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  todayEventItem: {
    backgroundColor: '#4caf50',
  },
  overdueEventItem: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ff4433',
    borderWidth: 1,
  },
  overdueEventText: {
    color: '#8b0000',
  },
  
});

export default CalendarView;