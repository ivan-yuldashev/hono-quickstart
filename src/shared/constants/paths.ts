export enum RootPath {
  V1 = '/api/v1',

  DOC = '/doc',
  HEALTH = '/health',
  OPEN_API = '/openapi',
};

export enum V1Path {
  // Task
  TASK = '/tasks/{id}',
  TASKS = '/tasks',

  // Auth
  LOGIN = '/login',
  LOGOUT = '/logout',
  REFRESH_TOKEN = '/refresh-token',
  REGISTER = '/register',
} ;
