import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { Movie } from './movie.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MovieService', () => {
  let service: MovieService;
  let repository: Repository<Movie>;

  const mockMovieRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const sampleMovieInput = {
    title: 'Sample Movie',
    genre: 'Action',
    duration: 120,
    rating: 8.5,
    releaseYear: 2023,
  };

  const sampleMovie: Movie = {
    id: 1,
    ...sampleMovieInput,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllMovies', () => {
    it('should return all movies', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([sampleMovie]);

      const result = await service.getAllMovies();

      expect(result).toEqual([sampleMovie]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('addMovie', () => {
    it('should add a movie and return it with an ID', async () => {
      const savedMovie = { ...sampleMovieInput, id: 1 };
      jest.spyOn(repository, 'create').mockReturnValue(savedMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(savedMovie);

      const result = await service.addMovie(
        sampleMovieInput.title,
        sampleMovieInput.genre,
        sampleMovieInput.duration,
        sampleMovieInput.rating,
        sampleMovieInput.releaseYear
      );

      expect(result).toEqual(savedMovie);
      expect(repository.create).toHaveBeenCalledWith(sampleMovieInput);
      expect(repository.save).toHaveBeenCalledWith(savedMovie);
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie by title', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(sampleMovie);
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.deleteMovie(sampleMovie.title);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: sampleMovie.title } });
      expect(repository.remove).toHaveBeenCalledWith(sampleMovie);
    });

    it('should throw an error if movie not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.deleteMovie('Unknown Movie')).rejects.toThrow('Movie not found');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: 'Unknown Movie' } });
    });
  });

  describe('updateMovie', () => {
    it('should update a movie by title', async () => {
      const updatedMovie = { ...sampleMovie, rating: 9.0 };
      jest.spyOn(repository, 'findOne').mockResolvedValue(sampleMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedMovie);

      await service.updateMovie(
        sampleMovie.title,
        updatedMovie.title,
        updatedMovie.genre,
        updatedMovie.duration,
        updatedMovie.rating,
        updatedMovie.releaseYear
      );

      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: sampleMovie.title } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedMovie));
    });

    it('should throw an error if movie not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.updateMovie(
          'Unknown Movie',
          sampleMovie.title,
          sampleMovie.genre,
          sampleMovie.duration,
          sampleMovie.rating,
          sampleMovie.releaseYear
        )
      ).rejects.toThrow('Movie not found');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: 'Unknown Movie' } });
    });
  });
});
