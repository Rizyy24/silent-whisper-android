import { useEffect, useState, useCallback } from "react";

interface SpeechToTextProps {
  onTranscription: (text: string) => void;
  onCurrentText: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

export const SpeechToText = ({ 
  onTranscription, 
  onCurrentText, 
  onListeningChange 
}: SpeechToTextProps) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.start();
      setIsListening(true);
      onListeningChange(true);
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [recognition, onListeningChange]);

  const stopListening = useCallback(() => {
    if (!recognition) return;

    recognition.stop();
    setIsListening(false);
    onListeningChange(false);
    console.log('Speech recognition stopped');
  }, [recognition, onListeningChange]);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition is not supported in this browser');
      return;
    }

    const speechRecognition = new SpeechRecognition();
    
    // Configure speech recognition
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxAlternatives = 1;

    // Handle speech recognition results
    speechRecognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current text with interim results
      if (interimTranscript) {
        onCurrentText(interimTranscript);
      }

      // Send final transcript when ready
      if (finalTranscript) {
        onTranscription(finalTranscript.trim());
        onCurrentText(''); // Clear current text
        
        // Send to ESP32 if available
        if ((window as any).sendToESP32) {
          (window as any).sendToESP32(finalTranscript.trim());
        }
      }
    };

    // Handle speech recognition events
    speechRecognition.onstart = () => {
      console.log('Speech recognition service has started');
      setIsListening(true);
      onListeningChange(true);
    };

    speechRecognition.onend = () => {
      console.log('Speech recognition service disconnected');
      setIsListening(false);
      onListeningChange(false);
      
      // Auto-restart after a short delay (continuous listening)
      setTimeout(() => {
        if (speechRecognition) {
          startListening();
        }
      }, 100);
    };

    speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChange(false);

      // Handle specific errors
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and refresh the page.');
        return;
      }

      // Auto-restart on other errors after delay
      setTimeout(() => {
        startListening();
      }, 1000);
    };

    speechRecognition.onnomatch = () => {
      console.log('Speech recognition: no match found');
    };

    speechRecognition.onsoundstart = () => {
      console.log('Sound detected');
    };

    speechRecognition.onsoundend = () => {
      console.log('Sound ended');
    };

    setRecognition(speechRecognition);

    // Start listening automatically when component mounts
    setTimeout(() => {
      startListening();
    }, 1000); // Small delay to ensure everything is ready

    // Cleanup
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [onTranscription, onCurrentText, onListeningChange, startListening]);

  // Request microphone permission on component mount
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
      } catch (error) {
        console.error('Microphone permission denied:', error);
        alert('Microphone access is required for SilentSpeak to work. Please allow microphone access and refresh the page.');
      }
    };

    requestMicrophonePermission();
  }, []);

  return null; // This component doesn't render anything
};