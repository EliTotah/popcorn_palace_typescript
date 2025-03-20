import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Showtime } from './showtime.model';
import { MovieService } from '../movie/movie.service';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    private readonly movieService: MovieService
  ) {}

  async getShowtimeById(id: number): Promise<Showtime> {
    try {
        const showtime = await this.showtimeRepository.findOne({ where: { id } });
        if (!showtime) {
            throw new Error('Showtime not found');
        }
        return showtime;
    } catch (error) {
        throw error;
      }
  }

  async addShowtime(movieId: number, price: number, theater: string, 
    startTime: string, endTime: string ): Promise<Showtime> {
        try {
            const movie = (await this.movieService.getAllMovies()).find(movie => movie.id === movieId);
            if (!movie) {
                throw new Error('Movie not exist');
            }
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            const overlappingShowtime = await this.showtimeRepository.findOne({
            where: {
                theater: theater,
                startTime: LessThanOrEqual(endDate),
                endTime: MoreThanOrEqual(startDate),
            },
            });
            if (overlappingShowtime) {
                throw new ConflictException('Overlapping showtime for the same theater');
            }
            const newShowtime = this.showtimeRepository.create({price, movieId, theater, 
            startTime: startDate,
            endTime: endDate});
            return await this.showtimeRepository.save(newShowtime);
        } catch (error) {
            throw error;
        }
    }

    async deleteShowtime(id: number): Promise<void> {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id } });
            if (!showtime) {
            throw new Error('Showtime not found');
            }
            await this.showtimeRepository.remove(showtime);
        } catch (error) {
            throw error;
        }
    }

    async updateShowtime(id: number, movieId: number, price: number, theater: string, 
        startTime: string, endTime: string): Promise<void> {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id } });
            if (!showtime) {
                throw new Error('Showtime not found');
            }
            const movie = (await this.movieService.getAllMovies()).find(movie => movie.id === movieId);
            if (!movie) {
                throw new Error('Movie not exist');
            }
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            const overlappingShowtime = await this.showtimeRepository.findOne({
            where: {
                theater: theater,
                startTime: LessThanOrEqual(endDate),
                endTime: MoreThanOrEqual(startDate),
            },
            });
            if (overlappingShowtime && overlappingShowtime.id !== id) {
                throw new ConflictException('Overlapping showtime for the same theater');
            }
            Object.assign(showtime, {price, movieId, theater, startTime, endTime});
            await this.showtimeRepository.save(showtime);
      } catch (error) {
        throw error;
      }
    }
}