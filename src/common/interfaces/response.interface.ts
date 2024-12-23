import { ApiProperty } from '@nestjs/swagger';

export class ResponseMessage {
  @ApiProperty()
  message: string;
}

export class AppResponse<T> {
  @ApiProperty()
  content: T;
}
