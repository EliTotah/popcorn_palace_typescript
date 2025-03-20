import { Controller, Post, Body, HttpException, HttpStatus, HttpCode, Param, ConflictException, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import {validateBookTicketInput} from '../utils/validations'

@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    @HttpCode(200)
    async bookTicket(
        @Body() body: {showtimeId: number; seatNumber: number; userId: string
        }): Promise<{ bookingId: string }> {
            try {
                const { showtimeId, seatNumber, userId} = body;
                validateBookTicketInput(body);
                const booking = await this.bookingService.bookTicket(showtimeId, seatNumber, userId);
                return {"bookingId":booking.bookingId};
            } catch(error) {
                if (error instanceof HttpException || error instanceof ConflictException) {
                    throw error; 
                }
                if (error.message === 'Showtime not found') {
                    throw new HttpException('Failed to book ticket: ' + error.message, HttpStatus.NOT_FOUND);
                  }
                throw new HttpException('Failed to book ticket: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            }
    }

    @HttpCode(200)
    @Delete('/:bookingId')
      async deleteMovie(@Param('bookingId') bookingId: string): Promise<void> {
        try {
            if (!bookingId) {
              throw new HttpException('bookingId is required', HttpStatus.BAD_REQUEST);
            }
            if (bookingId.trim().length === 0) {
                throw new HttpException('bookingId cannot be empty', HttpStatus.BAD_REQUEST);
            }
            await this.bookingService.deleteMovie(bookingId);
          } catch (error) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
                throw error; 
            }
            if (error.message === 'Booking not found') {
              throw new HttpException('Failed to delete booking: ' + error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Failed to delete booking: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
      }
}