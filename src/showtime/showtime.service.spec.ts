import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeService } from './showtime.service';
import { Repository } from 'typeorm';
import { Showtime } from './showtime.model';
import { MovieService } from '../movie/movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ShowtimeService', () => {
  let showtimeService: ShowtimeService;
  let showtimeRepository: jest.Mocked<Repository<Showtime>>;
  let movieService: jest.Mocked<MovieService>;

  beforeEach(async () => {
    showtimeRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;

    movieService = {
      getAllMovies: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimeService,
        {
          provide: getRepositoryToken(Showtime),
          useValue: showtimeRepository,
        },
        {
          provide: MovieService,
          useValue: movieService,
        },
      ],
    }).compile();

    showtimeService = module.get<ShowtimeService>(ShowtimeService);
  });

  describe('getShowtimeById', () => {
    it('should return a showtime for a valid ID', async () => {
      const mockShowtime = new Showtime();
      mockShowtime.id = 1;
      showtimeRepository.findOne.mockResolvedValue(mockShowtime);

      const result = await showtimeService.getShowtimeById(1);
      expect(result).toEqual(mockShowtime);
    });

    it('should throw an error for an invalid ID', async () => {
      showtimeRepository.findOne.mockResolvedValue(null);

      await expect(showtimeService.getShowtimeById(999)).rejects.toThrow('Showtime not found');
    });
  });

  describe('addShowtime', () => {
    it('should add a showtime successfully', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie',
          genre: 'Drama',
          duration: 120,
          rating: 5,
          releaseYear: 2022,
        },
      ];
      const mockShowtime = new Showtime();
      const input = {
        movieId: 1,
        price: 20.2,
        theater: 'Sample Theater',
        startTime: '2025-02-14T11:47:46.125405Z',
        endTime: '2025-02-14T14:47:46.125405Z',
      };
      movieService.getAllMovies.mockResolvedValue(mockMovies);
      showtimeRepository.findOne.mockResolvedValue(null);
      showtimeRepository.create.mockReturnValue(mockShowtime);
      showtimeRepository.save.mockResolvedValue(mockShowtime);

      const result = await showtimeService.addShowtime(
        input.movieId,
        input.price,
        input.theater,
        input.startTime,
        input.endTime
      );
      expect(result).toEqual(mockShowtime);
    });

    it('should throw an error for a non-existent movie', async () => {
      movieService.getAllMovies.mockResolvedValue([]);

      await expect(
        showtimeService.addShowtime(1, 20.2, 'Sample Theater', '2025-02-14T11:47:46.125405Z', '2025-02-14T14:47:46.125405Z')
      ).rejects.toThrow('Movie not exist');
    });

    it('should throw an error for overlapping showtimes', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie',
          genre: 'Drama',
          duration: 120,
          rating: 5,
          releaseYear: 2022,
        },
      ];
      const mockOverlappingShowtime = new Showtime();
      movieService.getAllMovies.mockResolvedValue(mockMovies);
      showtimeRepository.findOne.mockResolvedValue(mockOverlappingShowtime);

      await expect(
        showtimeService.addShowtime(1, 20.2, 'Sample Theater', '2025-02-14T11:47:46.125405Z', '2025-02-14T14:47:46.125405Z')
      ).rejects.toThrow('Overlapping showtime for the same theater');
    });
  });

  describe('deleteShowtime', () => {
    it('should delete a showtime successfully', async () => {
      const mockShowtime = new Showtime();
      showtimeRepository.findOne.mockResolvedValue(mockShowtime);

      await expect(showtimeService.deleteShowtime(1)).resolves.not.toThrow();
      expect(showtimeRepository.remove).toHaveBeenCalledWith(mockShowtime);
    });

    it('should throw an error for a non-existent showtime', async () => {
      showtimeRepository.findOne.mockResolvedValue(null);

      await expect(showtimeService.deleteShowtime(999)).rejects.toThrow('Showtime not found');
    });
  });

  describe('updateShowtime', () => {
    it('should update a showtime successfully', async () => {
      const mockShowtime = new Showtime();
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie',
          genre: 'Drama',
          duration: 120,
          rating: 5,
          releaseYear: 2022,
        },
      ];
      movieService.getAllMovies.mockResolvedValue(mockMovies);
      showtimeRepository.findOne.mockResolvedValueOnce(mockShowtime).mockResolvedValueOnce(null);

      await expect(
        showtimeService.updateShowtime(
          1,
          1,
          50.2,
          'Sample Theater',
          '2025-02-14T11:47:46.125405Z',
          '2025-02-14T14:47:46.125405Z'
        )
      ).resolves.not.toThrow();
      expect(showtimeRepository.save).toHaveBeenCalledWith({
        ...mockShowtime,
        movieId: 1,
        price: 50.2,
        theater: 'Sample Theater',
        startTime: '2025-02-14T11:47:46.125405Z',
        endTime: '2025-02-14T14:47:46.125405Z',
      });
    });

    it('should throw an error for a non-existent showtime', async () => {
      showtimeRepository.findOne.mockResolvedValue(null);

      await expect(
        showtimeService.updateShowtime(
          999,
          1,
          50.2,
          'Sample Theater',
          '2025-02-14T11:47:46.125405Z',
          '2025-02-14T14:47:46.125405Z'
        )
      ).rejects.toThrow('Showtime not found');
    });

    it('should throw an error for overlapping showtimes', async () => {
      const mockShowtime = new Showtime();
      const mockOverlappingShowtime = new Showtime();
      mockOverlappingShowtime.id = 2;
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie',
          genre: 'Drama',
          duration: 120,
          rating: 5,
          releaseYear: 2022,
        },
      ];
      movieService.getAllMovies.mockResolvedValue(mockMovies);
      showtimeRepository.findOne.mockResolvedValueOnce(mockShowtime).mockResolvedValueOnce(mockOverlappingShowtime);

      await expect(
        showtimeService.updateShowtime(
          1,
          1,
          50.2,
          'Sample Theater',
          '2025-02-14T11:47:46.125405Z',
          '2025-02-14T14:47:46.125405Z'
        )
      ).rejects.toThrow('Overlapping showtime for the same theater');
    });
  });
});