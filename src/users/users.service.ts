import { HttpException, Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserRequest, UserResponse } from '../model/users.model';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async register(registerUserDTO: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register new user ${JSON.stringify(registerUserDTO)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, registerUserDTO);

    const checkUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });
    Error('Username already exists');
    if (checkUsername > 0) {
      throw new HttpException('Username already exists', 400);
    }
    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        username: registerRequest.username,
        password: registerRequest.password,
        name: registerRequest.name,
      },
    });
    return {
      username: user.username,
      name: user.name,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
