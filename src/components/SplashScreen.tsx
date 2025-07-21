import { useEffect, useState } from "react";
import silentSpeakLogo from "@/assets/silentspeak-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-brand transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center space-y-8 fade-in-up">
        <div className="relative">
          <img 
            src={silentSpeakLogo} 
            alt="SilentSpeak Logo" 
            className="w-32 h-32 mx-auto pulse-glow rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-20 animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-brand-text tracking-tight">
            SilentSpeak
          </h1>
          <p className="text-xl text-brand-text-muted font-light">
            Speak Freely
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};