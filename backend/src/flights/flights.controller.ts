import { Controller, Get, Param } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
    constructor(private readonly flightsService: FlightsService) {}

    @Get(':id/turbulence')
    async getTurbulenceMap(@Param('id') flightId: string): Promise<{ flightData: any; mapUrl: string }> {
        return this.flightsService.getTurbulenceMap(flightId);
    }
}
