import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {HttpService} from "@nestjs/axios";

@Injectable()
export class FlightsService {
    private aviationstackApiKey: string;
    private weatherApiKey: string;

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {
        this.aviationstackApiKey = this.configService.get<string>('AVIATIONSTACK_API_KEY');
        this.weatherApiKey = this.configService.get<string>('OPENWEATHERMAP_API_KEY');
    }

    private getAviationStackHeaders() {
        return {
            'Access-Key': this.aviationstackApiKey,
        };
    }

    async getFlightData(flightId: string): Promise<any> {
        const url = `http://api.aviationstack.com/v1/flights?flight_iata=${flightId}&access_key=${this.aviationstackApiKey}`;

        try {
            const response = await this.httpService.get(url).toPromise();
            const flights = response.data.data;

            if (flights.length === 0) {
                throw new Error('Flight not found');
            }

            // Фильтруем только предстоящие рейсы
            const upcomingFlights = flights.filter(flight => new Date(flight.departure.estimated) > new Date());

            if (upcomingFlights.length === 0) {
                throw new Error('No upcoming flights found');
            }

            return upcomingFlights[0];
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch flight data');
        }
    }

    async getAirportCoordinates(iataCode: string): Promise<{ latitude: number, longitude: number }> {
        // Здесь используем бесплатный сервис для получения координат аэропорта
        // Пример использования: https://geocode.xyz/
        const url = `https://geocode.xyz/${iataCode}?json=1`;

        try {
            const response = await this.httpService.get(url).toPromise();
            const airport = response.data;

            if (!airport) {
                throw new Error('Airport coordinates not found');
            }

            return {
                latitude: parseFloat(airport.latt),
                longitude: parseFloat(airport.longt),
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch airport coordinates');
        }
    }

    async getWeatherData(latitude: number, longitude: number): Promise<any> {
        const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.weatherApiKey}`;

        try {
            const response = await this.httpService.get(url).toPromise();
            return response.data;
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch weather data');
        }
    }

    async getTurbulenceMap(flightId: string): Promise<any> {
        const flightData = await this.getFlightData(flightId);

        const departureAirportCode = flightData.departure.iata;
        const arrivalAirportCode = flightData.arrival.iata;

        const departureCoords = await this.getAirportCoordinates(departureAirportCode);
        const arrivalCoords = await this.getAirportCoordinates(arrivalAirportCode);

        const departureWeather = await this.getWeatherData(departureCoords.latitude, departureCoords.longitude);
        const arrivalWeather = await this.getWeatherData(arrivalCoords.latitude, arrivalCoords.longitude);

        // Генерируем URL карты турбулентности
        const mapUrl = `http://example.com/turbulence-map?dep_lat=${departureCoords.latitude}&dep_lon=${departureCoords.longitude}&arr_lat=${arrivalCoords.latitude}&arr_lon=${arrivalCoords.longitude}`;

        return {
            flightData,
            departureWeather,
            arrivalWeather,
            mapUrl,
        };
    }
}
