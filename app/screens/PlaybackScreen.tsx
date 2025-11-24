import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { COLORS } from '../constants/colors';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import storageService from '../services/storageService';
import { VoiceNote } from '../types';
import { formatDate } from '../utils/dateFormatter';
import { formatTime } from '../utils/timeFormatter';

export const PlaybackScreen = ({ route, navigation }: any) => {
  const { note } = route.params as { note: VoiceNote };
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const {
    isPlaying,
    currentPosition,
    duration,
    startPlayback,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    seekTo,
    playbackSpeed,
    changePlaybackSpeed,
  } = useAudioPlayer();

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await pausePlayback();
      } else if (currentPosition > 0 && currentPosition < duration) {
        await resumePlayback();
      } else {
        await startPlayback(note.uri, note.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const handleStop = async () => {
    try {
      await stopPlayback();
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handleSeek = async (value: number) => {
    try {
      await seekTo(value);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handleSaveTitle = async () => {
    try {
      if (editedTitle.trim() !== note.title) {
        await storageService.updateVoiceNote(note.id, { title: editedTitle.trim() });
        note.title = editedTitle.trim();
      }
      setIsEditingTitle(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update title');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await stopPlayback();
              await storageService.deleteVoiceNote(note.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recording');
            }
          },
        },
      ]
    );
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const currentSpeedIndex = speeds.indexOf(playbackSpeed);

  const cycleSpeed = async () => {
    const nextIndex = (currentSpeedIndex + 1) % speeds.length;
    await changePlaybackSpeed(speeds[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          {isEditingTitle ? (
            <View style={styles.titleEditContainer}>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                autoFocus
                onSubmitEditing={handleSaveTitle}
                onBlur={handleSaveTitle}
                maxLength={50}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={styles.title}>{note.title}</Text>
              <Feather name="edit-2" size={16} color={COLORS.light} style={styles.editIcon} />
            </TouchableOpacity>
          )}
          <Text style={styles.date}>{formatDate(note.date)}</Text>
        </View>

        <View style={styles.waveformContainer}>
          <WaveformVisualizer isActive={isPlaying} height={80} />
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || note.duration}
            value={currentPosition}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={COLORS.tertiary}
            maximumTrackTintColor={COLORS.light}
            thumbTintColor={COLORS.tertiary}
          />
          <Text style={styles.timeText}>{formatTime(duration || note.duration)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={cycleSpeed} style={styles.speedButton}>
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSeek(Math.max(0, currentPosition - 15))}
            style={styles.skipButton}
          >
            <Feather name="rotate-ccw" size={28} color={COLORS.white} />
            <Text style={styles.skipText}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Feather name={isPlaying ? 'pause' : 'play'} size={40} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSeek(Math.min(duration, currentPosition + 15))}
            style={styles.skipButton}
          >
            <Feather name="rotate-cw" size={28} color={COLORS.white} />
            <Text style={styles.skipText}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
            <Feather name="square" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formatTime(note.duration)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>
              {(note.fileSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  deleteButton: { padding: 8 },
  content: { flex: 1, paddingHorizontal: 30 },
  titleContainer: { alignItems: 'center', marginBottom: 40 },
  titleEditContainer: { width: '100%' },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    paddingVertical: 8,
  },
  title: { fontSize: 24, fontWeight: '600', color: COLORS.white, textAlign: 'center' },
  editIcon: { marginTop: 8, alignSelf: 'center' },
  date: { fontSize: 14, color: COLORS.light, marginTop: 8 },
  waveformContainer: { marginVertical: 30 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  slider: { flex: 1, marginHorizontal: 12 },
  timeText: { fontSize: 14, color: COLORS.light, fontWeight: '500' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  speedButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: 10, color: COLORS.white, position: 'absolute', bottom: 8 },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 12, color: COLORS.light, marginBottom: 4 },
  infoValue: { fontSize: 16, color: COLORS.white, fontWeight: '600' },
});