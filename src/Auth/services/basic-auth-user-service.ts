// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {User, UserRelations} from '../../models';
import {UserRepository} from '../../repositories';
// import {UserRepository} from '@loopback/authentication-jwt';
import {Filter} from '@loopback/repository';
import {AuthenticationBindings, USER_REPO} from '../keys';
import {BasicAuthenticationStrategyCredentials} from '../providers/basic-strategy';
import {UserProfileFactory} from '../types';
import {UserService} from './user.service';

export class BasicAuthenticationUserService
  implements UserService<User, BasicAuthenticationStrategyCredentials>
{
  constructor(
    @inject(USER_REPO)
    private userRepository: UserRepository,
    @inject(AuthenticationBindings.USER_PROFILE_FACTORY)
    public userProfileFactory: UserProfileFactory<User>,
  ) { }

  async verifyCredentials(
    credentials: BasicAuthenticationStrategyCredentials,
  ): Promise<User & UserRelations> {
    console.log(credentials);

    if (!credentials) {
      throw new HttpErrors.Unauthorized(`'credentials' is null`);
    }

    if (!credentials.email) {
      throw new HttpErrors.Unauthorized(`'credentials.email' is null`);
    }

    if (!credentials.password) {
      throw new HttpErrors.Unauthorized(`'credentials.password' is null`);
    }

    const filter: Filter<User> = {
      where: {
        email: credentials.email,
        password: credentials.password,
      },
    };

    const foundUser = await this.userRepository.findOne(filter);
    if (!foundUser) {
      throw new HttpErrors['Unauthorized'](
        `User with email ${credentials.email} not found.`,
      );
    }

    if (credentials.password !== foundUser.password) {
      throw new HttpErrors.Unauthorized('The password is not correct.');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    if (!user) {
      throw new HttpErrors.Unauthorized(`'user' is null`);
    }

    if (!user.id) {
      throw new HttpErrors.Unauthorized(`'user id' is null`);
    }

    return this.userProfileFactory(user);
  }
}
