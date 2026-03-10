import React from 'react';
import './App.css';
import Weather from './components/weather/Weather';

const App:React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Weather/>
      
      </header>
    </div>
  );
}

export default App;
