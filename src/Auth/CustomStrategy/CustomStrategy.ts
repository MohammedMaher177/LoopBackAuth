import {AuthenticationBindings, AuthenticationMetadata} from '@loopback/authentication';
import {Strategy} from 'passport-local';
// import {RedirectRoute, Request} from '@loopback/rest';
// import {HttpErrors} from '@loopback/rest';
// import {UserProfile} from '@loopback/security';
// import {inject} from '@loopback/testlab';
import {Provider, inject} from '@loopback/context';
// import {AUTHENTICATION_STRATEGY_NOT_FOUND} from '../types';
import {repository} from "@loopback/repository";
import {User, UserRelations} from '../../models';
import {UserRepository} from '../../repositories';
// import {AuthenticationBindings} from '../keys';
// import {User} from '../../models';
// import {Filter} from "@loopback/repository"

import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
// import {TokenServiceBindings} from '../keys';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {TokenService} from '../services';
export class CustomStrategy implements Provider<Strategy> {
  name = 'my-custom';


  // constructor() {
  //   // قم بتكوين استراتيجية المصادقة هنا
  //   // يمكنك استخدام Passport.js وتحديد استراتيجية المصادقة المناسبة حسب احتياجاتك
  // }

  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
  ) {console.log(this.name);}

  value(): Strategy {
    const strategy = new Strategy(
      // {},
      {
        usernameField: 'email', // اسم حقل اسم المستخدم في طلب المصادقة
        passwordField: 'password', // اسم حقل كلمة المرور في طلب المصادقة
      },
      async (
        username: string,
        password: string,
        done: (err: unknown, user?: User & UserRelations | false) => void,
      ) => {
        try {
          // قم بتنفيذ العملية المخصصة للتحقق من المصادقة هنا
          // يمكنك الوصول إلى معلومات المصادقة من متغيرات "username" و "password"
          // وقم بتنفيذ الخطوات اللازمة للتحقق من هوية المستخدم واسترجاع ملف المستخدم

          const user: (User & UserRelations) | null = await this.userRepository.findOne({where: {username, password}})
          // const user: UserProfile = {
          //   // استبدل هذا بمعلومات المستخدم الفعلية التي تم التحقق منها
          //   id: "",
          //   name: 'John Doe',
          //   email: 'john@example.com',
          //   [securityId]: u,
          // };


          done(null, user!);
        } catch (err) {
          done(err, false);
        }
      }
    );

    return strategy;

  }


  async authenticate(request: Request): Promise<UserProfile | undefined> {
    // Extract the token from the Authorization header
    const token: string = this.extractCredentials(request);

    // Verify the token and get the user profile
    const userProfile: UserProfile = await this.tokenService.verifyToken(token);

    // Return the user profile
    return userProfile;
  }

  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // For example: Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    // Split the string into 2 parts: 'Bearer' and 'xxx.yyy.zzz'
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const token = parts[1];

    return token;
  }
  // async authenticate(request: Request): Promise<UserProfile> {
  // قم بتنفيذ العملية المخصصة للمصادقة هنا
  // يمكنك الوصول إلى معلومات المصادقة من طلب الواردة
  // وتنفيذ الخطوات اللازمة للتحقق من هوية المستخدم واسترجاع ملف المستخدم
  // }


}
