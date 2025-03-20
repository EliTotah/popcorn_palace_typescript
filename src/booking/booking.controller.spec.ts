import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Booking } from './booking.model';

describe('BookingController', () => {
  let bookingController: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  beforeEach(async () => {
    bookingService = {
      bookTicket: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: bookingService,
        },
      ],
    }).compile();

    bookingController = module.get<BookingController>(BookingController);
  });

  describe('bookTicket', () => {
    it('should successfully book a ticket and return bookingId', async () => {
      const mockBooking: Booking = {
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
        bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
      };

      bookingService.bookTicket.mockResolvedValue(mockBooking);

      const response = await bookingController.bookTicket({
        showtimeId: 1,
        seatNumber: 15,
        userId: '84438967-f68f-4fa0-b620-0f08217e76af',
      });

      expect(response).toEqual({ bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae' });
      expect(bookingService.bookTicket).toHaveBeenCalledWith(
        1,
        15,
        '84438967-f68f-4fa0-b620-0f08217e76af'
      );
    });

    it('should throw an error if the showtime is not found', async () => {
      const errorMessage = 'Showtime not found';
      bookingService.bookTicket.mockRejectedValue(new Error(errorMessage));

      await expect(
        bookingController.bookTicket({
          showtimeId: 999,
          seatNumber: 15,
          userId: '84438967-f68f-4fa0-b620-0f08217e76af',
        })
      ).rejects.toThrow(new HttpException('Failed to book ticket: ' + errorMessage, HttpStatus.NOT_FOUND));
    });

    it('should throw an error if input validation fails', async () => {
      const errorMessage = 'Invalid input';
      bookingService.bookTicket.mockRejectedValue(new Error(errorMessage));

      await expect(
        bookingController.bookTicket({
          showtimeId: 1,
          seatNumber: 15,
          userId: 'invalid-user-id',
        })
      ).rejects.toThrow(new HttpException('Failed to book ticket: ' + errorMessage, HttpStatus.INTERNAL_SERVER_ERROR));
    });
  });
});
