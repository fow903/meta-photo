import { Injectable } from "@nestjs/common";
import { BaseService } from "../base/base.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersService extends BaseService {
	constructor(httpService: HttpService, configService: ConfigService) {
		super(httpService, configService, "users");
	}
}
