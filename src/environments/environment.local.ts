import { baseEnvironment } from './environment.base';

export const environment = {
  ...baseEnvironment,
  name: 'local',
  apiBaseUrl: 'http://localhost:8080'
};