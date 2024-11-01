import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { AuthDTO } from './dtos/auth.dto';

import * as schema from 'src/shared/database/schema';
import * as bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // private readonly jwtSecret: string = String(process.env.JWT_SECRET_KEY);

  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async validateUser(authDTO: AuthDTO) {
    const { email } = authDTO;

    const [peopleExists]: any = await this.database.execute(sql`
      select
        people.id,
        people.nome,
        people.senha,
        people.id_tipo_pessoa,
        courses.id as id_curso 
      from
        people 
        join
            people_courses 
            on people_courses.people_id = people.id 
        join
            courses 
            on courses.id = people_courses.course_id 
      where
        email = ${email}
    `);

    if (!peopleExists) {
      throw new NotFoundException(`Usuário não encontrado.`);
    }

    const passwordIsValid = bcrypt.compareSync(
      authDTO.senha,
      peopleExists.senha,
    );

    if (!passwordIsValid) throw new BadRequestException('Senha Incorreta.');

    return peopleExists;
  }

  async generateToken(payload: any, user: any) {
    const people = {
      id: user.id,
      name: user.nome,
      email: payload.email,
      tipo_pessoa: user.id_tipo_pessoa,
      id_curso: user.id_curso,
    };

    return {
      user: people,
      token: await this.jwtService.signAsync(payload),
    };
  }
}
