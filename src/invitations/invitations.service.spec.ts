import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { InvitationType } from '../utils/enums/invitation-type';
import { InvitationStatus } from '../utils/enums/invitation-status';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

const mockPool = {
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
};

describe('InvitationsService', () => {
  let service: InvitationsService;
  let pool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationsService, { provide: 'PG_CONNECTION', useValue: mockPool }],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    pool = module.get('PG_CONNECTION');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockData = {
      sender_id: 1,
      receiver_id: 2,
      type: InvitationType.FRIEND,
      status: InvitationStatus.PENDING,
    };

    it('should create a new invitation successfully', async () => {
      pool.connect.mockResolvedValue({
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [{ is_exist: true }] })
          .mockResolvedValueOnce({ rows: [{ is_exist: false }] })
          .mockResolvedValueOnce({
            rows: [mockData],
          }),
        release: jest.fn(),
      });

      const result = await service.create(
        {
          receiver_id: mockData.receiver_id,
          type: mockData.type,
        },
        mockData.sender_id,
      );

      expect(result).toEqual(mockData);

      expect(pool.connect).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundException if receiver doesn't not exist", async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValueOnce({ rows: [{ is_exist: false }] }),
        release: jest.fn(),
      });

      await expect(
        service.create(
          { receiver_id: mockData.receiver_id, type: mockData.type },
          mockData.sender_id,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invitation already exists', async () => {
      pool.connect.mockResolvedValue({
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [{ is_exist: true }] })
          .mockResolvedValueOnce({ rows: [{ is_exist: true }] }),
        release: jest.fn(),
      });

      await expect(
        service.create(
          { receiver_id: mockData.receiver_id, type: mockData.type },
          mockData.sender_id,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    const mockData = {
      invitation_id: 1,
      receiver_id: 2,
      status: InvitationStatus.ACCEPTED,
    };
    it('should update the invitation status successfully', async () => {
      pool.connect.mockResolvedValue({
        query: jest
          .fn()
          .mockResolvedValueOnce({
            rows: [{ id: mockData.invitation_id, receiver_id: mockData.receiver_id }],
          })
          .mockResolvedValueOnce({
            rows: [{ id: mockData.invitation_id, status: mockData.status }],
          }),
        release: jest.fn(),
      });

      const result = await service.update(
        { status: mockData.status },
        mockData.invitation_id,
        mockData.receiver_id,
      );

      expect(result).toEqual({ id: mockData.invitation_id, status: InvitationStatus.ACCEPTED });
    });

    it('should throw NotFoundException if invitation does not exist', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      });

      await expect(
        service.update({ status: mockData.status }, mockData.invitation_id, mockData.receiver_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if receiver_id does not match', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({
          rows: [{ id: mockData.invitation_id, receiver_id: faker.number.int({ min: 100 }) }],
        }),
        release: jest.fn(),
      });

      await expect(
        service.update({ status: mockData.status }, mockData.invitation_id, mockData.receiver_id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMyInvitations', () => {
    it('should return an empty array if the user has no invitations', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      });

      const result = await service.getMyInvitations(1);

      expect(result).toEqual([]);
    });
  });
});
