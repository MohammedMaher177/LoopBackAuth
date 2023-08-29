import {AuthenticationBindings, AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MongoDataSource} from './datasources';
import {MySequence} from './sequence';

// import {registerAuthenticationStrategy} from '@loopback/authentication';
// import {BasicAuthenticationStrategy} from './Auth';
import {CustomStrategy} from './Auth/CustomStrategy/CustomStrategy';
// import {BasicAuthenticationUserService} from './Auth/services/basic-auth-user-service';





export {ApplicationConfig};

export class App2Application extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    this.component(AuthenticationComponent);
    // Bind datasource
    this.dataSource(MongoDataSource, UserServiceBindings.DATASOURCE_NAME);

    // registerAuthenticationStrategy(this, BasicAuthenticationStrategy);

    // this.bind(AuthenticationBindings.STRATEGY).toClass(CustomStrategy)
    // this.bind('services.authentication.basic.user.service').toClass(
    //   BasicAuthenticationUserService,
    // );

    // this.bind(AuthenticationBindings.STRATEGY).toProvider(CustomStrategy);
    // registerAuthenticationStrategy(this, CustomStrategy);


    this.add(createBindingFromClass(CustomStrategy, {key: AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}));
  }

  // async mountComponent(): Promise<void> {
  //   // قم بإجراء الربط (binding) هنا
  //   this.bind(AuthenticationBindings.STRATEGY).toClass(CustomStrategy.arguments);
  // }
}
