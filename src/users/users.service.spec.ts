import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { GetUsersDto } from './dtos/get-users.dto';
import { faker } from '@faker-js/faker';

const mockPool = {
  query: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let pool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: 'PG_CONNECTION', useValue: mockPool }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    pool = module.get('PG_CONNECTION');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('index', () => {
    const mockUsers = [
      {
        id: faker.number.int({ min: 1 }),
        first_name: faker.internet.username(),
        last_name: faker.internet.username(),
        age: faker.number.int({ min: 0, max: 100 }),
        email: faker.internet.email(),
        created_at: new Date(),
      },
      {
        id: faker.number.int({ min: 1 }),
        first_name: faker.internet.username(),
        last_name: faker.internet.username(),
        age: faker.number.int({ min: 0, max: 100 }),
        email: faker.internet.email(),
        created_at: new Date(),
      },
    ];

    it('should return a list of users with pagination', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: mockUsers })
        .mockResolvedValueOnce({ rows: [{ total: 2 }] });

      const query: GetUsersDto = { search: '', page: 1, limit: 10 };
      const result = await service.index(query, 3);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should apply search filter correctly', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] });

      const query: GetUsersDto = { search: 'nonexistent', page: 1, limit: 10 };
      const result = await service.index(query, 3);

      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });
  });
});
