"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const express = require("express");
const isLocal = !process.env.FUNCTION_NAME;
const server = express();
async function createNestServer(expressInstance) {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Test API')
        .setDescription('The Test API description')
        .setVersion('1.0')
        .addTag('test')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
    });
    await app.init();
}
createNestServer(server).then(() => {
    if (isLocal) {
        server.listen(3000, () => {
            console.log('NestJS app is running on http://localhost:3000');
        });
    }
});
exports.api = functions.https.onRequest(server);
//# sourceMappingURL=main.js.map