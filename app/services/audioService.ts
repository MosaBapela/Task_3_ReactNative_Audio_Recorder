import { Audio } from 'expo-av';

class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async startRecording(quality: 'low' | 'medium' | 'high'): Promise<string> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        this.getRecordingOptions(quality)
      );
      
      this.recording = recording;
      const uri = recording.getURI() || '';
      return uri;
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    try {
      if (!this.recording) throw new Error('No recording in progress');
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI() || '';
      this.recording = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return uri;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  }

  async pauseRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync();
      }
    } catch (error) {
      console.error('Pause recording error:', error);
      throw error;
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.startAsync();
      }
    } catch (error) {
      console.error('Resume recording error:', error);
      throw error;
    }
  }

  onRecordingProgress(callback: (status: any) => void) {
    if (this.recording) {
      this.recording.setOnRecordingStatusUpdate(callback);
    }
  }

  async startPlayback(uri: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      
      this.sound = sound;
    } catch (error) {
      console.error('Start playback error:', error);
      throw error;
    }
  }

  async stopPlayback(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Stop playback error:', error);
      throw error;
    }
  }

  async pausePlayback(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Pause playback error:', error);
      throw error;
    }
  }

  async resumePlayback(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Resume playback error:', error);
      throw error;
    }
  }

  async seekToPosition(position: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(position);
      }
    } catch (error) {
      console.error('Seek error:', error);
      throw error;
    }
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(speed, true);
      }
    } catch (error) {
      console.error('Set speed error:', error);
      throw error;
    }
  }

  onPlaybackProgress(callback: (status: any) => void) {
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  private getRecordingOptions(quality: 'low' | 'medium' | 'high') {
    const qualityMap = {
      low: Audio.RecordingOptionsPresets.LOW_QUALITY,
      medium: Audio.RecordingOptionsPresets.HIGH_QUALITY,
      high: Audio.RecordingOptionsPresets.HIGH_QUALITY,
    };
    return qualityMap[quality];
  }

  getRecordingStatus() {
    return this.recording?.getStatusAsync();
  }

  getPlaybackStatus() {
    return this.sound?.getStatusAsync();
  }
}

export default new AudioService();
