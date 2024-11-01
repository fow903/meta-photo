import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { PhotosModule } from "./modules/photos/photos.module";
import { HealthController } from "./controllers/health.controller";
import { RedirectMiddleware } from "./middlewares/redirect.middleware";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HttpModule,
		PhotosModule,
	],
	controllers: [AppController, HealthController],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RedirectMiddleware).forRoutes("/");
	}
}
