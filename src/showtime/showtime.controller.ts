import { Controller, Post, Get, HttpException,HttpStatus, Delete, Param, Body, HttpCode, ConflictException } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { Showtime } from './showtime.model';
import {validateShowtimeInput} from '../utils/validations'


@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Get('/:id')
  async getShowtimeById(@Param('id') id: number): Promise<Showtime> {
    try {
        const numericId = Number(id);
        if (Number.isNaN(numericId)) {
            throw new HttpException('Failed to fetch showtime: id is not valid', HttpStatus.BAD_REQUEST);
        }
        return await this.showtimeService.getShowtimeById(numericId);
    } catch (error) {
        if (error.message === 'Showtime not found') {
            throw new HttpException('Failed to fetch showtime: ' + error.message, HttpStatus.NOT_FOUND);
          }
          if (error instanceof HttpException || error instanceof ConflictException) {
            throw new HttpException('Failed to fetch showtime: ' + error.message, error.getStatus()); 
        }
        throw new HttpException('Failed to fetch showtime: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @HttpCode(200)
  async addShowtime(@Body() body: { movieId: number; price: number; theater: string;
    startTime: string; endTime: string }
    ): Promise<Showtime> {
        try {
            const { movieId, price, theater, startTime, endTime } = body; 
            validateShowtimeInput(body);
            return await this.showtimeService.addShowtime(movieId, price, theater, 
                startTime, endTime);
        } catch (error) {
            if (error instanceof HttpException || error instanceof ConflictException) {
                throw new HttpException('Failed to fetch showtime: ' + error.message, error.getStatus()); 
            }
            if (error.message === 'Showtime not found' || error.message === 'Movie not exist') {
                throw new HttpException('Failed to add showtime: ' + error.message, HttpStatus.NOT_FOUND);
            }
            if (error.message === 'Overlapping showtime for the same theater') {
                throw new HttpException('Failed to add showtime: ' + error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Failed to add showtime: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

  @Delete('/:id')
  async deleteShowtime(@Param('id') id: number): Promise<void> {
    try {
        if (!id) {
            throw new HttpException('Failed to delete showtime: id is required', HttpStatus.BAD_REQUEST);
        }
        const numericId = Number(id);
        if (Number.isNaN(numericId) || id <= 0) {
            throw new HttpException('Failed to delete showtime: id must be a positive number', HttpStatus.BAD_REQUEST);
        }
        await this.showtimeService.deleteShowtime(numericId);
    } catch (error) {
        if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
            throw error; 
        }
        if (error.message === 'Showtime not found' || error.message === 'Movie not exist') {
          throw new HttpException('Failed to delete showtime: ' + error.message, HttpStatus.NOT_FOUND);
        }
        if (error.message === 'Overlapping showtime for the same theater') {
            throw new HttpException('Failed to add showtime: ' + error.message, HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('Failed to delete showtime: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Post('/update/:id')
  @HttpCode(200)
  async updateShowtime(
    @Param('id') id: number, 
    @Body() body: { movieId: number; price: number; theater: string;
        startTime: string; endTime: string }
    ): Promise<void> {
        try {
            if (!id) {
                throw new HttpException('id is required', HttpStatus.BAD_REQUEST);
            }
            const numericId = Number(id);
            if (Number.isNaN(numericId) || id <= 0) {
                throw new HttpException('id must be a positive number', HttpStatus.BAD_REQUEST);
            }
            const { movieId, price, theater, startTime, endTime } = body; 
            validateShowtimeInput(body);
            await this.showtimeService.updateShowtime(numericId, movieId, price, theater, startTime, endTime);
        } catch (error) {
            if (error instanceof HttpException && error.getStatus() === HttpStatus.BAD_REQUEST) {
                throw new HttpException('Failed to update showtime: ' + error.message, HttpStatus.BAD_REQUEST); 
            }
            if (error instanceof ConflictException) {
                throw new HttpException('Failed to update showtime: ' + error.message, HttpStatus.CONFLICT);
            }
            if (error.message === 'Showtime not found' || error.message === 'Movie not exist' || error.message === 'Overlapping showtime for the same theater') {
              throw new HttpException('Failed to update showtime: ' + error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Failed to update showtime: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
          }
  }

}