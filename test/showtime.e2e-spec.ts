import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('ShowtimeController (e2e)', () => {
  let app: INestApplication;
  let newShowtimeId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get showtime by ID', async () => {
    const response = await request(app.getHttpServer()).get('/showtimes/2').expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('price');
    expect(response.body).toHaveProperty('movieId');
    expect(response.body).toHaveProperty('theater');
    expect(response.body).toHaveProperty('startTime');
    expect(response.body).toHaveProperty('endTime');
  });

  it('should add a new showtime', async () => {
    const startTime = new Date();
    const endTime = new Date();
    startTime.setHours(startTime.getHours() + 2);
    endTime.setHours(startTime.getHours() + 1);
    const showtimeData = {
      movieId: 1,
      price: 30.2,
      theater: 'Best Theater',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };

    const response = await request(app.getHttpServer())
      .post('/showtimes')
      .send(showtimeData)
      .expect(200);
      newShowtimeId = response.body.id;
    expect(response.body).toHaveProperty('id');
    expect(response.body.price).toBe(showtimeData.price);
    expect(response.body.movieId).toBe(showtimeData.movieId);
    expect(response.body.theater).toBe(showtimeData.theater);
    expect(response.body.startTime).toBe(showtimeData.startTime);
    expect(response.body.endTime).toBe(showtimeData.endTime);
  });

  it('should update a showtime', async () => {
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(startTime.getHours() + 6);
    startTime.setHours(startTime.getHours() + 5);
    const updatedShowtimeData = {
      movieId: 1,
      price: 51.2,
      theater: 'Similiar Theater',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };

    const response = await request(app.getHttpServer())
      .post(`/showtimes/update/${newShowtimeId}`)  
      .send(updatedShowtimeData)
      .expect(200);
  });

  it('should delete a showtime', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/showtimes/${newShowtimeId}`)  
      .expect(200);

    expect(response.status).toBe(200);
  });
});
