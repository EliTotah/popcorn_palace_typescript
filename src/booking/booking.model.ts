import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['showtimeId', 'seatNumber'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  @Column()
  showtimeId: number;

  @Column()
  seatNumber: number;

  @Column()
  userId: string;
}
