import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Movie } from './movie.model';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MovieController', () => {
  let movieController: MovieController;
  let movieService: MovieService;

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Sample Movie Title 1',
      genre: 'Action',
      duration: 120,
      rating: 8.7,
      releaseYear: 2025,
    },
    {
      id: 2,
      title: 'Sample Movie Title 2',
      genre: 'Comedy',
      duration: 90,
      rating: 7.5,
      releaseYear: 2024,
    },
  ];

  const mockMovieService = {
    getAllMovies: jest.fn().mockResolvedValue(mockMovies),
    addMovie: jest.fn().mockResolvedValue(mockMovies[0]),
    deleteMovie: jest.fn().mockResolvedValue(undefined),
    updateMovie: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [{ provide: MovieService, useValue: mockMovieService }],
    }).compile();

    movieController = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
  });

  it('should fetch all movies', async () => {
    const result = await movieController.getAllMovies();
    expect(result).toEqual(mockMovies);
    expect(movieService.getAllMovies).toHaveBeenCalled();
  });

  it('should add a movie', async () => {
    const newMovie = {
      title: 'Sample Movie Title',
      genre: 'Action',
      duration: 120,
      rating: 8.7,
      releaseYear: 2025,
    };
    const result = await movieController.addMovie(newMovie);
    expect(result).toEqual(mockMovies[0]);
    expect(movieService.addMovie).toHaveBeenCalledWith(
      newMovie.title,
      newMovie.genre,
      newMovie.duration,
      newMovie.rating,
      newMovie.releaseYear,
    );
  });

  it('should delete a movie', async () => {
    const movieTitle = 'Sample Movie Title 1';
    await movieController.deleteMovie(movieTitle);
    expect(movieService.deleteMovie).toHaveBeenCalledWith(movieTitle);
  });

  it('should update a movie', async () => {
    const movieTitle = 'Sample Movie Title 1';
    const updatedMovie = {
      title: 'Updated Title',
      genre: 'Action',
      duration: 125,
      rating: 9.0,
      releaseYear: 2025,
    };
    await movieController.updateMovie(movieTitle, updatedMovie);
    expect(movieService.updateMovie).toHaveBeenCalledWith(
      movieTitle,
      updatedMovie.title,
      updatedMovie.genre,
      updatedMovie.duration,
      updatedMovie.rating,
      updatedMovie.releaseYear,
    );
  });

  it('should throw an error when deleting a non-existing movie', async () => {
    mockMovieService.deleteMovie.mockRejectedValue(
      new HttpException('Movie not found', HttpStatus.NOT_FOUND),
    );

    await expect(movieController.deleteMovie('Nonexistent Title')).rejects.toThrow(
      'Movie not found',
    );
    expect(movieService.deleteMovie).toHaveBeenCalledWith('Nonexistent Title');
  });
});
