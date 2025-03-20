import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const mockPool = {
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
};

const mockToken = faker.string.uuid();

const mockJwtService = {
  sign: jest.fn().mockReturnValue(mockToken),
};

describe('AuthService', () => {
  let service: AuthService;
  let pool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'PG_CONNECTION', useValue: mockPool },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    pool = module.get('PG_CONNECTION');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const mockData = {
      first_name: faker.internet.username(),
      last_name: faker.internet.username(),
      age: faker.number.int({ min: 0, max: 100 }),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should register a new user successfully', async () => {
      pool.connect.mockResolvedValue({
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [{ is_exist: false }] })
          .mockResolvedValueOnce({}),
        release: jest.fn(),
      });

      const result = await service.signUp(mockData);

      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw BadRequestException when user is already exists', async () => {
      pool.connect.mockResolvedValue({
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [{ is_exist: true }] })
          .mockResolvedValueOnce({}),
        release: jest.fn(),
      });

      await expect(service.signUp(mockData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signIn', () => {
    const mockData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    it('should successfully sign in a user', async () => {
      const mockHashedPassword = await bcrypt.hash(mockData.password, 10);

      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              email: mockData.email,
              password: mockHashedPassword,
            },
          ],
        }),
        release: jest.fn(),
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.signIn(mockData);

      expect(result).toEqual({ token: mockToken, user: expect.any(Object) });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      });

      await expect(
        service.signIn({ email: faker.internet.email(), password: faker.internet.password() }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({
          rows: [{ email: mockData.email, password: mockData.password }],
        }),
        release: jest.fn(),
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.signIn({ email: mockData.email, password: faker.internet.password() }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
