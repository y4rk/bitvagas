angular.module('bitvagas.jobs',
    [ 'ui.router'
    , 'bitvagas.jobs.controllers'
    , 'bitvagas.jobs.filters'
    , 'bitvagas.jobs.services'
    , 'bitvagas.jobs.category.services'
    ])
    .config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider){
        $stateProvider
        .state('jobs', {
            url: '/jobs'
          , templateUrl : '/modules/jobs/views/job-list'
          , controller  : 'JobListController'
        })
        .state('jobs-list', {
            url: '/jobs/list/:filter'
          , templateUrl : '/modules/jobs/views/job-list'
          , controller  : 'JobListController'
        })
        .state('jobs-post', {
            url: '/jobs/post'
          , templateUrl  : '/modules/jobs/views/job-post'
          , resolve      : {
              Categories : ["CategoryService", function(CategoryService){
                  return CategoryService.findAll();
              }]
          }
          , params       : { data : {}, errors : [] }
          , controller   : 'JobPostController'
        })
        .state('jobs-confirm', {
            url: '/jobs/create/confirm'
          , templateUrl  : '/modules/jobs/views/job-confirm'
          , resolve      : {
              Categories : ["CategoryService", function(CategoryService){
                  return CategoryService.findAll();
              }]
          }
          , params       : { data : {}}
          , controller   : 'JobPostController'
        })
        .state('jobs-show', {
            url: '/{id: [0-9]+}-:title-:org'
          , templateUrl: '/modules/jobs/views/job-show'
          , controller : 'JobShowController'
          , params     : { id: undefined, title: undefined }
          , caseInsensitiveMatch: true
          , resolve    : {
            Job        : ["$q", "$state", "$stateParams", "JobService", function($q, $state, $stateParams, JobService){
              var deferred = $q.defer();

              if ($stateParams.id) {
                JobService.findById($stateParams.id)
                .then(function(job){
                    return deferred.resolve(job);
                }).catch(function(err){
                    deferred.reject(err);
                    $state.transitionTo('jobs-list');
                });
              } else {
                $state.transitionTo('jobs-list');
              }

              return deferred.promise;
            }]
          }
        })
        //Dashboard views
        .state('dashboard.jobs', {
            url : '/jobs'
          , abstract     : true
          , templateUrl  : '/modules/jobs/views/dashboard/job-dashboard'
          , authenticate : true
        })
        .state('dashboard.jobs.list', {
            url          : '/'
          , templateUrl  : '/modules/jobs/views/dashboard/job-dashboard-list'
          , authenticate : true
          , controller   : 'JobDashListController'
        })
        .state('dashboard.jobs.create', {
            url          : '/create'
          , templateUrl  : '/modules/jobs/views/dashboard/job-dashboard-create'
          , resolve      : {
                Categories : ["CategoryService", function(CategoryService){
                  return CategoryService.findAll();
              }]
          }
          , params       : { data : {}, errors : [] }
          , controller   : 'JobCreateController'
          , authenticate : true
        })
        .state('dashboard.jobs.confirm', {
            url          : '/create'
          , templateUrl  : '/modules/jobs/views/dashboard/job-confirm'
          , resolve      : {
              Categories : ["CategoryService", function(CategoryService){
                  return CategoryService.findAll();
              }]
          }
          , params       : { data : {} }
          , controller   : 'JobCreateController'
          , authenticate : true
        });
    }]);
