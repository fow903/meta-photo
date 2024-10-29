import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/externalapi/photos/:id')
  getPhotoById(): string {
    return 'Hello World!';
  }
}
