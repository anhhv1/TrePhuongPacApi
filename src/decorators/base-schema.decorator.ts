import { applyDecorators } from '@nestjs/common';
import { Schema } from '@nestjs/mongoose';
import { SchemaOptions } from 'mongoose';

export const BaseSchema = (options?: SchemaOptions) =>
  applyDecorators(
    Schema({
      strict: true,
      timestamps: true,
      toJSON: {
        virtuals: true,
      },
      toObject: {
        virtuals: true,
      },
      ...options,
    }),
  );
