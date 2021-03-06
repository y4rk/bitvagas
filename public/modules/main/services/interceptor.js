angular.module('bitvagas.main.factory', [])
.factory('Interceptor', Interceptor);

Interceptor.$inject = ['$rootScope', '$q', '$injector', 'lodash'];
function Interceptor($rootScope, $q, $injector, _){
    return {

        response: function(response){

            if((response.status === 201 ||
                response.status === 204) &&
                !/\/api\/jobs\/\d\/apply/.exec(response.config.url) &&
                !/\/api\/jobs\/post/.exec(response.config.url))
                $rootScope.$broadcast('update-me');

            return response;
        }

        , responseError: function(response){

            var $translate =  $injector.get('$translate');

            var errorMessage = response.data.message ?
                               response.data.message :
                               response.data;

            if(_.startsWith(errorMessage, 'errorMessage'))
               errorMessage  = $translate.instant(errorMessage);

            if(response.status === 401){

                if(response.data.destroy === true)
                    $rootScope.logout();

                new NotificationFx({
                    message : '<div class="ns-thumb"><img src="img/template.png"/></div><div class="ns-content"><span>'+errorMessage+'</span></div>'
                  , layout : 'other'
                  , effect : 'thumbslider'
                  , ttl : 9000
                  , type : 'notice'
                });
                $rootScope.$broadcast('unauthorized');
                return $q.reject(response);
            }

            if(response.status === 400){
                new NotificationFx({
                    message : '<div class="ns-thumb"><img src="img/template.png"/></div><div class="ns-content"><span>'+errorMessage+'</span></div>'
                  , layout : 'other'
                  , effect : 'thumbslider'
                  , ttl : 9000
                  , type : 'notice'
                });
                return $q.reject(response);
            }
            if(response.status === 404){
                //show error
                return $q.reject(response);
            }

            return response;
        }
    };
}

