import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dotenv from 'dotenv';
import { PhotoFilters } from 'src/modules/photos/interfaces/photo.filters';
import * as NodeCache from 'node-cache';

dotenv.config();

const BASE_URL = process.env.JSON_PLACEHOLDER;

@Injectable()
export class PhotosService {
	private readonly logger = new Logger(PhotosService.name);
	private cache = new NodeCache({ stdTTL: 3600 }); // Cache with TTL of 1 hour

	constructor(private readonly httpService: HttpService) {}

	async getEnrichedPhoto(id: string) {
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
		} catch (error) {
			this.logger.error(
				`Failed to fetch enriched photo: ${error.message}`,
				error.stack,
			);
			throw new Error('Unable to fetch enriched photo data');
		}
	}

	async getPhotos(
		filters: PhotoFilters,
		limit: number = 25,
		offset: number = 0,
	) {
		try {
			this.logger.debug(
				`Fetching photos with filters: ${JSON.stringify(filters)}`,
			);
			let albums = [];
			if (filters['email']) {
				const users = await this.fetchUsersByEmail(filters['email']);
				if (users.length > 0) {
					albums = await this.fetchAlbumsByUserId(users[0].id);
				}
			} else if (filters['albumTitle']) {
				albums = await this.fetchAlbums(filters['albumTitle']);
			}

			let photos = [];
			if (albums.length > 0) {
				photos = await this.fetchPhotosByAlbums(
					albums.map((album) => album.id),
				);
			} else {
				photos = await this.fetchAllPhotos();
			}

			// Todo - Refactor this to use a single filter function
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
			const enrichedPhotos = this.enrichPhotosWithAlbumData(
				filteredPhotos,
				albumsMap,
			);

			// Only apply email filter after enriching photos
			const finalFilteredPhotos = this.applyFilters(enrichedPhotos, filters);

			return this.applyPagination(finalFilteredPhotos, limit, offset);
		} catch (error) {
			this.logger.error(
				`Failed to fetch and process photos: ${error.message}`,
				error.stack,
			);
			throw new Error('Failed to fetch and process photos');
		}
	}

	private async fetchPhoto(id: string) {
		const cachedPhoto = this.cache.get(`photo_${id}`);
		if (cachedPhoto) {
			this.logger.debug(`Cache hit for photo ID: ${id}`);
			return cachedPhoto;
		}

		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/photos/${id}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					this.logger.error(
						`Error fetching photo: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching photo: ${error.message}`);
				}),
			),
		);
	}

	private async fetchAlbum(albumId: number) {
		const cachedAlbum = this.cache.get(`album_${albumId}`);
		if (cachedAlbum) {
			this.logger.debug(`Cache hit for album ID: ${albumId}`);
			return cachedAlbum;
		}

		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/albums/${albumId}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					this.logger.error(
						`Error fetching album: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching album: ${error.message}`);
				}),
			),
		);
	}

	private async fetchUser(userId: number) {
		const cachedUser = this.cache.get(`user_${userId}`);
		if (cachedUser) {
			this.logger.debug(`Cache hit for user ID: ${userId}`);
			return cachedUser;
		}

		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/users/${userId}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					this.logger.error(
						`Error fetching user: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching user: ${error.message}`);
				}),
			),
		);
	}

	private async fetchUsers() {
		const cachedUsers = this.cache.get('users');
		if (cachedUsers) {
			this.logger.debug('Cache hit for users');
			return cachedUsers;
		}

		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/users`).pipe(
				map((response) => {
					this.cache.set('users', response.data);
					return response.data;
				}),
				catchError((error) => {
					this.logger.error(
						`Error fetching users: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching users: ${error.message}`);
				}),
			),
		);
	}

	private async fetchUsersByEmail(email: string) {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/users`, { params: { email } }).pipe(
				map((response) => response.data),
				catchError((error) => {
					this.logger.error(
						`Error fetching users by email: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching users by email: ${error.message}`);
				}),
			),
		);
	}

	private async fetchAlbums(albumTitle: string) {
		const cachedAlbums = this.cache.get('albums');
		if (cachedAlbums && Array.isArray(cachedAlbums)) {
			this.logger.debug('Cache hit for albums');
			return cachedAlbums.filter((album: any) =>
				album.title.toLowerCase().includes(albumTitle.toLowerCase()),
			);
		}

		const albumsResponse = await firstValueFrom(
			this.httpService.get(`${BASE_URL}/albums`).pipe(
				map((response) => {
					this.cache.set('albums', response.data);
					return response.data;
				}),
				catchError((error) => {
					this.logger.error(
						`Error fetching albums: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching albums: ${error.message}`);
				}),
			),
		);
		return albumsResponse.filter((album: any) =>
			album.title.toLowerCase().includes(albumTitle.toLowerCase()),
		);
	}

	private async fetchAlbumsByIds(albumIds: number[]) {
		const albumRequests = albumIds.map((albumId) => this.fetchAlbum(albumId));
		return Promise.all(albumRequests);
	}

	private async fetchAlbumsByUserId(userId: number) {
		const cachedAlbums = this.cache.get(`albums_user_${userId}`);
		if (cachedAlbums) {
			this.logger.debug(`Cache hit for albums by user ID: ${userId}`);
			return cachedAlbums;
		}

		const albumsResponse = await firstValueFrom(
			this.httpService
				.get(`${BASE_URL}/albums`, { params: { userId: userId.toString() } })
				.pipe(
					map((response) => {
						this.cache.set(`albums_user_${userId}`, response.data);
						return response.data;
					}),
					catchError((error) => {
						this.logger.error(
							`Error fetching albums by user ID: ${error.message}`,
							error.stack,
						);
						throw new Error(
							`Error fetching albums by user ID: ${error.message}`,
						);
					}),
				),
		);
		return albumsResponse;
	}

	private async fetchPhotosByAlbums(albumIds: number[]) {
		const photoRequests = albumIds.map((albumId) =>
			this.fetchPhotosByAlbum(albumId),
		);
		const photosArray = await Promise.all(photoRequests);
		return photosArray.flat();
	}

	private async fetchPhotosByAlbum(albumId: number) {
		const cachedPhotos = this.cache.get(`photos_album_${albumId}`);
		if (cachedPhotos) {
			this.logger.debug(`Cache hit for photos by album ID: ${albumId}`);
			return cachedPhotos;
		}

		return firstValueFrom(
			this.httpService
				.get(`${BASE_URL}/photos`, {
					params: { albumId: albumId.toString() },
				})
				.pipe(
					map((response) => {
						this.cache.set(`photos_album_${albumId}`, response.data);
						return response.data;
					}),
					catchError((error) => {
						this.logger.error(
							`Error fetching photos for album ${albumId}: ${error.message}`,
							error.stack,
						);
						throw new Error(
							`Error fetching photos for album ${albumId}: ${error.message}`,
						);
					}),
				),
		);
	}

	private async fetchAllPhotos() {
		const cachedPhotos = this.cache.get('all_photos');
		if (cachedPhotos) {
			this.logger.debug('Cache hit for all photos');
			return cachedPhotos;
		}

		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/photos`).pipe(
				map((response) => {
					this.cache.set('all_photos', response.data);
					return response.data;
				}),
				catchError((error) => {
					this.logger.error(
						`Error fetching photos: ${error.message}`,
						error.stack,
					);
					throw new Error(`Error fetching photos: ${error.message}`);
				}),
			),
		);
	}

	private buildUsersMap(users: any[]) {
		return Object.fromEntries(users.map((user) => [user.id, user]));
	}

	private buildAlbumsMap(albums: any[], photos: any[], usersMap: any) {
		if (albums.length > 0) {
			return Object.fromEntries(
				albums.map((album) => [
					album.id,
					{ ...album, user: usersMap[album.userId] },
				]),
			);
		} else {
			return Object.fromEntries(photos.map((photo) => [photo.albumId, null]));
		}
	}

	private enrichPhotosWithAlbumData(photos: any[], albumsMap: any) {
		return photos.map((photo) => ({
			...photo,
			album: albumsMap[photo.albumId] ? albumsMap[photo.albumId] : null,
		}));
	}

	private applyFilters(enrichedPhotos: any[], filters: any) {
		return enrichedPhotos.filter((photo) => {
			return (
				(!filters.title ||
					photo.title.toLowerCase().includes(filters.title.toLowerCase())) &&
				(!filters['email'] ||
					(photo.album &&
						photo.album.user.email.toLowerCase() ===
							filters['email'].toLowerCase()))
			);
		});
	}

	private applyPagination(photos: any[], limit: number, offset: number) {
		return photos.slice(offset, offset + limit);
	}

	private buildEnrichedPhoto(photo: any, album: any, user: any) {
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
}
