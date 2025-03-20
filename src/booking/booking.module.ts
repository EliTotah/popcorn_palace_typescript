import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { ShowtimeModule } from '../showtime/showtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), ShowtimeModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
  
})
export class BookingsModule {}
