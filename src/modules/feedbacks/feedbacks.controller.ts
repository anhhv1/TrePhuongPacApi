import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '~/guards';
import { FeedbacksService } from './feedbacks.service';
import { Feedbacks } from './feedbacks.schema';
import { AppResponse } from '~/common/interfaces';
import { Observable } from 'rxjs';
import { CreateFeedbackDto, FindPaginateFeedback, UpdateFeedbackDto } from './dto';
import { IdDto } from '~/common/dto';
import { Authorize, Roles } from '~/decorators';
import { EAccountRole } from '~/constants';

@ApiTags('[Admin] - Feedbacks')
@Roles(EAccountRole.ADMIN)
@Authorize()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginate feedback',
  })
  findPaginateFeedbacks(@Query() dto: FindPaginateFeedback) {
    return this.feedbacksService.findPaginateFeedbacks(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail feedback',
  })
  findOne(@Param() id: IdDto): Promise<AppResponse<Feedbacks> | Observable<never>> {
    return this.feedbacksService.findOne(id.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Reply feedback',
  })
  update(
    @Param() id: IdDto,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<AppResponse<Feedbacks | null> | Observable<never>> {
    return this.feedbacksService.update(id.id, updateFeedbackDto);
  }
}

@ApiTags('[User] - Feedbacks')
@Controller('feedbacks')
export class UserFeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @ApiOperation({
    description: 'Send feedbacks',
    summary: 'Send feedbacks',
  })
  @ApiOkResponse({ type: Feedbacks })
  sendFeedBack(@Body() dto: CreateFeedbackDto): Promise<AppResponse<Feedbacks> | Observable<never>> {
    return this.feedbacksService.sendFeedBack(dto);
  }
}
