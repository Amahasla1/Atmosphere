import React from 'react';
import './styles/forecast.css';

export type ForecastDay = {
    date: string;
    day: string;
    temperature: number;
    icon: string;
    description: string;
}

interface ForecastProps {
    forecast: ForecastDay[];
    onClose: () => void;
}

const Forecast: React.FC<ForecastProps> = ({ forecast, onClose }) => {
    return (
        <div className="forecast-overlay" onClick={onClose}>
            <div className="forecast-modal" onClick={e => e.stopPropagation()}>
                <div className="forecast-header">
                    <div className="header-content">
                        <span className="forecast-badge">5 дней</span>
                        <h2>Прогноз погоды</h2>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Закрыть">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <div className="forecast-grid">
                    {forecast.map((day, index) => (
                        <div 
                            key={day.date} 
                            className="forecast-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="card-glow"></div>
                            <div className="card-content">
                                <div className="day-header">
                                    <span className="day-name">{day.day}</span>
                                    <span className="day-date">{day.date}</span>
                                </div>
                                
                                <div className="weather-main">
                                    <img 
                                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                        alt={day.description}
                                        className="weather-icon"
                                    />
                                    <div className="temperature">
                                        <span className="temp-value">{Math.round(day.temperature)}</span>
                                        <span className="temp-unit">°</span>
                                    </div>
                                </div>
                                
                                <p className="description">{day.description}</p>
                                
                                <div className="weather-bar">
                                    <div 
                                        className="weather-fill" 
                                        style={{ 
                                            width: `${Math.min(Math.max((day.temperature + 10) / 40 * 100, 10), 100)}%`,
                                            background: day.temperature > 20 
                                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                                                : day.temperature > 10 
                                                    ? 'linear-gradient(90deg, #10b981, #f59e0b)' 
                                                    : 'linear-gradient(90deg, #3b82f6, #10b981)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Forecast;