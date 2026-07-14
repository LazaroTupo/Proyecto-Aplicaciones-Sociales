import { Controller, Get, Post, Body, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedQueryDto } from './dto/feed-query.dto';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('feed')
  async getFeed(@Request() req, @Query() query: FeedQueryDto) {
    const userId = req.user.id;
    return this.recommendationsService.getFeedForUser(userId, query);
  }

  @Post('interact')
  @HttpCode(HttpStatus.OK)
  async interact(@Request() req, @Body() dto: CreateInteractionDto) {
    const userId = req.user.id;
    return this.recommendationsService.recordInteraction(userId, dto.projectId, dto.interactionType);
  }
}

