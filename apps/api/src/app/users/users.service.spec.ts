import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let dbMock: any;

  beforeEach(() => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 1, email: 'new@test.com', name: 'New User' }]),
    };
    service = new UsersService(dbMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreate', () => {
    it('should return existing user if found', async () => {
      const existingUser = { id: 1, email: 'test@test.com', name: 'Existing User' };
      dbMock.limit.mockResolvedValueOnce([existingUser]);
      
      const result = await service.findOrCreate({
        email: 'test@test.com',
        name: 'Existing User',
        provider: 'google',
      });
      
      expect(result).toEqual({ user: existingUser, created: false });
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it('should create and return new user if not found', async () => {
      dbMock.limit.mockResolvedValueOnce([]); // User not found
      
      const result = await service.findOrCreate({
        email: 'new@test.com',
        name: 'New User',
        provider: 'google',
      });
      
      expect(result).toEqual({
        user: { id: 1, email: 'new@test.com', name: 'New User' },
        created: true,
      });
      expect(dbMock.insert).toHaveBeenCalled();
    });
  });
});
