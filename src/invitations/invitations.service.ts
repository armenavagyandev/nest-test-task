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
    const client = await this.pool.connect();

    try {
      const receiverCheckData = await client.query(
        `SELECT EXISTS (SELECT 1 FROM users WHERE id = $1) as is_exist`,
        [receiver_id],
      );

      if (!receiverCheckData.rows[0]?.is_exist) {
        throw new NotFoundException('User not found');
      }

      const checkInvitationExistsData = await client.query(
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

      const result = await client.query(insertQuery, [
        sender_id,
        receiver_id,
        type,
        InvitationStatus.PENDING,
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(data: UpdateDto, invitation_id: number, receiver_id: number) {
    const { status } = data;
    const client = await this.pool.connect();

    try {
      const invitationData = await client.query(`SELECT * FROM invitations WHERE id = $1`, [
        invitation_id,
      ]);

      const invitation = invitationData.rows?.[0];

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.receiver_id !== receiver_id) {
        throw new ForbiddenException('Forbidden');
      }

      const result = await client.query(
        `UPDATE invitations SET status = $1 WHERE id = $2 RETURNING *;`,
        [status, invitation_id],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getMyInvitations(authId: number) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`SELECT * FROM invitations WHERE receiver_id = $1`, [
        authId,
      ]);

      return result.rows;
    } finally {
      client.release();
    }
  }
}
