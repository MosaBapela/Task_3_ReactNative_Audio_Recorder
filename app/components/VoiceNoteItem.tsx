import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { VoiceNote } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { formatDuration } from '../utils/timeFormatter';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceNoteItemProps {
  note: VoiceNote;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onPress: () => void;
}

export const VoiceNoteItem: React.FC<VoiceNoteItemProps> = ({
  note,
  isPlaying,
  onPlay,
  onDelete,
  onPress,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.date}>{formatDate(note.date)}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.waveformContainer}>
        <WaveformVisualizer isActive={isPlaying} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.duration}>{formatDuration(note.duration)}</Text>
        <TouchableOpacity onPress={onPlay} style={styles.playButton}>
          <Feather name={isPlaying ? 'pause' : 'play'} size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 4 },
  date: { fontSize: 12, color: COLORS.tertiary },
  deleteButton: { padding: 4 },
  waveformContainer: { marginVertical: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: { fontSize: 14, color: COLORS.secondary, fontWeight: '500' },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
