import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../../utils/enums/invitation-status';

export class UpdateDto {
  @IsString()
  @IsIn([InvitationStatus.ACCEPTED, InvitationStatus.REJECTED])
  @IsNotEmpty()
  status: string;
}
