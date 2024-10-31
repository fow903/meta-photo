import { PhotosService } from '../services/photos.service';
export declare class PhotosController {
    private readonly photosService;
    constructor(photosService: PhotosService);
    getPhoto(id: string): Promise<unknown>;
    getPhotos(title: string, albumTitle: string, userEmail: string, limit?: number, offset?: number): Promise<any[]>;
}
