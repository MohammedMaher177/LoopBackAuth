import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mongo',
  connector: 'mongodb',
  url: 'mongodb+srv://momaherfrontend:JXT0Ob9skw4M7ZOo@cluster0.7l7zov4.mongodb.net/app2',
  host: '27017',
  port: 27018,
  user: 'momaherfrontend',
  password: 'JXT0Ob9skw4M7ZOo',
  database: 'app2',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
