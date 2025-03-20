import { HttpException, HttpStatus } from '@nestjs/common';

export function validateMovieInput(movie: { title: string; genre: string; duration: number; rating: number; releaseYear: number }): void {
    const { title, genre, duration, rating, releaseYear } = movie;
    if (!title || !genre || !duration || !rating || !releaseYear) {
        throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }
    if (typeof title !== 'string' || title.trim().length === 0) {
        throw new HttpException('Title must be a non-empty string', HttpStatus.BAD_REQUEST);
    }
    if (typeof genre !== 'string' || genre.trim().length === 0) {
        throw new HttpException('Genre must be a non-empty string', HttpStatus.BAD_REQUEST);
    }
    if (typeof duration !== 'number' || duration <= 0) {
        throw new HttpException('Duration must be a positive number', HttpStatus.BAD_REQUEST);
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
        throw new HttpException('Rating must be between 0 and 10', HttpStatus.BAD_REQUEST);
    }
    if (typeof releaseYear !== 'number') {
        throw new HttpException('Release year must be valid', HttpStatus.BAD_REQUEST);
    }
}

export function validateShowtimeInput(showtime: { movieId: number; price: number; theater: string; startTime: string; endTime: string }): void {
    const { movieId, price, theater, startTime, endTime } = showtime;
  
    if (!movieId || !price || !theater || !startTime || !endTime) {
      throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }
  
    if (!Number.isInteger(movieId) || movieId <= 0) {
      throw new HttpException('movieId must be a positive integer', HttpStatus.BAD_REQUEST);
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new HttpException('price must be a positive number', HttpStatus.BAD_REQUEST);
    }
  
    if (typeof theater !== 'string' || theater.trim() === '') {
      throw new HttpException('theater must be a non-empty string', HttpStatus.BAD_REQUEST);
    }
  
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
  
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException('startTime and endTime must be valid ISO date strings', HttpStatus.BAD_REQUEST);
    }
  
    if (startDate >= endDate) {
      throw new HttpException('startTime must be before endTime', HttpStatus.BAD_REQUEST);
    }
}

export function validateBookTicketInput(body: { showtimeId: number; seatNumber: number; userId: string }): void {
    const { showtimeId, seatNumber, userId } = body;

    if (!showtimeId || !seatNumber || !userId) {
        throw new HttpException('All fields are required', HttpStatus.BAD_REQUEST);
    }

    if (!Number.isInteger(showtimeId) || showtimeId <= 0) {
        throw new HttpException('showtimeId must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
        throw new HttpException('seatNumber must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    if (typeof userId !== 'string' || userId.trim().length === 0) {
        throw new HttpException('userId must be a non-empty string', HttpStatus.BAD_REQUEST);
    }
}