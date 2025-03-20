import { IsInt, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { InvitationType } from '../../utils/enums/invitation-type';

export class CreateDto {
  @IsInt()
  @IsNotEmpty()
  receiver_id: number;

  @IsString()
  @IsIn(Object.values(InvitationType))
  @IsNotEmpty()
  type: string;
}
