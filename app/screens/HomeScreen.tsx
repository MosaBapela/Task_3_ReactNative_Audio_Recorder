import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchBar from '../components/SearchBar';
import VoiceNoteItem from '../components/VoiceNoteItem';
import { COLORS } from '../constants/colors';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import storageService from '../services/storageService';
import { VoiceNote } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<VoiceNote[]>([]);

  const {
    isPlaying,
    playingNoteId,
    startPlayback,
    stopPlayback,
    pausePlayback,
  } = useAudioPlayer();

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  useEffect(() => {
    filterNotes();
  }, [searchQuery, notes]);

  const loadNotes = async () => {
    try {
      const loadedNotes = await storageService.getAllVoiceNotes();
      setNotes(loadedNotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load voice notes');
    }
  };

  const filterNotes = () => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handlePlayNote = async (note: VoiceNote) => {
    try {
      if (playingNoteId === note.id) {
        if (isPlaying) {
          await pausePlayback();
        } else {
          await startPlayback(note.uri, note.id);
        }
      } else {
        await startPlayback(note.uri, note.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      console.log('HomeScreen: handleDeleteNote called with noteId:', noteId);
      if (playingNoteId === noteId) {
        console.log('HomeScreen: Stopping playback for noteId:', noteId);
        await stopPlayback();
      }
      console.log('HomeScreen: Calling storageService.deleteVoiceNote');
      await storageService.deleteVoiceNote(noteId);
      console.log('HomeScreen: Calling loadNotes to refresh list');
      await loadNotes();
      console.log('HomeScreen: Delete operation completed');
    } catch (error) {
      console.error('HomeScreen: Delete error:', error);
      Alert.alert('Error', 'Failed to delete recording');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="mic" size={64} color={COLORS.light} />
      <Text style={styles.emptyTitle}>No Voice Notes Yet</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to start recording</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Voice Notes</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerIcon}
          >
            <Feather name="settings" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes..."
        />
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VoiceNoteItem
            note={item}
            isPlaying={isPlaying && playingNoteId === item.id}
            onPlay={() => handlePlayNote(item)}
            onDelete={() => handleDeleteNote(item.id)}
            onPress={() => navigation.navigate('Playback', { note: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.tertiary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Recording')}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '600', color: COLORS.white },
  headerIcon: { padding: 8 },
  listContent: { padding: 20, flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});