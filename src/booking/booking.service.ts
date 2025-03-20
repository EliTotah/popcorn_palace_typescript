import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.model';
import { ShowtimeService } from '../showtime/showtime.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly showtimeService: ShowtimeService
  ) {}

  async bookTicket(showtimeId: number, seatNumber: number, userId: string): Promise<Booking>{
    try {
        const showtime = await this.showtimeService.getShowtimeById(showtimeId);
        if (!showtime) {
            throw new Error('Showtime not found');
        }
        const existingBooking = await this.bookingRepository.findOne({
            where: { showtimeId, seatNumber }
          });
        if (existingBooking) {
            throw new ConflictException('Seat already booked for this showtime.');
        }
        const booking = this.bookingRepository.create({ showtimeId, seatNumber, userId });
        return await this.bookingRepository.save(booking);
    } catch (error) {
        throw error;
    }
  }

  async deleteMovie(bookingId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findOne({ where: { bookingId } });
      if (!booking) {
        throw new Error('Booking not found');
      }
      await this.bookingRepository.remove(booking);
    } catch (error) {
        throw error;
    }
  }
}