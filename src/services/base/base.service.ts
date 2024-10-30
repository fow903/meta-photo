import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom, Observable } from "rxjs";
import { AxiosResponse } from "axios";

@Injectable()
export class BaseService {
	public baseUrl: string;

	constructor(
		public readonly httpService: HttpService,
		public readonly configService: ConfigService,
		public readonly model: string,
	) {
		this.baseUrl = this.configService.get<string>("JSON_PLACEHOLDER");
	}

	public async getAll<T>(): Promise<T> {
		const url = `${this.baseUrl}/${this.model}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.get(url);
		return lastValueFrom(response).then((res) => res.data);
	}

	public async get<T>(endpoint: string = "", params?: any): Promise<T> {
		const url = `${this.baseUrl}/${this.model}/${endpoint}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.get(url, {
			params,
		});
		return lastValueFrom(response).then((res) => res.data);
	}

	public async getByCondition<T>(
		endpoint: string = "",
		params?: any,
	): Promise<T> {
		const url = `${this.baseUrl}/${this.model}/${endpoint}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.get(url, {
			params,
		});
		return lastValueFrom(response).then((res) => res.data);
	}

	public async post<T>(endpoint: string = "", data: any): Promise<T> {
		const url = `${this.baseUrl}/${this.model}/${endpoint}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.post(
			url,
			data,
		);
		return lastValueFrom(response).then((res) => res.data);
	}

	public async put<T>(endpoint: string = "", data: any): Promise<T> {
		const url = `${this.baseUrl}/${this.model}/${endpoint}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.put(
			url,
			data,
		);
		return lastValueFrom(response).then((res) => res.data);
	}

	public async delete<T>(endpoint: string = ""): Promise<T> {
		const url = `${this.baseUrl}/${this.model}/${endpoint}`;
		const response: Observable<AxiosResponse<T>> = this.httpService.delete(url);
		return lastValueFrom(response).then((res) => res.data);
	}
}
