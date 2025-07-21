import { useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface TranscriptionDisplayProps {
  transcription: string[];
  isListening: boolean;
  currentText: string;
}

export const TranscriptionDisplay = ({ 
  transcription, 
  isListening, 
  currentText 
}: TranscriptionDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcription, currentText]);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Listening Header */}
      <div className="flex items-center justify-center space-x-3 p-4">
        <div className={`relative ${isListening ? 'listening-pulse' : ''}`}>
          {isListening ? (
            <Mic className="w-8 h-8 text-primary" />
          ) : (
            <MicOff className="w-8 h-8 text-muted-foreground" />
          )}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          {isListening ? "Listening..." : "Speech Recognition Paused"}
        </h2>
      </div>

      {/* Transcription Display */}
      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Real-time Transcription
          </h3>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
        >
          {transcription.length === 0 && !currentText ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Start speaking to see transcription here...
              </p>
            </div>
          ) : (
            <>
              {/* Previous transcribed lines */}
              {transcription.map((line, index) => (
                <div 
                  key={index} 
                  className="text-appear p-3 bg-muted/30 rounded-lg border border-border/20"
                >
                  <p className="text-foreground leading-relaxed">{line}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Sent to ESP32
                  </span>
                </div>
              ))}
              
              {/* Current live text */}
              {currentText && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 animate-pulse">
                  <p className="text-foreground leading-relaxed">{currentText}</p>
                  <span className="text-xs text-primary mt-1 block">
                    Transcribing...
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom scrollbar styles for better appearance
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--primary));
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary-glow));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}