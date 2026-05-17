import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user object for valid payload', async () => {
    const payload = { sub: 1, email: 'test@test.com', role: 'USER' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ id: 1, email: 'test@test.com', role: 'USER' });
  });

  it('should throw UnauthorizedException if payload is invalid', async () => {
    await expect(strategy.validate(null)).rejects.toThrow(UnauthorizedException);
    await expect(strategy.validate({})).rejects.toThrow(UnauthorizedException);
  });
});
