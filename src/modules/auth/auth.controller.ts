import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthDTO, authSchema } from './dtos/auth.dto';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(
    @Body(new ZodValidationPipe(authSchema)) authDto: AuthDTO,
    @Res() response: any,
  ) {
    const user = await this.authService.validateUser(authDto);
    const token = await this.authService.generateToken(authDto, user);

    return response.status(200).json(token);
  }
}
