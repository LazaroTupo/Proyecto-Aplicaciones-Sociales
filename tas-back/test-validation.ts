import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto } from './src/projects/dto/create-project.dto';

async function run() {
  const payload = {
    title: 'Test',
    description: 'Test',
    targetAmount: '5000',
    durationDays: '30',
    trlLevel: '4',
    hasVideo: 'false',
    category: 'Tecnología',
    rewards: '[{"amount": 10, "description": "Taza"}]'
  };

  const dto = plainToInstance(CreateProjectDto, payload);
  console.log("Transformed DTO:", dto);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length > 0) {
    console.log("Validation Errors:", JSON.stringify(errors, null, 2));
  } else {
    console.log("Validation Passed!");
  }
}
run();
