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
import { AuthGuard } from "../src/common/guards/auth.guard";
import { AuthMockGuard } from "../src/common/guards/auth-mock.guard";
import { Cart } from "../src/schemas/cart.schema";

// categories проверяется отдельно
const expectedProductStructure = {
  productId: expect.any(Number) as number,
  name: expect.any(String) as string,
  description: expect.any(String) as string,
  price: expect.any(Number) as number,
  count: expect.any(Number) as number,
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

const checkCorrectCartStructure = (cart: Cart) => {
  expect(cart).toHaveProperty("ownerEmail");
  expect(cart).toHaveProperty("products");

  expect(typeof cart.ownerEmail).toEqual("string");
  expect(cart.products).toBeInstanceOf(Array);
  cart.products.forEach((product) => checkCorrectProductStructure(product));
};

describe("CartController (e2e)", () => {
  let app: INestApplication<App>;
  let cartModel: Model<Product>;
  let userModel: Model<User>;
  let productModel: Model<Product>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(AuthMockGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    cartModel = moduleFixture.get<Model<Product>>("CartModel");
    userModel = moduleFixture.get<Model<User>>("UserModel");
    productModel = moduleFixture.get<Model<Product>>("ProductModel");

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api");
    await app.init();

    await cartModel.deleteMany({});
    await userModel.deleteMany({});
    await productModel.deleteMany({});

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "admin@email.com", password: "password" });

    await request(app.getHttpServer())
      .post("/api/products")
      .send(createProductDto);
  });

  afterAll(async () => {
    await cartModel.deleteMany({});
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await app.close();
  });

  it("POST /api/cart/:id - should return cart with added product", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/cart/1")
      .expect(200)) as unknown as Response & { body: Cart };

    checkCorrectCartStructure(response.body);
  });

  it("GET /api/cart - should return an array of products from cart", async () => {
    const response = (await request(app.getHttpServer())
      .get("/api/cart")
      .expect(200)) as unknown as Response & { body: Product[] };

    expect(response.body).toBeInstanceOf(Array);

    response.body.forEach((item) => {
      checkCorrectProductStructure(item);
    });
  });

  it("second POST /api/cart/:id - should return cart with product's count incremented by 1", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/cart/1")
      .expect(200)) as unknown as Response & { body: Cart };

    checkCorrectCartStructure(response.body);
    const foundedProduct = response.body.products.find(
      (item) => item.productId === 1
    );
    expect(foundedProduct?.count).toEqual(2);
  });

  it("DELETE /api/cart/dec/:id - should return cart with product's count decreased by 1", async () => {
    const response = (await request(app.getHttpServer())
      .delete("/api/cart/dec/1")
      .expect(200)) as unknown as Response & { body: Cart };

    checkCorrectCartStructure(response.body);
    const foundedProduct = response.body.products.find(
      (item) => item.productId === 1
    );
    expect(foundedProduct?.count).toEqual(1);
  });

  it("DELETE /api/cart/:id - should throw 204", async () => {
    await request(app.getHttpServer()).delete("/api/products/1").expect(204);
  });

  it("POST /api/cart/:id - should throw 404 if product not found", async () => {
    await request(app.getHttpServer()).post("/api/cart/2").expect(404);
  });

  it("DELETE /api/cart/dec/:id - should throw 404 if product not found", async () => {
    await request(app.getHttpServer()).put("/api/cart/dec/2").expect(404);
  });
});
