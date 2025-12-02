import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { AppSettings, VoiceNote } from '../types';

const VOICE_NOTES_KEY = '@voice_notes';
const SETTINGS_KEY = '@app_settings';
const AUDIO_DIR = `${FileSystem.documentDirectory}VoiceNotes/`;

class StorageService {
  constructor() {
    this.initializeStorage();
  }

  async initializeStorage() {
    if (Platform.OS === 'web') return; // Skip on web
    try {
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  async saveVoiceNote(note: VoiceNote): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Convert blob to base64 data URL
        const response = await fetch(note.uri);
        const blob = await response.blob();
        const base64 = await this.blobToBase64(blob);
        note.uri = base64;
        note.fileSize = base64.length; // Approximate size
      }
      const notes = await this.getAllVoiceNotes();
      notes.unshift(note);
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Save voice note error:', error);
      throw error;
    }
  }

  async getAllVoiceNotes(): Promise<VoiceNote[]> {
    try {
      const data = await AsyncStorage.getItem(VOICE_NOTES_KEY);
      if (!data) return [];
      const notes = JSON.parse(data);
      return notes.map((note: any) => ({
        ...note,
        date: new Date(note.date)
      }));
    } catch (error) {
      console.error('Get voice notes error:', error);
      return [];
    }
  }

  async deleteVoiceNote(id: string): Promise<void> {
    try {
      const notes = await this.getAllVoiceNotes();
      const noteToDelete = notes.find(n => n.id === id);

      if (noteToDelete && Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(noteToDelete.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(noteToDelete.uri);
        }
      }

      const updatedNotes = notes.filter(n => n.id !== id);
      await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Delete voice note error:', error);
      throw error;
    }
  }

  async updateVoiceNote(id: string, updates: Partial<VoiceNote>): Promise<void> {
    try {
      const notes = await this.getAllVoiceNotes();
      const index = notes.findIndex(n => n.id === id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates };
        await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Update voice note error:', error);
      throw error;
    }
  }

  async searchVoiceNotes(query: string): Promise<VoiceNote[]> {
    try {
      const notes = await this.getAllVoiceNotes();
      return notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!data) {
        return {
          recordingQuality: 'high',
          playbackSpeed: 1.0,
          autoDelete: false,
          autoDeleteDays: 30
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        recordingQuality: 'high',
        playbackSpeed: 1.0,
        autoDelete: false,
        autoDeleteDays: 30
      };
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Save settings error:', error);
      throw error;
    }
  }

  async exportBackup(): Promise<string> {
    try {
      const notes = await this.getAllVoiceNotes();
      const settings = await this.getSettings();

      const backup = {
        notes,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      if (Platform.OS === 'web') {
        return JSON.stringify(backup); // Return JSON string on web
      } else {
        const backupPath = `${AUDIO_DIR}backup_${Date.now()}.json`;
        await FileSystem.writeAsStringAsync(backupPath, JSON.stringify(backup));
        return backupPath;
      }
    } catch (error) {
      console.error('Export backup error:', error);
      throw error;
    }
  }

  async importBackup(uri: string): Promise<void> {
    try {
      let content: string;
      if (Platform.OS === 'web') {
        content = uri; // uri is the JSON string on web
      } else {
        content = await FileSystem.readAsStringAsync(uri);
      }
      const backup = JSON.parse(content);
      if (backup.notes) {
        await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(backup.notes));
      }
      if (backup.settings) {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(backup.settings));
      }
    } catch (error) {
      console.error('Import backup error:', error);
      throw error;
    }
  }

  getAudioDirectory(): string {
    return AUDIO_DIR;
  }

  async getStorageInfo() {
    try {
      const notes = await this.getAllVoiceNotes();
      const totalSize = notes.reduce((sum, note) => sum + note.fileSize, 0);
      const totalDuration = notes.reduce((sum, note) => sum + note.duration, 0);

      return {
        totalNotes: notes.length,
        totalSize,
        totalDuration,
        formattedSize: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.error('Get storage info error:', error);
      return { totalNotes: 0, totalSize: 0, totalDuration: 0, formattedSize: '0 B' };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export default new StorageService();
