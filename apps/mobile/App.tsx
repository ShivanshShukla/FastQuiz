import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QUIZ_CONSTANTS, type TopicSummary } from '@fastquiz/shared';

const SAMPLE_TOPICS: TopicSummary[] = [
  {
    id: 'topic-1',
    name: 'Arrays & Strings',
    description: 'Sliding window, two-pointer, hashing patterns.',
    total_quizzes: 5,
    free_attempt_available: true,
  },
  {
    id: 'topic-2',
    name: 'System Design Patterns',
    description: 'Load balancing, rate limiting, pub-sub messaging.',
    total_quizzes: 4,
    free_attempt_available: true,
  },
];

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>FastQuiz Mobile 📱</Text>
          <Text style={styles.subtitle}>
            Prep for interviews on the go. {QUIZ_CONSTANTS.FREE_ATTEMPTS_PER_TOPIC} free quiz per topic!
          </Text>
        </View>

        <Text style={styles.sectionHeader}>Featured Topics</Text>
        {SAMPLE_TOPICS.map((topic) => (
          <View key={topic.id} style={styles.card}>
            <Text style={styles.badge}>{topic.free_attempt_available ? 'FREE TRIAL' : 'PRO'}</Text>
            <Text style={styles.cardTitle}>{topic.name}</Text>
            <Text style={styles.cardDescription}>{topic.description}</Text>
            <Text style={styles.cardMeta}>{topic.total_quizzes} Quizzes available</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
});
