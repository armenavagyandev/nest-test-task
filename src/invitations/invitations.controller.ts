import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AuthGuard } from '../guards/auth.guard';
import { CreateDto } from './dtos/create.dto';
import { User } from '../utils/types/user';
import { UpdateDto } from './dtos/update.dto';

@Controller('invitations')
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(@Body() createDto: CreateDto, @Req() req: { user: User }) {
    return this.invitationsService.create(createDto, req.user.id);
  }

  @Patch(':id')
  update(@Body() updateDto: UpdateDto, @Param() param: { id: number }, @Req() req: { user: User }) {
    return this.invitationsService.update(updateDto, param.id, req.user.id);
  }

  @Get('my')
  getMyInvitations(@Req() req: { user: User }) {
    return this.invitationsService.getMyInvitations(req.user.id);
  }
}
