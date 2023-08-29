import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  Where,
  model,
  property,
} from '@loopback/repository';
import {
  HttpErrors,
  SchemaObject,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';

import {
  TokenService,
  UserService,
} from '@loopback/authentication';
import {
  Credentials,
  TokenServiceBindings,
  UserRelations,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import {authenticate} from '../Auth';
// import _ from 'lodash';
@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
export class UserController {
  constructor(
    // @repository(UserRepository)
    // public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    // @repository(UserRepository) protected userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(UserServiceBindings.USER_REPOSITORY)
    public userRepository: UserRepository, // @inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    // public refreshService: RefreshTokenService,
  ) { }
  // @authenticate("basic")
  @post('/auth/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    const existUser: User | null = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (existUser) {
      const passwordMatched = await compare(
        credentials.password,
        existUser.password,
      );
      if (passwordMatched) {
        const userProfile = this.userService.convertToUserProfile(existUser);
        const token = await this.jwtService.generateToken(userProfile);
        return {token};
      } else {
        throw new HttpErrors.Unauthorized('Invalid password.');
      }
    } else {
      throw new HttpErrors.Unauthorized('Invalid email.');
    }
  }

  @authenticate("my-custom")
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('/auth/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User | UserRelations> {
    try {
      const email: string | undefined = newUserRequest.email;
      if (!email) {
        throw new HttpErrors.Unauthorized(`Authorization header not found.`);

      }
      const {count} = await this.userRepository.count({email});

      if (count) {
        return {message: 'error', param: 'Email Already Exist'};
      }
      const password = await hash(newUserRequest.password, await genSalt());

      newUserRequest.password = password;
      const savedUser = await this.userRepository.create(newUserRequest);
      const id: string | undefined = savedUser.id;
      if (id) {
        const token = await this.jwtService.generateToken({
          savedUser,
          [securityId]: id,
        });
        console.log(token);
        return {message: 'success', token};
      } else {
        throw new Error('Invalid');
      }
    } catch (error) {
      throw new HttpErrors.BadRequest(`catch error.`);

    }
  }

  // @post('/users')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(User)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {
  //           title: 'NewUser',
  //           exclude: ['id'],
  //         }),
  //       },
  //     },
  //   })
  //   user: Omit<User, 'id'>,
  // ): Promise<User | UserRelations> {
  //   return this.userRepository.create(user);
  // }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[] | UserRelations> {
    return this.userRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User | UserRelations> {
    return this.userRepository.findById(id, filter);
  }
  @authenticate('jwt')
  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    @param.header.string('Authorization')
    yourHeader: string,
    user: User,
  ): Promise<User | UserRelations> {
    yourHeader = yourHeader.replace('Bearer ', '');
    const {id: userId} = await this.jwtService.verifyToken(yourHeader);

    if (userId !== id) {
      throw new HttpErrors.Unauthorized('Not Authorized.');
    }
    if (user?.password) {
      user.password = await hash(user.password, await genSalt());
    }
    await this.userRepository.updateById(id, user);
    const updated: User = await this.userRepository.findById(id);
    return updated;
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
