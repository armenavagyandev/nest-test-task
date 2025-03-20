import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dtos/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private jwtService: JwtService,
  ) {}

  async signUp(data: SignUpDto) {
    const { first_name, last_name, email, age, password } = data;
    const client = await this.pool.connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const isExistUserResult = await client.query(
        `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) as is_exist`,
        [email],
      );

      if (isExistUserResult.rows[0]?.is_exist) {
        throw new BadRequestException('User already exists');
      }

      await client.query(
        `INSERT INTO users (first_name, last_name, age, email, password) VALUES ($1, $2, $3, $4, $5)`,
        [first_name, last_name, age, email, hashedPassword],
      );
    } finally {
      client.release();
    }
    return { message: 'User registered successfully' };
  }

  async signIn(data: SignInDto) {
    const { email, password } = data;
    const client = await this.pool.connect();

    try {
      const res = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);

      if (!res.rows.length) throw new NotFoundException('User not found');

      const user = res.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      const token = this.jwtService.sign({ user });
      return { token, user };
    } finally {
      client.release();
    }
  }
}
