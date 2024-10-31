import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PhotosModule } from './modules/photos/photos.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HttpModule,
		PhotosModule,
	],
	controllers: [AppController],
})
export class AppModule {}
