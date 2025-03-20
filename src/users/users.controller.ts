import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUsersDto } from './dtos/get-users.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../utils/types/user';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  index(@Query() query: GetUsersDto, @Request() req: { user: User }) {
    return this.usersService.index(query, req.user.id);
  }
}
