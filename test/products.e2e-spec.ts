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

const checkCorrectProductStructure = (product: Product) => {
  expect(product).toMatchObject(expectedProductStructure);
  expect(product).toHaveProperty("categories");
  expect(product.categories).toBeInstanceOf(Array);
  product.categories!.forEach((category) => {
    expect(typeof category).toBe("string");
  });
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

    await productModel.deleteMany({});
    await userModel.deleteMany({});

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "admin@email.com", password: "password" });
  });

  afterAll(async () => {
    await productModel.deleteMany({});
    await userModel.deleteMany({});
    await app.close();
  });

  it("POST /api/products - should return created product", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/products")
      .send(createProductDto)
      .expect(201)) as unknown as Response & { body: Product };

    expect(response.body).toMatchObject(expectedProductStructure);
    expect(response.body).toHaveProperty("categories");
  });

  it("GET /api/products - should return an array of products", async () => {
    const response = (await request(app.getHttpServer())
      .get("/api/products")
      .expect(200)) as unknown as Response & { body: Product[] };

    expect(response.body).toBeInstanceOf(Array);

    response.body.forEach((item) => {
      checkCorrectProductStructure(item);
    });
  });

  it("GET /api/products/:id - should return single product", async () => {
    const response = (await request(app.getHttpServer())
      .get("/api/products/1")
      .expect(200)) as unknown as Response & { body: Product };

    checkCorrectProductStructure(response.body);
  });

  it("PUT /api/products/:id - should return updated product", async () => {
    const response = (await request(app.getHttpServer())
      .put("/api/products/1")
      .send({ ...createProductDto, price: 1500 })
      .expect(200)) as unknown as Response & { body: Product };

    checkCorrectProductStructure(response.body);
    expect(response.body.price).toEqual(1500);
  });

  it("DELETE /api/products/:id - should throw 204", async () => {
    await request(app.getHttpServer()).delete("/api/products/1").expect(204);
  });

  it("GET /api/products/:id - should throw 404 if product not found", async () => {
    await request(app.getHttpServer()).get("/api/products/1").expect(404);
  });

  it("PUT /api/products/:id - should throw 404 if product not found", async () => {
    await request(app.getHttpServer())
      .put("/api/products/1")
      .send({ ...createProductDto, price: 1500 })
      .expect(404);
  });

  it("DELETE /api/products/:id - should throw 404 if product not found", async () => {
    await request(app.getHttpServer()).delete("/api/products/1").expect(404);
  });
});
