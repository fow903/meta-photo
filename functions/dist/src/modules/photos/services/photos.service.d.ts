import { HttpService } from '@nestjs/axios';
import { PhotoFilters } from 'src/modules/photos/interfaces/photo.filters';
export declare class PhotosService {
    private readonly httpService;
    private readonly logger;
    private cache;
    constructor(httpService: HttpService);
    getEnrichedPhoto(id: string): Promise<unknown>;
    getPhotos(filters: PhotoFilters, limit?: number, offset?: number): Promise<any[]>;
    private fetchPhoto;
    private fetchAlbum;
    private fetchUser;
    private fetchUsers;
    private fetchUsersByEmail;
    private fetchAlbums;
    private fetchAlbumsByIds;
    private fetchAlbumsByUserId;
    private fetchPhotosByAlbums;
    private fetchPhotosByAlbum;
    private fetchAllPhotos;
    private buildUsersMap;
    private buildAlbumsMap;
    private enrichPhotosWithAlbumData;
    private applyFilters;
    private applyPagination;
    private buildEnrichedPhoto;
}
