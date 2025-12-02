import { useEffect, useState } from 'react';
import audioService from '../services/audioService';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    return () => {
      if (isPlaying) stopPlayback();
    };
  }, []);

  const startPlayback = async (uri: string, noteId: string) => {
    try {
      if (isPlaying) await stopPlayback();

      await audioService.startPlayback(uri);
      await audioService.setPlaybackSpeed(playbackSpeed);
      setIsPlaying(true);
      setPlayingNoteId(noteId);

      audioService.onPlaybackProgress((status: any) => {
        if (status.isLoaded) {
          setCurrentPosition(Math.floor(status.positionMillis / 1000));
          setDuration(Math.floor(status.durationMillis / 1000));

          if (status.didJustFinish) {
            stopPlayback();
          }
        }
      });
    } catch (error) {
      console.error('Start playback error:', error);
      throw error;
    }
  };

  const stopPlayback = async () => {
    try {
      await audioService.stopPlayback();
      setIsPlaying(false);
      setPlayingNoteId(null);
      setCurrentPosition(0);
      setDuration(0);
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  const pausePlayback = async () => {
    try {
      await audioService.pausePlayback();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause playback error:', error);
    }
  };

  const resumePlayback = async () => {
    try {
      await audioService.resumePlayback();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume playback error:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      await audioService.seekToPosition(position * 1000);
      setCurrentPosition(position);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const changePlaybackSpeed = async (speed: number) => {
    try {
      setPlaybackSpeed(speed);
      await audioService.setPlaybackSpeed(speed);
    } catch (error) {
      console.error('Change speed error:', error);
    }
  };

  return {
    isPlaying,
    currentPosition,
    duration,
    playingNoteId,
    playbackSpeed,
    startPlayback,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    seekTo,
    changePlaybackSpeed,
  };
};