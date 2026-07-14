import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/evaluate')
  evaluateProject(@Param('id') id: string, @Request() req) {
    return this.predictionsService.evaluateProject(id, req.user);
  }
}
