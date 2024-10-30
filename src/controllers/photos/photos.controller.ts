import { Controller, Get, Query } from "@nestjs/common";
import { PhotosService } from "src/services/photos/photos.service";

@Controller("externalapi/photos")
export class PhotosController {
	constructor(private readonly photosService: PhotosService) {}

	@Get()
	async getPhotos(
		@Query("title") title: string,
		@Query("album.title") albumTitle: string,
		@Query("album.user.email") email: string,
		@Query("limit") limit = 25,
		@Query("offset") offset = 0,
	) {
		const filters = { title, albumTitle, email };
		return this.photosService.getPhotos(filters, +limit, +offset);
	}
}
