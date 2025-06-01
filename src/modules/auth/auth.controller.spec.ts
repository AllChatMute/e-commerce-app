import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { HashService } from "../../services/hash.service";
import { UsersService } from "../users/users.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { CartRepositoryService } from "src/services/cartRepository.service";

const token = { accessToken: "test_token" };
const user = { email: "email", password: "password" };
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
} as unknown as Response;

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn().mockResolvedValue(token),
            signIn: jest.fn().mockResolvedValue(token),
          },
        },
        { provide: UsersService, useValue: {} },
        JwtService,
        CartRepositoryService,
        ConfigService,
        HashService,
      ],
    }).compile();

    authController = moduleRef.get(AuthController);
    authService = moduleRef.get(AuthService);
  });

  it("should be defined", () => {
    expect(authController).toBeDefined();
  });

  it("should return accessToken in signUp and signIn", async () => {
    expect(await authController.signIn(user, mockResponse)).toEqual(token);

    expect(await authController.signUp(user, mockResponse)).toEqual(token);
  });

  it("should be called with correct params", async () => {
    await authController.signIn(user, mockResponse);

    expect(authService.signIn).toHaveBeenCalledWith(user, mockResponse);
  });

  it("should throw 401 if user not found", async () => {
    jest
      .spyOn(authService, "signIn")
      .mockRejectedValue(new UnauthorizedException());

    await expect(
      authController.signIn(
        { email: "invalid", password: "invalid" },
        mockResponse
      )
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw 400 if user exists", async () => {
    jest
      .spyOn(authService, "signUp")
      .mockRejectedValue(new BadRequestException());

    await expect(authController.signUp(user, mockResponse)).rejects.toThrow(
      BadRequestException
    );
  });
});
