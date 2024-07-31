import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [flightId, setFlightId] = useState('');
    const [mapUrl, setMapUrl] = useState('');
    const [flightData, setFlightData] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFlightId(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:3001/main`);
            // @ts-ignore
            setMapUrl(response.data.mapUrl);
            // @ts-ignore
            setFlightData(response.data.flightData);
        } catch (error) {
            console.error('Error fetching turbulence map:', error);
        }
    };

    return (
        <div className="App">
            <h1>Flight Turbulence Map</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={flightId} onChange={handleInputChange} placeholder="Enter Flight ID" />
                <button type="submit">Get Turbulence Map</button>
            </form>
            {mapUrl && (
                <div>
                    <img src={mapUrl} alt="Turbulence Map" />
                    {flightData && (
                        <div>
                            <h2>Flight Information</h2>
                            <p>Flight Number: {flightData[0].flight.iata}</p>
                            <p>Departure: {flightData[0].departure.airport}</p>
                            <p>Arrival: {flightData[0].arrival.airport}</p>
                            <p>Status: {flightData[0].flight_status}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
