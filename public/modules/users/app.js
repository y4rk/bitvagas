angular.module('bitvagas.users', [
      'bitvagas.users.controllers'
    , 'bitvagas.users.services'
    ])
    .config(function($urlRouterProvider, $stateProvider){

        $stateProvider
        .state('signup', {
            url: '/signup'
          , templateUrl : 'modules/users/views/signup'
          , controller  : 'AuthController'
        })
        .state('signin', {
            url: '/signin'
          , templateUrl : 'modules/users/views/signin'
          , controller  : 'AuthController'
        })
        .state('freelancers', {
            url: '/freelancers'
          , templateUrl : 'modules/users/views/freelancers'
          , controller  : 'FreelancerController'
        })
        .state('freelancers-cv', {
            url: '/freelancers/:id'
          , templateUrl : 'modules/users/views/cv'
          , controller  : 'CVController'
        });
    });
