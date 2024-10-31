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
var PhotosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotosService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");
dotenv.config();
const BASE_URL = process.env.JSON_PLACEHOLDER;
let PhotosService = PhotosService_1 = class PhotosService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(PhotosService_1.name);
        this.cache = new NodeCache({ stdTTL: 3600 });
    }
    async getEnrichedPhoto(id) {
        try {
            const cachedPhoto = this.cache.get(`photo_${id}`);
            if (cachedPhoto) {
                this.logger.debug(`Cache hit for photo ID: ${id}`);
                return cachedPhoto;
            }
            this.logger.debug(`Fetching photo ID: ${id}`);
            const photo = await this.fetchPhoto(id);
            if (!photo) {
                throw new Error('Photo not found');
            }
            this.logger.debug(`Fetching album ID: ${photo.albumId}`);
            const album = await this.fetchAlbum(photo.albumId);
            if (!album) {
                throw new Error('Album not found');
            }
            this.logger.debug(`Fetching user ID: ${album.userId}`);
            const user = await this.fetchUser(album.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const enrichedPhoto = this.buildEnrichedPhoto(photo, album, user);
            this.cache.set(`photo_${id}`, enrichedPhoto);
            return enrichedPhoto;
        }
        catch (error) {
            this.logger.error(`Failed to fetch enriched photo: ${error.message}`, error.stack);
            throw new Error('Unable to fetch enriched photo data');
        }
    }
    async getPhotos(filters, limit = 25, offset = 0) {
        try {
            this.logger.debug(`Fetching photos with filters: ${JSON.stringify(filters)}`);
            let albums = [];
            if (filters['email']) {
                const users = await this.fetchUsersByEmail(filters['email']);
                if (users.length > 0) {
                    albums = await this.fetchAlbumsByUserId(users[0].id);
                }
            }
            else if (filters['albumTitle']) {
                albums = await this.fetchAlbums(filters['albumTitle']);
            }
            let photos = [];
            if (albums.length > 0) {
                photos = await this.fetchPhotosByAlbums(albums.map((album) => album.id));
            }
            else {
                photos = await this.fetchAllPhotos();
            }
            const filteredPhotos = this.applyFilters(photos, {
                ...filters,
                email: undefined,
            });
            if (albums.length === 0) {
                const albumIds = [
                    ...new Set(filteredPhotos.map((photo) => photo.albumId)),
                ];
                albums = await this.fetchAlbumsByIds(albumIds);
            }
            const users = await this.fetchUsers();
            const usersMap = this.buildUsersMap(users);
            const albumsMap = this.buildAlbumsMap(albums, photos, usersMap);
            const enrichedPhotos = this.enrichPhotosWithAlbumData(filteredPhotos, albumsMap);
            const finalFilteredPhotos = this.applyFilters(enrichedPhotos, filters);
            return this.applyPagination(finalFilteredPhotos, limit, offset);
        }
        catch (error) {
            this.logger.error(`Failed to fetch and process photos: ${error.message}`, error.stack);
            throw new Error('Failed to fetch and process photos');
        }
    }
    async fetchPhoto(id) {
        const cachedPhoto = this.cache.get(`photo_${id}`);
        if (cachedPhoto) {
            this.logger.debug(`Cache hit for photo ID: ${id}`);
            return cachedPhoto;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/photos/${id}`).pipe((0, operators_1.map)((response) => response.data), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching photo: ${error.message}`, error.stack);
            throw new Error(`Error fetching photo: ${error.message}`);
        })));
    }
    async fetchAlbum(albumId) {
        const cachedAlbum = this.cache.get(`album_${albumId}`);
        if (cachedAlbum) {
            this.logger.debug(`Cache hit for album ID: ${albumId}`);
            return cachedAlbum;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/albums/${albumId}`).pipe((0, operators_1.map)((response) => response.data), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching album: ${error.message}`, error.stack);
            throw new Error(`Error fetching album: ${error.message}`);
        })));
    }
    async fetchUser(userId) {
        const cachedUser = this.cache.get(`user_${userId}`);
        if (cachedUser) {
            this.logger.debug(`Cache hit for user ID: ${userId}`);
            return cachedUser;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/users/${userId}`).pipe((0, operators_1.map)((response) => response.data), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching user: ${error.message}`, error.stack);
            throw new Error(`Error fetching user: ${error.message}`);
        })));
    }
    async fetchUsers() {
        const cachedUsers = this.cache.get('users');
        if (cachedUsers) {
            this.logger.debug('Cache hit for users');
            return cachedUsers;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/users`).pipe((0, operators_1.map)((response) => {
            this.cache.set('users', response.data);
            return response.data;
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching users: ${error.message}`, error.stack);
            throw new Error(`Error fetching users: ${error.message}`);
        })));
    }
    async fetchUsersByEmail(email) {
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/users`, { params: { email } }).pipe((0, operators_1.map)((response) => response.data), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching users by email: ${error.message}`, error.stack);
            throw new Error(`Error fetching users by email: ${error.message}`);
        })));
    }
    async fetchAlbums(albumTitle) {
        const cachedAlbums = this.cache.get('albums');
        if (cachedAlbums && Array.isArray(cachedAlbums)) {
            this.logger.debug('Cache hit for albums');
            return cachedAlbums.filter((album) => album.title.toLowerCase().includes(albumTitle.toLowerCase()));
        }
        const albumsResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/albums`).pipe((0, operators_1.map)((response) => {
            this.cache.set('albums', response.data);
            return response.data;
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching albums: ${error.message}`, error.stack);
            throw new Error(`Error fetching albums: ${error.message}`);
        })));
        return albumsResponse.filter((album) => album.title.toLowerCase().includes(albumTitle.toLowerCase()));
    }
    async fetchAlbumsByIds(albumIds) {
        const albumRequests = albumIds.map((albumId) => this.fetchAlbum(albumId));
        return Promise.all(albumRequests);
    }
    async fetchAlbumsByUserId(userId) {
        const cachedAlbums = this.cache.get(`albums_user_${userId}`);
        if (cachedAlbums) {
            this.logger.debug(`Cache hit for albums by user ID: ${userId}`);
            return cachedAlbums;
        }
        const albumsResponse = await (0, rxjs_1.firstValueFrom)(this.httpService
            .get(`${BASE_URL}/albums`, { params: { userId: userId.toString() } })
            .pipe((0, operators_1.map)((response) => {
            this.cache.set(`albums_user_${userId}`, response.data);
            return response.data;
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching albums by user ID: ${error.message}`, error.stack);
            throw new Error(`Error fetching albums by user ID: ${error.message}`);
        })));
        return albumsResponse;
    }
    async fetchPhotosByAlbums(albumIds) {
        const photoRequests = albumIds.map((albumId) => this.fetchPhotosByAlbum(albumId));
        const photosArray = await Promise.all(photoRequests);
        return photosArray.flat();
    }
    async fetchPhotosByAlbum(albumId) {
        const cachedPhotos = this.cache.get(`photos_album_${albumId}`);
        if (cachedPhotos) {
            this.logger.debug(`Cache hit for photos by album ID: ${albumId}`);
            return cachedPhotos;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService
            .get(`${BASE_URL}/photos`, {
            params: { albumId: albumId.toString() },
        })
            .pipe((0, operators_1.map)((response) => {
            this.cache.set(`photos_album_${albumId}`, response.data);
            return response.data;
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching photos for album ${albumId}: ${error.message}`, error.stack);
            throw new Error(`Error fetching photos for album ${albumId}: ${error.message}`);
        })));
    }
    async fetchAllPhotos() {
        const cachedPhotos = this.cache.get('all_photos');
        if (cachedPhotos) {
            this.logger.debug('Cache hit for all photos');
            return cachedPhotos;
        }
        return (0, rxjs_1.firstValueFrom)(this.httpService.get(`${BASE_URL}/photos`).pipe((0, operators_1.map)((response) => {
            this.cache.set('all_photos', response.data);
            return response.data;
        }), (0, rxjs_1.catchError)((error) => {
            this.logger.error(`Error fetching photos: ${error.message}`, error.stack);
            throw new Error(`Error fetching photos: ${error.message}`);
        })));
    }
    buildUsersMap(users) {
        return Object.fromEntries(users.map((user) => [user.id, user]));
    }
    buildAlbumsMap(albums, photos, usersMap) {
        if (albums.length > 0) {
            return Object.fromEntries(albums.map((album) => [
                album.id,
                { ...album, user: usersMap[album.userId] },
            ]));
        }
        else {
            return Object.fromEntries(photos.map((photo) => [photo.albumId, null]));
        }
    }
    enrichPhotosWithAlbumData(photos, albumsMap) {
        return photos.map((photo) => ({
            ...photo,
            album: albumsMap[photo.albumId] ? albumsMap[photo.albumId] : null,
        }));
    }
    applyFilters(enrichedPhotos, filters) {
        return enrichedPhotos.filter((photo) => {
            return ((!filters.title ||
                photo.title.toLowerCase().includes(filters.title.toLowerCase())) &&
                (!filters['email'] ||
                    (photo.album &&
                        photo.album.user.email.toLowerCase() ===
                            filters['email'].toLowerCase())));
        });
    }
    applyPagination(photos, limit, offset) {
        return photos.slice(offset, offset + limit);
    }
    buildEnrichedPhoto(photo, album, user) {
        return {
            id: photo.id,
            title: photo.title,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl,
            album: {
                id: album.id,
                title: album.title,
                user,
            },
        };
    }
};
exports.PhotosService = PhotosService;
exports.PhotosService = PhotosService = PhotosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], PhotosService);
//# sourceMappingURL=photos.service.js.map