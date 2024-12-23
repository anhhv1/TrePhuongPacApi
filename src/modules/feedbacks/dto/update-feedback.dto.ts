import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiProperty()
  content: string;
}
