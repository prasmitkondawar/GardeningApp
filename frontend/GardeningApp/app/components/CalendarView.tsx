import supabase from '@/config/supabase';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Event {
  ScheduleID: number;
  PlantID: number;
  PlantPetName: string;
  WaterIsCompleted: boolean;
  WateringDate: Date;
  NextWateringDate: Date;
  WaterRepeatEvery: number;
  WaterRepeatUnit: string;
}

const CalendarView: React.FC = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [view, setView] = useState<'week' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [events, setEvents] = useState<Event[]>([]);
  const todayDate = new Date();
  const today = todayDate.getFullYear() + "-" +
    String(todayDate.getMonth() + 1).padStart(2, '0') + "-" +
    String(todayDate.getDate()).padStart(2, '0');


  // Function to get the current week's dates
  const getCurrentWeekDates = (): string[] => {
    const today = new Date(); // now in local time
    // Get today's UTC info
    const utcYear = today.getUTCFullYear();
    const utcMonth = today.getUTCMonth();
    const utcDate = today.getUTCDate();
    const currentDay = today.getUTCDay();

    // Calculate Monday in UTC
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(Date.UTC(utcYear, utcMonth, utcDate + diffToMonday));

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(startOfWeek);
      tempDate.setUTCDate(startOfWeek.getUTCDate() + i);
      const localDate = tempDate.getUTCFullYear() + "-" +
        String(tempDate.getUTCMonth() + 1).padStart(2, '0') + "-" +
        String(tempDate.getUTCDate()).padStart(2, '0');
      weekDates.push(localDate);
    }
    return weekDates;
  };  
  

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Function to get day name from date
  const getDayName = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to get events for a specific date
  const getEventsForDate = (date: string): Event[] => {
    return events.filter(event => {
      const nextWateringDateStr = event.NextWateringDate ? event.NextWateringDate.toISOString().split('T')[0] : null;
      const wateringDateStr = event.WateringDate ? (typeof event.WateringDate === 'string' ? event.WateringDate : event.WateringDate.toISOString().split('T')[0]) : null;
  
      return (nextWateringDateStr === date) || (wateringDateStr === date);
    });
  };
  
  // In a real app, fetch or filter events for selectedDate
  const eventsForSelectedDate = events.filter(event => {
    const nextWateringDateStr = event.NextWateringDate ? event.NextWateringDate.toISOString().split('T')[0] : null;
    const wateringDateStr = event.WateringDate ? (typeof event.WateringDate === 'string' ? event.WateringDate : event.WateringDate.toISOString().split('T')[0]) : null;
  
    return (nextWateringDateStr && nextWateringDateStr <= selectedDate) || (wateringDateStr && wateringDateStr <= selectedDate);
  });

  console.log("EVENTS FOR SELECTED DATE", eventsForSelectedDate);
  const weekDates = getCurrentWeekDates();

  const renderWeekView = () => (
    <ScrollView style={styles.weekViewContainer}>
      {weekDates.map((date, index) => {
        const dayEvents = getEventsForDate(date);
        const dayName = getDayName(date);
        const tempDate = new Date(date + 'T00:00:00Z');  // Parse as UTC midnight
        const dayNumber = tempDate.getUTCDate();         // Get UTC day number

        const isToday = date === today;
        const isOverdue = date < today;
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
                  <View
                    key={event.ScheduleID}
                    style={[
                      styles.eventItemWeek,
                      // Check if event is overdue, apply red background
                      isOverdue ? styles.overdueEvent : null,
                    ]}
                  >
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
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

      const response = await fetch(`${baseUrl}/schedules`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      console.log("SCHEDULE FETCH", json);
      const data = json.schedule ?? [];
      const mappedData = data.map((item: any) => ({
        PlantPetName: item.plant_pet_name,
        PlantID: item.plant_id,
        WateringDate: new Date(item.watering_date), // Convert string to Date object
        NextWateringDate: new Date(item.next_watering_date),
        WaterIsCompleted: item.water_is_completed,
        WaterRepeatEvery: 1,
        WaterRepeatUnit: "test",
        ScheduleID: item.schedule_id,
      }));
      setEvents(mappedData);
      console.log(mappedData);
      return mappedData;

    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async function updateCompletion(scheduleID: number, newValue: boolean, water_repeat_every: number, water_repeat_unit: string) {


    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

      const response = await fetch(`${baseUrl}/schedules/${scheduleID}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error completing schedule:', error);
      throw error;
    }
  }

  return (
    <View style={styles.container}>
      {/* Toggle buttons */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>📅</Text>
          <Text style={styles.headerTitle}>CALENDAR</Text>
        </View>
        <Text style={styles.headerSubtitle}>Your Garden's Schedule</Text>
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
                  renderItem={({ item }) => {
                    const wateringDateStr = item.NextWateringDate.toISOString().split('T')[0];
                    let isToday = wateringDateStr === today;
                    let isOverdue = wateringDateStr < today;
                    let isClickedToday = item.WateringDate.toISOString().split('T')[0] === today
                    console.log(item.WaterIsCompleted);
                    if (isClickedToday && item.WaterIsCompleted == false) {
                      isClickedToday = false;
                      isToday = true;
                    }
                    return isToday || isOverdue || isClickedToday? (
                      <View
                        style={[
                          styles.eventItemDay,
                          {
                            backgroundColor: isOverdue
                            ? '#ff4433'        // overdue red
                            : item.WaterIsCompleted
                              ? '#4f4f4f'      // completed today (grey)
                              : '#4caf50',     // default green for incomplete                          
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.eventText,
                            { color: '#ffffff' },
                            isClickedToday && { textDecorationLine: 'line-through' }
                          ]}
                        >
                          Water {item.PlantPetName}
                        </Text>

                        <TouchableOpacity
                          style={[styles.checkbox, item.WaterIsCompleted && styles.checkedBox]}
                          onPress={() => {
                            setEvents(prevEvents =>
                              prevEvents.map(ev =>
                                ev.ScheduleID === item.ScheduleID
                                  ? { ...ev, WaterIsCompleted: !ev.WaterIsCompleted }
                                  : ev
                              )
                            );
                            updateCompletion(item.ScheduleID, item.WaterIsCompleted, item.WaterRepeatEvery, item.WaterRepeatUnit);
                          }}
                        >
                          {item.WaterIsCompleted && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                      </View>
                    ) : null; // do not render items for future dates in this list
                  }}                  

                />
              )}
            </View>
          </>
        ) : (
          renderWeekView()
        )}

      </View>
      
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/PlantDirectory')}
        >
          <Ionicons name="folder" size={24} color={pathName === "/PlantDirectory" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/PlantDirectory" && styles.activeNavLabel]}>Plants</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/components/CameraScreen')}
        >
          <Ionicons name="camera" size={24} color={pathName === "/components/CameraScreen" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/components/CameraScreen" && styles.activeNavLabel]}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/components/CalendarView')}
        >
          <Ionicons name="calendar" size={24} color={pathName === "/components/CalendarView" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/components/CalendarView" && styles.activeNavLabel]}>Calendar</Text>
        </TouchableOpacity>
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
    flexDirection: 'column',  // stack events vertically downwards
    // Remove flexWrap if existed
    // flexWrap: 'wrap',        // remove this line if it exists
    alignItems: 'stretch',    // stretch items to fill width
    minHeight: 65,
    backgroundColor: '#fff',
    paddingHorizontal: 10,        // Add horizontal padding to control inside spacing
    paddingVertical: 8,
    // remove gap property if using React Native version that doesn't support it
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
  eventItemDay: {
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
    minHeight: 50,
  },
  eventItemWeek: {
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
    paddingBottom: 25,
    paddingTop: 75,
    paddingLeft: 0,
    paddingRight: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffbb00', // fallback
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 12,
    fontSize: 32,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '300',
    paddingLeft: 30,
    letterSpacing: 1,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkmark: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overdueEvent: {
    backgroundColor: '#ff3b30', // red color
    borderRadius: 8,
    padding: 6,
    marginVertical: 2,
  },
  
  // Navigation Bar
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#007AFF',
  },
});

export default CalendarView;