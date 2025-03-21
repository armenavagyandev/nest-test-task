import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateDto } from './dtos/create.dto';
import { InvitationStatus } from '../utils/enums/invitation-status';
import { UpdateDto } from './dtos/update.dto';

@Injectable()
export class InvitationsService {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  async create(data: CreateDto, sender_id: number) {
    const { receiver_id, type } = data;

    const receiverCheckData = await this.pool.query(
      `SELECT EXISTS (SELECT 1 FROM users WHERE id = $1) as is_exist`,
      [receiver_id],
    );

    if (!receiverCheckData.rows[0]?.is_exist) {
      throw new NotFoundException('User not found');
    }

    const checkInvitationExistsData = await this.pool.query(
      `SELECT EXISTS (SELECT 1 FROM invitations WHERE sender_id = $1 AND receiver_id = $2 AND type = $3 AND status = $4) as is_exist`,
      [sender_id, receiver_id, type, InvitationStatus.PENDING],
    );

    if (checkInvitationExistsData.rows[0]?.is_exist) {
      throw new BadRequestException('You have already invited this user');
    }

    const insertQuery = `
        INSERT INTO invitations (sender_id, receiver_id, type, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

    const result = await this.pool.query(insertQuery, [
      sender_id,
      receiver_id,
      type,
      InvitationStatus.PENDING,
    ]);

    return result.rows[0];
  }

  async update(data: UpdateDto, invitation_id: number, receiver_id: number) {
    const { status } = data;
    const invitationData = await this.pool.query(`SELECT * FROM invitations WHERE id = $1`, [
      invitation_id,
    ]);

    const invitation = invitationData.rows?.[0];

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.receiver_id !== receiver_id) {
      throw new ForbiddenException('Forbidden');
    }

    const result = await this.pool.query(
      `UPDATE invitations SET status = $1 WHERE id = $2 RETURNING *;`,
      [status, invitation_id],
    );

    return result.rows[0];
  }

  async getMyInvitations(authId: number) {
    const result = await this.pool.query(`SELECT * FROM invitations WHERE receiver_id = $1`, [
      authId,
    ]);

    return result.rows;
  }
}
