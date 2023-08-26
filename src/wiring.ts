// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   Application,
//   Constructor,
//   createBindingFromClass,
//   Provider,
// } from '@loopback/core'

// import passport from 'passport'
// import {UserServiceBindings} from './Auth';


// export function setupBindings(app: Application){
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   passport.serializeUser(function (user: any, done){
//     done(null, user);
//   });

//   passport.deserializeUser(function (user: any, done){
//     done(null, user);
//   });
//   app.bind(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
//   .toClass(Passport)
// }
