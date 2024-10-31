import { Test, TestingModule } from '@nestjs/testing';
import { PhotosController } from './photos.controller';
import { PhotosService } from '../services/photos.service';
import { PhotoFilters } from '../interfaces/photo.filters';

describe('PhotosController', () => {
	let photosController: PhotosController;
	let photosService: PhotosService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PhotosController],
			providers: [
				{
					provide: PhotosService,
					useValue: {
						getEnrichedPhoto: jest.fn(),
						getPhotos: jest.fn(),
					},
				},
			],
		}).compile();

		photosController = module.get<PhotosController>(PhotosController);
		photosService = module.get<PhotosService>(PhotosService);
	});

	it('should be defined', () => {
		expect(photosController).toBeDefined();
	});

	describe('getPhoto', () => {
		it('should return a single enriched photo', async () => {
			const photoId = '123';
			const mockPhoto = {
				id: photoId,
				title: 'Sample Photo',
				url: 'sample-url',
				thumbnailUrl: 'sample-thumbnail',
				album: {
					id: '1',
					title: 'Sample Album',
					user: { id: '1', email: 'test@example.com' },
				},
			};
			jest
				.spyOn(photosService, 'getEnrichedPhoto')
				.mockResolvedValue(mockPhoto);

			const result = await photosController.getPhoto(photoId);
			expect(result).toEqual(mockPhoto);
			expect(photosService.getEnrichedPhoto).toHaveBeenCalledWith(photoId);
		});
	});

	describe('getPhotos', () => {
		it('should return a list of photos with filters', async () => {
			const mockFilters: PhotoFilters = {
				title: 'Sample',
				albumTitle: 'Album',
				email: 'test@example.com',
			};
			const limit = 10;
			const offset = 5;
			const mockPhotos = [
				{
					id: '1',
					title: 'Sample Photo',
					url: 'sample-url',
					thumbnailUrl: 'sample-thumbnail',
					album: {
						id: '1',
						title: 'Sample Album',
						user: { id: '1', email: 'test@example.com' },
					},
				},
			];
			jest.spyOn(photosService, 'getPhotos').mockResolvedValue(mockPhotos);

			const result = await photosController.getPhotos(
				mockFilters.title,
				mockFilters.albumTitle,
				mockFilters.email,
				limit,
				offset,
			);
			expect(result).toEqual(mockPhotos);
			expect(photosService.getPhotos).toHaveBeenCalledWith(
				mockFilters,
				limit,
				offset,
			);
		});
	});
});
