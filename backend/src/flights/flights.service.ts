import {  HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {Injectable} from "@nestjs/common";

interface FlightData {
    flight: {
        iata: string;
    };
    departure: {
        airport: string;
        latitude: number;
        longitude: number;
    };
    arrival: {
        airport: string;
        latitude: number;
        longitude: number;
    };
    flight_status: string;
}

interface FlightApiResponse {
    data: FlightData[];
}

@Injectable()
export class FlightsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async getFlightInfo(flightId: string): Promise<FlightApiResponse> {
        const apiKey = this.configService.get('AVIATIONSTACK_API_KEY');
        const response = await firstValueFrom(
            this.httpService.get<FlightApiResponse>(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightId}`),
        );
        return response.data;
    }

    async generateTurbulenceMap(flightData: FlightApiResponse): Promise<string> {
        const mapboxApiKey = this.configService.get('MAPBOX_API_KEY');
        const flight = flightData.data[0];
        const coordinates = `${flight.departure.latitude},${flight.departure.longitude};${flight.arrival.latitude},${flight.arrival.longitude}`;
        const response = await firstValueFrom(
            this.httpService.get(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/path-5+f44-0.5(${coordinates})/auto/600x600?access_token=${mapboxApiKey}`),
        );
        return response.config.url;
    }

    async getTurbulenceMap(flightId: string): Promise<{ flightData: FlightData[]; mapUrl: string }> {
        const flightData = await this.getFlightInfo(flightId);
        const mapUrl = await this.generateTurbulenceMap(flightData);
        return { flightData: flightData.data, mapUrl };
    }
}
