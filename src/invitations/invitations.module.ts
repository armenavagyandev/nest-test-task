import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [InvitationsService, JwtService],
  controllers: [InvitationsController],
})
export class InvitationsModule {}
