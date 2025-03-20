import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BookingController (e2e)', () => {
  let app;
  let server;
  let newBookingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully book a ticket and return bookingId', async () => {
    const response = await request(server)
      .post('/bookings')
      .send({
        showtimeId: 2,
        seatNumber: 51,
        userId: 'user-123',
      })
      .expect(200);
      newBookingId = response.body.bookingId;
    expect(typeof response.body.bookingId).toBe('string');
  });

  it('should return 404 if showtime is not found', async () => {
    const response = await request(server)
      .post('/bookings')
      .send({
        showtimeId: 999, 
        seatNumber: 15,
        userId: 'user-123',
      })
      .expect(404);

    expect(response.body.message).toBe('Failed to book ticket: Showtime not found');
  });

  it('should return 409 if seat is already booked', async () => {
    const response = await request(server)
      .post('/bookings')
      .send({
        showtimeId: 2,
        seatNumber: 38,
        userId: 'user-456',
      })
      .expect(409);

    expect(response.body.message).toBe('Seat already booked for this showtime.');
  });

  it('should delete a booking', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/bookings/${newBookingId}`)  
        .expect(200);
  
      expect(response.status).toBe(200);
    });
});
