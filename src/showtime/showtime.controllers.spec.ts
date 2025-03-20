import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.model';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('ShowtimeController', () => {
  let showtimeController: ShowtimeController;
  let showtimeService: Partial<ShowtimeService>;

  beforeEach(async () => {
    showtimeService = {
      getShowtimeById: jest.fn(),
      addShowtime: jest.fn(),
      deleteShowtime: jest.fn(),
      updateShowtime: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimeController],
      providers: [
        {
          provide: ShowtimeService,
          useValue: showtimeService,
        },
      ],
    }).compile();

    showtimeController = module.get<ShowtimeController>(ShowtimeController);
  });

  describe('getShowtimeById', () => {
    it('should return a showtime for a valid ID', async () => {
      const mockShowtime = new Showtime();
      mockShowtime.id = 1;
      jest.spyOn(showtimeService, 'getShowtimeById').mockResolvedValue(mockShowtime);

      const result = await showtimeController.getShowtimeById(1);
      expect(result).toEqual(mockShowtime);
    });

    it('should throw an error for invalid ID', async () => {
      jest.spyOn(showtimeService, 'getShowtimeById').mockImplementation(() => {
        throw new Error('Showtime not found');
      });

      await expect(showtimeController.getShowtimeById(999)).rejects.toThrow(HttpException);
    });
  });

  describe('addShowtime', () => {
    it('should add a showtime and return it', async () => {
      const input = {
        movieId: 1,
        price: 20.2,
        theater: 'Sample Theater',
        startTime: '2025-02-14T11:47:46.125405Z',
        endTime: '2025-02-14T14:47:46.125405Z',
      };
      const mockShowtime = new Showtime();
      Object.assign(mockShowtime, { id: 1, ...input });

      jest.spyOn(showtimeService, 'addShowtime').mockResolvedValue(mockShowtime);

      const result = await showtimeController.addShowtime(input);
      expect(result).toEqual(mockShowtime);
    });

    it('should throw an error for invalid input', async () => {
      const input = {
        movieId: null,
        price: -10,
        theater: '',
        startTime: '',
        endTime: '',
      };

      await expect(showtimeController.addShowtime(input)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteShowtime', () => {
    it('should delete a showtime for a valid ID', async () => {
      jest.spyOn(showtimeService, 'deleteShowtime').mockResolvedValue();

      await expect(showtimeController.deleteShowtime(1)).resolves.not.toThrow();
    });

    it('should throw an error for an invalid ID', async () => {
      jest.spyOn(showtimeService, 'deleteShowtime').mockImplementation(() => {
        throw new Error('Showtime not found');
      });

      await expect(showtimeController.deleteShowtime(999)).rejects.toThrow(HttpException);
    });
  });

  describe('updateShowtime', () => {
    it('should update a showtime successfully', async () => {
      const input = {
        movieId: 1,
        price: 50.2,
        theater: 'Sample Theater',
        startTime: '2025-02-14T11:47:46.125405Z',
        endTime: '2025-02-14T14:47:46.125405Z',
      };

      jest.spyOn(showtimeService, 'updateShowtime').mockResolvedValue();

      await expect(showtimeController.updateShowtime(1, input)).resolves.not.toThrow();
    });

    it('should throw an error for invalid update data', async () => {
      const input = {
        movieId: null,
        price: -10,
        theater: '',
        startTime: '',
        endTime: '',
      };

      await expect(showtimeController.updateShowtime(999, input)).rejects.toThrow(HttpException);
    });
  });
});
