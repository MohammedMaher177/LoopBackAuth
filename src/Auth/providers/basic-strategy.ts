// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, injectable} from '@loopback/core';
import {
  HttpErrors,
  OASEnhancer,
  OpenApiSpec,
  Request,
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {BasicAuthenticationStrategyBindings} from '../keys';
import {BasicAuthenticationUserService} from '../services/basic-auth-user-service';
import {AuthenticationStrategy, asAuthStrategy} from '../types';

export interface BasicAuthenticationStrategyCredentials {
  email: string;
  password: string;
}

@injectable(asAuthStrategy, asSpecEnhancer)
export class BasicAuthenticationStrategy
  implements AuthenticationStrategy, OASEnhancer {
  name = 'basic';

  constructor(
    @inject(BasicAuthenticationStrategyBindings.USER_SERVICE)
    private userService: BasicAuthenticationUserService,
  ) {  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log(111);

    const credentials: BasicAuthenticationStrategyCredentials =
      this.extractCredentials(request);
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);

    return userProfile;
  }

  extractCredentials(request: Request): BasicAuthenticationStrategyCredentials {
    console.log(222);

    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Basic Z2l6bW9AZ21haWwuY29tOnBhc3N3b3Jk
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Basic')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Basic'.`,
      );
    }

    //split the string into 2 parts. We are interested in the base64 portion
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Basic xxyyzz' where xxyyzz is a base64 string.`,
      );
    const encryptedCredentails = parts[1];

    // decrypt the credentials. Should look like :   'username:password'
    const decryptedCredentails = Buffer.from(
      encryptedCredentails,
      'base64',
    ).toString('utf8');

    //split the string into 2 parts
    const decryptedParts = decryptedCredentails.split(':');

    if (decryptedParts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header 'Basic' value does not contain two parts separated by ':'.`,
      );
    }

    const creds: BasicAuthenticationStrategyCredentials = {
      email: decryptedParts[0],
      password: decryptedParts[1],
    };

    return creds;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    console.log(333);

    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'basic',
    });
  }
}
