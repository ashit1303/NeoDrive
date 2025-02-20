import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerService } from './shortener.service';

describe('ShortenerService', () => {
  let service: ShortenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortenerService],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
