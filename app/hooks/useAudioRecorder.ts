import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import audioService from '../services/audioService';
import storageService from '../services/storageService';
import { VoiceNote } from '../types';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' && isRecording) {
        pauseRecording();
      }
    });

    return () => {
      subscription.remove();
      if (isRecording) stopRecording();
    };
  }, [isRecording]);

  const startRecording = async (quality: 'low' | 'medium' | 'high' = 'high') => {
    try {
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) throw new Error('Microphone permission denied');

      const uri = await audioService.startRecording(quality);
      setRecordingUri(uri);
      setIsRecording(true);
      setIsPaused(false);
      setCurrentTime(0);

      audioService.onRecordingProgress((status) => {
        if (status.isRecording) {
          setCurrentTime(Math.floor(status.durationMillis / 1000));
        }
      });
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  };

  const stopRecording = async (title: string = 'New Recording'): Promise<VoiceNote | null> => {
    try {
      const uri = await audioService.stopRecording();
      setIsRecording(false);
      setIsPaused(false);

      if (!uri) return null; // No recording was in progress

      let fileSize = 0;
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        fileSize = fileInfo.exists ? fileInfo.size : 0;
      }

      const note: VoiceNote = {
        id: Date.now().toString(),
        title,
        duration: currentTime,
        date: new Date(),
        uri,
        fileSize,
      };

      await storageService.saveVoiceNote(note);
      setCurrentTime(0);
      setRecordingUri(null);

      return note;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  };

  const pauseRecording = async () => {
    try {
      await audioService.pauseRecording();
      setIsPaused(true);
    } catch (error) {
      console.error('Pause recording error:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      await audioService.resumeRecording();
      setIsPaused(false);
    } catch (error) {
      console.error('Resume recording error:', error);
    }
  };

  const cancelRecording = async () => {
    try {
      await audioService.stopRecording();
      if (recordingUri && Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(recordingUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(recordingUri);
        }
      }
      setIsRecording(false);
      setIsPaused(false);
      setCurrentTime(0);
      setRecordingUri(null);
    } catch (error) {
      console.error('Cancel recording error:', error);
    }
  };

  return {
    isRecording,
    isPaused,
    currentTime,
    recordingUri,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  };
};