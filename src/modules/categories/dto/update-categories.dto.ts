
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Category name cannot be empty' })
    name: string;

    @ApiProperty({
        type: String,
        description: 'Image URLs',
        example: "image2.jpg"
    })
    image: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Category name cannot be empty' })
    slug: string;
}