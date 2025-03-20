import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.model';
import { ShowtimeService } from '../showtime/showtime.service';
import { ConflictException } from '@nestjs/common';

describe('BookingService', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;
  let showtimeService: ShowtimeService;

  beforeEach(async () => {
    const mockBookingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockShowtimeService = {
      getShowtimeById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: ShowtimeService,
          useValue: mockShowtimeService,
        },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    showtimeService = module.get<ShowtimeService>(ShowtimeService);
  });

  describe('bookTicket', () => {
    it('should successfully book a ticket and return the booking', async () => {
      const mockShowtime = { id: 1, movie: 'Test Movie' };
      const mockBooking = { showtimeId: 1, seatNumber: 15, userId: 'user-123', bookingId: 'booking-1' };
      
      showtimeService.getShowtimeById = jest.fn().mockResolvedValue(mockShowtime);
      bookingRepository.findOne = jest.fn().mockResolvedValue(null);
      bookingRepository.create = jest.fn().mockReturnValue(mockBooking);
      bookingRepository.save = jest.fn().mockResolvedValue(mockBooking);

      const result = await bookingService.bookTicket(1, 15, 'user-123');
      
      expect(result).toEqual(mockBooking);
      expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
    });

    it('should throw error if the showtime is not found', async () => {
      showtimeService.getShowtimeById = jest.fn().mockResolvedValue(null);

      await expect(bookingService.bookTicket(1, 15, 'user-123'))
        .rejects
        .toThrowError(new Error('Showtime not found'));
    });

    it('should throw ConflictException if the seat is already booked', async () => {
      const mockShowtime = { id: 1, movie: 'Test Movie' };
      const existingBooking = { showtimeId: 1, seatNumber: 15, userId: 'user-123' };

      showtimeService.getShowtimeById = jest.fn().mockResolvedValue(mockShowtime);
      bookingRepository.findOne = jest.fn().mockResolvedValue(existingBooking);

      await expect(bookingService.bookTicket(1, 15, 'user-123'))
        .rejects
        .toThrowError(new ConflictException('Seat already booked for this showtime.'));
    });

    it('should throw error for any other unexpected errors', async () => {
      const errorMessage = 'Unexpected error occurred';
      showtimeService.getShowtimeById = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(bookingService.bookTicket(1, 15, 'user-123'))
        .rejects
        .toThrowError(new Error(errorMessage));
    });
  });
});
