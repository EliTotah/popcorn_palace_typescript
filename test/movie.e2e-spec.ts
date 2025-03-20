import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('MovieController (e2e)', () => {
  let app: INestApplication;

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

  it('should get all movies', async () => {
    const response = await request(app.getHttpServer()).get('/movies/all').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('genre');
    expect(response.body[0]).toHaveProperty('duration');
    expect(response.body[0]).toHaveProperty('rating');
    expect(response.body[0]).toHaveProperty('releaseYear');
  });

  it('should add a new movie', async () => {
    const movieData = {
      title: 'Sample Movie Title',
      genre: 'Action',
      duration: 120,
      rating: 8.7,
      releaseYear: 2025,
    };

    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(movieData.title);
    expect(response.body.genre).toBe(movieData.genre);
    expect(response.body.duration).toBe(movieData.duration);
    expect(response.body.rating).toBe(movieData.rating);
    expect(response.body.releaseYear).toBe(movieData.releaseYear);
  });

  it('should update a movie', async () => {
    const updatedMovieData = {
      title: 'Updated Movie Title',
      genre: 'Comedy',
      duration: 100,
      rating: 7.5,
      releaseYear: 2024,
    };

    await request(app.getHttpServer())
      .post('/movies/update/Sample Movie Title') // Assuming "Sample Movie Title" exists
      .send(updatedMovieData)
      .expect(200);

    const response = await request(app.getHttpServer()).get('/movies/all').expect(200);
    const updatedMovie = response.body.find((movie: any) => movie.title === updatedMovieData.title);

    expect(updatedMovie).toBeDefined();
    expect(updatedMovie.genre).toBe(updatedMovieData.genre);
    expect(updatedMovie.duration).toBe(updatedMovieData.duration);
    expect(updatedMovie.rating).toBe(updatedMovieData.rating);
    expect(updatedMovie.releaseYear).toBe(updatedMovieData.releaseYear);
  });

  it('should delete a movie', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete('/movies/Updated Movie Title') 
      .expect(200);
  
    expect(deleteResponse.body).toEqual({});
  });
});
