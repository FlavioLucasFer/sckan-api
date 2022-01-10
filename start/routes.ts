/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
	Route.post('/login', 'AuthController.login');
	Route.post('/logout', 'AuthController.logout').middleware('auth');
	Route.post('/me', 'AuthController.loggedUser').middleware('auth');
}).prefix('/auth');

Route.resource('roles', 'RolesController').apiOnly().middleware({ '*': ['auth'] });
Route.post('/roles/:id/restore', 'RolesController.restore').middleware('auth');

Route.resource('companies', 'CompaniesController').apiOnly().middleware({ '*': ['auth'] });
Route.group(() => {
	Route.put('/logo', 'CompaniesController.logo');
	Route.post('/restore', 'CompaniesController.restore');
}).prefix('/companies/:id')
	.middleware('auth');

Route.resource('users', 'UsersController').apiOnly().middleware({ '*': ['auth'] });
Route.group(() => {
	Route.put('/picture', 'UsersController.picture');
	Route.post('/restore', 'UsersController.restore');
}).prefix('/users/:id')
	.middleware('auth');

Route.group(() => {
	Route.put('/logo', 'ProjectsController.logo');
	Route.post('/restore', 'ProjectsController.restore');
}).prefix('/projects/:id')
	.middleware('auth');
Route.resource('projects', 'ProjectsController').apiOnly().middleware({ '*': ['auth'] });

Route.post('/sprints/:id/restore', 'SprintsController.restore').middleware('auth');
Route.resource('sprints', 'SprintsController').apiOnly().middleware({ '*': ['auth'] });