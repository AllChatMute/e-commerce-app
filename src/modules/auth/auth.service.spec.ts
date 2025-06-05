import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { HashService } from "../../services/hash.service";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { CookieService } from "../../services/cookie.service";

const token = { accessToken: "test_token" };
const user = { email: "email", password: "password" };
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
} as unknown as Response;

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let hashService: HashService;
  let cookieService: CookieService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUser: jest.fn().mockResolvedValue(user),
            createUser: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        JwtService,
        CookieService,
        ConfigService,
        HashService,
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    hashService = moduleRef.get(HashService);
    cookieService = moduleRef.get(CookieService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  it("should return accessToken in signIn", async () => {
    jest.spyOn(cookieService, "generateAuthCookie").mockResolvedValue(token);
    jest.spyOn(hashService, "compare").mockResolvedValue(true);

    expect(await authService.signIn(user, mockResponse)).toEqual(token);
  });

  it("should return accessToken in signUp", async () => {
    jest.spyOn(usersService, "findUser").mockResolvedValue(null);
    jest.spyOn(cookieService, "generateAuthCookie").mockResolvedValue(token);

    expect(await authService.signUp(user, mockResponse)).toEqual(token);
  });

  it("should throw 401 if user not found", async () => {
    jest.spyOn(usersService, "findUser").mockResolvedValue(null);

    await expect(
      authService.signIn(
        { email: "invalid", password: "invalid" },
        mockResponse
      )
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw 401 if password doesn't compare", async () => {
    jest.spyOn(hashService, "compare").mockResolvedValue(false);

    await expect(
      authService.signIn(
        { email: "email@mail.test", password: "invalid" },
        mockResponse
      )
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw 401 if user exists", async () => {
    jest.spyOn(usersService, "findUser").mockResolvedValue(user);

    await expect(authService.signUp(user, mockResponse)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
