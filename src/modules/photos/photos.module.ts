import { Module } from '@nestjs/common';
import { PhotosService } from './services/photos.service';
import { PhotosController } from './controllers/photos.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HttpModule,
	],
	controllers: [PhotosController],
	providers: [PhotosService],
})
export class PhotosModule {}
