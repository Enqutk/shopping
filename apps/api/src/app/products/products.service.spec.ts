import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let dbMock: any;

  const mockProduct = {
    id: 1,
    name: 'Test Shoe',
    description: 'A great shoe',
    price: '49.99',
    imageUrl: 'https://example.com/shoe.jpg',
    stock: 10,
    category: 'footwear',
    createdAt: new Date(),
  };

  beforeEach(() => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockResolvedValue([mockProduct]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([mockProduct]),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };
    service = new ProductsService(dbMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      dbMock.limit.mockReturnThis();
      dbMock.offset = undefined;
      // Override for findOne (no offset)
      dbMock.limit.mockResolvedValue([mockProduct]);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      dbMock.limit.mockResolvedValue([]);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should insert and return the new product', async () => {
      const dto = {
        name: 'Test Shoe',
        price: 49.99,
        stock: 10,
      };
      const result = await service.create(dto as any);
      expect(result).toEqual(mockProduct);
      expect(dbMock.insert).toHaveBeenCalled();
    });
  });
});
