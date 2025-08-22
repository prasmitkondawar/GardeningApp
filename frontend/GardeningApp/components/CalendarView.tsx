import supabase from '@/config/supabase';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';

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
  const todayDate = new Date();
  const today = todayDate.getFullYear() + "-" +
    String(todayDate.getMonth() + 1).padStart(2, '0') + "-" +
    String(todayDate.getDate()).padStart(2, '0');


  // Function to get the current week's dates
  const getCurrentWeekDates = (): string[] => {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Calculate difference to Monday (1)
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
    // Get the Monday of the current week in local time
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diffToMonday);
  
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(startOfWeek);
      tempDate.setDate(startOfWeek.getDate() + i);
  
      // Build local YYYY-MM-DD string for tempDate
      const localDate = tempDate.getFullYear() + "-" +
        String(tempDate.getMonth() + 1).padStart(2, '0') + "-" +
        String(tempDate.getDate()).padStart(2, '0');
  
      weekDates.push(localDate);
    }
    return weekDates;
  };  
  

  useEffect(() => {
    fetchSchedule();
    console.log("EVENTS", events);
  }, []);

  // Function to get day name from date
  const getDayName = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
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
        const isToday = date === today;
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
                  <View key={event.ScheduleID} style={styles.eventItem}>
                    <Text style={styles.eventText}></Text>
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
      const data = json.schedule ?? [];
      console.log(data);
      const mappedData = data.map((item: any) => ({
        PlantPetName: item.plant_pet_name,
        PlantID: item.plant_id,
        WateringDate: new Date(item.watering_date), // Convert string to Date object
        WaterIsCompleted: item.water_is_completed,
        ScheduleID: item.scheduleid,
      }));
      setEvents(mappedData);
      return mappedData;

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
                  keyExtractor={(item, index) => (item.ScheduleID ? item.ScheduleID.toString() : index.toString())}
                  renderItem={({ item }) => (
                    item.WateringDate.toISOString().split('T')[0] === today ? (  
                      <View style={styles.eventItem}>
                        <Text style={styles.eventText}>Water {item.PlantPetName}</Text>
                      </View>
                    ) : (
                      <View style={[styles.eventItem, { backgroundColor: '#ff4433' }]}>
                        <Text style={[styles.eventText, { color: '#8b0000' }]}>Water {item.PlantPetName}</Text>
                      </View>

                    )
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 65,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 7,
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
    borderRadius: 15,
    minWidth: 108,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 2,
    marginRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#7abf76',
    shadowOpacity: 0.13,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  eventDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#388e3c',
  },
  eventText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
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
});

export default CalendarView;