import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as schema from 'src/shared/database/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';

import * as bcrypt from 'bcrypt';
import { CreatePeopleDTO } from './dtos/people.dto';
import { sql } from 'drizzle-orm';

@Injectable()
export class PeopleService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createPeopleDto: any): Promise<CreatePeopleDTO> {
    const { email } = createPeopleDto;

    const { id_courses, ...props } = createPeopleDto;

    const peopleExists = await this.database.query.people.findMany({
      where: (people, { eq }) => eq(people.email, email),
    });

    if (peopleExists.length > 0) {
      throw new BadRequestException(`O e-mail ${email} já possui um cadastro.`);
    }

    props.senha = bcrypt.hashSync(props.senha, 10);

    try {
      await this.database.transaction(async (db) => {
        await db.insert(schema.people).values(props);

        const [person] = await db.query.people.findMany({
          where: (people, { eq }) => eq(people.email, email),
        });

        const existingCourses = await db.query.courses.findMany({
          where: (courses, { inArray }) => inArray(courses.id, id_courses),
        });

        if (existingCourses.length !== id_courses.length) {
          throw new BadRequestException(
            "Um ou mais cursos não existem na tabela 'courses'",
          );
        }

        await Promise.all(
          id_courses.map(async (id: string) => {
            await db.insert(schema.peopleCourses).values({
              course_id: id,
              people_id: person.id,
            });
          }),
        );
      });

      return createPeopleDto;
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  async getTeachers(id_course: number): Promise<any> {
    try {
      const teachers = await this.database.execute(sql`
        select
          people.id,
          people.nome,
          people.email,
          courses.name as curso 
        from people 
          join
              people_courses 
              on people_courses.people_id = people.id 
          join
              courses 
              on courses.id = people_courses.course_id 
        where
          people.id_tipo_pessoa = 'b6a95883-9949-4d23-b220-1f3af6c8f7ea'
          and people_courses.course_id = ${id_course}
      `);

      return teachers;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
