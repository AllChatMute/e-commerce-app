import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { User } from "../src/schemas/user.schema";
import { Model } from "mongoose";
import * as cookieParser from "cookie-parser";
import { CreateUserDto } from "../src/modules/auth/types/createUserDto";
import { Response } from "express";

const dto: CreateUserDto = {
  email: "email@mail.com",
  password: "password",
};

describe("AuthController (e2e)", () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    userModel = moduleFixture.get<Model<User>>("UserModel");

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api");
    await app.init();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  it("POST /api/auth/register - should create user and return accessToken", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(dto)
      .expect(200)) as unknown as Response & { body: { accessToken: string } };

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken).toMatch(/^eyJ/);
  });

  it("POST /api/auth/register - should throw 401 if user exists", async () => {
    await request(app.getHttpServer()).post("/api/auth/register").send(dto);

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(dto)
      .expect(401);
  });

  it("POST api/auth/login - should find user and return accessToken", async () => {
    await request(app.getHttpServer()).post("/api/auth/register").send(dto);

    const response = (await request(app.getHttpServer())
      .post("/api/auth/login")
      .send(dto)
      .expect(200)) as unknown as Response & { body: { accessToken: string } };

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.accessToken).toMatch(/^eyJ/);
  });

  it("POST api/auth/login - should throw 401 if user not found", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send(dto)
      .expect(401);
  });

  it("POST api/auth/login - throw return 401 if password doesn't compare", async () => {
    await request(app.getHttpServer()).post("/api/auth/register").send(dto);

    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "email@mail.com", password: "invalid" })
      .expect(401);
  });
});
