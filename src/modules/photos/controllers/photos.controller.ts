import { Controller, Get, Param, Query } from '@nestjs/common';
import { PhotoFilters } from 'src/modules/photos/interfaces/photo.filters';
import { PhotosService } from '../services/photos.service';

@Controller('externalapi/photos')
export class PhotosController {
	constructor(private readonly photosService: PhotosService) {}

	@Get(':id')
	async getPhoto(@Param('id') id: string) {
		return this.photosService.getEnrichedPhoto(id);
	}

	@Get()
	async getPhotos(
		@Query('title') title: string,
		@Query('album.title') albumTitle: string,
		@Query('album.user.email') email: string,
		@Query('limit') limit = 25,
		@Query('offset') offset = 0,
	) {
		const filters: PhotoFilters = { title, albumTitle, email };
		return this.photosService.getPhotos(filters, +limit, +offset);
	}
}
