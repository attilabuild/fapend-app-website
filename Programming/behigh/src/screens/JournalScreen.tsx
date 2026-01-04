import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface JournalScreenProps {
  onViewEntry: (entry: any) => void;
}

export default function JournalScreen({ onViewEntry }: JournalScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  
  const journalEntries = [
    { id: 1, title: 'Morning Thoughts', date: '2025-11-20', duration: '2:34', preview: 'Had a great morning session...', transcript: 'Full transcript here...' },
    { id: 2, title: 'Evening Reflection', date: '2025-11-19', duration: '1:45', preview: 'Reflecting on today...', transcript: 'Full transcript here...' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Journal</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Recording Button */}
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={() => setIsRecording(!isRecording)}
        >
          <Ionicons 
            name={isRecording ? "stop-circle" : "mic"} 
            size={48} 
            color={isRecording ? "#ff0000" : "#00ff88"} 
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {/* Journal Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Your Entries</Text>
          {journalEntries.map((entry) => (
            <TouchableOpacity 
              key={entry.id} 
              style={styles.entryCard}
              onPress={() => onViewEntry(entry)}
            >
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryDuration}>{entry.duration}</Text>
              </View>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <Text style={styles.entryPreview} numberOfLines={2}>{entry.preview}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  recordButton: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  recordingButton: {
    borderColor: '#ff0000',
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  entriesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  entryDuration: {
    fontSize: 14,
    color: '#00ff88',
  },
  entryDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});
