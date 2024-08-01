import { Controller, Get, Param } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
    constructor(private readonly flightsService: FlightsService) {}

    @Get(':flightId')
    async getFlightData(@Param('flightId') flightId: string) {
        return this.flightsService.getFlightData(flightId);
    }

    @Get(':flightId/coordinates')
    async getAirportCoordinates(@Param('flightId') flightId: string) {
        const flightData = await this.flightsService.getFlightData(flightId);
        const departureAirportCode = flightData.departure.iata;
        const arrivalAirportCode = flightData.arrival.iata;

        const departureCoords = await this.flightsService.getAirportCoordinates(departureAirportCode);
        const arrivalCoords = await this.flightsService.getAirportCoordinates(arrivalAirportCode);

        return {
            departureCoords,
            arrivalCoords,
        };
    }

    @Get(':flightId/weather')
    async getWeatherData(@Param('flightId') flightId: string) {
        const flightData = await this.flightsService.getFlightData(flightId);
        const departureAirportCode = flightData.departure.iata;
        const arrivalAirportCode = flightData.arrival.iata;

        const departureCoords = await this.flightsService.getAirportCoordinates(departureAirportCode);
        const arrivalCoords = await this.flightsService.getAirportCoordinates(arrivalAirportCode);

        const departureWeather = await this.flightsService.getWeatherData(departureCoords.latitude, departureCoords.longitude);
        const arrivalWeather = await this.flightsService.getWeatherData(arrivalCoords.latitude, arrivalCoords.longitude);

        return {
            departureWeather,
            arrivalWeather,
        };
    }

    @Get(':flightId/turbulence')
    async getTurbulenceMap(@Param('flightId') flightId: string) {
        return this.flightsService.getTurbulenceMap(flightId);
    }
}
