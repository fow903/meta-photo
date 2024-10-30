import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { UsersController } from "./controllers/user/users.controller";
import { UsersService } from "./services/users/users.service";
import { PhotosController } from "./controllers/photos/photos.controller";
import { PhotosService } from "./services/photos/photos.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HttpModule,
	],
	controllers: [AppController, UsersController, PhotosController],
	providers: [AppService, UsersService, PhotosService],
})
export class AppModule {}
