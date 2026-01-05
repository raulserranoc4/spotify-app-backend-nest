import { Test, TestingModule } from '@nestjs/testing';
import { RecordAnalysisService } from './record-analysis.service';

describe('RecordAnalysisService', () => {
  let service: RecordAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordAnalysisService],
    }).compile();

    service = module.get<RecordAnalysisService>(RecordAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
