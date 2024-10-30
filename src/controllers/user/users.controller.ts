import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "src/services/users/users.service";

@Controller("users")
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get(":id")
	async getUserById(@Param("id") id: string) {
		return await this.usersService.get(id);
	}

	@Get()
	async getUsers() {
		return await this.usersService.getAll();
	}

	@Get("search/:query")
	async searchUsers(@Param("query") query: string) {
		return await this.usersService.getByCondition(query);
	}
}
