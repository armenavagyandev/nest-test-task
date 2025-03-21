import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { GetUsersDto } from './dtos/get-users.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  async index(query: GetUsersDto, authId: number) {
    const { search = '', page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const searchQuery = search ? `%${search}%` : '%';

    const usersQuery = `
      SELECT id, first_name, last_name, age, email, created_at
      FROM users
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR CAST(age AS TEXT) LIKE $1)
      AND id <> $2
      ORDER BY id DESC
      LIMIT $3 OFFSET $4;
    `;

    const countQuery = `
      SELECT COUNT(*) AS total FROM users
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR CAST(age AS TEXT) LIKE $1)
      AND id <> $2;
    `;

    const [usersResult, countResult] = await Promise.all([
      this.pool.query(usersQuery, [searchQuery, authId, limit, offset]),
      this.pool.query(countQuery, [searchQuery, authId]),
    ]);

    return {
      users: usersResult.rows,
      total: Number(countResult.rows[0].total),
      page,
      limit,
    };
  }
}
