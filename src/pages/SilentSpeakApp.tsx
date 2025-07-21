import { useState, useCallback } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { ConnectionStatus, ConnectionState } from "@/components/ConnectionStatus";
import { TranscriptionDisplay } from "@/components/TranscriptionDisplay";
import { BluetoothManager } from "@/components/BluetoothManager";
import { SpeechToText } from "@/components/SpeechToText";
import silentSpeakLogo from "@/assets/silentspeak-logo.png";

export const SilentSpeakApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [transcription, setTranscription] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dataSentCount, setDataSentCount] = useState(0);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleTranscription = useCallback((text: string) => {
    if (text.trim()) {
      setTranscription(prev => [...prev, text]);
    }
  }, []);

  const handleCurrentText = useCallback((text: string) => {
    setCurrentText(text);
  }, []);

  const handleDataSent = useCallback((data: string) => {
    setDataSentCount(prev => prev + 1);
    console.log(`Data sent to ESP32: ${data}`);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-brand text-foreground p-4">
      {/* Hidden managers for Bluetooth and Speech */}
      <BluetoothManager 
        onConnectionStateChange={setConnectionState}
        onDataSend={handleDataSent}
      />
      <SpeechToText 
        onTranscription={handleTranscription}
        onCurrentText={handleCurrentText}
        onListeningChange={setIsListening}
      />

      {/* Main App Layout */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            <img 
              src={silentSpeakLogo} 
              alt="SilentSpeak" 
              className="w-12 h-12 rounded-lg shadow-glow"
            />
            <h1 className="text-3xl font-bold text-brand-text tracking-tight">
              SilentSpeak
            </h1>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-brand-text-muted">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Messages Sent: {dataSentCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Auto Mode</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Transcription Display */}
          <TranscriptionDisplay 
            transcription={transcription}
            isListening={isListening}
            currentText={currentText}
          />
        </main>

        {/* Footer */}
        <footer className="space-y-4 pt-6">
          {/* Connection Status */}
          <ConnectionStatus 
            state={connectionState}
            deviceName="ESP32_STT"
          />
          
          {/* App Info */}
          <div className="text-center py-4">
            <p className="text-xs text-brand-text-muted">
              SilentSpeak v1.0 • Real-time Speech-to-Text • ESP32 Integration
            </p>
            <p className="text-xs text-brand-text-muted mt-1">
              Speak freely - your words are automatically transmitted
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};