"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotosController = void 0;
const common_1 = require("@nestjs/common");
const photos_service_1 = require("../services/photos.service");
const swagger_1 = require("@nestjs/swagger");
let PhotosController = class PhotosController {
    constructor(photosService) {
        this.photosService = photosService;
    }
    async getPhoto(id) {
        return this.photosService.getEnrichedPhoto(id);
    }
    async getPhotos(title, albumTitle, userEmail, limit = 25, offset = 0) {
        const filters = { title, albumTitle, userEmail };
        return this.photosService.getPhotos(filters, +limit, +offset);
    }
};
exports.PhotosController = PhotosController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "getPhoto", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'title', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'album.title', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'album.user.email', required: false }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items to return',
        default: 25,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Number of items to skip',
        default: 0,
    }),
    __param(0, (0, common_1.Query)('title')),
    __param(1, (0, common_1.Query)('album.title')),
    __param(2, (0, common_1.Query)('album.user.email')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "getPhotos", null);
exports.PhotosController = PhotosController = __decorate([
    (0, common_1.Controller)('externalapi/photos'),
    __metadata("design:paramtypes", [photos_service_1.PhotosService])
], PhotosController);
//# sourceMappingURL=photos.controller.js.map