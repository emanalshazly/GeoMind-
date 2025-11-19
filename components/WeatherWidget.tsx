import React, { useEffect, useState } from 'react';
import { Coordinates } from '../types';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Droplets,
  Wind,
  Loader2
} from 'lucide-react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

interface WeatherWidgetProps {
  location: Coordinates | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(false);
      try {
        // Fetch current weather from Open-Meteo (Free, no key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=celsius`
        );
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          humidity: data.current.relative_humidity_2m
        });
      } catch (err) {
        console.error("Weather API Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch to avoid spamming the API on rapid movement
    const timeoutId = setTimeout(fetchWeather, 1000);
    return () => clearTimeout(timeoutId);

  }, [location?.lat, location?.lng]);

  if (!location) return null;

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-amber-500" size={24} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-slate-500" size={24} />;
    if ([45, 48].includes(code)) return <CloudFog className="text-slate-400" size={24} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-500" size={24} />;
    if (code >= 80 && code <= 82) return <CloudRain className="text-blue-600" size={24} />;
    if (code >= 71 && code <= 77) return <CloudSnow className="text-sky-300" size={24} />;
    if (code >= 95) return <CloudLightning className="text-purple-600" size={24} />;
    return <Cloud className="text-slate-500" size={24} />;
  };

  const getWeatherLabel = (code: number) => {
     if (code === 0) return "Clear";
     if (code >= 1 && code <= 3) return "Cloudy";
     if ([45, 48].includes(code)) return "Fog";
     if (code >= 51 && code <= 67) return "Rain";
     if (code >= 80 && code <= 82) return "Showers";
     if (code >= 71 && code <= 77) return "Snow";
     if (code >= 95) return "Storm";
     return "Cloudy";
  };

  return (
    <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 min-w-[180px] transition-all duration-300 hover:shadow-xl">
        {loading && !weather ? (
          <div className="flex items-center justify-center h-16 w-full">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        ) : error ? (
          <div className="text-xs text-red-500 text-center py-2">Weather unavailable</div>
        ) : weather ? (
          <div className="flex flex-col animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Weather</span>
                {loading && <Loader2 className="animate-spin text-slate-300" size={12} />}
             </div>
             
             <div className="flex items-center gap-3 mb-3">
                {getWeatherIcon(weather.weatherCode)}
                <div>
                   <div className="text-2xl font-bold text-slate-800 leading-none">{Math.round(weather.temperature)}°</div>
                   <div className="text-xs text-slate-500 font-medium mt-1">{getWeatherLabel(weather.weatherCode)}</div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80">
               <div className="flex items-center gap-1.5" title="Wind Speed">
                 <Wind size={14} className="text-slate-400" />
                 <span className="text-xs text-slate-600">{weather.windSpeed} <span className="text-[10px] text-slate-400">km/h</span></span>
               </div>
               <div className="flex items-center gap-1.5" title="Humidity">
                 <Droplets size={14} className="text-blue-400" />
                 <span className="text-xs text-slate-600">{weather.humidity}%</span>
               </div>
             </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-2">Locating...</div>
        )}
      </div>
    </div>
  );
};