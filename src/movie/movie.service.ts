import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.model';

@Injectable()
export class MovieService {
    constructor(
      @InjectRepository(Movie)
      private movieRepository: Repository<Movie>
    ) {}

    async getAllMovies(): Promise<Movie[]> {
      try {
        return await this.movieRepository.find();
      } catch (error) {
        throw new Error(error.message);
      }
    }
  
    async addMovie(title: string, genre: string, duration: number, 
        rating: number, releaseYear: number
    ): Promise<Movie> {
      try {
      const newMovie = this.movieRepository.create({title, genre, duration, 
        rating, releaseYear
      });
      return await this.movieRepository.save(newMovie);
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

    async deleteMovie(title: string): Promise<void> {
      try {
        const movie = await this.movieRepository.findOne({ where: { title } });
        if (!movie) {
          throw new Error('Movie not found');
        }
        await this.movieRepository.remove(movie);
      } catch (error) {
        throw new Error(error.message);
      }
    }

    async updateMovie(movieTitle: string, title: string, genre: string, duration: number, 
      rating: number, releaseYear: number
    ): Promise<void> {
      try {
        const movie = await this.movieRepository.findOne({ where: { title : movieTitle } });
        if (!movie) {
          throw new Error('Movie not found');
        }
        Object.assign(movie, { title, genre, duration, rating, releaseYear });
        await this.movieRepository.save(movie);
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }