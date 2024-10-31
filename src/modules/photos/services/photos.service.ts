import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as dotenv from 'dotenv';
import { PhotoFilters } from 'src/modules/photos/interfaces/photo.filters';

dotenv.config();

const BASE_URL = process.env.JSON_PLACEHOLDER;

@Injectable()
export class PhotosService {
	constructor(private readonly httpService: HttpService) {}

	async getEnrichedPhoto(id: string) {
		try {
			const photo = await this.fetchPhoto(id);
			if (!photo) {
				throw new Error('Photo not found');
			}
			const albumId = photo.albumId;

			const album = await this.fetchAlbum(albumId);
			if (!album) {
				throw new Error('Album not found');
			}

			const user = await this.fetchUser(album.userId);
			if (!user) {
				throw new Error('User not found');
			}

			return this.buildEnrichedPhoto(photo, album, user);
		} catch (error) {
			console.error(error);
			throw new Error('Unable to fetch enriched photo data');
		}
	}

	async getPhotos(
		filters: PhotoFilters,
		limit: number = 25,
		offset: number = 0,
	) {
		try {
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

			const finalFilteredPhotos = this.applyFilters(enrichedPhotos, filters);

			return this.applyPagination(finalFilteredPhotos, limit, offset);
		} catch (error) {
			console.error('Failed to fetch and process photos:', error.message);
			throw new Error('Failed to fetch and process photos');
		}
	}

	private async fetchPhoto(id: string) {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/photos/${id}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					throw new Error(`Error fetching photo: ${error.message}`);
				}),
			),
		);
	}

	private async fetchAlbum(albumId: number) {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/albums/${albumId}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					throw new Error(`Error fetching album: ${error.message}`);
				}),
			),
		);
	}

	private async fetchUser(userId: number) {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/users/${userId}`).pipe(
				map((response) => response.data),
				catchError((error) => {
					throw new Error(`Error fetching user: ${error.message}`);
				}),
			),
		);
	}

	private async fetchUsers() {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/users`).pipe(
				map((response) => response.data),
				catchError((error) => {
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
					throw new Error(`Error fetching users by email: ${error.message}`);
				}),
			),
		);
	}

	private async fetchAlbums(albumTitle: string) {
		const albumsResponse = await firstValueFrom(
			this.httpService.get(`${BASE_URL}/albums`).pipe(
				map((response) => response.data),
				catchError((error) => {
					throw new Error(`Error fetching albums: ${error.message}`);
				}),
			),
		);
		return albumsResponse.filter((album) =>
			album.title.toLowerCase().includes(albumTitle.toLowerCase()),
		);
	}

	private async fetchAlbumsByIds(albumIds: number[]) {
		const albumRequests = albumIds.map((albumId) =>
			firstValueFrom(
				this.httpService.get(`${BASE_URL}/albums/${albumId}`).pipe(
					map((response) => response.data),
					catchError((error) => {
						throw new Error(
							`Error fetching album ${albumId}: ${error.message}`,
						);
					}),
				),
			),
		);
		return Promise.all(albumRequests);
	}

	private async fetchAlbumsByUserId(userId: number) {
		const albumsResponse = await firstValueFrom(
			this.httpService
				.get(`${BASE_URL}/albums`, { params: { userId: userId.toString() } })
				.pipe(
					map((response) => response.data),
					catchError((error) => {
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
			firstValueFrom(
				this.httpService
					.get(`${BASE_URL}/photos`, {
						params: { albumId: albumId.toString() },
					})
					.pipe(
						map((response) => response.data),
						catchError((error) => {
							throw new Error(
								`Error fetching photos for album ${albumId}: ${error.message}`,
							);
						}),
					),
			),
		);
		const photosArray = await Promise.all(photoRequests);
		return photosArray.flat();
	}

	private async fetchAllPhotos() {
		return firstValueFrom(
			this.httpService.get(`${BASE_URL}/photos`).pipe(
				map((response) => response.data),
				catchError((error) => {
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
