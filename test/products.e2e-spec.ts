import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Model } from "mongoose";
import * as cookieParser from "cookie-parser";
import { Product } from "../src/schemas/product.schema";
import { Response } from "express";
import { CreateProductDto } from "../src/modules/products/types/createProductDto";
import { User } from "../src/schemas/user.schema";
import { AuthGuard } from "../src/guards/auth.guard";
import { AuthMockGuard } from "../src/guards/auth-mock.guard";

// categories проверяется отдельно
const expectedProductStructure = {
  productId: expect.any(Number) as number,
  name: expect.any(String) as string,
  description: expect.any(String) as string,
  price: expect.any(Number) as number,
};

const createProductDto: CreateProductDto = {
  name: "test",
  description: "test",
  price: 1000,
  categories: ["category"],
};

describe("ProductsController (e2e)", () => {
  let app: INestApplication<App>;
  let productModel: Model<Product>;
  let userModel: Model<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(AuthMockGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    productModel = moduleFixture.get<Model<Product>>("ProductModel");
    userModel = moduleFixture.get<Model<User>>("UserModel");

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api");
    await app.init();

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "admin@email.com", password: "password" });
  });

  beforeEach(async () => {
    await productModel.deleteMany({});
  });

  afterAll(async () => {
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await app.close();
  });

  // TODO: Добавить мок авторизации во все последующие тесты
  it("POST /api/products - should return created product", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/products")
      .send(createProductDto)
      .expect(200)) as unknown as Response & { body: Product };
  });

  it("GET /api/products - should return an array of products", async () => {
    const response = (await request(app.getHttpServer())
      .get("/api/products")
      .expect(200)) as unknown as Response & { body: Product[] };

    expect(response.body).toBeInstanceOf(Array);

    response.body.forEach((item) => {
      expect(item).toMatchObject(expectedProductStructure);
      expect(item).toHaveProperty("categories");
      expect(typeof item.categories).toBe("string");
    });
  });
});
