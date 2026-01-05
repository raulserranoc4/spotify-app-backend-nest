import { Test, TestingModule } from '@nestjs/testing';
import { RecordAnalysisController } from './record-analysis.controller';

describe('RecordAnalysisController', () => {
  let controller: RecordAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordAnalysisController],
    }).compile();

    controller = module.get<RecordAnalysisController>(RecordAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
