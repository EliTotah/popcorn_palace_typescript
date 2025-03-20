import { Controller, Post, Body, Get, Delete, Param, HttpException, HttpStatus, HttpCode  } from '@nestjs/common';
import { MovieService } from './movie.service';  
import { Movie } from './movie.model';
import {validateMovieInput} from '../utils/validations';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('/all') 
  async getAllMovies(): Promise<Movie[]> {
    try {
        return await this.movieService.getAllMovies();
      } catch (error) {
        throw new HttpException('Failed to fetch movies: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Post()
  @HttpCode(200)
  async addMovie(
    @Body() body: { title: string; genre: string; duration: number; rating: number; 
        releaseYear: number }
  ): Promise<Movie> {
    try {
        const { title, genre, duration, rating, releaseYear } = body;
        validateMovieInput(body);
        return await this.movieService.addMovie(title, genre, duration, rating, releaseYear);
      } catch (error) {
        if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
            throw error; 
        }
        throw new HttpException('Failed to add movie: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Delete('/:movieTitle')
  async deleteMovie(@Param('movieTitle') title: string): Promise<void> {
    try {
        if (!title) {
          throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
        }
        if (title.trim().length === 0) {
            throw new HttpException('Title cannot be empty', HttpStatus.BAD_REQUEST);
        }
        await this.movieService.deleteMovie(title);
      } catch (error) {
        if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
            throw error; 
        }
        if (error.message === 'Movie not found') {
          throw new HttpException('Failed to delete movie: ' + error.message, HttpStatus.NOT_FOUND);
        }
        throw new HttpException('Failed to delete movie: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Post('update/:movieTitle')
  @HttpCode(200)
  async updateMovie(
    @Param('movieTitle') MovieTitle: string,
    @Body() body: { title: string, genre: string; duration: number; rating: number; releaseYear: number}
    ): Promise<void> {
        try {
            if (!MovieTitle) {
                throw new HttpException('movieTitle is required', HttpStatus.BAD_REQUEST);
            }
            if (typeof MovieTitle !== 'string' || MovieTitle.trim().length === 0) {
                throw new HttpException('MovieTitle must be a non-empty string', HttpStatus.BAD_REQUEST);
            }
            const { title, genre, duration, rating, releaseYear } = body;
            validateMovieInput({title, genre, duration, rating, releaseYear});
            await this.movieService.updateMovie(MovieTitle, title, genre, duration, rating, releaseYear);
          } catch (error) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
                throw error; 
            }
            if (error.message === 'Movie not found') {
              throw new HttpException('Failed to update movie: ' + error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Failed to update movie: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }
}
