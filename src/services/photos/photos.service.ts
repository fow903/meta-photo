import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom, retryWhen, delay, take } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class PhotosService {
	private readonly baseUrl: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		this.baseUrl = this.configService.get<string>("JSON_PLACEHOLDER");
	}

	private async fetchAllData() {
		const [photosResponse, albumsResponse, usersResponse] = await Promise.all([
			lastValueFrom(
				this.httpService.get(`${this.baseUrl}/photos`).pipe(
					retryWhen((errors) => errors.pipe(delay(1000), take(3))),
					catchError((error) => {
						console.error("Error fetching photos:", error.message);
						throw new Error("Unable to fetch photos");
					}),
				),
			),
			lastValueFrom(
				this.httpService.get(`${this.baseUrl}/albums`).pipe(
					retryWhen((errors) => errors.pipe(delay(1000), take(3))),
					catchError((error) => {
						console.error("Error fetching albums:", error.message);
						throw new Error("Unable to fetch albums");
					}),
				),
			),
			lastValueFrom(
				this.httpService.get(`${this.baseUrl}/users`).pipe(
					retryWhen((errors) => errors.pipe(delay(1000), take(3))),
					catchError((error) => {
						console.error("Error fetching users:", error.message);
						throw new Error("Unable to fetch users");
					}),
				),
			),
		]);

		const photos = photosResponse.data;
		const albums = albumsResponse.data;
		const users = usersResponse.data;

		const usersMap = Object.fromEntries(users.map((user) => [user.id, user]));

		const albumsMap = Object.fromEntries(
			albums.map((album) => [
				album.id,
				{ ...album, user: usersMap[album.userId] },
			]),
		);

		const enrichedPhotos = photos.map((photo) => ({
			...photo,
			album: albumsMap[photo.albumId],
		}));

		return enrichedPhotos;
	}

	async getPhotos(filters: any, limit: number, offset: number) {
		try {
			const enrichedPhotos = await this.fetchAllData();

			const filteredPhotos = enrichedPhotos.filter((photo) => {
				return (
					(!filters.title || photo.title.includes(filters.title)) &&
					(!filters["album.title"] ||
						photo.album.title.includes(filters["album.title"])) &&
					(!filters["album.user.email"] ||
						photo.album.user.email === filters["album.user.email"])
				);
			});

			const paginatedPhotos = filteredPhotos.slice(offset, offset + limit);

			return paginatedPhotos;
		} catch (error) {
			console.error("Failed to fetch and process photos:", error.message);
			throw new Error("Failed to fetch and process photos");
		}
	}
}
