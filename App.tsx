import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import ChatInterface from './components/ChatInterface';
import { WeatherWidget } from './components/WeatherWidget';
import { Message, Coordinates, ModelType } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  // Initialize with SF defaults so weather works immediately even before geo permissions
  const [currentMapCenter, setCurrentMapCenter] = useState<Coordinates | null>({ lat: 37.7749, lng: -122.4194 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.LOCATION_SEARCH);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mobile toggle

  // Initial Location Request
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          // Only update map center if user specifically requested location or it's the first load
          // We update it here to trigger the "Recenter" effect in MapComponent
          setCurrentMapCenter(coords);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default fallback is handled in MapComponent, but we already have default state here
        }
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Use current map center if user has panned, otherwise user location, otherwise undefined
      const locationContext = currentMapCenter || userLocation || undefined;

      const response = await sendMessageToGemini(
        text,
        messages, // pass full history
        modelType,
        locationContext
      );

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        groundingChunks: response.groundingChunks
      };

      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to the AI service. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row">
      
      {/* Map Layer - Background on Mobile, Split on Desktop */}
      <div className="absolute inset-0 z-0 md:relative md:flex-1 md:order-2">
        <MapComponent 
          userLocation={userLocation} 
          onLocationUpdate={(coords) => setCurrentMapCenter(coords)}
        />
        {/* Weather Widget Overlay */}
        <WeatherWidget location={currentMapCenter} />
      </div>

      {/* Sidebar / Chat Overlay */}
      <div 
        className={`
          absolute md:relative z-10 h-full w-full md:w-[450px] md:max-w-[35%] md:order-1
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pointer-events-none md:pointer-events-auto
        `}
      >
        <div className="h-full w-full md:w-full sm:w-[400px] bg-transparent pointer-events-auto shadow-2xl">
           <ChatInterface 
             messages={messages}
             isLoading={isLoading}
             onSendMessage={handleSendMessage}
             onModelChange={setModelType}
             currentModel={modelType}
             userLocation={userLocation}
             onRequestLocation={requestLocation}
           />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute bottom-6 left-6 z-50 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

    </div>
  );
};

export default App;