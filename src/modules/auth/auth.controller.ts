import { Body, Controller, Post, Put, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

import { AuthDTO, authSchema } from './dtos/auth.dto';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import {
  ValidatePeopleDTO,
  validatePeopleSchema,
} from './dtos/validate-people.dto';
import {
  UpdatePasswordDTO,
  updatePasswordSchema,
} from './dtos/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(
    @Body(new ZodValidationPipe(authSchema)) authDto: AuthDTO,
    @Res() response: Response,
  ) {
    const user = await this.authService.validateUser(authDto);
    const token = await this.authService.generateToken(authDto, user);

    return response.status(200).json(token);
  }

  @Post('validateUser')
  async validateUser(
    @Body(new ZodValidationPipe(validatePeopleSchema))
    validatePeopleDTO: ValidatePeopleDTO,
    @Res() response: Response,
  ) {
    const user = await this.authService.validatePeople(validatePeopleDTO);

    return response.status(200).json(user);
  }

  @Put('updatePassword')
  async updatePassword(
    @Body(new ZodValidationPipe(updatePasswordSchema))
    updatePasswordDTO: UpdatePasswordDTO,
    @Res() response: Response,
  ) {
    const user = await this.authService.updatePassword(updatePasswordDTO);

    return response.status(200).json(user);
  }
}
