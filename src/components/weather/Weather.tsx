import React, { useState, useEffect } from 'react';
import './styles/weather.css';
import Forecast, { ForecastDay } from '../forecast/Forecast';

type WeatherData = {
    icon: string;
    city: string;
    temperature: number;
    description: string;
    windSpeed: number;
    humidity: number;
    clouds: number;
    feelsLike: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    windDeg: number;
    windGust: number;
    pressure?: number;
}

const Weather: React.FC = () => {
    const apiKey = 'e60068e3c0e4eca4c55726f696ee407c';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inputCity, setInputCity] = useState('');
    const [weatherData, setWeatherData] = useState<WeatherData>();
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [showForecast, setShowForecast] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSetInputCity = (input: string) => {
        const cityAliases: { [key: string]: string } = {
            'спб': 'Санкт-Петербург',
            '52': 'Санкт-Петербург',
            'питер': 'Санкт-Петербург',
            'мск': 'Москва',
            'москва': 'Москва',
        };
        const normalizedCity = input.toLowerCase().trim();
        setInputCity(cityAliases[normalizedCity] || input);
    };

    const fetchWeather = async () => {
        if (!inputCity.trim()) {
            setError('Введите название города');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}&units=metric&lang=ru`
            );
            
            if (!response.ok) throw new Error('Город не найден');
            
            const data = await response.json();
            
            const localTime = new Date();
            const cityTime = new Date(localTime.getTime() + (data.timezone * 1000));
            const hours = cityTime.getHours();
            const isDaytime = hours >= 6 && hours < 18;
            const iconCode = data.weather[0].icon.replace('n', isDaytime ? 'd' : 'n');

            setWeatherData({
                city: data.name,
                icon: iconCode,
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                windSpeed: Number(data.wind.speed.toFixed(1)),
                humidity: data.main.humidity,
                clouds: data.clouds.all,
                feelsLike: Math.round(data.main.feels_like),
                visibility: data.visibility / 1000,
                sunrise: data.sys.sunrise * 1000,
                sunset: data.sys.sunset * 1000,
                windDeg: data.wind.deg,
                windGust: data.wind.gust || 0,
                pressure: data.main.pressure
            });
        } catch (err) {
            setError('Не удалось найти город. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    const fetchForecast = async () => {
        if (!inputCity.trim()) {
            setError('Сначала введите город');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${apiKey}&units=metric&lang=ru`
            );
            
            if (!response.ok) throw new Error('Ошибка прогноза');
            
            const data = await response.json();
            
            const dailyData = data.list
                .filter((item: any) => item.dt_txt.includes('12:00:00'))
                .slice(0, 5)
                .map((item: any) => {
                    const date = new Date(item.dt * 1000);
                    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
                    return {
                        date: `${date.getDate()} ${months[date.getMonth()]}`,
                        day: days[date.getDay()],
                        temperature: Math.round(item.main.temp),
                        icon: item.weather[0].icon,
                        description: item.weather[0].description
                    };
                });
            
            setForecast(dailyData);
            setShowForecast(true);
        } catch (error) {
            setError('Ошибка при получении прогноза');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') fetchWeather();
    };

    const getWeatherTheme = (description?: string) => {
        if (!description) return 'default';
        const desc = description.toLowerCase();
        if (desc.includes('солн') || desc.includes('ясно')) return 'sunny';
        if (desc.includes('дожд') || desc.includes('ливень')) return 'rainy';
        if (desc.includes('снег') || desc.includes('метель')) return 'snowy';
        if (desc.includes('облач') || desc.includes('пасмур')) return 'cloudy';
        if (desc.includes('гроз')) return 'stormy';
        return 'default';
    };

    const theme = getWeatherTheme(weatherData?.description);

    return (
        <div className={`weather-app theme-${theme} ${mounted ? 'mounted' : ''}`}>
            <div className="ambient-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="glass-panel main-panel">
                <header className="app-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                        </div>
                        <h1>Агрегатор погоды</h1>
                    </div>
                </header>

                <div className="search-section">
                    <div className={`input-wrapper ${inputCity ? 'has-value' : ''}`}>
                        <input 
                            type="text" 
                            placeholder=" "
                            value={inputCity}
                            onChange={(e) => handleSetInputCity(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <label>Поиск города...</label>
                        <div className="input-highlight"></div>
                        <button 
                            className="search-btn" 
                            onClick={fetchWeather}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21l-4.35-4.35"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="error-toast">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {weatherData && (
                    <div className="weather-display">
                        <div className="location-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{weatherData.city}</span>
                        </div>

                        <div className="main-weather">
                            <div className="weather-icon-wrap">
                                <div className="icon-glow"></div>
                                <img 
                                    src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`}
                                    alt={weatherData.description}
                                    className="floating-icon"
                                />
                            </div>
                            
                            <div className="temp-display">
                                <span className="temp-value">{weatherData.temperature}</span>
                                <span className="temp-unit">°C</span>
                            </div>
                            
                            <p className="weather-desc">{weatherData.description}</p>
                            
                            <div className="feels-like">
                                Ощущается как <span>{weatherData.feelsLike}°</span>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            {[
                                { 
                                    icon: '💧', 
                                    label: 'Влажность', 
                                    value: `${weatherData.humidity}%`,
                                    sub: 'Относительная'
                                },
                                { 
                                    icon: '💨', 
                                    label: 'Ветер', 
                                    value: `${weatherData.windSpeed} м/с`,
                                    sub: getWindDirection(weatherData.windDeg)
                                },
                                { 
                                    icon: '☁️', 
                                    label: 'Облачность', 
                                    value: `${weatherData.clouds}%`,
                                    sub: 'Затянутость'
                                },
                                { 
                                    icon: '👁️', 
                                    label: 'Видимость', 
                                    value: `${weatherData.visibility} км`,
                                    sub: 'Горизонт'
                                },
                                { 
                                    icon: '🌅', 
                                    label: 'Восход', 
                                    value: formatTime(weatherData.sunrise),
                                    sub: 'Утро'
                                },
                                { 
                                    icon: '🌇', 
                                    label: 'Закат', 
                                    value: formatTime(weatherData.sunset),
                                    sub: 'Вечер'
                                }
                            ].map((metric, idx) => (
                                <div 
                                    key={metric.label} 
                                    className="metric-card"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="metric-icon">{metric.icon}</div>
                                    <div className="metric-info">
                                        <span className="metric-label">{metric.label}</span>
                                        <span className="metric-value">{metric.value}</span>
                                        <span className="metric-sub">{metric.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="forecast-trigger"
                            onClick={fetchForecast}
                            disabled={loading}
                        >
                            <span>Прогноз на 5 дней</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                            </svg>
                        </button>
                    </div>
                )}

                {!weatherData && !loading && (
                    <div className="empty-state">
                        <div className="empty-illustration">
                            <div className="cloud cloud-1"></div>
                            <div className="cloud cloud-2"></div>
                            <div className="sun"></div>
                        </div>
                        <p>Введите город, чтобы узнать погоду</p>
                    </div>
                )}
            </div>

            {showForecast && (
                <Forecast 
                    forecast={forecast} 
                    onClose={() => setShowForecast(false)} 
                />
            )}
        </div>
    );
};

const getWindDirection = (deg: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
};

const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default Weather;