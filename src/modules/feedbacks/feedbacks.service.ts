import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Feedbacks } from './feedbacks.schema';
import { Model } from 'mongoose';
import { MailService } from '../../mail/mail.service';
import { EFeedbackStatus } from '~/constants';
import { FindPaginateFeedback } from './dto';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import PaginationHelper from '~/helpers/pagination.helper';
import { FindPaginateService } from '../services/dto';
import { escapeRegex } from '~/helpers';
import { Observable } from 'rxjs';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Feedbacks.name) private feedbacksModel: Model<Feedbacks>,
    private mailService: MailService,
  ) {}

  async findPaginateFeedbacks(dto: FindPaginateFeedback): Promise<AppResponse<PaginationResponse<Feedbacks>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Feedbacks, FindPaginateService>(dto);

    const { keyword, isReply } = dto;

    if (keyword) {
      match.email = { $regex: new RegExp(escapeRegex(keyword), 'i') };
    }

    if (isReply) {
      match.isReply = { $regex: new RegExp(escapeRegex(isReply), 'i') };
    }
    const [videos, count] = await Promise.all([
      this.feedbacksModel.find(match).sort({ createdAt: 'desc' }).limit(perPage).skip(skip),
      this.feedbacksModel.countDocuments(match),
    ]);
    return {
      content: PaginationHelper.getPaginationResponse({ page: page, data: videos, perPage: perPage, total: count }),
    };
  }

  async findOne(id: string) {
    const feedback = await this.findByField({ _id: id });

    if (feedback instanceof Observable) {
      return feedback;
    }

    return {
      content: feedback,
    };
  }

  async findByField(filter: object): Promise<Feedbacks | Observable<never>> {
    const feedback = await this.feedbacksModel.findOne(filter);

    if (!feedback) {
      throw new BadRequestException('feedback not exist');
    }

    return feedback;
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    const { content } = updateFeedbackDto;
    const feedback = await this.findByField({ _id: id });

    if (feedback instanceof Observable) {
      return feedback;
    }
    this.mailService.sendRepliedFeedBack({ content: content, email: feedback?.email });

    return {
      content: await this.feedbacksModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: { isReply: EFeedbackStatus.REPLIED },
        },
        { new: true },
      ),
    };
  }

  async sendFeedBack(dto: CreateFeedbackDto): Promise<AppResponse<Feedbacks> | Observable<never>> {
    const { email } = dto;

    const feedback = await this.feedbacksModel.findOne({ category: EFeedbackStatus.NEW, email: email });
    
    if (feedback) {
      throw new BadRequestException('Your request has been fulfilled! We will talk to you as soon as possible!');
    }

    await this.mailService.sendFeedBack(dto);
    return {
      content: await this.feedbacksModel.create({
        ...dto,
      }),
    };
  }
}
