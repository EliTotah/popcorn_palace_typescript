import { Module } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './showtime.model';
import { MovieModule } from '../movie/movie.module';


@Module({
  imports: [TypeOrmModule.forFeature([Showtime]), MovieModule],
  providers: [ShowtimeService],
  controllers: [ShowtimeController],
  exports: [ShowtimeService],
})
export class ShowtimeModule {}
