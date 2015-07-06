angular.module('bitvagas',
    ['ui.router'
    ,'pascalprecht.translate'
    ,'satellizer'
    ,'ngLodash'
    ,'ngCookies'
    ,'bitvagas.main'
    ,'bitvagas.jobs'
    ,'bitvagas.org'
    ,'bitvagas.users'
    ,'bitvagas.admin'
    ]).config(function($translateProvider){
        //Angular translation configuration
        $translateProvider.useStaticFilesLoader({
            prefix: 'locales/',
            suffix: '.json'
        })
        .preferredLanguage('en')
        .fallbackLanguage(['pt', 'en'])
        .useLocalStorage();

        $translateProvider.useSanitizeValueStrategy('escaped');
    }).config(function(lodash){

        //find selected : true property
        lodash.mixin({ 'selected' : function(array, property){
            return lodash.result(lodash.find(array, { selected : true }), property);
        }});

    }).config(function($authProvider, $httpProvider){

        $authProvider.loginUrl = '/auth/login';
        $authProvider.loginRedirect = '/dashboard/overview';

        $authProvider.signupUrl = '/signup';
        $authProvider.signupRedirect = '/login';

        $httpProvider.interceptors.push('Interceptor');

    }).run(function($rootScope, $state, $auth, $window, UserService){

        $rootScope.$on("$stateChangeStart", function(e, toState, toParams, fromState, fromParams){
            if(toState.authenticate) {
                if($auth.isAuthenticated() === false){
                    e.preventDefault();
                    $state.transitionTo('signin');
                }
            }

            if($window.localStorage.getItem('currentUser')      !== null &&
               $window.localStorage.getItem('satellizer_token') !== null)
               $rootScope.currentUser = JSON.parse($window.atob($window.localStorage.currentUser));
            else
                deleteCurrentUser();
        });

        $window.onload = function() {
            if($rootScope.isAuthenticated())
                updateUser();
        };

        $rootScope.$on('unauthorize', function(){
            $state.transitionTo('signin');
        });

        $rootScope.$on('update-me', function(){
            updateUser();
        });

        $rootScope.logout = function(){
            $auth.logout().then(function(){
                deleteCurrentUser();
            });
        };

        $rootScope.isAuthenticated = function(){
            return $auth.isAuthenticated();
        };

        function updateUser(){
            UserService.me().then(function(data){
                $window.localStorage.currentUser = $window.btoa(JSON.stringify(data.data));
                $rootScope.currentUser = data.data;
            });
        }

        function deleteCurrentUser(){
            delete $rootScope.currentUser;
            $window.localStorage.removeItem('currentUser');
        }
    });

angular.module('bitvagas.admin', [ 'bitvagas.admin.controllers' ])
.config(function($urlRouterProvider, $stateProvider ){

    $stateProvider
    .state('dashboard', {
        abstract : true
        , url: '/dashboard'
        , templateUrl  : '/modules/admin/views/dashboard'
        , controller   : 'DashBoardController'
        , authenticate : true
    })
    .state('dashboard.overview', {
        url : '/overview'
        , templateUrl  : '/modules/admin/views/overview'
        , authenticate : true
    })
    .state('dashboard.profile', {
        url : '/profile'
        , views : {
            ''  : {
                templateUrl : '/modules/users/views/dashboard/profile'
            }
            , 'change-password@dashboard.profile' : {
                templateUrl : '/modules/users/views/change-password'
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

angular.module('bitvagas.jobs',
    [ 'ui.router'
    , 'bitvagas.jobs.controllers'
    , 'bitvagas.jobs.services'
    , 'bitvagas.jobs.category.services'
    ])
    .config(function($urlRouterProvider, $stateProvider){

        $stateProvider
        .state('jobs', {
            url: '/jobs'
          , templateUrl : '/modules/jobs/views/job-list'
          , controller  : 'JobListController'
        })
        .state('jobs-list', {
            url: '/jobs/list'
          , templateUrl : '/modules/jobs/views/job-list'
          , controller  : 'JobListController'
        })
        .state('jobs-post', {
            url: '/jobs/post'
          , templateUrl  : '/modules/jobs/views/job-post'
          , resolve      : {
              Categories : function(CategoryService){
                  return CategoryService.findAll();
              }
          }
          , params       : { data : {}, errors : [] }
          , controller   : 'JobPostController'
        })
        .state('jobs-confirm', {
            url: '/jobs/create/confirm'
          , templateUrl  : '/modules/jobs/views/job-confirm'
          , resolve      : {
              Categories : function(CategoryService){
                  return CategoryService.findAll();
              }
          }
          , params       : { data : {}}
          , controller   : 'JobPostController'
        })
        .state('jobs-show', {
            url: '/jobs/:id'
          , templateUrl: '/modules/jobs/views/job-show'
          , controller : 'JobShowController'
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
                Categories : function(CategoryService){
                  return CategoryService.findAll();
              }
          }
          , params       : { data : {}, errors : [] }
          , controller   : 'JobCreateController'
          , authenticate : true
        })
        .state('dashboard.jobs.confirm', {
            url          : '/create'
          , templateUrl  : '/modules/jobs/views/job-confirm'
          , resolve      : {
              Categories : function(CategoryService){
                  return CategoryService.findAll();
              }
              , Organizations : function(OrgService){
                  return OrgService.findByUser();
              }
          }
          , params       : { data : {} }
          , controller   : 'JobCreateController'
          , authenticate : true
        });
    });

angular.module('bitvagas.main',
    ['bitvagas.main.factory'
    ,'bitvagas.main.controllers'
    ])
    .config(function($urlRouterProvider, $stateProvider){

        $urlRouterProvider.otherwise('/');
        $stateProvider
        .state('index', {
            url: '/'
          , views        : {
              ''         : {
                    templateUrl     : 'modules/main/views/index'
              }
              , 'job-list@index'    : {
                    templateUrl     : 'modules/jobs/views/job-list'
                  , controller      : 'JobListController'
              }
              , 'job-sidebar@index' : {
                    templateUrl     : 'modules/jobs/views/job-sidebar'
              }
          }
        })
        .state('about', {
            url: '/about'
          , templateUrl: 'modules/main/views/about'
        })
        .state('terms', {
            url: '/terms'
          , templateUrl: 'modules/main/views/terms'
        })
        .state('contact', {
            url: '/contact'
          , templateUrl: 'modules/main/views/contact'
        });
    });

angular.module('bitvagas.org',
    [ 'bitvagas.org.controllers'
    , 'bitvagas.org.services'
    ])
    .config(function($urlRouterProvider, $stateProvider){

        $stateProvider
        .state('dashboard.organization', {
            url: '/organization'
          , abstract : true
          , templateUrl  : '/modules/organizations/views/organizations'
          , authenticate : true
        })
        .state('dashboard.organization.list', {
            url : '/'
          , templateUrl  : '/modules/organizations/views/org.list'
          , authenticate : true
          , controller   : 'OrgController'
        })
        .state('dashboard.organization.create', {
            url : '/create'
          , templateUrl  : '/modules/organizations/views/org.create'
          , authenticate : true
          , controller   : 'OrgController'
        })
        .state('dashboard.organization.edit', {
            url : '/edit/:OrgID'
          , templateUrl  : '/modules/organizations/views/org.edit'
          , authenticate : true
          , controller   : 'OrgController'
        });
    });

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

angular.module('bitvagas.admin.controllers', [])
.controller('DashBoardController',DashBoardController);

DashBoardController.$inject = ['$scope', '$state', 'UserService'];
function DashBoardController($scope, $state, UserService){
}

angular.module('bitvagas.admin.services', [])
.factory('AuthenticationService', AuthenticationService);

AuthenticationService.$inject = ['$q', '$http', '$state'];
function AuthenticationService($q, $http, $state){
    return {
        isAuthenticated : function() {
            var deferred = $q.defer();
            $http.get('/isAuthenticated').then(function(user){
                if(user !== 0)
                    deferred.resolve(user);
                else
                    deferred.reject();

            },function(err){
                deferred.reject(err);
            });
            return deferred.promise;
        }
    };
}

angular.module('bitvagas.jobs.controllers',[]);

angular.module('bitvagas.jobs.controllers', ['pg-ng-dropdown'])
.controller('JobPostController', JobPostController)
.controller('JobCreateController', JobCreateController);

JobPostController.$inject   = ['$scope', '$state', '$stateParams', 'JobService', 'Categories', 'ErrorHandling', 'lodash'];
JobCreateController.$inject = ['$scope', '$state', '$stateParams', 'JobService', 'Categories', 'lodash', 'ErrorHandling'];
function JobPostController($scope, $state, $stateParams, JobService, Categories,  ErrorHandling, _){

    $scope.data = $stateParams.data;
    $scope.errors = $stateParams.errors || [];

    $scope.categories = Categories.data;

    $scope.create = function(){
        $scope.data.CATEGORY_ID = _.selected($scope.categories, 'id');
        if($scope.form.$valid)
            $state.go('jobs-confirm', { data : $scope.data });
    };

    $scope.confirm = function(data){

        JobService.post(data)
        .then(function(data){
            $state.go('jobs-show', { 'id': data.data.id});
        }, function(err){
            //back to crate state and show errors
            $state.go('jobs-create', {
                data   : $scope.data
              , errors : ErrorHandling.getErrors(err.data)
            });
        });
    };
}

function JobCreateController($scope, $state, $stateParams, JobService, Categories, _, ErrorHandling){

    $scope.data = $stateParams.data;
    $scope.errors = $stateParams.errors || [];

    $scope.categories = Categories.data;

    $scope.create = function(){
        $scope.data.CATEGORY_ID = _.selected($scope.categories, 'id');
        $scope.data.ORG_ID = _.selected($scope.orgs, 'id');
        $state.go('dashboard.jobs.confirm', { data : $scope.data });
    };

    $scope.confirm = function(data){

        JobService.create(data)
        .then(function(data){
            $state.go('dashboard.jobs.list');
        }, function(err){
            //back to crate state and show errors
            $state.go('dashboard.jobs.create', {
                data   : $scope.data
              , errors : ErrorHandling.getErrors(err.data)
            });
        });
    };
}

angular.module('bitvagas.jobs.controllers')
.controller('JobListController', JobListController);

JobListController.$inject = ['$scope', 'JobService'];

function JobListController($scope, JobService) {

    JobService.findAll().then(function(data){
        $scope.jobs = data.data;
    });
}

angular.module('bitvagas.jobs.controllers')
.controller('JobDashListController', JobDashListController);

JobDashListController.$inject = ['$scope', '$sce'];
function JobDashListController($scope, $sce){

    var setUrl = function(id){
        $scope.url = $sce.trustAsResourceUrl("https://sandbox.coinbase.com/checkouts/6d111844c2041be4fdbdd1b3df5eaab5/inline"+(id ? "?c="+id : ""));
    };

    $scope.toggle = function(index, id) {

        if($scope.$parent.open == index)
            return;

        setUrl(id);

        $scope.$parent.open = index;
    };
}


angular.module('bitvagas.jobs.controllers')
.controller('JobShowController', JobShowController);

JobShowController.$inject = ['$scope', '$state', 'JobService'];

function JobShowController($scope, $state, JobService){
    var id = $state.params.id;
    JobService.findById(id).then(function(data){
        $scope.job = data.data;
    });

    $scope.apply = function(){
        $scope.applied = true;
    };
}

angular.module('bitvagas.jobs.category.services', [])
.service('CategoryService', CategoryService);

CategoryService.$inject = ['$http'];
function CategoryService($http){
    var baseUrl = 'api/categories';
    this.findAll = function(){
        return $http.get(baseUrl);
    };
}

angular.module('bitvagas.jobs.services', [])
.service('JobService', JobService);

JobService.$inject = ['$http'];
function JobService($http){
    var baseUrl = '/api/jobs/';

    this.create = function(job){
        return $http.post(baseUrl, job);
    };
    this.post = function(job){
        return $http.post(baseUrl + 'post', job);
    };
    this.findAll = function(){
        return $http.get(baseUrl);
    };
    this.findById = function(id){
        return $http.get(baseUrl+id);
    };
}

angular.module('bitvagas.main.controllers', [])
.controller('MainController', MainController);


MainController.$inject = ['$scope', '$translate'];

function MainController($scope, $translate){
    $scope.setLang = function(langKey) {
        $translate.use(langKey);
    };
}

angular.module('bitvagas.main.factory',[])
.factory('ErrorHandling', function(){

    var handler = {};

    handler.getErrors = function(data){
        var errorList = [];
        if(typeof data === 'object')
            if(data.errors !== undefined)
                //Get a list of errors
                for(var errorIndex in data.errors)
                    errorList.push(data.errors[errorIndex].message);
            else
                errorList.push(data.message);
        else
            //Single error
            errorList.push(data);

        return errorList;
    }

    return handler
});

angular.module('bitvagas.main.factory')
.factory('Interceptor', Interceptor);

Interceptor.$inject = ['$rootScope', '$q'];
function Interceptor($rootScope, $q){
    return {

        response: function(response){

            if(response.status === 201 ||
               response.status === 204)
                $rootScope.$broadcast('update-me');

            return response;
        }

        , responseError: function(response){

            if(response.status === 401){
                $rootScope.$broadcast('unauthorized');
                console.log('401 error');
                console.log(response);
                $q.reject(response);
            }

            if(response.status === 400 ||
               response.status === 404){
                //show error
                console.log('400 error');
                console.log(response);
                $q.reject(response);
            }

            return response;
        }
    };
}


angular.module('bitvagas.org.controllers',[])
.controller('OrgController', OrgController);

OrgController.$inject = ['$scope', '$state', 'OrgService', 'ErrorHandling'];
function OrgController($scope, $state, OrgService, ErrorHandling){

    if($state.params.OrgID !== undefined) {
        OrgService.findById($state.params.OrgID)
        .then(function(data){
            $scope.org = data.data;
        });
    }

    $scope.create = function(org){
        OrgService.create(org).then(function(data){
            GoBack();
        }, function(err){
            console.log(err);
            $scope.errors = ErrorHandling.getErrors(err.data);
        });
    };

    $scope.edit = function(org){
        OrgService.edit(org).then(function(data){
            GoBack();
        }, function(err){
            console.log(err);
            $scope.errors = ErrorHandling.getErrors(err.data);
        });
    };

    $scope.delete = function(id){
        //TODO: Message confirmation
        OrgService.delete(id).then(function(data){
            GoBack();
        }, function(err){
            console.log(err);
            $scope.errors = ErrorHandling.getErrors(err.data);
        });
    };

    function GoBack(){
        $state.transitionTo('dashboard.organization.list');
    }
}

angular.module('bitvagas.org.services', [])
.service('OrgService', OrgService);

OrgService.$inject = ['$http'];
function OrgService($http){
    var baseUrl = 'api/organizations/';

    this.findAll = function(){
        return $http.get(baseUrl);
    };

    this.findById = function(id){
        return $http.get(baseUrl+id);
    };

    this.create = function(org){
        return $http.post(baseUrl, org);
    };

    this.edit = function(org){
        return $http.put(baseUrl + org.id, org);
    };

    this.delete = function(id){
        return $http.delete(baseUrl + id);
    };
};

angular.module('bitvagas.users.controllers', [])
.controller('AuthController', AuthController);

AuthController.$inject = ['$rootScope', '$scope', '$state', '$window', '$auth'];
function AuthController ($rootScope, $scope, $state, $window, $auth) {

    if($auth.isAuthenticated())
        $state.transitionTo('dashboard.overview');

    $scope.login = function(){
        $auth.login({
            EMAIL: $scope.email
          , PASSWORD: $scope.password
        }).then(function(data){
            $scope.authenticated = true;
            $rootScope.$broadcast('update-me');
            $state.reload();
        }).catch(function(err){
            $scope.authenticated = false;
            if($state.current.name === 'signin')
                $window.location.href = '/auth/login';
        });
    };

    $scope.signup = function(user){
        $auth.signup({
            NAME: $scope.NAME
          , EMAIL: $scope.EMAIL
          , PASSWORD: $scope.PASSWORD
          , REPASSWORD: $scope.REPASSWORD
        }).catch(function(err){
            console.log(err);
        });
    };
}

angular.module('bitvagas.users.controllers')
.controller('FreelancerController', FreelancerController)
.controller('CVController', CVController);

FreelancerController.$inject = ['$scope', 'FreelancerService'];
CVController.$inject = ['$scope', '$state', '$stateParams', 'FreelancerService'];
function CVController($scope, $state, $stateParams, FreelancerService){

    var id = $stateParams.id || $scope.currentUser.id;
    FreelancerService.findById(id).then(function(user){
        $scope.user = user.data;
        var linkedIn = user.data.LINKEDIN_TOKEN;
        if(linkedIn) {
            FreelancerService.getCV({ token : linkedIn}).then(function(data){
                $scope.user.cv = data.data;
            });
        }
    });
}

function FreelancerController ($scope, FreelancerService) {
    FreelancerService.findAll().then(function(data){
        $scope.freelancers = data.data;
    });
}

angular.module('bitvagas.users.services', [])
.service('FreelancerService', FreelancerService);

FreelancerService.$inject = ['$http'];
function FreelancerService($http){

    this.findAll = function(){
        return $http.get('/api/freelancer');
    };

    this.findById = function(id){
        return $http.get('/api/freelancer/'+id);
    };

    this.getCV = function(token){
        return $http.post('/api/freelancer/cv', token);
    };
}

angular.module('bitvagas.users.services')
.service('UserService', UserService);

UserService.$inject = ['$http'];
function UserService($http) {

    this.currentUser = {};

    this.me = function(){
        return $http.get('/me');
    };

    this.invite = function(user){
        return $http.post('/invite', user);
    };
}
