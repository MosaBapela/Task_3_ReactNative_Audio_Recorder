import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';
import storageService from '../services/storageService';
import { AppSettings } from '../types';

const SettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState<AppSettings>({
    recordingQuality: 'high',
    playbackSpeed: 1.0,
    autoDelete: false,
    autoDeleteDays: 30,
  });
  const [storageInfo, setStorageInfo] = useState({
    totalNotes: 0,
    formattedSize: '0 B',
  });

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await storageService.getSettings();
    setSettings(loadedSettings);
  };

  const loadStorageInfo = async () => {
    const info = await storageService.getStorageInfo();
    setStorageInfo(info);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storageService.saveSettings(updated);
  };

  const handleExport = async () => {
    try {
      const backupPath = await storageService.exportBackup();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(backupPath);
      } else {
        Alert.alert('Success', 'Backup created at: ' + backupPath);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await storageService.importBackup(result.assets[0].uri);
        Alert.alert('Success', 'Backup imported successfully!');
        loadStorageInfo();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import backup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recording</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Recording Quality</Text>
            <View style={styles.qualityButtons}>
              {(['low', 'medium', 'high'] as const).map(quality => (
                <TouchableOpacity
                  key={quality}
                  onPress={() => updateSettings({ recordingQuality: quality })}
                  style={[
                    styles.qualityButton,
                    settings.recordingQuality === quality && styles.qualityButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      settings.recordingQuality === quality &&
                        styles.qualityButtonTextActive,
                    ]}
                  >
                    {quality.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Playback Speed</Text>
            <View style={styles.speedButtons}>
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => updateSettings({ playbackSpeed: speed })}
                  style={[
                    styles.speedButton,
                    settings.playbackSpeed === speed && styles.speedButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.speedButtonText,
                      settings.playbackSpeed === speed && styles.speedButtonTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Auto-delete Old Recordings</Text>
              <Text style={styles.settingDescription}>
                Delete recordings after {settings.autoDeleteDays} days
              </Text>
            </View>
            <Switch
              value={settings.autoDelete}
              onValueChange={value => updateSettings({ autoDelete: value })}
              trackColor={{ false: COLORS.gray, true: COLORS.tertiary }}
              thumbColor={COLORS.white}
            />
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Recordings</Text>
              <Text style={styles.infoValue}>{storageInfo.totalNotes}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Storage Used</Text>
              <Text style={styles.infoValue}>{storageInfo.formattedSize}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Restore</Text>
          <TouchableOpacity style={styles.button} onPress={handleExport}>
            <Feather name="download" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Export Backup</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleImport}
          >
            <Feather name="upload" size={20} color={COLORS.tertiary} />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Import Backup
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>Voice Recorder App v1.0.0</Text>
          <Text style={styles.aboutText}>Built with Expo</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  placeholder: { width: 40 },
  content: { flex: 1 },
  section: { padding: 20, backgroundColor: COLORS.white, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: 16 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '500' },
  settingDescription: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  qualityButtons: { flexDirection: 'row', gap: 8 },
  qualityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.tertiary,
  },
  qualityButtonActive: { backgroundColor: COLORS.tertiary },
  qualityButtonText: { fontSize: 14, color: COLORS.tertiary, fontWeight: '600' },
  qualityButtonTextActive: { color: COLORS.white },
  speedButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxWidth: 200 },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.tertiary,
  },
  speedButtonActive: { backgroundColor: COLORS.tertiary },
  speedButtonText: { fontSize: 12, color: COLORS.tertiary, fontWeight: '600' },
  speedButtonTextActive: { color: COLORS.white },
  infoBox: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, marginTop: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: COLORS.secondary },
  infoValue: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.tertiary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.tertiary,
  },
  buttonText: { fontSize: 16, color: COLORS.white, fontWeight: '600' },
  buttonTextSecondary: { color: COLORS.tertiary },
  aboutText: { fontSize: 14, color: COLORS.gray, marginBottom: 8, textAlign: 'center' },
});

export default SettingsScreen;
