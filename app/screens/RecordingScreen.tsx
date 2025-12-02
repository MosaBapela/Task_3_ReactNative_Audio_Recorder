import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RecordButton from '../components/RecordButton';
import { COLORS } from '../constants/colors';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import storageService from '../services/storageService';
import { formatTime } from '../utils/timeFormatter';

const RecordingScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');

  const {
    isRecording,
    isPaused,
    currentTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useAudioRecorder();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await storageService.getSettings();
    setQuality(settings.recordingQuality);
  };

  const handleStartStop = async () => {
    if (isRecording) {
      try {
        const recordingTitle = title.trim() || `Recording ${new Date().toLocaleDateString()}`;
        await stopRecording(recordingTitle);
        Alert.alert('Success', 'Recording saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save recording');
      }
    } else {
      try {
        await startRecording(quality);
      } catch (error) {
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pause/resume recording');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Recording',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Continue Recording', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await cancelRecording();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelImmediate = async () => {
    try {
      await cancelRecording();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel recording');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isRecording) {
              handleCancel();
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Recording</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, isRecording && styles.timerCircleActive]}>
            <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
          </View>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                {isPaused ? 'Paused' : 'Recording...'}
              </Text>
            </View>
          )}
        </View>

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Add title..."
          placeholderTextColor={COLORS.light}
          editable={!isRecording}
          maxLength={50}
        />

        <View style={styles.controls}>
          {isRecording && (
            <TouchableOpacity onPress={handlePauseResume} style={styles.controlButton}>
              <Feather
                name={isPaused ? 'play' : 'pause'}
                size={28}
                color={COLORS.white}
              />
            </TouchableOpacity>
          )}

          <RecordButton isRecording={isRecording} onPress={handleStartStop} size={80} />

          {isRecording && (
            <TouchableOpacity onPress={handleCancelImmediate} style={styles.controlButton}>
              <Feather name="x" size={28} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {!isRecording && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Tap the microphone to start recording
            </Text>
            <View style={styles.qualityBadge}>
              <Text style={styles.qualityText}>Quality: {quality.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  placeholder: { width: 40 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  timerContainer: { alignItems: 'center', marginBottom: 40 },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(151, 202, 219, 0.1)',
    borderWidth: 3,
    borderColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleActive: {
    borderColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  timerText: { fontSize: 48, fontWeight: '300', color: COLORS.white },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },
  recordingText: { fontSize: 16, color: COLORS.white, fontWeight: '500' },
  titleInput: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: { alignItems: 'center', marginTop: 40 },
  instructionsText: {
    fontSize: 14,
    color: COLORS.light,
    textAlign: 'center',
    marginBottom: 12,
  },
  qualityBadge: {
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qualityText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
});

export default RecordingScreen;
