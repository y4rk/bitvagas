angular.module('bitvagas.dashboard', [ 'bitvagas.dashboard.controllers' ])
.config(function($urlRouterProvider, $stateProvider ){

    $stateProvider
    .state('dashboard', {
        abstract : true
        , url: '/dashboard'
        , templateUrl  : '/modules/dashboard/views/dashboard'
        , controller   : 'DashBoardController'
        , authenticate : true
    })
    .state('dashboard.overview', {
        url : '/overview'
        , templateUrl  : '/modules/dashboard/views/overview'
        , authenticate : true
        , controller   : 'OverviewController'
    })
    .state('dashboard.profile', {
        url : '/profile'
        , views : {
            ''  : {
                templateUrl : '/modules/users/views/dashboard/profile'
              , controller  : 'ProfileController'
            }
            , 'change-password@dashboard.profile' : {
                templateUrl : '/modules/users/views/dashboard/change-password'
            }
            , 'settings@dashboard.profile': {
                templateUrl : '/modules/users/views/dashboard/settings'
            }
        }
        , authenticate  : true
    })
    .state('dashboard.cv', {
        url : '/cv'
        , templateUrl  : '/modules/users/views/cv'
        , controller   : 'CVController'
        , authenticate : true
    });
});