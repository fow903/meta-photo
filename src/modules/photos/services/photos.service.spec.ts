import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PhotosService } from './photos.service';

jest.mock('@nestjs/axios');

describe('PhotosService', () => {
	let service: PhotosService;
	let httpService: HttpService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PhotosService, HttpService],
		}).compile();

		service = module.get<PhotosService>(PhotosService);
		httpService = module.get<HttpService>(HttpService);
	});

	describe('getEnrichedPhoto', () => {
		it('should return an enriched photo', async () => {
			const mockPhoto = { id: '1', albumId: 1, title: 'Test Photo' };
			const mockAlbum = { id: 1, userId: 1, title: 'Test Album' };
			const mockUser = { id: 1, name: 'Test User' };

			jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
				if (url.endsWith('/photos/1')) {
					return of({ data: mockPhoto } as AxiosResponse);
				} else if (url.endsWith('/albums/1')) {
					return of({ data: mockAlbum } as AxiosResponse);
				} else if (url.endsWith('/users/1')) {
					return of({ data: mockUser } as AxiosResponse);
				}
				return of({ data: null } as AxiosResponse);
			});

			const result = await service.getEnrichedPhoto('1');
			expect(result).toEqual({
				id: '1',
				title: 'Test Photo',
				url: undefined,
				thumbnailUrl: undefined,
				album: {
					id: 1,
					title: 'Test Album',
					user: mockUser,
				},
			});
		});

		it('should throw an error if photo not found', async () => {
			jest
				.spyOn(httpService, 'get')
				.mockReturnValue(of({ data: null } as AxiosResponse));

			await expect(service.getEnrichedPhoto('1')).rejects.toThrow(
				'Unable to fetch enriched photo data',
			);
		});
	});
});
