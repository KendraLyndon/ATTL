webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var attlApp = angular.module('attlApp', [__webpack_require__(1), __webpack_require__(3)]);

	var HomeController = __webpack_require__(6);
	var AboutController = __webpack_require__(9);
	var NewsController = __webpack_require__(11);

	attlApp.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {

	  $routeProvider.when('/', {
	    templateUrl: 'app/partials/home.html',
	    controller: 'HomeController',
	    resolve: HomeController.resolve
	  }).when('/about', {
	    templateUrl: 'app/partials/about.html',
	    controller: 'AboutController',
	    resolve: AboutController.resolve
	  }).when('/news', {
	    templateUrl: 'app/partials/news.html',
	    controller: 'NewsController',
	    resolve: NewsController.resolve
	  }).when('/contact', {
	    templateUrl: 'app/partials/contact.html'
	  });

	  $locationProvider.html5Mode(true);
	}]);

	module.exports = attlApp;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	module.exports = 'ngRoute';


/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * @license AngularJS v1.6.1
	 * (c) 2010-2016 Google, Inc. http://angularjs.org
	 * License: MIT
	 */
	(function(window, angular) {'use strict';

	/* global shallowCopy: true */

	/**
	 * Creates a shallow copy of an object, an array or a primitive.
	 *
	 * Assumes that there are no proto properties for objects.
	 */
	function shallowCopy(src, dst) {
	  if (isArray(src)) {
	    dst = dst || [];

	    for (var i = 0, ii = src.length; i < ii; i++) {
	      dst[i] = src[i];
	    }
	  } else if (isObject(src)) {
	    dst = dst || {};

	    for (var key in src) {
	      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
	        dst[key] = src[key];
	      }
	    }
	  }

	  return dst || src;
	}

	/* global shallowCopy: false */

	// `isArray` and `isObject` are necessary for `shallowCopy()` (included via `src/shallowCopy.js`).
	// They are initialized inside the `$RouteProvider`, to ensure `window.angular` is available.
	var isArray;
	var isObject;
	var isDefined;

	/**
	 * @ngdoc module
	 * @name ngRoute
	 * @description
	 *
	 * # ngRoute
	 *
	 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
	 *
	 * ## Example
	 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
	 *
	 *
	 * <div doc-module-components="ngRoute"></div>
	 */
	/* global -ngRouteModule */
	var ngRouteModule = angular.
	  module('ngRoute', []).
	  provider('$route', $RouteProvider).
	  // Ensure `$route` will be instantiated in time to capture the initial `$locationChangeSuccess`
	  // event (unless explicitly disabled). This is necessary in case `ngView` is included in an
	  // asynchronously loaded template.
	  run(instantiateRoute);
	var $routeMinErr = angular.$$minErr('ngRoute');
	var isEagerInstantiationEnabled;


	/**
	 * @ngdoc provider
	 * @name $routeProvider
	 * @this
	 *
	 * @description
	 *
	 * Used for configuring routes.
	 *
	 * ## Example
	 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
	 *
	 * ## Dependencies
	 * Requires the {@link ngRoute `ngRoute`} module to be installed.
	 */
	function $RouteProvider() {
	  isArray = angular.isArray;
	  isObject = angular.isObject;
	  isDefined = angular.isDefined;

	  function inherit(parent, extra) {
	    return angular.extend(Object.create(parent), extra);
	  }

	  var routes = {};

	  /**
	   * @ngdoc method
	   * @name $routeProvider#when
	   *
	   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
	   *    contains redundant trailing slash or is missing one, the route will still match and the
	   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
	   *    route definition.
	   *
	   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
	   *        to the next slash are matched and stored in `$routeParams` under the given `name`
	   *        when the route matches.
	   *    * `path` can contain named groups starting with a colon and ending with a star:
	   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
	   *        when the route matches.
	   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
	   *
	   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
	   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
	   *
	   *    * `color: brown`
	   *    * `largecode: code/with/slashes`.
	   *
	   *
	   * @param {Object} route Mapping information to be assigned to `$route.current` on route
	   *    match.
	   *
	   *    Object properties:
	   *
	   *    - `controller` – `{(string|Function)=}` – Controller fn that should be associated with
	   *      newly created scope or the name of a {@link angular.Module#controller registered
	   *      controller} if passed as a string.
	   *    - `controllerAs` – `{string=}` – An identifier name for a reference to the controller.
	   *      If present, the controller will be published to scope under the `controllerAs` name.
	   *    - `template` – `{(string|Function)=}` – html template as a string or a function that
	   *      returns an html template as a string which should be used by {@link
	   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
	   *      This property takes precedence over `templateUrl`.
	   *
	   *      If `template` is a function, it will be called with the following parameters:
	   *
	   *      - `{Array.<Object>}` - route parameters extracted from the current
	   *        `$location.path()` by applying the current route
	   *
	   *      One of `template` or `templateUrl` is required.
	   *
	   *    - `templateUrl` – `{(string|Function)=}` – path or function that returns a path to an html
	   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
	   *
	   *      If `templateUrl` is a function, it will be called with the following parameters:
	   *
	   *      - `{Array.<Object>}` - route parameters extracted from the current
	   *        `$location.path()` by applying the current route
	   *
	   *      One of `templateUrl` or `template` is required.
	   *
	   *    - `resolve` - `{Object.<string, Function>=}` - An optional map of dependencies which should
	   *      be injected into the controller. If any of these dependencies are promises, the router
	   *      will wait for them all to be resolved or one to be rejected before the controller is
	   *      instantiated.
	   *      If all the promises are resolved successfully, the values of the resolved promises are
	   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
	   *      fired. If any of the promises are rejected the
	   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired.
	   *      For easier access to the resolved dependencies from the template, the `resolve` map will
	   *      be available on the scope of the route, under `$resolve` (by default) or a custom name
	   *      specified by the `resolveAs` property (see below). This can be particularly useful, when
	   *      working with {@link angular.Module#component components} as route templates.<br />
	   *      <div class="alert alert-warning">
	   *        **Note:** If your scope already contains a property with this name, it will be hidden
	   *        or overwritten. Make sure, you specify an appropriate name for this property, that
	   *        does not collide with other properties on the scope.
	   *      </div>
	   *      The map object is:
	   *
	   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
	   *      - `factory` - `{string|Function}`: If `string` then it is an alias for a service.
	   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
	   *        and the return value is treated as the dependency. If the result is a promise, it is
	   *        resolved before its value is injected into the controller. Be aware that
	   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
	   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
	   *
	   *    - `resolveAs` - `{string=}` - The name under which the `resolve` map will be available on
	   *      the scope of the route. If omitted, defaults to `$resolve`.
	   *
	   *    - `redirectTo` – `{(string|Function)=}` – value to update
	   *      {@link ng.$location $location} path with and trigger route redirection.
	   *
	   *      If `redirectTo` is a function, it will be called with the following parameters:
	   *
	   *      - `{Object.<string>}` - route parameters extracted from the current
	   *        `$location.path()` by applying the current route templateUrl.
	   *      - `{string}` - current `$location.path()`
	   *      - `{Object}` - current `$location.search()`
	   *
	   *      The custom `redirectTo` function is expected to return a string which will be used
	   *      to update `$location.url()`. If the function throws an error, no further processing will
	   *      take place and the {@link ngRoute.$route#$routeChangeError $routeChangeError} event will
	   *      be fired.
	   *
	   *      Routes that specify `redirectTo` will not have their controllers, template functions
	   *      or resolves called, the `$location` will be changed to the redirect url and route
	   *      processing will stop. The exception to this is if the `redirectTo` is a function that
	   *      returns `undefined`. In this case the route transition occurs as though there was no
	   *      redirection.
	   *
	   *    - `resolveRedirectTo` – `{Function=}` – a function that will (eventually) return the value
	   *      to update {@link ng.$location $location} URL with and trigger route redirection. In
	   *      contrast to `redirectTo`, dependencies can be injected into `resolveRedirectTo` and the
	   *      return value can be either a string or a promise that will be resolved to a string.
	   *
	   *      Similar to `redirectTo`, if the return value is `undefined` (or a promise that gets
	   *      resolved to `undefined`), no redirection takes place and the route transition occurs as
	   *      though there was no redirection.
	   *
	   *      If the function throws an error or the returned promise gets rejected, no further
	   *      processing will take place and the
	   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event will be fired.
	   *
	   *      `redirectTo` takes precedence over `resolveRedirectTo`, so specifying both on the same
	   *      route definition, will cause the latter to be ignored.
	   *
	   *    - `[reloadOnSearch=true]` - `{boolean=}` - reload route when only `$location.search()`
	   *      or `$location.hash()` changes.
	   *
	   *      If the option is set to `false` and url in the browser changes, then
	   *      `$routeUpdate` event is broadcasted on the root scope.
	   *
	   *    - `[caseInsensitiveMatch=false]` - `{boolean=}` - match routes without being case sensitive
	   *
	   *      If the option is set to `true`, then the particular route can be matched without being
	   *      case sensitive
	   *
	   * @returns {Object} self
	   *
	   * @description
	   * Adds a new route definition to the `$route` service.
	   */
	  this.when = function(path, route) {
	    //copy original route object to preserve params inherited from proto chain
	    var routeCopy = shallowCopy(route);
	    if (angular.isUndefined(routeCopy.reloadOnSearch)) {
	      routeCopy.reloadOnSearch = true;
	    }
	    if (angular.isUndefined(routeCopy.caseInsensitiveMatch)) {
	      routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
	    }
	    routes[path] = angular.extend(
	      routeCopy,
	      path && pathRegExp(path, routeCopy)
	    );

	    // create redirection for trailing slashes
	    if (path) {
	      var redirectPath = (path[path.length - 1] === '/')
	            ? path.substr(0, path.length - 1)
	            : path + '/';

	      routes[redirectPath] = angular.extend(
	        {redirectTo: path},
	        pathRegExp(redirectPath, routeCopy)
	      );
	    }

	    return this;
	  };

	  /**
	   * @ngdoc property
	   * @name $routeProvider#caseInsensitiveMatch
	   * @description
	   *
	   * A boolean property indicating if routes defined
	   * using this provider should be matched using a case insensitive
	   * algorithm. Defaults to `false`.
	   */
	  this.caseInsensitiveMatch = false;

	   /**
	    * @param path {string} path
	    * @param opts {Object} options
	    * @return {?Object}
	    *
	    * @description
	    * Normalizes the given path, returning a regular expression
	    * and the original path.
	    *
	    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
	    */
	  function pathRegExp(path, opts) {
	    var insensitive = opts.caseInsensitiveMatch,
	        ret = {
	          originalPath: path,
	          regexp: path
	        },
	        keys = ret.keys = [];

	    path = path
	      .replace(/([().])/g, '\\$1')
	      .replace(/(\/)?:(\w+)(\*\?|[?*])?/g, function(_, slash, key, option) {
	        var optional = (option === '?' || option === '*?') ? '?' : null;
	        var star = (option === '*' || option === '*?') ? '*' : null;
	        keys.push({ name: key, optional: !!optional });
	        slash = slash || '';
	        return ''
	          + (optional ? '' : slash)
	          + '(?:'
	          + (optional ? slash : '')
	          + (star && '(.+?)' || '([^/]+)')
	          + (optional || '')
	          + ')'
	          + (optional || '');
	      })
	      .replace(/([/$*])/g, '\\$1');

	    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
	    return ret;
	  }

	  /**
	   * @ngdoc method
	   * @name $routeProvider#otherwise
	   *
	   * @description
	   * Sets route definition that will be used on route change when no other route definition
	   * is matched.
	   *
	   * @param {Object|string} params Mapping information to be assigned to `$route.current`.
	   * If called with a string, the value maps to `redirectTo`.
	   * @returns {Object} self
	   */
	  this.otherwise = function(params) {
	    if (typeof params === 'string') {
	      params = {redirectTo: params};
	    }
	    this.when(null, params);
	    return this;
	  };

	  /**
	   * @ngdoc method
	   * @name $routeProvider#eagerInstantiationEnabled
	   * @kind function
	   *
	   * @description
	   * Call this method as a setter to enable/disable eager instantiation of the
	   * {@link ngRoute.$route $route} service upon application bootstrap. You can also call it as a
	   * getter (i.e. without any arguments) to get the current value of the
	   * `eagerInstantiationEnabled` flag.
	   *
	   * Instantiating `$route` early is necessary for capturing the initial
	   * {@link ng.$location#$locationChangeStart $locationChangeStart} event and navigating to the
	   * appropriate route. Usually, `$route` is instantiated in time by the
	   * {@link ngRoute.ngView ngView} directive. Yet, in cases where `ngView` is included in an
	   * asynchronously loaded template (e.g. in another directive's template), the directive factory
	   * might not be called soon enough for `$route` to be instantiated _before_ the initial
	   * `$locationChangeSuccess` event is fired. Eager instantiation ensures that `$route` is always
	   * instantiated in time, regardless of when `ngView` will be loaded.
	   *
	   * The default value is true.
	   *
	   * **Note**:<br />
	   * You may want to disable the default behavior when unit-testing modules that depend on
	   * `ngRoute`, in order to avoid an unexpected request for the default route's template.
	   *
	   * @param {boolean=} enabled - If provided, update the internal `eagerInstantiationEnabled` flag.
	   *
	   * @returns {*} The current value of the `eagerInstantiationEnabled` flag if used as a getter or
	   *     itself (for chaining) if used as a setter.
	   */
	  isEagerInstantiationEnabled = true;
	  this.eagerInstantiationEnabled = function eagerInstantiationEnabled(enabled) {
	    if (isDefined(enabled)) {
	      isEagerInstantiationEnabled = enabled;
	      return this;
	    }

	    return isEagerInstantiationEnabled;
	  };


	  this.$get = ['$rootScope',
	               '$location',
	               '$routeParams',
	               '$q',
	               '$injector',
	               '$templateRequest',
	               '$sce',
	      function($rootScope, $location, $routeParams, $q, $injector, $templateRequest, $sce) {

	    /**
	     * @ngdoc service
	     * @name $route
	     * @requires $location
	     * @requires $routeParams
	     *
	     * @property {Object} current Reference to the current route definition.
	     * The route definition contains:
	     *
	     *   - `controller`: The controller constructor as defined in the route definition.
	     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
	     *     controller instantiation. The `locals` contain
	     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
	     *
	     *     - `$scope` - The current route scope.
	     *     - `$template` - The current route template HTML.
	     *
	     *     The `locals` will be assigned to the route scope's `$resolve` property. You can override
	     *     the property name, using `resolveAs` in the route definition. See
	     *     {@link ngRoute.$routeProvider $routeProvider} for more info.
	     *
	     * @property {Object} routes Object with all route configuration Objects as its properties.
	     *
	     * @description
	     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
	     * It watches `$location.url()` and tries to map the path to an existing route definition.
	     *
	     * Requires the {@link ngRoute `ngRoute`} module to be installed.
	     *
	     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
	     *
	     * The `$route` service is typically used in conjunction with the
	     * {@link ngRoute.directive:ngView `ngView`} directive and the
	     * {@link ngRoute.$routeParams `$routeParams`} service.
	     *
	     * @example
	     * This example shows how changing the URL hash causes the `$route` to match a route against the
	     * URL, and the `ngView` pulls in the partial.
	     *
	     * <example name="$route-service" module="ngRouteExample"
	     *          deps="angular-route.js" fixBase="true">
	     *   <file name="index.html">
	     *     <div ng-controller="MainController">
	     *       Choose:
	     *       <a href="Book/Moby">Moby</a> |
	     *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
	     *       <a href="Book/Gatsby">Gatsby</a> |
	     *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
	     *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
	     *
	     *       <div ng-view></div>
	     *
	     *       <hr />
	     *
	     *       <pre>$location.path() = {{$location.path()}}</pre>
	     *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
	     *       <pre>$route.current.params = {{$route.current.params}}</pre>
	     *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
	     *       <pre>$routeParams = {{$routeParams}}</pre>
	     *     </div>
	     *   </file>
	     *
	     *   <file name="book.html">
	     *     controller: {{name}}<br />
	     *     Book Id: {{params.bookId}}<br />
	     *   </file>
	     *
	     *   <file name="chapter.html">
	     *     controller: {{name}}<br />
	     *     Book Id: {{params.bookId}}<br />
	     *     Chapter Id: {{params.chapterId}}
	     *   </file>
	     *
	     *   <file name="script.js">
	     *     angular.module('ngRouteExample', ['ngRoute'])
	     *
	     *      .controller('MainController', function($scope, $route, $routeParams, $location) {
	     *          $scope.$route = $route;
	     *          $scope.$location = $location;
	     *          $scope.$routeParams = $routeParams;
	     *      })
	     *
	     *      .controller('BookController', function($scope, $routeParams) {
	     *          $scope.name = 'BookController';
	     *          $scope.params = $routeParams;
	     *      })
	     *
	     *      .controller('ChapterController', function($scope, $routeParams) {
	     *          $scope.name = 'ChapterController';
	     *          $scope.params = $routeParams;
	     *      })
	     *
	     *     .config(function($routeProvider, $locationProvider) {
	     *       $routeProvider
	     *        .when('/Book/:bookId', {
	     *         templateUrl: 'book.html',
	     *         controller: 'BookController',
	     *         resolve: {
	     *           // I will cause a 1 second delay
	     *           delay: function($q, $timeout) {
	     *             var delay = $q.defer();
	     *             $timeout(delay.resolve, 1000);
	     *             return delay.promise;
	     *           }
	     *         }
	     *       })
	     *       .when('/Book/:bookId/ch/:chapterId', {
	     *         templateUrl: 'chapter.html',
	     *         controller: 'ChapterController'
	     *       });
	     *
	     *       // configure html5 to get links working on jsfiddle
	     *       $locationProvider.html5Mode(true);
	     *     });
	     *
	     *   </file>
	     *
	     *   <file name="protractor.js" type="protractor">
	     *     it('should load and compile correct template', function() {
	     *       element(by.linkText('Moby: Ch1')).click();
	     *       var content = element(by.css('[ng-view]')).getText();
	     *       expect(content).toMatch(/controller: ChapterController/);
	     *       expect(content).toMatch(/Book Id: Moby/);
	     *       expect(content).toMatch(/Chapter Id: 1/);
	     *
	     *       element(by.partialLinkText('Scarlet')).click();
	     *
	     *       content = element(by.css('[ng-view]')).getText();
	     *       expect(content).toMatch(/controller: BookController/);
	     *       expect(content).toMatch(/Book Id: Scarlet/);
	     *     });
	     *   </file>
	     * </example>
	     */

	    /**
	     * @ngdoc event
	     * @name $route#$routeChangeStart
	     * @eventType broadcast on root scope
	     * @description
	     * Broadcasted before a route change. At this  point the route services starts
	     * resolving all of the dependencies needed for the route change to occur.
	     * Typically this involves fetching the view template as well as any dependencies
	     * defined in `resolve` route property. Once  all of the dependencies are resolved
	     * `$routeChangeSuccess` is fired.
	     *
	     * The route change (and the `$location` change that triggered it) can be prevented
	     * by calling `preventDefault` method of the event. See {@link ng.$rootScope.Scope#$on}
	     * for more details about event object.
	     *
	     * @param {Object} angularEvent Synthetic event object.
	     * @param {Route} next Future route information.
	     * @param {Route} current Current route information.
	     */

	    /**
	     * @ngdoc event
	     * @name $route#$routeChangeSuccess
	     * @eventType broadcast on root scope
	     * @description
	     * Broadcasted after a route change has happened successfully.
	     * The `resolve` dependencies are now available in the `current.locals` property.
	     *
	     * {@link ngRoute.directive:ngView ngView} listens for the directive
	     * to instantiate the controller and render the view.
	     *
	     * @param {Object} angularEvent Synthetic event object.
	     * @param {Route} current Current route information.
	     * @param {Route|Undefined} previous Previous route information, or undefined if current is
	     * first route entered.
	     */

	    /**
	     * @ngdoc event
	     * @name $route#$routeChangeError
	     * @eventType broadcast on root scope
	     * @description
	     * Broadcasted if a redirection function fails or any redirection or resolve promises are
	     * rejected.
	     *
	     * @param {Object} angularEvent Synthetic event object
	     * @param {Route} current Current route information.
	     * @param {Route} previous Previous route information.
	     * @param {Route} rejection The thrown error or the rejection reason of the promise. Usually
	     * the rejection reason is the error that caused the promise to get rejected.
	     */

	    /**
	     * @ngdoc event
	     * @name $route#$routeUpdate
	     * @eventType broadcast on root scope
	     * @description
	     * The `reloadOnSearch` property has been set to false, and we are reusing the same
	     * instance of the Controller.
	     *
	     * @param {Object} angularEvent Synthetic event object
	     * @param {Route} current Current/previous route information.
	     */

	    var forceReload = false,
	        preparedRoute,
	        preparedRouteIsUpdateOnly,
	        $route = {
	          routes: routes,

	          /**
	           * @ngdoc method
	           * @name $route#reload
	           *
	           * @description
	           * Causes `$route` service to reload the current route even if
	           * {@link ng.$location $location} hasn't changed.
	           *
	           * As a result of that, {@link ngRoute.directive:ngView ngView}
	           * creates new scope and reinstantiates the controller.
	           */
	          reload: function() {
	            forceReload = true;

	            var fakeLocationEvent = {
	              defaultPrevented: false,
	              preventDefault: function fakePreventDefault() {
	                this.defaultPrevented = true;
	                forceReload = false;
	              }
	            };

	            $rootScope.$evalAsync(function() {
	              prepareRoute(fakeLocationEvent);
	              if (!fakeLocationEvent.defaultPrevented) commitRoute();
	            });
	          },

	          /**
	           * @ngdoc method
	           * @name $route#updateParams
	           *
	           * @description
	           * Causes `$route` service to update the current URL, replacing
	           * current route parameters with those specified in `newParams`.
	           * Provided property names that match the route's path segment
	           * definitions will be interpolated into the location's path, while
	           * remaining properties will be treated as query params.
	           *
	           * @param {!Object<string, string>} newParams mapping of URL parameter names to values
	           */
	          updateParams: function(newParams) {
	            if (this.current && this.current.$$route) {
	              newParams = angular.extend({}, this.current.params, newParams);
	              $location.path(interpolate(this.current.$$route.originalPath, newParams));
	              // interpolate modifies newParams, only query params are left
	              $location.search(newParams);
	            } else {
	              throw $routeMinErr('norout', 'Tried updating route when with no current route');
	            }
	          }
	        };

	    $rootScope.$on('$locationChangeStart', prepareRoute);
	    $rootScope.$on('$locationChangeSuccess', commitRoute);

	    return $route;

	    /////////////////////////////////////////////////////

	    /**
	     * @param on {string} current url
	     * @param route {Object} route regexp to match the url against
	     * @return {?Object}
	     *
	     * @description
	     * Check if the route matches the current url.
	     *
	     * Inspired by match in
	     * visionmedia/express/lib/router/router.js.
	     */
	    function switchRouteMatcher(on, route) {
	      var keys = route.keys,
	          params = {};

	      if (!route.regexp) return null;

	      var m = route.regexp.exec(on);
	      if (!m) return null;

	      for (var i = 1, len = m.length; i < len; ++i) {
	        var key = keys[i - 1];

	        var val = m[i];

	        if (key && val) {
	          params[key.name] = val;
	        }
	      }
	      return params;
	    }

	    function prepareRoute($locationEvent) {
	      var lastRoute = $route.current;

	      preparedRoute = parseRoute();
	      preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route
	          && angular.equals(preparedRoute.pathParams, lastRoute.pathParams)
	          && !preparedRoute.reloadOnSearch && !forceReload;

	      if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
	        if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
	          if ($locationEvent) {
	            $locationEvent.preventDefault();
	          }
	        }
	      }
	    }

	    function commitRoute() {
	      var lastRoute = $route.current;
	      var nextRoute = preparedRoute;

	      if (preparedRouteIsUpdateOnly) {
	        lastRoute.params = nextRoute.params;
	        angular.copy(lastRoute.params, $routeParams);
	        $rootScope.$broadcast('$routeUpdate', lastRoute);
	      } else if (nextRoute || lastRoute) {
	        forceReload = false;
	        $route.current = nextRoute;

	        var nextRoutePromise = $q.resolve(nextRoute);

	        nextRoutePromise.
	          then(getRedirectionData).
	          then(handlePossibleRedirection).
	          then(function(keepProcessingRoute) {
	            return keepProcessingRoute && nextRoutePromise.
	              then(resolveLocals).
	              then(function(locals) {
	                // after route change
	                if (nextRoute === $route.current) {
	                  if (nextRoute) {
	                    nextRoute.locals = locals;
	                    angular.copy(nextRoute.params, $routeParams);
	                  }
	                  $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
	                }
	              });
	          }).catch(function(error) {
	            if (nextRoute === $route.current) {
	              $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
	            }
	          });
	      }
	    }

	    function getRedirectionData(route) {
	      var data = {
	        route: route,
	        hasRedirection: false
	      };

	      if (route) {
	        if (route.redirectTo) {
	          if (angular.isString(route.redirectTo)) {
	            data.path = interpolate(route.redirectTo, route.params);
	            data.search = route.params;
	            data.hasRedirection = true;
	          } else {
	            var oldPath = $location.path();
	            var oldSearch = $location.search();
	            var newUrl = route.redirectTo(route.pathParams, oldPath, oldSearch);

	            if (angular.isDefined(newUrl)) {
	              data.url = newUrl;
	              data.hasRedirection = true;
	            }
	          }
	        } else if (route.resolveRedirectTo) {
	          return $q.
	            resolve($injector.invoke(route.resolveRedirectTo)).
	            then(function(newUrl) {
	              if (angular.isDefined(newUrl)) {
	                data.url = newUrl;
	                data.hasRedirection = true;
	              }

	              return data;
	            });
	        }
	      }

	      return data;
	    }

	    function handlePossibleRedirection(data) {
	      var keepProcessingRoute = true;

	      if (data.route !== $route.current) {
	        keepProcessingRoute = false;
	      } else if (data.hasRedirection) {
	        var oldUrl = $location.url();
	        var newUrl = data.url;

	        if (newUrl) {
	          $location.
	            url(newUrl).
	            replace();
	        } else {
	          newUrl = $location.
	            path(data.path).
	            search(data.search).
	            replace().
	            url();
	        }

	        if (newUrl !== oldUrl) {
	          // Exit out and don't process current next value,
	          // wait for next location change from redirect
	          keepProcessingRoute = false;
	        }
	      }

	      return keepProcessingRoute;
	    }

	    function resolveLocals(route) {
	      if (route) {
	        var locals = angular.extend({}, route.resolve);
	        angular.forEach(locals, function(value, key) {
	          locals[key] = angular.isString(value) ?
	              $injector.get(value) :
	              $injector.invoke(value, null, null, key);
	        });
	        var template = getTemplateFor(route);
	        if (angular.isDefined(template)) {
	          locals['$template'] = template;
	        }
	        return $q.all(locals);
	      }
	    }

	    function getTemplateFor(route) {
	      var template, templateUrl;
	      if (angular.isDefined(template = route.template)) {
	        if (angular.isFunction(template)) {
	          template = template(route.params);
	        }
	      } else if (angular.isDefined(templateUrl = route.templateUrl)) {
	        if (angular.isFunction(templateUrl)) {
	          templateUrl = templateUrl(route.params);
	        }
	        if (angular.isDefined(templateUrl)) {
	          route.loadedTemplateUrl = $sce.valueOf(templateUrl);
	          template = $templateRequest(templateUrl);
	        }
	      }
	      return template;
	    }

	    /**
	     * @returns {Object} the current active route, by matching it against the URL
	     */
	    function parseRoute() {
	      // Match a route
	      var params, match;
	      angular.forEach(routes, function(route, path) {
	        if (!match && (params = switchRouteMatcher($location.path(), route))) {
	          match = inherit(route, {
	            params: angular.extend({}, $location.search(), params),
	            pathParams: params});
	          match.$$route = route;
	        }
	      });
	      // No route matched; fallback to "otherwise" route
	      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
	    }

	    /**
	     * @returns {string} interpolation of the redirect path with the parameters
	     */
	    function interpolate(string, params) {
	      var result = [];
	      angular.forEach((string || '').split(':'), function(segment, i) {
	        if (i === 0) {
	          result.push(segment);
	        } else {
	          var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
	          var key = segmentMatch[1];
	          result.push(params[key]);
	          result.push(segmentMatch[2] || '');
	          delete params[key];
	        }
	      });
	      return result.join('');
	    }
	  }];
	}

	instantiateRoute.$inject = ['$injector'];
	function instantiateRoute($injector) {
	  if (isEagerInstantiationEnabled) {
	    // Instantiate `$route`
	    $injector.get('$route');
	  }
	}

	ngRouteModule.provider('$routeParams', $RouteParamsProvider);


	/**
	 * @ngdoc service
	 * @name $routeParams
	 * @requires $route
	 * @this
	 *
	 * @description
	 * The `$routeParams` service allows you to retrieve the current set of route parameters.
	 *
	 * Requires the {@link ngRoute `ngRoute`} module to be installed.
	 *
	 * The route parameters are a combination of {@link ng.$location `$location`}'s
	 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
	 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
	 *
	 * In case of parameter name collision, `path` params take precedence over `search` params.
	 *
	 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
	 * (but its properties will likely change) even when a route change occurs.
	 *
	 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
	 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
	 * Instead you can use `$route.current.params` to access the new route's parameters.
	 *
	 * @example
	 * ```js
	 *  // Given:
	 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
	 *  // Route: /Chapter/:chapterId/Section/:sectionId
	 *  //
	 *  // Then
	 *  $routeParams ==> {chapterId:'1', sectionId:'2', search:'moby'}
	 * ```
	 */
	function $RouteParamsProvider() {
	  this.$get = function() { return {}; };
	}

	ngRouteModule.directive('ngView', ngViewFactory);
	ngRouteModule.directive('ngView', ngViewFillContentFactory);


	/**
	 * @ngdoc directive
	 * @name ngView
	 * @restrict ECA
	 *
	 * @description
	 * # Overview
	 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
	 * including the rendered template of the current route into the main layout (`index.html`) file.
	 * Every time the current route changes, the included view changes with it according to the
	 * configuration of the `$route` service.
	 *
	 * Requires the {@link ngRoute `ngRoute`} module to be installed.
	 *
	 * @animations
	 * | Animation                        | Occurs                              |
	 * |----------------------------------|-------------------------------------|
	 * | {@link ng.$animate#enter enter}  | when the new element is inserted to the DOM |
	 * | {@link ng.$animate#leave leave}  | when the old element is removed from to the DOM  |
	 *
	 * The enter and leave animation occur concurrently.
	 *
	 * @scope
	 * @priority 400
	 * @param {string=} onload Expression to evaluate whenever the view updates.
	 *
	 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
	 *                  $anchorScroll} to scroll the viewport after the view is updated.
	 *
	 *                  - If the attribute is not set, disable scrolling.
	 *                  - If the attribute is set without value, enable scrolling.
	 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
	 *                    as an expression yields a truthy value.
	 * @example
	    <example name="ngView-directive" module="ngViewExample"
	             deps="angular-route.js;angular-animate.js"
	             animations="true" fixBase="true">
	      <file name="index.html">
	        <div ng-controller="MainCtrl as main">
	          Choose:
	          <a href="Book/Moby">Moby</a> |
	          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
	          <a href="Book/Gatsby">Gatsby</a> |
	          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
	          <a href="Book/Scarlet">Scarlet Letter</a><br/>

	          <div class="view-animate-container">
	            <div ng-view class="view-animate"></div>
	          </div>
	          <hr />

	          <pre>$location.path() = {{main.$location.path()}}</pre>
	          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
	          <pre>$route.current.params = {{main.$route.current.params}}</pre>
	          <pre>$routeParams = {{main.$routeParams}}</pre>
	        </div>
	      </file>

	      <file name="book.html">
	        <div>
	          controller: {{book.name}}<br />
	          Book Id: {{book.params.bookId}}<br />
	        </div>
	      </file>

	      <file name="chapter.html">
	        <div>
	          controller: {{chapter.name}}<br />
	          Book Id: {{chapter.params.bookId}}<br />
	          Chapter Id: {{chapter.params.chapterId}}
	        </div>
	      </file>

	      <file name="animations.css">
	        .view-animate-container {
	          position:relative;
	          height:100px!important;
	          background:white;
	          border:1px solid black;
	          height:40px;
	          overflow:hidden;
	        }

	        .view-animate {
	          padding:10px;
	        }

	        .view-animate.ng-enter, .view-animate.ng-leave {
	          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

	          display:block;
	          width:100%;
	          border-left:1px solid black;

	          position:absolute;
	          top:0;
	          left:0;
	          right:0;
	          bottom:0;
	          padding:10px;
	        }

	        .view-animate.ng-enter {
	          left:100%;
	        }
	        .view-animate.ng-enter.ng-enter-active {
	          left:0;
	        }
	        .view-animate.ng-leave.ng-leave-active {
	          left:-100%;
	        }
	      </file>

	      <file name="script.js">
	        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
	          .config(['$routeProvider', '$locationProvider',
	            function($routeProvider, $locationProvider) {
	              $routeProvider
	                .when('/Book/:bookId', {
	                  templateUrl: 'book.html',
	                  controller: 'BookCtrl',
	                  controllerAs: 'book'
	                })
	                .when('/Book/:bookId/ch/:chapterId', {
	                  templateUrl: 'chapter.html',
	                  controller: 'ChapterCtrl',
	                  controllerAs: 'chapter'
	                });

	              $locationProvider.html5Mode(true);
	          }])
	          .controller('MainCtrl', ['$route', '$routeParams', '$location',
	            function MainCtrl($route, $routeParams, $location) {
	              this.$route = $route;
	              this.$location = $location;
	              this.$routeParams = $routeParams;
	          }])
	          .controller('BookCtrl', ['$routeParams', function BookCtrl($routeParams) {
	            this.name = 'BookCtrl';
	            this.params = $routeParams;
	          }])
	          .controller('ChapterCtrl', ['$routeParams', function ChapterCtrl($routeParams) {
	            this.name = 'ChapterCtrl';
	            this.params = $routeParams;
	          }]);

	      </file>

	      <file name="protractor.js" type="protractor">
	        it('should load and compile correct template', function() {
	          element(by.linkText('Moby: Ch1')).click();
	          var content = element(by.css('[ng-view]')).getText();
	          expect(content).toMatch(/controller: ChapterCtrl/);
	          expect(content).toMatch(/Book Id: Moby/);
	          expect(content).toMatch(/Chapter Id: 1/);

	          element(by.partialLinkText('Scarlet')).click();

	          content = element(by.css('[ng-view]')).getText();
	          expect(content).toMatch(/controller: BookCtrl/);
	          expect(content).toMatch(/Book Id: Scarlet/);
	        });
	      </file>
	    </example>
	 */


	/**
	 * @ngdoc event
	 * @name ngView#$viewContentLoaded
	 * @eventType emit on the current ngView scope
	 * @description
	 * Emitted every time the ngView content is reloaded.
	 */
	ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
	function ngViewFactory($route, $anchorScroll, $animate) {
	  return {
	    restrict: 'ECA',
	    terminal: true,
	    priority: 400,
	    transclude: 'element',
	    link: function(scope, $element, attr, ctrl, $transclude) {
	        var currentScope,
	            currentElement,
	            previousLeaveAnimation,
	            autoScrollExp = attr.autoscroll,
	            onloadExp = attr.onload || '';

	        scope.$on('$routeChangeSuccess', update);
	        update();

	        function cleanupLastView() {
	          if (previousLeaveAnimation) {
	            $animate.cancel(previousLeaveAnimation);
	            previousLeaveAnimation = null;
	          }

	          if (currentScope) {
	            currentScope.$destroy();
	            currentScope = null;
	          }
	          if (currentElement) {
	            previousLeaveAnimation = $animate.leave(currentElement);
	            previousLeaveAnimation.done(function(response) {
	              if (response !== false) previousLeaveAnimation = null;
	            });
	            currentElement = null;
	          }
	        }

	        function update() {
	          var locals = $route.current && $route.current.locals,
	              template = locals && locals.$template;

	          if (angular.isDefined(template)) {
	            var newScope = scope.$new();
	            var current = $route.current;

	            // Note: This will also link all children of ng-view that were contained in the original
	            // html. If that content contains controllers, ... they could pollute/change the scope.
	            // However, using ng-view on an element with additional content does not make sense...
	            // Note: We can't remove them in the cloneAttchFn of $transclude as that
	            // function is called before linking the content, which would apply child
	            // directives to non existing elements.
	            var clone = $transclude(newScope, function(clone) {
	              $animate.enter(clone, null, currentElement || $element).done(function onNgViewEnter(response) {
	                if (response !== false && angular.isDefined(autoScrollExp)
	                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
	                  $anchorScroll();
	                }
	              });
	              cleanupLastView();
	            });

	            currentElement = clone;
	            currentScope = current.scope = newScope;
	            currentScope.$emit('$viewContentLoaded');
	            currentScope.$eval(onloadExp);
	          } else {
	            cleanupLastView();
	          }
	        }
	    }
	  };
	}

	// This directive is called during the $transclude call of the first `ngView` directive.
	// It will replace and compile the content of the element with the loaded template.
	// We need this directive so that the element content is already filled when
	// the link function of another directive on the same element as ngView
	// is called.
	ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
	function ngViewFillContentFactory($compile, $controller, $route) {
	  return {
	    restrict: 'ECA',
	    priority: -400,
	    link: function(scope, $element) {
	      var current = $route.current,
	          locals = current.locals;

	      $element.html(locals.$template);

	      var link = $compile($element.contents());

	      if (current.controller) {
	        locals.$scope = scope;
	        var controller = $controller(current.controller, locals);
	        if (current.controllerAs) {
	          scope[current.controllerAs] = controller;
	        }
	        $element.data('$ngControllerController', controller);
	        $element.children().data('$ngControllerController', controller);
	      }
	      scope[current.resolveAs || '$resolve'] = locals;

	      link(scope);
	    }
	  };
	}


	})(window, window.angular);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	(function(root, factory) {
	if (true) {
	module.exports = factory(__webpack_require__(4));
	} else if (typeof define === "function" && define.amd) {
	define(['angular'], factory);
	} else{
	factory(root.angular);
	}
	}(this, function(angular) {
	/**
	 * AngularJS Google Maps Ver. 1.17.7
	 *
	 * The MIT License (MIT)
	 * 
	 * Copyright (c) 2014, 2015, 1016 Allen Kim
	 * 
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of
	 * this software and associated documentation files (the "Software"), to deal in
	 * the Software without restriction, including without limitation the rights to
	 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	 * the Software, and to permit persons to whom the Software is furnished to do so,
	 * subject to the following conditions:
	 * 
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 * 
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	 */
	angular.module('ngMap', []);

	/**
	 * @ngdoc controller
	 * @name MapController
	 */
	(function() {
	  'use strict';
	  var Attr2MapOptions;

	  var __MapController = function(
	      $scope, $element, $attrs, $parse, _Attr2MapOptions_, NgMap, NgMapPool
	    ) {
	    Attr2MapOptions = _Attr2MapOptions_;
	    var vm = this;

	    vm.mapOptions; /** @memberof __MapController */
	    vm.mapEvents;  /** @memberof __MapController */
	    vm.eventListeners;  /** @memberof __MapController */

	    /**
	     * Add an object to the collection of group
	     * @memberof __MapController
	     * @function addObject
	     * @param groupName the name of collection that object belongs to
	     * @param obj  an object to add into a collection, i.e. marker, shape
	     */
	    vm.addObject = function(groupName, obj) {
	      if (vm.map) {
	        vm.map[groupName] = vm.map[groupName] || {};
	        var len = Object.keys(vm.map[groupName]).length;
	        vm.map[groupName][obj.id || len] = obj;

	        if (vm.map instanceof google.maps.Map) {
	          //infoWindow.setMap works like infoWindow.open
	          if (groupName != "infoWindows" && obj.setMap) {
	            obj.setMap && obj.setMap(vm.map);
	          }
	          if (obj.centered && obj.position) {
	            vm.map.setCenter(obj.position);
	          }
	          (groupName == 'markers') && vm.objectChanged('markers');
	          (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
	        }
	      }
	    };

	    /**
	     * Delete an object from the collection and remove from map
	     * @memberof __MapController
	     * @function deleteObject
	     * @param {Array} objs the collection of objects. i.e., map.markers
	     * @param {Object} obj the object to be removed. i.e., marker
	     */
	    vm.deleteObject = function(groupName, obj) {
	      /* delete from group */
	      if (obj.map) {
	        var objs = obj.map[groupName];
	        for (var name in objs) {
	          if (objs[name] === obj) {
	            void 0;
	            google.maps.event.clearInstanceListeners(obj);
	            delete objs[name];
	          }
	        }

	        /* delete from map */
	        obj.map && obj.setMap && obj.setMap(null);

	        (groupName == 'markers') && vm.objectChanged('markers');
	        (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
	      }
	    };

	    /**
	     * @memberof __MapController
	     * @function observeAttrSetObj
	     * @param {Hash} orgAttrs attributes before its initialization
	     * @param {Hash} attrs    attributes after its initialization
	     * @param {Object} obj    map object that an action is to be done
	     * @description watch changes of attribute values and
	     * do appropriate action based on attribute name
	     */
	    vm.observeAttrSetObj = function(orgAttrs, attrs, obj) {
	      if (attrs.noWatcher) {
	        return false;
	      }
	      var attrsToObserve = Attr2MapOptions.getAttrsToObserve(orgAttrs);
	      for (var i=0; i<attrsToObserve.length; i++) {
	        var attrName = attrsToObserve[i];
	        attrs.$observe(attrName, NgMap.observeAndSet(attrName, obj));
	      }
	    };

	    /**
	     * @memberof __MapController
	     * @function zoomToIncludeMarkers
	     */
	    vm.zoomToIncludeMarkers = function() {
	      // Only fit to bounds if we have any markers
	      // object.keys is supported in all major browsers (IE9+)
	      if ((vm.map.markers != null && Object.keys(vm.map.markers).length > 0) || (vm.map.customMarkers != null && Object.keys(vm.map.customMarkers).length > 0)) {
	        var bounds = new google.maps.LatLngBounds();
	        for (var k1 in vm.map.markers) {
	          bounds.extend(vm.map.markers[k1].getPosition());
	        }
	        for (var k2 in vm.map.customMarkers) {
	          bounds.extend(vm.map.customMarkers[k2].getPosition());
	        }
	    	  if (vm.mapOptions.maximumZoom) {
	    		  vm.enableMaximumZoomCheck = true; //enable zoom check after resizing for markers
	    	  }
	        vm.map.fitBounds(bounds);
	      }
	    };

	    /**
	     * @memberof __MapController
	     * @function objectChanged
	     * @param {String} group name of group e.g., markers
	     */
	    vm.objectChanged = function(group) {
	      if ( vm.map &&
	        (group == 'markers' || group == 'customMarkers') &&
	        vm.map.zoomToIncludeMarkers == 'auto'
	      ) {
	        vm.zoomToIncludeMarkers();
	      }
	    };

	    /**
	     * @memberof __MapController
	     * @function initializeMap
	     * @description
	     *  . initialize Google map on <div> tag
	     *  . set map options, events, and observers
	     *  . reset zoom to include all (custom)markers
	     */
	    vm.initializeMap = function() {
	      var mapOptions = vm.mapOptions,
	          mapEvents = vm.mapEvents;

	      var lazyInitMap = vm.map; //prepared for lazy init
	      vm.map = NgMapPool.getMapInstance($element[0]);
	      NgMap.setStyle($element[0]);

	      // set objects for lazyInit
	      if (lazyInitMap) {

	        /**
	         * rebuild mapOptions for lazyInit
	         * because attributes values might have been changed
	         */
	        var filtered = Attr2MapOptions.filter($attrs);
	        var options = Attr2MapOptions.getOptions(filtered);
	        var controlOptions = Attr2MapOptions.getControlOptions(filtered);
	        mapOptions = angular.extend(options, controlOptions);
	        void 0;

	        for (var group in lazyInitMap) {
	          var groupMembers = lazyInitMap[group]; //e.g. markers
	          if (typeof groupMembers == 'object') {
	            for (var id in groupMembers) {
	              vm.addObject(group, groupMembers[id]);
	            }
	          }
	        }
	        vm.map.showInfoWindow = vm.showInfoWindow;
	        vm.map.hideInfoWindow = vm.hideInfoWindow;
	      }

	      // set options
	      mapOptions.zoom = mapOptions.zoom || 15;
	      var center = mapOptions.center;
	      if (!mapOptions.center ||
	        ((typeof center === 'string') && center.match(/\{\{.*\}\}/))
	      ) {
	        mapOptions.center = new google.maps.LatLng(0, 0);
	      } else if( (typeof center === 'string') && center.match(/[0-9.-]*,[0-9.-]*/) ){
	           mapOptions.center = new google.maps.LatLng(center);
	      } else if (!(center instanceof google.maps.LatLng)) {
	        var geoCenter = mapOptions.center;
	        delete mapOptions.center;
	        NgMap.getGeoLocation(geoCenter, mapOptions.geoLocationOptions).
	          then(function (latlng) {
	            vm.map.setCenter(latlng);
	            var geoCallback = mapOptions.geoCallback;
	            geoCallback && $parse(geoCallback)($scope);
	          }, function () {
	            if (mapOptions.geoFallbackCenter) {
	              vm.map.setCenter(mapOptions.geoFallbackCenter);
	            }
	          });
	      }
	      vm.map.setOptions(mapOptions);

	      // set events
	      for (var eventName in mapEvents) {
	        var event = mapEvents[eventName];
	        var listener = google.maps.event.addListener(vm.map, eventName, event);
	        vm.eventListeners[eventName] = listener;
	      }

	      // set observers
	      vm.observeAttrSetObj(orgAttrs, $attrs, vm.map);
	      vm.singleInfoWindow = mapOptions.singleInfoWindow;

	      google.maps.event.trigger(vm.map, 'resize');

	      google.maps.event.addListenerOnce(vm.map, "idle", function () {
	        NgMap.addMap(vm);
	        if (mapOptions.zoomToIncludeMarkers) {
	          vm.zoomToIncludeMarkers();
	        }
	        //TODO: it's for backward compatibiliy. will be removed
	        $scope.map = vm.map;
	        $scope.$emit('mapInitialized', vm.map);

	        //callback
	        if ($attrs.mapInitialized) {
	          $parse($attrs.mapInitialized)($scope, {map: vm.map});
	        }
	      });
		  
		  //add maximum zoom listeners if zoom-to-include-markers and and maximum-zoom are valid attributes
		  if (mapOptions.zoomToIncludeMarkers && mapOptions.maximumZoom) {
		    google.maps.event.addListener(vm.map, 'zoom_changed', function() {
	          if (vm.enableMaximumZoomCheck == true) {
				vm.enableMaximumZoomCheck = false;
		        google.maps.event.addListenerOnce(vm.map, 'bounds_changed', function() { 
			      vm.map.setZoom(Math.min(mapOptions.maximumZoom, vm.map.getZoom())); 
			    });
		  	  }
		    });
		  }
	    };

	    $scope.google = google; //used by $scope.eval to avoid eval()

	    /**
	     * get map options and events
	     */
	    var orgAttrs = Attr2MapOptions.orgAttributes($element);
	    var filtered = Attr2MapOptions.filter($attrs);
	    var options = Attr2MapOptions.getOptions(filtered, {scope: $scope});
	    var controlOptions = Attr2MapOptions.getControlOptions(filtered);
	    var mapOptions = angular.extend(options, controlOptions);
	    var mapEvents = Attr2MapOptions.getEvents($scope, filtered);
	    void 0;
	    Object.keys(mapEvents).length && void 0;

	    vm.mapOptions = mapOptions;
	    vm.mapEvents = mapEvents;
	    vm.eventListeners = {};

	    if (options.lazyInit) { // allows controlled initialization
	      // parse angular expression for dynamic ids
	      if (!!$attrs.id && 
	      	  // starts with, at position 0
		  $attrs.id.indexOf("{{", 0) === 0 &&
		  // ends with
		  $attrs.id.indexOf("}}", $attrs.id.length - "}}".length) !== -1) {
	        var idExpression = $attrs.id.slice(2,-2);
	        var mapId = $parse(idExpression)($scope);
	      } else {
	        var mapId = $attrs.id;
	      }
	      vm.map = {id: mapId}; //set empty, not real, map
	      NgMap.addMap(vm);
	    } else {
	      vm.initializeMap();
	    }

	    //Trigger Resize
	    if(options.triggerResize) {
	      google.maps.event.trigger(vm.map, 'resize');
	    }

	    $element.bind('$destroy', function() {
	      NgMapPool.returnMapInstance(vm.map);
	      NgMap.deleteMap(vm);
	    });
	  }; // __MapController

	  __MapController.$inject = [
	    '$scope', '$element', '$attrs', '$parse', 'Attr2MapOptions', 'NgMap', 'NgMapPool'
	  ];
	  angular.module('ngMap').controller('__MapController', __MapController);
	})();

	/**
	 * @ngdoc directive
	 * @name bicycling-layer
	 * @param Attr2Options {service}
	 *   convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 *
	 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
	 *     <bicycling-layer></bicycling-layer>
	 *    </map>
	 */
	(function() {
	  'use strict';
	  var parser;

	  var linkFunc = function(scope, element, attrs, mapController) {
	    mapController = mapController[0]||mapController[1];
	    var orgAttrs = parser.orgAttributes(element);
	    var filtered = parser.filter(attrs);
	    var options = parser.getOptions(filtered, {scope: scope});
	    var events = parser.getEvents(scope, filtered);

	    void 0;

	    var layer = getLayer(options, events);
	    mapController.addObject('bicyclingLayers', layer);
	    mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
	    element.bind('$destroy', function() {
	      mapController.deleteObject('bicyclingLayers', layer);
	    });
	  };

	  var getLayer = function(options, events) {
	    var layer = new google.maps.BicyclingLayer(options);
	    for (var eventName in events) {
	      google.maps.event.addListener(layer, eventName, events[eventName]);
	    }
	    return layer;
	  };

	  var bicyclingLayer= function(Attr2MapOptions) {
	    parser = Attr2MapOptions;
	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	     };
	  };
	  bicyclingLayer.$inject = ['Attr2MapOptions'];

	  angular.module('ngMap').directive('bicyclingLayer', bicyclingLayer);
	})();

	/**
	 * @ngdoc directive
	 * @name custom-control
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @param $compile {service} AngularJS $compile service
	 * @description
	 *   Build custom control and set to the map with position
	 *
	 *   Requires:  map directive
	 *
	 *   Restrict To:  Element
	 *
	 * @attr {String} position position of this control
	 *        i.e. TOP_RIGHT
	 * @attr {Number} index index of the control
	 * @example
	 *
	 * Example:
	 *  <map center="41.850033,-87.6500523" zoom="3">
	 *    <custom-control id="home" position="TOP_LEFT" index="1">
	 *      <div style="background-color: white;">
	 *        <b>Home</b>
	 *      </div>
	 *    </custom-control>
	 *  </map>
	 *
	 */
	(function() {
	  'use strict';
	  var parser, $compile, NgMap;

	  var linkFunc = function(scope, element, attrs, mapController) {
	    mapController = mapController[0]||mapController[1];
	    var filtered = parser.filter(attrs);
	    var options = parser.getOptions(filtered, {scope: scope});
	    var events = parser.getEvents(scope, filtered);

	    /**
	     * build a custom control element
	     */
	    var customControlEl = element[0].parentElement.removeChild(element[0]);
	    $compile(customControlEl.innerHTML.trim())(scope);

	    /**
	     * set events
	     */
	    for (var eventName in events) {
	      google.maps.event.addDomListener(customControlEl, eventName, events[eventName]);
	    }

	    mapController.addObject('customControls', customControlEl);
	    var position = options.position;
	    mapController.map.controls[google.maps.ControlPosition[position]].push(customControlEl);

	    element.bind('$destroy', function() {
	      mapController.deleteObject('customControls', customControlEl);
	    });
	  };

	  var customControl =  function(Attr2MapOptions, _$compile_, _NgMap_)  {
	    parser = Attr2MapOptions, $compile = _$compile_, NgMap = _NgMap_;

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	    }; // return
	  };
	  customControl.$inject = ['Attr2MapOptions', '$compile', 'NgMap'];

	  angular.module('ngMap').directive('customControl', customControl);
	})();

	/**
	 * @ngdoc directive
	 * @memberof ngmap
	 * @name custom-marker
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @param $timeout {service} AngularJS $timeout
	 * @description
	 *   Marker with html
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @attr {String} position required, position on map
	 * @attr {Number} z-index optional
	 * @attr {Boolean} visible optional
	 * @example
	 *
	 * Example:
	 *   <map center="41.850033,-87.6500523" zoom="3">
	 *     <custom-marker position="41.850033,-87.6500523">
	 *       <div>
	 *         <b>Home</b>
	 *       </div>
	 *     </custom-marker>
	 *   </map>
	 *
	 */
	/* global document */
	(function() {
	  'use strict';
	  var parser, $timeout, $compile, NgMap;

	  var CustomMarker = function(options) {
	    options = options || {};

	    this.el = document.createElement('div');
	    this.el.style.display = 'inline-block';
	    this.el.style.visibility = "hidden";
	    this.visible = true;
	    for (var key in options) { /* jshint ignore:line */
	     this[key] = options[key];
	    }
	  };

	  var setCustomMarker = function() {

	    CustomMarker.prototype = new google.maps.OverlayView();

	    CustomMarker.prototype.setContent = function(html, scope) {
	      this.el.innerHTML = html;
	      this.el.style.position = 'absolute';
	      if (scope) {
	        $compile(angular.element(this.el).contents())(scope);
	      }
	    };

	    CustomMarker.prototype.getDraggable = function() {
	      return this.draggable;
	    };

	    CustomMarker.prototype.setDraggable = function(draggable) {
	      this.draggable = draggable;
	    };

	    CustomMarker.prototype.getPosition = function() {
	      return this.position;
	    };

	    CustomMarker.prototype.setPosition = function(position) {
	      position && (this.position = position); /* jshint ignore:line */

	      if (this.getProjection() && typeof this.position.lng == 'function') {
	        var _this = this;
	        var setPosition = function() {
	          var posPixel = _this.getProjection().fromLatLngToDivPixel(_this.position);
	          var x = Math.round(posPixel.x - (_this.el.offsetWidth/2));
	          var y = Math.round(posPixel.y - _this.el.offsetHeight - 10); // 10px for anchor
	          _this.el.style.left = x + "px";
	          _this.el.style.top = y + "px";
	          _this.el.style.visibility = "visible";
	        };
	        if (_this.el.offsetWidth && _this.el.offsetHeight) { 
	          setPosition();
	        } else {
	          //delayed left/top calculation when width/height are not set instantly
	          $timeout(setPosition, 300);
	        }
	      }
	    };

	    CustomMarker.prototype.setZIndex = function(zIndex) {
	      zIndex && (this.zIndex = zIndex); /* jshint ignore:line */
	      this.el.style.zIndex = this.zIndex;
	    };

	    CustomMarker.prototype.getVisible = function() {
	      return this.visible;
	    };

	    CustomMarker.prototype.setVisible = function(visible) {
	      this.el.style.display = visible ? 'inline-block' : 'none';
	      this.visible = visible;
	    };

	    CustomMarker.prototype.addClass = function(className) {
	      var classNames = this.el.className.trim().split(' ');
	      (classNames.indexOf(className) == -1) && classNames.push(className); /* jshint ignore:line */
	      this.el.className = classNames.join(' ');
	    };

	    CustomMarker.prototype.removeClass = function(className) {
	      var classNames = this.el.className.split(' ');
	      var index = classNames.indexOf(className);
	      (index > -1) && classNames.splice(index, 1); /* jshint ignore:line */
	      this.el.className = classNames.join(' ');
	    };

	    CustomMarker.prototype.onAdd = function() {
	      this.getPanes().overlayMouseTarget.appendChild(this.el);
	    };

	    CustomMarker.prototype.draw = function() {
	      this.setPosition();
	      this.setZIndex(this.zIndex);
	      this.setVisible(this.visible);
	    };

	    CustomMarker.prototype.onRemove = function() {
	      this.el.parentNode.removeChild(this.el);
	      //this.el = null;
	    };
	  };

	  var linkFunc = function(orgHtml, varsToWatch) {
	    //console.log('orgHtml', orgHtml, 'varsToWatch', varsToWatch);

	    return function(scope, element, attrs, mapController) {
	      mapController = mapController[0]||mapController[1];
	      var orgAttrs = parser.orgAttributes(element);

	      var filtered = parser.filter(attrs);
	      var options = parser.getOptions(filtered, {scope: scope});
	      var events = parser.getEvents(scope, filtered);

	      /**
	       * build a custom marker element
	       */
	      element[0].style.display = 'none';
	      void 0;
	      var customMarker = new CustomMarker(options);

	      $timeout(function() { //apply contents, class, and location after it is compiled

	        scope.$watch('[' + varsToWatch.join(',') + ']', function() {
	          customMarker.setContent(orgHtml, scope);
	        }, true);

	        customMarker.setContent(element[0].innerHTML, scope);
	        var classNames = element[0].firstElementChild.className;
	        customMarker.addClass('custom-marker');
	        customMarker.addClass(classNames);
	        void 0;

	        if (!(options.position instanceof google.maps.LatLng)) {
	          NgMap.getGeoLocation(options.position).then(
	                function(latlng) {
	                  customMarker.setPosition(latlng);
	                }
	          );
	        }

	      });

	      void 0;
	      for (var eventName in events) { /* jshint ignore:line */
	        google.maps.event.addDomListener(
	          customMarker.el, eventName, events[eventName]);
	      }
	      mapController.addObject('customMarkers', customMarker);

	      //set observers
	      mapController.observeAttrSetObj(orgAttrs, attrs, customMarker);

	      element.bind('$destroy', function() {
	        //Is it required to remove event listeners when DOM is removed?
	        mapController.deleteObject('customMarkers', customMarker);
	      });

	    }; // linkFunc
	  };


	  var customMarkerDirective = function(
	      _$timeout_, _$compile_, Attr2MapOptions, _NgMap_
	    )  {
	    parser = Attr2MapOptions;
	    $timeout = _$timeout_;
	    $compile = _$compile_;
	    NgMap = _NgMap_;

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      compile: function(element) {
	        setCustomMarker();
	        element[0].style.display ='none';
	        var orgHtml = element.html();
	        var matches = orgHtml.match(/{{([^}]+)}}/g);
	        var varsToWatch = [];
	        //filter out that contains '::', 'this.'
	        (matches || []).forEach(function(match) {
	          var toWatch = match.replace('{{','').replace('}}','');
	          if (match.indexOf('::') == -1 &&
	            match.indexOf('this.') == -1 &&
	            varsToWatch.indexOf(toWatch) == -1) {
	            varsToWatch.push(match.replace('{{','').replace('}}',''));
	          }
	        });

	        return linkFunc(orgHtml, varsToWatch);
	      }
	    }; // return
	  };// function
	  customMarkerDirective.$inject =
	    ['$timeout', '$compile', 'Attr2MapOptions', 'NgMap'];

	  angular.module('ngMap').directive('customMarker', customMarkerDirective);
	})();

	/**
	 * @ngdoc directive
	 * @name directions
	 * @description
	 *   Enable directions on map.
	 *   e.g., origin, destination, draggable, waypoints, etc
	 *
	 *   Requires:  map directive
	 *
	 *   Restrict To:  Element
	 *
	 * @attr {String} DirectionsRendererOptions
	 *   [Any DirectionsRendererOptions](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRendererOptions)
	 * @attr {String} DirectionsRequestOptions
	 *   [Any DirectionsRequest options](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRequest)
	 * @example
	 *  <map zoom="14" center="37.7699298, -122.4469157">
	 *    <directions
	 *      draggable="true"
	 *      panel="directions-panel"
	 *      travel-mode="{{travelMode}}"
	 *      waypoints="[{location:'kingston', stopover:true}]"
	 *      origin="{{origin}}"
	 *      destination="{{destination}}">
	 *    </directions>
	 *  </map>
	 */
	/* global document */
	(function() {
	  'use strict';
	  var NgMap, $timeout, NavigatorGeolocation;

	  var getDirectionsRenderer = function(options, events) {
	    if (options.panel) {
	      options.panel = document.getElementById(options.panel) ||
	        document.querySelector(options.panel);
	    }
	    var renderer = new google.maps.DirectionsRenderer(options);
	    for (var eventName in events) {
	      google.maps.event.addListener(renderer, eventName, events[eventName]);
	    }
	    return renderer;
	  };

	  var updateRoute = function(renderer, options) {
	    var directionsService = new google.maps.DirectionsService();

	    /* filter out valid keys only for DirectionsRequest object*/
	    var request = options;
	    request.travelMode = request.travelMode || 'DRIVING';
	    var validKeys = [
	      'origin', 'destination', 'travelMode', 'transitOptions', 'unitSystem',
	      'durationInTraffic', 'waypoints', 'optimizeWaypoints', 
	      'provideRouteAlternatives', 'avoidHighways', 'avoidTolls', 'region'
	    ];
	    for(var key in request){
	      (validKeys.indexOf(key) === -1) && (delete request[key]);
	    }

	    if(request.waypoints) {
	      // Check fo valid values
	      if(request.waypoints == "[]" || request.waypoints === "") {
	        delete request.waypoints;
	      }
	    }

	    var showDirections = function(request) {
	      directionsService.route(request, function(response, status) {
	        if (status == google.maps.DirectionsStatus.OK) {
	          $timeout(function() {
	            renderer.setDirections(response);
	          });
	        }
	      });
	    };

	    if (request.origin && request.destination) {
	      if (request.origin == 'current-location') {
	        NavigatorGeolocation.getCurrentPosition().then(function(ll) {
	          request.origin = new google.maps.LatLng(ll.coords.latitude, ll.coords.longitude);
	          showDirections(request);
	        });
	      } else if (request.destination == 'current-location') {
	        NavigatorGeolocation.getCurrentPosition().then(function(ll) {
	          request.destination = new google.maps.LatLng(ll.coords.latitude, ll.coords.longitude);
	          showDirections(request);
	        });
	      } else {
	        showDirections(request);
	      }
	    }
	  };

	  var directions = function(
	      Attr2MapOptions, _$timeout_, _NavigatorGeolocation_, _NgMap_) {
	    var parser = Attr2MapOptions;
	    NgMap = _NgMap_;
	    $timeout = _$timeout_;
	    NavigatorGeolocation = _NavigatorGeolocation_;

	    var linkFunc = function(scope, element, attrs, mapController) {
	      mapController = mapController[0]||mapController[1];

	      var orgAttrs = parser.orgAttributes(element);
	      var filtered = parser.filter(attrs);
	      var options = parser.getOptions(filtered, {scope: scope});
	      var events = parser.getEvents(scope, filtered);
	      var attrsToObserve = parser.getAttrsToObserve(orgAttrs);

	      var renderer = getDirectionsRenderer(options, events);
	      mapController.addObject('directionsRenderers', renderer);

	      attrsToObserve.forEach(function(attrName) {
	        (function(attrName) {
	          attrs.$observe(attrName, function(val) {
	            if (attrName == 'panel') {
	              $timeout(function(){
	                var panel =
	                  document.getElementById(val) || document.querySelector(val);
	                void 0;
	                panel && renderer.setPanel(panel);
	              });
	            } else if (options[attrName] !== val) { //apply only if changed
	              var optionValue = parser.toOptionValue(val, {key: attrName});
	              void 0;
	              options[attrName] = optionValue;
	              updateRoute(renderer, options);
	            }
	          });
	        })(attrName);
	      });

	      NgMap.getMap().then(function() {
	        updateRoute(renderer, options);
	      });
	      element.bind('$destroy', function() {
	        mapController.deleteObject('directionsRenderers', renderer);
	      });
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	    };
	  }; // var directions
	  directions.$inject =
	    ['Attr2MapOptions', '$timeout', 'NavigatorGeolocation', 'NgMap'];

	  angular.module('ngMap').directive('directions', directions);
	})();


	/**
	 * @ngdoc directive
	 * @name drawing-manager
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *
	 *  <map zoom="13" center="37.774546, -122.433523" map-type-id="SATELLITE">
	 *    <drawing-manager
	 *      on-overlaycomplete="onMapOverlayCompleted()"
	 *      position="ControlPosition.TOP_CENTER"
	 *      drawingModes="POLYGON,CIRCLE"
	 *      drawingControl="true"
	 *      circleOptions="fillColor: '#FFFF00';fillOpacity: 1;strokeWeight: 5;clickable: false;zIndex: 1;editable: true;" >
	 *    </drawing-manager>
	 *  </map>
	 *
	 *  TODO: Add remove button.
	 *  currently, for our solution, we have the shapes/markers in our own
	 *  controller, and we use some css classes to change the shape button
	 *  to a remove button (<div>X</div>) and have the remove operation in our own controller.
	 */
	(function() {
	  'use strict';
	  angular.module('ngMap').directive('drawingManager', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var controlOptions = parser.getControlOptions(filtered);
	        var events = parser.getEvents(scope, filtered);

	        /**
	         * set options
	         */
	        var drawingManager = new google.maps.drawing.DrawingManager({
	          drawingMode: options.drawingmode,
	          drawingControl: options.drawingcontrol,
	          drawingControlOptions: controlOptions.drawingControlOptions,
	          circleOptions:options.circleoptions,
	          markerOptions:options.markeroptions,
	          polygonOptions:options.polygonoptions,
	          polylineOptions:options.polylineoptions,
	          rectangleOptions:options.rectangleoptions
	        });

	        //Observers
	        attrs.$observe('drawingControlOptions', function (newValue) {
	          drawingManager.drawingControlOptions = parser.getControlOptions({drawingControlOptions: newValue}).drawingControlOptions;
	          drawingManager.setDrawingMode(null);
	          drawingManager.setMap(mapController.map);
	        });


	        /**
	         * set events
	         */
	        for (var eventName in events) {
	          google.maps.event.addListener(drawingManager, eventName, events[eventName]);
	        }

	        mapController.addObject('mapDrawingManager', drawingManager);

	        element.bind('$destroy', function() {
	          mapController.deleteObject('mapDrawingManager', drawingManager);
	        });
	      }
	    }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name dynamic-maps-engine-layer
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *   <map zoom="14" center="[59.322506, 18.010025]">
	 *     <dynamic-maps-engine-layer
	 *       layer-id="06673056454046135537-08896501997766553811">
	 *     </dynamic-maps-engine-layer>
	 *    </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('dynamicMapsEngineLayer', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getDynamicMapsEngineLayer = function(options, events) {
	      var layer = new google.maps.visualization.DynamicMapsEngineLayer(options);

	      for (var eventName in events) {
	        google.maps.event.addListener(layer, eventName, events[eventName]);
	      }

	      return layer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered, events);

	        var layer = getDynamicMapsEngineLayer(options, events);
	        mapController.addObject('mapsEngineLayers', layer);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name fusion-tables-layer
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *   <map zoom="11" center="41.850033, -87.6500523">
	 *     <fusion-tables-layer query="{
	 *       select: 'Geocodable address',
	 *       from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'}">
	 *     </fusion-tables-layer>
	 *   </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('fusionTablesLayer', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getLayer = function(options, events) {
	      var layer = new google.maps.FusionTablesLayer(options);

	      for (var eventName in events) {
	        google.maps.event.addListener(layer, eventName, events[eventName]);
	      }

	      return layer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered, events);
	        void 0;

	        var layer = getLayer(options, events);
	        mapController.addObject('fusionTablesLayers', layer);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name heatmap-layer
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 *
	 * <map zoom="11" center="[41.875696,-87.624207]">
	 *   <heatmap-layer data="taxiData"></heatmap-layer>
	 * </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('heatmapLayer', [
	    'Attr2MapOptions', '$window', function(Attr2MapOptions, $window) {
	    var parser = Attr2MapOptions;
	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var filtered = parser.filter(attrs);

	        /**
	         * set options
	         */
	        var options = parser.getOptions(filtered, {scope: scope});
	        options.data = $window[attrs.data] || scope[attrs.data];
	        if (options.data instanceof Array) {
	          options.data = new google.maps.MVCArray(options.data);
	        } else {
	          throw "invalid heatmap data";
	        }
	        var layer = new google.maps.visualization.HeatmapLayer(options);

	        /**
	         * set events
	         */
	        var events = parser.getEvents(scope, filtered);
	        void 0;

	        mapController.addObject('heatmapLayers', layer);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name info-window
	 * @param Attr2MapOptions {service}
	 *   convert html attribute to Gogole map api options
	 * @param $compile {service} $compile service
	 * @description
	 *  Defines infoWindow and provides compile method
	 *
	 *  Requires:  map directive
	 *
	 *  Restrict To:  Element
	 *
	 *  NOTE: this directive should **NOT** be used with `ng-repeat`
	 *  because InfoWindow itself is a template, and a template must be
	 *  reused by each marker, thus, should not be redefined repeatedly
	 *  by `ng-repeat`.
	 *
	 * @attr {Boolean} visible
	 *   Indicates to show it when map is initialized
	 * @attr {Boolean} visible-on-marker
	 *   Indicates to show it on a marker when map is initialized
	 * @attr {Expression} geo-callback
	 *   if position is an address, the expression is will be performed
	 *   when geo-lookup is successful. e.g., geo-callback="showDetail()"
	 * @attr {String} &lt;InfoWindowOption> Any InfoWindow options,
	 *   https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
	 * @attr {String} &lt;InfoWindowEvent> Any InfoWindow events,
	 *   https://developers.google.com/maps/documentation/javascript/reference
	 * @example
	 * Usage:
	 *   <map MAP_ATTRIBUTES>
	 *    <info-window id="foo" ANY_OPTIONS ANY_EVENTS"></info-window>
	 *   </map>
	 *
	 * Example:
	 *  <map center="41.850033,-87.6500523" zoom="3">
	 *    <info-window id="1" position="41.850033,-87.6500523" >
	 *      <div ng-non-bindable>
	 *        Chicago, IL<br/>
	 *        LatLng: {{chicago.lat()}}, {{chicago.lng()}}, <br/>
	 *        World Coordinate: {{worldCoordinate.x}}, {{worldCoordinate.y}}, <br/>
	 *        Pixel Coordinate: {{pixelCoordinate.x}}, {{pixelCoordinate.y}}, <br/>
	 *        Tile Coordinate: {{tileCoordinate.x}}, {{tileCoordinate.y}} at Zoom Level {{map.getZoom()}}
	 *      </div>
	 *    </info-window>
	 *  </map>
	 */
	/* global google */
	(function() {
	  'use strict';

	  var infoWindow = function(Attr2MapOptions, $compile, $q, $templateRequest, $timeout, $parse, NgMap)  {
	    var parser = Attr2MapOptions;

	    var getInfoWindow = function(options, events, element) {
	      var infoWindow;

	      /**
	       * set options
	       */
	      if (options.position && !(options.position instanceof google.maps.LatLng)) {
	        delete options.position;
	      }
	      infoWindow = new google.maps.InfoWindow(options);

	      /**
	       * set events
	       */
	      for (var eventName in events) {
	        if (eventName) {
	          google.maps.event.addListener(infoWindow, eventName, events[eventName]);
	        }
	      }

	      /**
	       * set template and template-related functions
	       * it must have a container element with ng-non-bindable
	       */
	      var templatePromise = $q(function(resolve) {
	        if (angular.isString(element)) {
	          $templateRequest(element).then(function (requestedTemplate) {
	            resolve(angular.element(requestedTemplate).wrap('<div>').parent());
	          }, function(message) {
	            throw "info-window template request failed: " + message;
	          });
	        }
	        else {
	          resolve(element);
	        }
	      }).then(function(resolvedTemplate) {
	        var template = resolvedTemplate.html().trim();
	        if (angular.element(template).length != 1) {
	          throw "info-window working as a template must have a container";
	        }
	        infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/,"");
	      });

	      infoWindow.__open = function(map, scope, anchor) {
	        templatePromise.then(function() {
	          $timeout(function() {
	            anchor && (scope.anchor = anchor);
	            var el = $compile(infoWindow.__template)(scope);
	            infoWindow.setContent(el[0]);
	            scope.$apply();
	            if (anchor && anchor.getPosition) {
	              infoWindow.open(map, anchor);
	            } else if (anchor && anchor instanceof google.maps.LatLng) {
	              infoWindow.open(map);
	              infoWindow.setPosition(anchor);
	            } else {
	              infoWindow.open(map);
	            }
	            var infoWindowContainerEl = infoWindow.content.parentElement.parentElement.parentElement;
	            infoWindowContainerEl.className = "ng-map-info-window";
	          });
	        });
	      };

	      return infoWindow;
	    };

	    var linkFunc = function(scope, element, attrs, mapController) {
	      mapController = mapController[0]||mapController[1];

	      element.css('display','none');

	      var orgAttrs = parser.orgAttributes(element);
	      var filtered = parser.filter(attrs);
	      var options = parser.getOptions(filtered, {scope: scope});
	      var events = parser.getEvents(scope, filtered);

	      var infoWindow = getInfoWindow(options, events, options.template || element);
	      var address;
	      if (options.position && !(options.position instanceof google.maps.LatLng)) {
	        address = options.position;
	      }
	      if (address) {
	        NgMap.getGeoLocation(address).then(function(latlng) {
	          infoWindow.setPosition(latlng);
	          infoWindow.__open(mapController.map, scope, latlng);
	          var geoCallback = attrs.geoCallback;
	          geoCallback && $parse(geoCallback)(scope);
	        });
	      }

	      mapController.addObject('infoWindows', infoWindow);
	      mapController.observeAttrSetObj(orgAttrs, attrs, infoWindow);

	      mapController.showInfoWindow =
	      mapController.map.showInfoWindow = mapController.showInfoWindow ||
	        function(p1, p2, p3) { //event, id, marker
	          var id = typeof p1 == 'string' ? p1 : p2;
	          var marker = typeof p1 == 'string' ? p2 : p3;
	          if (typeof marker == 'string') {
	            //Check if markers if defined to avoid odd 'undefined' errors
	            if (typeof mapController.map.markers != "undefined"
	                && typeof mapController.map.markers[marker] != "undefined") {
	              marker = mapController.map.markers[marker];
	            } else if (
	                //additionally check if that marker is a custom marker
	            typeof mapController.map.customMarkers
	            && typeof mapController.map.customMarkers[marker] != "undefined") {
	              marker = mapController.map.customMarkers[marker];
	            } else {
	              //Better error output if marker with that id is not defined
	              throw new Error("Cant open info window for id " + marker + ". Marker or CustomMarker is not defined")
	            }
	          }

	          var infoWindow = mapController.map.infoWindows[id];
	          var anchor = marker ? marker : (this.getPosition ? this : null);
	          infoWindow.__open(mapController.map, scope, anchor);
	          if(mapController.singleInfoWindow) {
	            if(mapController.lastInfoWindow) {
	              scope.hideInfoWindow(mapController.lastInfoWindow);
	            }
	            mapController.lastInfoWindow = id;
	          }
	        };

	      mapController.hideInfoWindow =
	      mapController.map.hideInfoWindow = mapController.hideInfoWindow ||
	        function(p1, p2) {
	          var id = typeof p1 == 'string' ? p1 : p2;
	          var infoWindow = mapController.map.infoWindows[id];
	          infoWindow.close();
	        };

	      //TODO DEPRECATED
	      scope.showInfoWindow = mapController.map.showInfoWindow;
	      scope.hideInfoWindow = mapController.map.hideInfoWindow;

	      var map = infoWindow.mapId ? {id:infoWindow.mapId} : 0;
	      NgMap.getMap(map).then(function(map) {
	        infoWindow.visible && infoWindow.__open(map, scope);
	        if (infoWindow.visibleOnMarker) {
	          var markerId = infoWindow.visibleOnMarker;
	          infoWindow.__open(map, scope, map.markers[markerId]);
	        }
	      });

	    }; //link

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	    };

	  }; // infoWindow
	  infoWindow.$inject =
	    ['Attr2MapOptions', '$compile', '$q', '$templateRequest', '$timeout', '$parse', 'NgMap'];

	  angular.module('ngMap').directive('infoWindow', infoWindow);
	})();

	/**
	 * @ngdoc directive
	 * @name kml-layer
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   renders Kml layer on a map
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @attr {Url} url url of the kml layer
	 * @attr {KmlLayerOptions} KmlLayerOptions
	 *   (https://developers.google.com/maps/documentation/javascript/reference#KmlLayerOptions) 
	 * @attr {String} &lt;KmlLayerEvent> Any KmlLayer events,
	 *   https://developers.google.com/maps/documentation/javascript/reference
	 * @example
	 * Usage:
	 *   <map MAP_ATTRIBUTES>
	 *    <kml-layer ANY_KML_LAYER ANY_KML_LAYER_EVENTS"></kml-layer>
	 *   </map>
	 *
	 * Example:
	 *
	 * <map zoom="11" center="[41.875696,-87.624207]">
	 *   <kml-layer url="https://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml" >
	 *   </kml-layer>
	 * </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('kmlLayer', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getKmlLayer = function(options, events) {
	      var kmlLayer = new google.maps.KmlLayer(options);
	      for (var eventName in events) {
	        google.maps.event.addListener(kmlLayer, eventName, events[eventName]);
	      }
	      return kmlLayer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var orgAttrs = parser.orgAttributes(element);
	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered);
	        void 0;

	        var kmlLayer = getKmlLayer(options, events);
	        mapController.addObject('kmlLayers', kmlLayer);
	        mapController.observeAttrSetObj(orgAttrs, attrs, kmlLayer);  //observers
	        element.bind('$destroy', function() {
	          mapController.deleteObject('kmlLayers', kmlLayer);
	        });
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name map-data
	 * @param Attr2MapOptions {service}
	 *   convert html attribute to Gogole map api options
	 * @description
	 *   set map data
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @wn {String} method-name, run map.data[method-name] with attribute value
	 * @example
	 * Example:
	 *
	 *  <map zoom="11" center="[41.875696,-87.624207]">
	 *    <map-data load-geo-json="https://storage.googleapis.com/maps-devrel/google.json"></map-data>
	 *   </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('mapData', [
	    'Attr2MapOptions', 'NgMap', function(Attr2MapOptions, NgMap) {
	    var parser = Attr2MapOptions;
	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs) {
	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered, events);

	        void 0;
	        NgMap.getMap().then(function(map) {
	          //options
	          for (var key in options) {
	            var val = options[key];
	            if (typeof scope[val] === "function") {
	              map.data[key](scope[val]);
	            } else {
	              map.data[key](val);
	            }
	          }

	          //events
	          for (var eventName in events) {
	            map.data.addListener(eventName, events[eventName]);
	          }
	        });
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name map-lazy-load
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @description
	 *  Requires: Delay the initialization of map directive
	 *    until the map is ready to be rendered
	 *  Restrict To: Attribute
	 *
	 * @attr {String} map-lazy-load
	 *    Maps api script source file location.
	 *    Example:
	 *      'https://maps.google.com/maps/api/js'
	 * @attr {String} map-lazy-load-params
	 *   Maps api script source file location via angular scope variable.
	 *   Also requires the map-lazy-load attribute to be present in the directive.
	 *   Example: In your controller, set
	 *     $scope.googleMapsURL = 'https://maps.google.com/maps/api/js?v=3.20&client=XXXXXenter-api-key-hereXXXX'
	 *
	 * @example
	 * Example:
	 *
	 *   <div map-lazy-load="http://maps.google.com/maps/api/js">
	 *     <map center="Brampton" zoom="10">
	 *       <marker position="Brampton"></marker>
	 *     </map>
	 *   </div>
	 *
	 *   <div map-lazy-load="http://maps.google.com/maps/api/js"
	 *        map-lazy-load-params="{{googleMapsUrl}}">
	 *     <map center="Brampton" zoom="10">
	 *       <marker position="Brampton"></marker>
	 *     </map>
	 *   </div>
	 */
	/* global window, document */
	(function() {
	  'use strict';
	  var $timeout, $compile, src, savedHtml = [], elements = [];

	  var preLinkFunc = function(scope, element, attrs) {
	    var mapsUrl = attrs.mapLazyLoadParams || attrs.mapLazyLoad;

	    if(window.google === undefined || window.google.maps === undefined) {
	      elements.push({
	        scope: scope,
	        element: element,
	        savedHtml: savedHtml[elements.length],
	      });

	      window.lazyLoadCallback = function() {
	        void 0;
	        $timeout(function() { /* give some time to load */
	          elements.forEach(function(elm) {
	              elm.element.html(elm.savedHtml);
	              $compile(elm.element.contents())(elm.scope);
	          });
	        }, 100);
	      };

	      var scriptEl = document.createElement('script');
	      void 0;

	      scriptEl.src = mapsUrl +
	        (mapsUrl.indexOf('?') > -1 ? '&' : '?') +
	        'callback=lazyLoadCallback';

	        if (!document.querySelector('script[src="' + scriptEl.src + '"]')) {
	          document.body.appendChild(scriptEl);
	        }
	    } else {
	      element.html(savedHtml);
	      $compile(element.contents())(scope);
	    }
	  };

	  var compileFunc = function(tElement, tAttrs) {

	    (!tAttrs.mapLazyLoad) && void 0;
	    savedHtml.push(tElement.html());
	    src = tAttrs.mapLazyLoad;

	    /**
	     * if already loaded, stop processing it
	     */
	    if(window.google !== undefined && window.google.maps !== undefined) {
	      return false;
	    }

	    tElement.html('');  // will compile again after script is loaded

	    return {
	      pre: preLinkFunc
	    };
	  };

	  var mapLazyLoad = function(_$compile_, _$timeout_) {
	    $compile = _$compile_, $timeout = _$timeout_;
	    return {
	      compile: compileFunc
	    };
	  };
	  mapLazyLoad.$inject = ['$compile','$timeout'];

	  angular.module('ngMap').directive('mapLazyLoad', mapLazyLoad);
	})();

	/**
	 * @ngdoc directive
	 * @name map-type
	 * @param Attr2MapOptions {service} 
	 *   convert html attribute to Google map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *
	 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
	 *     <map-type name="coordinate" object="coordinateMapType"></map-type>
	 *   </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('mapType', ['$parse', 'NgMap',
	    function($parse, NgMap) {

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var mapTypeName = attrs.name, mapTypeObject;
	        if (!mapTypeName) {
	          throw "invalid map-type name";
	        }
	        mapTypeObject = $parse(attrs.object)(scope);
	        if (!mapTypeObject) {
	          throw "invalid map-type object";
	        }

	        NgMap.getMap().then(function(map) {
	          map.mapTypes.set(mapTypeName, mapTypeObject);
	        });
	        mapController.addObject('mapTypes', mapTypeObject);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @memberof ngMap
	 * @name ng-map
	 * @param Attr2Options {service}
	 *  convert html attribute to Gogole map api options
	 * @description
	 * Implementation of {@link __MapController}
	 * Initialize a Google map within a `<div>` tag
	 *   with given options and register events
	 *
	 * @attr {Expression} map-initialized
	 *   callback function when map is initialized
	 *   e.g., map-initialized="mycallback(map)"
	 * @attr {Expression} geo-callback if center is an address or current location,
	 *   the expression is will be executed when geo-lookup is successful.
	 *   e.g., geo-callback="showMyStoreInfo()"
	 * @attr {Array} geo-fallback-center
	 *   The center of map incase geolocation failed. i.e. [0,0]
	 * @attr {Object} geo-location-options
	 *  The navigator geolocation options.
	 *  e.g., { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }.
	 *  If none specified, { timeout: 5000 }.
	 *  If timeout not specified, timeout: 5000 added
	 * @attr {Boolean} zoom-to-include-markers
	 *  When true, map boundary will be changed automatially
	 *  to include all markers when initialized
	 * @attr {Boolean} default-style
	 *  When false, the default styling,
	 *  `display:block;height:300px`, will be ignored.
	 * @attr {String} &lt;MapOption> Any Google map options,
	 *  https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions
	 * @attr {String} &lt;MapEvent> Any Google map events,
	 *  https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/map_events.html
	 * @attr {Boolean} single-info-window
	 *  When true the map will only display one info window at the time,
	 *  if not set or false,
	 *  everytime an info window is open it will be displayed with the othe one.
	 * @attr {Boolean} trigger-resize
	 *  Default to false.  Set to true to trigger resize of the map.  Needs to be done anytime you resize the map
	 * @example
	 * Usage:
	 *   <map MAP_OPTIONS_OR_MAP_EVENTS ..>
	 *     ... Any children directives
	 *   </map>
	 *
	 * Example:
	 *   <map center="[40.74, -74.18]" on-click="doThat()">
	 *   </map>
	 *
	 *   <map geo-fallback-center="[40.74, -74.18]" zoom-to-inlude-markers="true">
	 *   </map>
	 */
	(function () {
	  'use strict';

	  var mapDirective = function () {
	    return {
	      restrict: 'AE',
	      controller: '__MapController',
	      controllerAs: 'ngmap'
	    };
	  };

	  angular.module('ngMap').directive('map', [mapDirective]);
	  angular.module('ngMap').directive('ngMap', [mapDirective]);
	})();

	/**
	 * @ngdoc directive
	 * @name maps-engine-layer
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *  <map zoom="14" center="[59.322506, 18.010025]">
	 *    <maps-engine-layer layer-id="06673056454046135537-08896501997766553811">
	 *    </maps-engine-layer>
	 *  </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('mapsEngineLayer', ['Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getMapsEngineLayer = function(options, events) {
	      var layer = new google.maps.visualization.MapsEngineLayer(options);

	      for (var eventName in events) {
	        google.maps.event.addListener(layer, eventName, events[eventName]);
	      }

	      return layer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered, events);
	        void 0;

	        var layer = getMapsEngineLayer(options, events);
	        mapController.addObject('mapsEngineLayers', layer);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name marker
	 * @param Attr2Options {service} convert html attribute to Gogole map api options
	 * @param NavigatorGeolocation It is used to find the current location
	 * @description
	 *  Draw a Google map marker on a map with given options and register events
	 *
	 *  Requires:  map directive
	 *
	 *  Restrict To:  Element
	 *
	 * @attr {String} position address, 'current', or [latitude, longitude]
	 *  example:
	 *    '1600 Pennsylvania Ave, 20500  Washingtion DC',
	 *    'current position',
	 *    '[40.74, -74.18]'
	 * @attr {Boolean} centered if set, map will be centered with this marker
	 * @attr {Expression} geo-callback if position is an address,
	 *   the expression is will be performed when geo-lookup is successful.
	 *   e.g., geo-callback="showStoreInfo()"
	 * @attr {Boolean} no-watcher if true, no attribute observer is added.
	 *   Useful for many ng-repeat
	 * @attr {String} &lt;MarkerOption>
	 *   [Any Marker options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerOptions)
	 * @attr {String} &lt;MapEvent>
	 *   [Any Marker events](https://developers.google.com/maps/documentation/javascript/reference)
	 * @example
	 * Usage:
	 *   <map MAP_ATTRIBUTES>
	 *    <marker ANY_MARKER_OPTIONS ANY_MARKER_EVENTS"></MARKER>
	 *   </map>
	 *
	 * Example:
	 *   <map center="[40.74, -74.18]">
	 *    <marker position="[40.74, -74.18]" on-click="myfunc()"></div>
	 *   </map>
	 *
	 *   <map center="the cn tower">
	 *    <marker position="the cn tower" on-click="myfunc()"></div>
	 *   </map>
	 */
	/* global google */
	(function() {
	  'use strict';
	  var parser, $parse, NgMap;

	  var getMarker = function(options, events) {
	    var marker;

	    if (NgMap.defaultOptions.marker) {
	      for (var key in NgMap.defaultOptions.marker) {
	        if (typeof options[key] == 'undefined') {
	          void 0;
	          options[key] = NgMap.defaultOptions.marker[key];
	        }
	      }
	    }

	    if (!(options.position instanceof google.maps.LatLng)) {
	      options.position = new google.maps.LatLng(0,0);
	    }
	    marker = new google.maps.Marker(options);

	    /**
	     * set events
	     */
	    if (Object.keys(events).length > 0) {
	      void 0;
	    }
	    for (var eventName in events) {
	      if (eventName) {
	        google.maps.event.addListener(marker, eventName, events[eventName]);
	      }
	    }

	    return marker;
	  };

	  var linkFunc = function(scope, element, attrs, mapController) {
	    mapController = mapController[0]||mapController[1];

	    var orgAttrs = parser.orgAttributes(element);
	    var filtered = parser.filter(attrs);
	    var markerOptions = parser.getOptions(filtered, scope, {scope: scope});
	    var markerEvents = parser.getEvents(scope, filtered);
	    void 0;

	    var address;
	    if (!(markerOptions.position instanceof google.maps.LatLng)) {
	      address = markerOptions.position;
	    }
	    var marker = getMarker(markerOptions, markerEvents);
	    mapController.addObject('markers', marker);
	    if (address) {
	      NgMap.getGeoLocation(address).then(function(latlng) {
	        marker.setPosition(latlng);
	        markerOptions.centered && marker.map.setCenter(latlng);
	        var geoCallback = attrs.geoCallback;
	        geoCallback && $parse(geoCallback)(scope);
	      });
	    }

	    //set observers
	    mapController.observeAttrSetObj(orgAttrs, attrs, marker); /* observers */

	    element.bind('$destroy', function() {
	      mapController.deleteObject('markers', marker);
	    });
	  };

	  var marker = function(Attr2MapOptions, _$parse_, _NgMap_) {
	    parser = Attr2MapOptions;
	    $parse = _$parse_;
	    NgMap = _NgMap_;

	    return {
	      restrict: 'E',
	      require: ['^?map','?^ngMap'],
	      link: linkFunc
	    };
	  };

	  marker.$inject = ['Attr2MapOptions', '$parse', 'NgMap'];
	  angular.module('ngMap').directive('marker', marker);

	})();

	/**
	 * @ngdoc directive
	 * @name overlay-map-type
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @param $window {service}
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *
	 * <map zoom="13" center="34.04924594193164, -118.24104309082031">
	 *   <overlay-map-type index="0" object="coordinateMapType"></map-type>
	 * </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('overlayMapType', [
	    'NgMap', function(NgMap) {

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var initMethod = attrs.initMethod || "insertAt";
	        var overlayMapTypeObject = scope[attrs.object];

	        NgMap.getMap().then(function(map) {
	          if (initMethod == "insertAt") {
	            var index = parseInt(attrs.index, 10);
	            map.overlayMapTypes.insertAt(index, overlayMapTypeObject);
	          } else if (initMethod == "push") {
	            map.overlayMapTypes.push(overlayMapTypeObject);
	          }
	        });
	        mapController.addObject('overlayMapTypes', overlayMapTypeObject);
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name places-auto-complete
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   Provides address auto complete feature to an input element
	 *   Requires: input tag
	 *   Restrict To: Attribute
	 *
	 * @attr {AutoCompleteOptions}
	 *   [Any AutocompleteOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#AutocompleteOptions)
	 *
	 * @example
	 * Example:
	 *   <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
	 *   <input places-auto-complete types="['geocode']" on-place-changed="myCallback(place)" component-restrictions="{country:'au'}"/>
	 */
	/* global google */
	(function() {
	  'use strict';

	  var placesAutoComplete = function(Attr2MapOptions, $timeout) {
	    var parser = Attr2MapOptions;

	    var linkFunc = function(scope, element, attrs, ngModelCtrl) {
	      if (attrs.placesAutoComplete ==='false') {
	        return false;
	      }
	      var filtered = parser.filter(attrs);
	      var options = parser.getOptions(filtered, {scope: scope});
	      var events = parser.getEvents(scope, filtered);
	      var autocomplete = new google.maps.places.Autocomplete(element[0], options);
	      for (var eventName in events) {
	        google.maps.event.addListener(autocomplete, eventName, events[eventName]);
	      }

	      var updateModel = function() {
	        $timeout(function(){
	          ngModelCtrl && ngModelCtrl.$setViewValue(element.val());
	        },100);
	      };
	      google.maps.event.addListener(autocomplete, 'place_changed', updateModel);
	      element[0].addEventListener('change', updateModel);

	      attrs.$observe('types', function(val) {
	        if (val) {
	          var optionValue = parser.toOptionValue(val, {key: 'types'});
	          autocomplete.setTypes(optionValue);
	        }
	      });
		  
		  attrs.$observe('componentRestrictions', function (val) {
			 if (val) {
			   autocomplete.setComponentRestrictions(scope.$eval(val));
			 }
		   });
	    };
		
	    return {
	      restrict: 'A',
	      require: '?ngModel',
	      link: linkFunc
	    };
	  };

	  placesAutoComplete.$inject = ['Attr2MapOptions', '$timeout'];
	  angular.module('ngMap').directive('placesAutoComplete', placesAutoComplete);
	})();

	/**
	 * @ngdoc directive
	 * @name shape
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   Initialize a Google map shape in map with given options and register events
	 *   The shapes are:
	 *     . circle
	 *     . polygon
	 *     . polyline
	 *     . rectangle
	 *     . groundOverlay(or image)
	 *
	 *   Requires:  map directive
	 *
	 *   Restrict To:  Element
	 *
	 * @attr {Boolean} centered if set, map will be centered with this marker
	 * @attr {Expression} geo-callback if shape is a circle and the center is
	 *   an address, the expression is will be performed when geo-lookup
	 *   is successful. e.g., geo-callback="showDetail()"
	 * @attr {String} &lt;OPTIONS>
	 *   For circle, [any circle options](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)
	 *   For polygon, [any polygon options](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
	 *   For polyline, [any polyline options](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
	 *   For rectangle, [any rectangle options](https://developers.google.com/maps/documentation/javascript/reference#RectangleOptions)
	 *   For image, [any groundOverlay options](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)
	 * @attr {String} &lt;MapEvent> [Any Shape events](https://developers.google.com/maps/documentation/javascript/reference)
	 * @example
	 * Usage:
	 *   <map MAP_ATTRIBUTES>
	 *    <shape name=SHAPE_NAME ANY_SHAPE_OPTIONS ANY_SHAPE_EVENTS"></MARKER>
	 *   </map>
	 *
	 * Example:
	 *
	 *   <map zoom="11" center="[40.74, -74.18]">
	 *     <shape id="polyline" name="polyline" geodesic="true"
	 *       stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
	 *       path="[[40.74,-74.18],[40.64,-74.10],[40.54,-74.05],[40.44,-74]]" >
	 *     </shape>
	 *   </map>
	 *
	 *   <map zoom="11" center="[40.74, -74.18]">
	 *     <shape id="polygon" name="polygon" stroke-color="#FF0000"
	 *       stroke-opacity="1.0" stroke-weight="2"
	 *       paths="[[40.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]" >
	 *     </shape>
	 *   </map>
	 *
	 *   <map zoom="11" center="[40.74, -74.18]">
	 *     <shape id="rectangle" name="rectangle" stroke-color='#FF0000'
	 *       stroke-opacity="0.8" stroke-weight="2"
	 *       bounds="[[40.74,-74.18], [40.78,-74.14]]" editable="true" >
	 *     </shape>
	 *   </map>
	 *
	 *   <map zoom="11" center="[40.74, -74.18]">
	 *     <shape id="circle" name="circle" stroke-color='#FF0000'
	 *       stroke-opacity="0.8"stroke-weight="2"
	 *       center="[40.70,-74.14]" radius="4000" editable="true" >
	 *     </shape>
	 *   </map>
	 *
	 *   <map zoom="11" center="[40.74, -74.18]">
	 *     <shape id="image" name="image"
	 *       url="https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"
	 *       bounds="[[40.71,-74.22],[40.77,-74.12]]" opacity="0.7"
	 *       clickable="true">
	 *     </shape>
	 *   </map>
	 *
	 *  For full-working example, please visit
	 *    [shape example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/shape.html)
	 */
	/* global google */
	(function() {
	  'use strict';

	  var getShape = function(options, events) {
	    var shape;

	    var shapeName = options.name;
	    delete options.name;  //remove name bcoz it's not for options
	    void 0;

	    /**
	     * set options
	     */
	    switch(shapeName) {
	      case "circle":
	        if (!(options.center instanceof google.maps.LatLng)) {
	          options.center = new google.maps.LatLng(0,0);
	        } 
	        shape = new google.maps.Circle(options);
	        break;
	      case "polygon":
	        shape = new google.maps.Polygon(options);
	        break;
	      case "polyline":
	        shape = new google.maps.Polyline(options);
	        break;
	      case "rectangle":
	        shape = new google.maps.Rectangle(options);
	        break;
	      case "groundOverlay":
	      case "image":
	        var url = options.url;
	        var opts = {opacity: options.opacity, clickable: options.clickable, id:options.id};
	        shape = new google.maps.GroundOverlay(url, options.bounds, opts);
	        break;
	    }

	    /**
	     * set events
	     */
	    for (var eventName in events) {
	      if (events[eventName]) {
	        google.maps.event.addListener(shape, eventName, events[eventName]);
	      }
	    }
	    return shape;
	  };

	  var shape = function(Attr2MapOptions, $parse, NgMap) {
	    var parser = Attr2MapOptions;

	    var linkFunc = function(scope, element, attrs, mapController) {
	      mapController = mapController[0]||mapController[1];

	      var orgAttrs = parser.orgAttributes(element);
	      var filtered = parser.filter(attrs);
	      var shapeOptions = parser.getOptions(filtered, {scope: scope});
	      var shapeEvents = parser.getEvents(scope, filtered);

	      var address, shapeType;
	      shapeType = shapeOptions.name;
	      if (!(shapeOptions.center instanceof google.maps.LatLng)) {
	        address = shapeOptions.center;
	      }
	      var shape = getShape(shapeOptions, shapeEvents);
	      mapController.addObject('shapes', shape);

	      if (address && shapeType == 'circle') {
	        NgMap.getGeoLocation(address).then(function(latlng) {
	          shape.setCenter(latlng);
	          shape.centered && shape.map.setCenter(latlng);
	          var geoCallback = attrs.geoCallback;
	          geoCallback && $parse(geoCallback)(scope);
	        });
	      }

	      //set observers
	      mapController.observeAttrSetObj(orgAttrs, attrs, shape);
	      element.bind('$destroy', function() {
	        mapController.deleteObject('shapes', shape);
	      });
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	     }; // return
	  };
	  shape.$inject = ['Attr2MapOptions', '$parse', 'NgMap'];

	  angular.module('ngMap').directive('shape', shape);

	})();

	/**
	 * @ngdoc directive
	 * @name streetview-panorama
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @attr container Optional, id or css selector, if given, streetview will be in the given html element
	 * @attr {String} &lt;StreetViewPanoramaOption>
	 *   [Any Google StreetViewPanorama options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#StreetViewPanoramaOptions)
	 * @attr {String} &lt;StreetViewPanoramaEvent>
	 *   [Any Google StreetViewPanorama events](https://developers.google.com/maps/documentation/javascript/reference#StreetViewPanorama)
	 *
	 * @example
	 *   <map zoom="11" center="[40.688738,-74.043871]" >
	 *     <street-view-panorama
	 *       click-to-go="true"
	 *       disable-default-ui="true"
	 *       disable-double-click-zoom="true"
	 *       enable-close-button="true"
	 *       pano="my-pano"
	 *       position="40.688738,-74.043871"
	 *       pov="{heading:0, pitch: 90}"
	 *       scrollwheel="false"
	 *       visible="true">
	 *     </street-view-panorama>
	 *   </map>
	 */
	/* global google, document */
	(function() {
	  'use strict';

	  var streetViewPanorama = function(Attr2MapOptions, NgMap) {
	    var parser = Attr2MapOptions;

	    var getStreetViewPanorama = function(map, options, events) {
	      var svp, container;
	      if (options.container) {
	        container = document.getElementById(options.container);
	        container = container || document.querySelector(options.container);
	      }
	      if (container) {
	        svp = new google.maps.StreetViewPanorama(container, options);
	      } else {
	        svp = map.getStreetView();
	        svp.setOptions(options);
	      }

	      for (var eventName in events) {
	        eventName &&
	          google.maps.event.addListener(svp, eventName, events[eventName]);
	      }
	      return svp;
	    };

	    var linkFunc = function(scope, element, attrs) {
	      var filtered = parser.filter(attrs);
	      var options = parser.getOptions(filtered, {scope: scope});
	      var controlOptions = parser.getControlOptions(filtered);
	      var svpOptions = angular.extend(options, controlOptions);

	      var svpEvents = parser.getEvents(scope, filtered);
	      void 0;

	      NgMap.getMap().then(function(map) {
	        var svp = getStreetViewPanorama(map, svpOptions, svpEvents);

	        map.setStreetView(svp);
	        (!svp.getPosition()) && svp.setPosition(map.getCenter());
	        google.maps.event.addListener(svp, 'position_changed', function() {
	          if (svp.getPosition() !== map.getCenter()) {
	            map.setCenter(svp.getPosition());
	          }
	        });
	        //needed for geo-callback
	        var listener =
	          google.maps.event.addListener(map, 'center_changed', function() {
	            svp.setPosition(map.getCenter());
	            google.maps.event.removeListener(listener);
	          });
	      });

	    }; //link

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],
	      link: linkFunc
	    };

	  };
	  streetViewPanorama.$inject = ['Attr2MapOptions', 'NgMap'];

	  angular.module('ngMap').directive('streetViewPanorama', streetViewPanorama);
	})();

	/**
	 * @ngdoc directive
	 * @name traffic-layer
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *
	 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
	 *     <traffic-layer></traffic-layer>
	 *    </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('trafficLayer', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getLayer = function(options, events) {
	      var layer = new google.maps.TrafficLayer(options);
	      for (var eventName in events) {
	        google.maps.event.addListener(layer, eventName, events[eventName]);
	      }
	      return layer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var orgAttrs = parser.orgAttributes(element);
	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered);
	        void 0;

	        var layer = getLayer(options, events);
	        mapController.addObject('trafficLayers', layer);
	        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
	        element.bind('$destroy', function() {
	          mapController.deleteObject('trafficLayers', layer);
	        });
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc directive
	 * @name transit-layer
	 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
	 * @description
	 *   Requires:  map directive
	 *   Restrict To:  Element
	 *
	 * @example
	 * Example:
	 *
	 *  <map zoom="13" center="34.04924594193164, -118.24104309082031">
	 *    <transit-layer></transit-layer>
	 *  </map>
	 */
	(function() {
	  'use strict';

	  angular.module('ngMap').directive('transitLayer', [
	    'Attr2MapOptions', function(Attr2MapOptions) {
	    var parser = Attr2MapOptions;

	    var getLayer = function(options, events) {
	      var layer = new google.maps.TransitLayer(options);
	      for (var eventName in events) {
	        google.maps.event.addListener(layer, eventName, events[eventName]);
	      }
	      return layer;
	    };

	    return {
	      restrict: 'E',
	      require: ['?^map','?^ngMap'],

	      link: function(scope, element, attrs, mapController) {
	        mapController = mapController[0]||mapController[1];

	        var orgAttrs = parser.orgAttributes(element);
	        var filtered = parser.filter(attrs);
	        var options = parser.getOptions(filtered, {scope: scope});
	        var events = parser.getEvents(scope, filtered);
	        void 0;

	        var layer = getLayer(options, events);
	        mapController.addObject('transitLayers', layer);
	        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
	        element.bind('$destroy', function() {
	          mapController.deleteObject('transitLayers', layer);
	        });
	      }
	     }; // return
	  }]);
	})();

	/**
	 * @ngdoc filter
	 * @name camel-case
	 * @description
	 *   Converts string to camel cased
	 */
	(function() {
	  'use strict';

	  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
	  var MOZ_HACK_REGEXP = /^moz([A-Z])/;

	  var camelCaseFilter = function() {
	    return function(name) {
	      return name.
	        replace(SPECIAL_CHARS_REGEXP,
	          function(_, separator, letter, offset) {
	            return offset ? letter.toUpperCase() : letter;
	        }).
	        replace(MOZ_HACK_REGEXP, 'Moz$1');
	    };
	  };

	  angular.module('ngMap').filter('camelCase', camelCaseFilter);
	})();

	/**
	 * @ngdoc filter
	 * @name jsonize
	 * @description
	 *   Converts json-like string to json string
	 */
	(function() {
	  'use strict';

	  var jsonizeFilter = function() {
	    return function(str) {
	      try {       // if parsable already, return as it is
	        JSON.parse(str);
	        return str;
	      } catch(e) { // if not parsable, change little
	        return str
	          // wrap keys without quote with valid double quote
	          .replace(/([\$\w]+)\s*:/g,
	            function(_, $1) {
	              return '"'+$1+'":';
	            }
	          )
	          // replacing single quote wrapped ones to double quote
	          .replace(/'([^']+)'/g,
	            function(_, $1) {
	              return '"'+$1+'"';
	            }
	          );
	      }
	    };
	  };

	  angular.module('ngMap').filter('jsonize', jsonizeFilter);
	})();

	/**
	 * @ngdoc service
	 * @name Attr2MapOptions
	 * @description
	 *   Converts tag attributes to options used by google api v3 objects
	 */
	/* global google */
	(function() {
	  'use strict';

	  //i.e. "2015-08-12T06:12:40.858Z"
	  var isoDateRE =
	    /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;

	  var Attr2MapOptions = function(
	      $parse, $timeout, $log, NavigatorGeolocation, GeoCoder,
	      camelCaseFilter, jsonizeFilter
	    ) {

	    /**
	     * Returns the attributes of an element as hash
	     * @memberof Attr2MapOptions
	     * @param {HTMLElement} el html element
	     * @returns {Hash} attributes
	     */
	    var orgAttributes = function(el) {
	      (el.length > 0) && (el = el[0]);
	      var orgAttributes = {};
	      for (var i=0; i<el.attributes.length; i++) {
	        var attr = el.attributes[i];
	        orgAttributes[attr.name] = attr.value;
	      }
	      return orgAttributes;
	    };

	    var getJSON = function(input) {
	      var re =/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/; //lat,lng
	      if (input.match(re)) {
	        input = "["+input+"]";
	      }
	      return JSON.parse(jsonizeFilter(input));
	    };

	    var getLatLng = function(input) {
	      var output = input;
	      if (input[0].constructor == Array) { // [[1,2],[3,4]]
	        output = input.map(function(el) {
	          return new google.maps.LatLng(el[0], el[1]);
	        });
	      } else if(!isNaN(parseFloat(input[0])) && isFinite(input[0])) {
	        output = new google.maps.LatLng(output[0], output[1]);
	      }
	      return output;
	    };

	    var toOptionValue = function(input, options) {
	      var output;
	      try { // 1. Number?
	        output = getNumber(input);
	      } catch(err) {
	        try { // 2. JSON?
	          var output = getJSON(input);
	          if (output instanceof Array) {
	            // [{a:1}] : not lat/lng ones
	            if (output[0].constructor == Object) {
	              output = output;
	            } else { // [[1,2],[3,4]] or [1,2]
	              output = getLatLng(output);
	            }
	          }
	          // JSON is an object (not array or null)
	          else if (output === Object(output)) {
	            // check for nested hashes and convert to Google API options
	            var newOptions = options;
	            newOptions.doNotConverStringToNumber = true;
	            output = getOptions(output, newOptions);
	          }
	        } catch(err2) {
	          // 3. Google Map Object function Expression. i.e. LatLng(80,-49)
	          if (input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
	            try {
	              var exp = "new google.maps."+input;
	              output = eval(exp); /* jshint ignore:line */
	            } catch(e) {
	              output = input;
	            }
	          // 4. Google Map Object constant Expression. i.e. MayTypeId.HYBRID
	          } else if (input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/)) {
	            try {
	              var matches = input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);
	              output = google.maps[matches[1]][matches[2]];
	            } catch(e) {
	              output = input;
	            }
	          // 5. Google Map Object constant Expression. i.e. HYBRID
	          } else if (input.match(/^[A-Z]+$/)) {
	            try {
	              var capitalizedKey = options.key.charAt(0).toUpperCase() +
	                options.key.slice(1);
	              if (options.key.match(/temperatureUnit|windSpeedUnit|labelColor/)) {
	                capitalizedKey = capitalizedKey.replace(/s$/,"");
	                output = google.maps.weather[capitalizedKey][input];
	              } else {
	                output = google.maps[capitalizedKey][input];
	              }
	            } catch(e) {
	              output = input;
	            }
	          // 6. Date Object as ISO String
	          } else if (input.match(isoDateRE)) {
	            try {
	              output = new Date(input);
	            } catch(e) {
	              output = input;
	            }
	          // 7. evaluate dynamically bound values
	          } else if (input.match(/^{/) && options.scope) {
	            try {
	              var expr = input.replace(/{{/,'').replace(/}}/g,'');
	              output = options.scope.$eval(expr);
	            } catch (err) {
	              output = input;
	            }
	          } else {
	            output = input;
	          }
	        } // catch(err2)
	      } // catch(err)

	      // convert output more for center and position
	      if (
	        (options.key == 'center' || options.key == 'position') &&
	        output instanceof Array
	      ) {
	        output = new google.maps.LatLng(output[0], output[1]);
	      }

	      // convert output more for shape bounds
	      if (options.key == 'bounds' && output instanceof Array) {
	        output = new google.maps.LatLngBounds(output[0], output[1]);
	      }

	      // convert output more for shape icons
	      if (options.key == 'icons' && output instanceof Array) {

	        for (var i=0; i<output.length; i++) {
	          var el = output[i];
	          if (el.icon.path.match(/^[A-Z_]+$/)) {
	            el.icon.path =  google.maps.SymbolPath[el.icon.path];
	          }
	        }
	      }

	      // convert output more for marker icon
	      if (options.key == 'icon' && output instanceof Object) {
	        if ((""+output.path).match(/^[A-Z_]+$/)) {
	          output.path = google.maps.SymbolPath[output.path];
	        }
	        for (var key in output) { //jshint ignore:line
	          var arr = output[key];
	          if (key == "anchor" || key == "origin" || key == "labelOrigin") {
	            output[key] = new google.maps.Point(arr[0], arr[1]);
	          } else if (key == "size" || key == "scaledSize") {
	            output[key] = new google.maps.Size(arr[0], arr[1]);
	          }
	        }
	      }

	      return output;
	    };

	    var getAttrsToObserve = function(attrs) {
	      var attrsToObserve = [];

	      if (!attrs.noWatcher) {
	        for (var attrName in attrs) { //jshint ignore:line
	          var attrValue = attrs[attrName];
	          if (attrValue && attrValue.match(/\{\{.*\}\}/)) { // if attr value is {{..}}
	            attrsToObserve.push(camelCaseFilter(attrName));
	          }
	        }
	      }

	      return attrsToObserve;
	    };

	    /**
	     * filters attributes by skipping angularjs methods $.. $$..
	     * @memberof Attr2MapOptions
	     * @param {Hash} attrs tag attributes
	     * @returns {Hash} filterd attributes
	     */
	    var filter = function(attrs) {
	      var options = {};
	      for(var key in attrs) {
	        if (key.match(/^\$/) || key.match(/^ng[A-Z]/)) {
	          void(0);
	        } else {
	          options[key] = attrs[key];
	        }
	      }
	      return options;
	    };

	    /**
	     * converts attributes hash to Google Maps API v3 options
	     * ```
	     *  . converts numbers to number
	     *  . converts class-like string to google maps instance
	     *    i.e. `LatLng(1,1)` to `new google.maps.LatLng(1,1)`
	     *  . converts constant-like string to google maps constant
	     *    i.e. `MapTypeId.HYBRID` to `google.maps.MapTypeId.HYBRID`
	     *    i.e. `HYBRID"` to `google.maps.MapTypeId.HYBRID`
	     * ```
	     * @memberof Attr2MapOptions
	     * @param {Hash} attrs tag attributes
	     * @param {Hash} options
	     * @returns {Hash} options converted attributess
	     */
	    var getOptions = function(attrs, params) {
	      params = params || {};
	      var options = {};
	      for(var key in attrs) {
	        if (attrs[key] || attrs[key] === 0) {
	          if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
	            continue;
	          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
	            continue;
	          } else {
	            // nested conversions need to be typechecked
	            // (non-strings are fully converted)
	            if (typeof attrs[key] !== 'string') {
	              options[key] = attrs[key];
	            } else {
	              if (params.doNotConverStringToNumber &&
	                attrs[key].match(/^[0-9]+$/)
	              ) {
	                options[key] = attrs[key];
	              } else {
	                options[key] = toOptionValue(attrs[key], {key: key, scope: params.scope});
	              }
	            }
	          }
	        } // if (attrs[key])
	      } // for(var key in attrs)
	      return options;
	    };

	    /**
	     * converts attributes hash to scope-specific event function 
	     * @memberof Attr2MapOptions
	     * @param {scope} scope angularjs scope
	     * @param {Hash} attrs tag attributes
	     * @returns {Hash} events converted events
	     */
	    var getEvents = function(scope, attrs) {
	      var events = {};
	      var toLowercaseFunc = function($1){
	        return "_"+$1.toLowerCase();
	      };
	      var EventFunc = function(attrValue) {
	        // funcName(argsStr)
	        var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
	        var funcName = matches[1];
	        var argsStr = matches[2].replace(/event[ ,]*/,'');  //remove string 'event'
	        var argsExpr = $parse("["+argsStr+"]"); //for perf when triggering event
	        return function(event) {
	          var args = argsExpr(scope); //get args here to pass updated model values
	          function index(obj,i) {return obj[i];}
	          var f = funcName.split('.').reduce(index, scope);
	          f && f.apply(this, [event].concat(args));
	          $timeout( function() {
	            scope.$apply();
	          });
	        };
	      };

	      for(var key in attrs) {
	        if (attrs[key]) {
	          if (!key.match(/^on[A-Z]/)) { //skip if not events
	            continue;
	          }

	          //get event name as underscored. i.e. zoom_changed
	          var eventName = key.replace(/^on/,'');
	          eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
	          eventName = eventName.replace(/([A-Z])/g, toLowercaseFunc);

	          var attrValue = attrs[key];
	          events[eventName] = new EventFunc(attrValue);
	        }
	      }
	      return events;
	    };

	    /**
	     * control means map controls, i.e streetview, pan, etc, not a general control
	     * @memberof Attr2MapOptions
	     * @param {Hash} filtered filtered tag attributes
	     * @returns {Hash} Google Map options
	     */
	    var getControlOptions = function(filtered) {
	      var controlOptions = {};
	      if (typeof filtered != 'object') {
	        return false;
	      }

	      for (var attr in filtered) {
	        if (filtered[attr]) {
	          if (!attr.match(/(.*)ControlOptions$/)) {
	            continue; // if not controlOptions, skip it
	          }

	          //change invalid json to valid one, i.e. {foo:1} to {"foo": 1}
	          var orgValue = filtered[attr];
	          var newValue = orgValue.replace(/'/g, '"');
	          newValue = newValue.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
	            if ($1) {
	              return $1.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
	            } else {
	              return $2;
	            }
	          });
	          try {
	            var options = JSON.parse(newValue);
	            for (var key in options) { //assign the right values
	              if (options[key]) {
	                var value = options[key];
	                if (typeof value === 'string') {
	                  value = value.toUpperCase();
	                } else if (key === "mapTypeIds") {
	                  value = value.map( function(str) {
	                    if (str.match(/^[A-Z]+$/)) { // if constant
	                      return google.maps.MapTypeId[str.toUpperCase()];
	                    } else { // else, custom map-type
	                      return str;
	                    }
	                  });
	                }

	                if (key === "style") {
	                  var str = attr.charAt(0).toUpperCase() + attr.slice(1);
	                  var objName = str.replace(/Options$/,'')+"Style";
	                  options[key] = google.maps[objName][value];
	                } else if (key === "position") {
	                  options[key] = google.maps.ControlPosition[value];
	                } else {
	                  options[key] = value;
	                }
	              }
	            }
	            controlOptions[attr] = options;
	          } catch (e) {
	            void 0;
	          }
	        }
	      } // for

	      return controlOptions;
	    };

	    return {
	      filter: filter,
	      getOptions: getOptions,
	      getEvents: getEvents,
	      getControlOptions: getControlOptions,
	      toOptionValue: toOptionValue,
	      getAttrsToObserve: getAttrsToObserve,
	      orgAttributes: orgAttributes
	    }; // return

	  };
	  Attr2MapOptions.$inject= [
	    '$parse', '$timeout', '$log', 'NavigatorGeolocation', 'GeoCoder',
	    'camelCaseFilter', 'jsonizeFilter'
	  ];

	  angular.module('ngMap').service('Attr2MapOptions', Attr2MapOptions);
	})();

	/**
	 * @ngdoc service
	 * @name GeoCoder
	 * @description
	 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
	 *   service for Google Geocoder service
	 */
	(function() {
	  'use strict';
	  var $q;
	  /**
	   * @memberof GeoCoder
	   * @param {Hash} options
	   *   https://developers.google.com/maps/documentation/geocoding/#geocoding
	   * @example
	   * ```
	   *   GeoCoder.geocode({address: 'the cn tower'}).then(function(result) {
	   *     //... do something with result
	   *   });
	   * ```
	   * @returns {HttpPromise} Future object
	   */
	  var geocodeFunc = function(options) {
	    var deferred = $q.defer();
	    var geocoder = new google.maps.Geocoder();
	    geocoder.geocode(options, function (results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	        deferred.resolve(results);
	      } else {
	        deferred.reject(status);
	      }
	    });
	    return deferred.promise;
	  };

	  var GeoCoder = function(_$q_) {
	    $q = _$q_;
	    return {
	      geocode : geocodeFunc
	    };
	  };
	  GeoCoder.$inject = ['$q'];

	  angular.module('ngMap').service('GeoCoder', GeoCoder);
	})();

	/**
	 * @ngdoc service
	 * @name NavigatorGeolocation
	 * @description
	 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
	 *  service for navigator.geolocation methods
	 */
	/* global google */
	(function() {
	  'use strict';
	  var $q;

	  /**
	   * @memberof NavigatorGeolocation
	   * @param {Object} geoLocationOptions the navigator geolocations options.
	   *  i.e. { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }.
	   *  If none specified, { timeout: 5000 }. 
	   *  If timeout not specified, timeout: 5000 added
	   * @param {function} success success callback function
	   * @param {function} failure failure callback function
	   * @example
	   * ```
	   *  NavigatorGeolocation.getCurrentPosition()
	   *    .then(function(position) {
	   *      var lat = position.coords.latitude, lng = position.coords.longitude;
	   *      .. do something lat and lng
	   *    });
	   * ```
	   * @returns {HttpPromise} Future object
	   */
	  var getCurrentPosition = function(geoLocationOptions) {
	    var deferred = $q.defer();
	    if (navigator.geolocation) {

	      if (geoLocationOptions === undefined) {
	        geoLocationOptions = { timeout: 5000 };
	      }
	      else if (geoLocationOptions.timeout === undefined) {
	        geoLocationOptions.timeout = 5000;
	      }

	      navigator.geolocation.getCurrentPosition(
	        function(position) {
	          deferred.resolve(position);
	        }, function(evt) {
	          void 0;
	          deferred.reject(evt);
	        },
	        geoLocationOptions
	      );
	    } else {
	      deferred.reject("Browser Geolocation service failed.");
	    }
	    return deferred.promise;
	  };

	  var NavigatorGeolocation = function(_$q_) {
	    $q = _$q_;
	    return {
	      getCurrentPosition: getCurrentPosition
	    };
	  };
	  NavigatorGeolocation.$inject = ['$q'];

	  angular.module('ngMap').
	    service('NavigatorGeolocation', NavigatorGeolocation);
	})();

	/**
	 * @ngdoc factory
	 * @name NgMapPool
	 * @description
	 *   Provide map instance to avoid memory leak
	 */
	(function() {
	  'use strict';
	  /**
	   * @memberof NgMapPool
	   * @desc map instance pool
	   */
	  var mapInstances = [];
	  var $window, $document, $timeout;

	  var add = function(el) {
	    var mapDiv = $document.createElement("div");
	    mapDiv.style.width = "100%";
	    mapDiv.style.height = "100%";
	    el.appendChild(mapDiv);
	    var map = new $window.google.maps.Map(mapDiv, {});
	    mapInstances.push(map);
	    return map;
	  };

	  var findById = function(el, id) {
	    var notInUseMap;
	    for (var i=0; i<mapInstances.length; i++) {
	      var map = mapInstances[i];
	      if (map.id == id && !map.inUse) {
	        var mapDiv = map.getDiv();
	        el.appendChild(mapDiv);
	        notInUseMap = map;
	        break;
	      }
	    }
	    return notInUseMap;
	  };

	  var findUnused = function(el) { //jshint ignore:line
	    var notInUseMap;
	    for (var i=0; i<mapInstances.length; i++) {
	      var map = mapInstances[i];
	      if (map.id) {
	        continue;
	      }
	      if (!map.inUse) {
	        var mapDiv = map.getDiv();
	        el.appendChild(mapDiv);
	        notInUseMap = map;
	        break;
	      }
	    }
	    return notInUseMap;
	  };

	  /**
	   * @memberof NgMapPool
	   * @function getMapInstance
	   * @param {HtmlElement} el map container element
	   * @return map instance for the given element
	   */
	  var getMapInstance = function(el) {
	    var map = findById(el, el.id) || findUnused(el);
	    if (!map) {
	      map = add(el);
	    } else {
	      /* firing map idle event, which is used by map controller */
	      $timeout(function() {
	        google.maps.event.trigger(map, 'idle');
	      }, 100);
	    }
	    map.inUse = true;
	    return map;
	  };

	  /**
	   * @memberof NgMapPool
	   * @function returnMapInstance
	   * @param {Map} an instance of google.maps.Map
	   * @desc sets the flag inUse of the given map instance to false, so that it 
	   * can be reused later
	   */
	  var returnMapInstance = function(map) {
	    map.inUse = false;
	  };
	  
	  /**
	   * @memberof NgMapPool
	   * @function resetMapInstances
	   * @desc resets mapInstance array
	   */
	  var resetMapInstances = function() {
	    for(var i = 0;i < mapInstances.length;i++) {
	        mapInstances[i] = null;
	    }
	    mapInstances = [];
	  };

	  var NgMapPool = function(_$document_, _$window_, _$timeout_) {
	    $document = _$document_[0], $window = _$window_, $timeout = _$timeout_;

	    return {
		  mapInstances: mapInstances,
	      resetMapInstances: resetMapInstances,
	      getMapInstance: getMapInstance,
	      returnMapInstance: returnMapInstance
	    };
	  };
	  NgMapPool.$inject = [ '$document', '$window', '$timeout'];

	  angular.module('ngMap').factory('NgMapPool', NgMapPool);

	})();

	/**
	 * @ngdoc provider
	 * @name NgMap
	 * @description
	 *  common utility service for ng-map
	 */
	(function() {
	  'use strict';
	  var $window, $document, $q;
	  var NavigatorGeolocation, Attr2MapOptions, GeoCoder, camelCaseFilter;

	  var mapControllers = {};

	  var getStyle = function(el, styleProp) {
	    var y;
	    if (el.currentStyle) {
	      y = el.currentStyle[styleProp];
	    } else if ($window.getComputedStyle) {
	      y = $document.defaultView.
	        getComputedStyle(el, null).
	        getPropertyValue(styleProp);
	    }
	    return y;
	  };

	  /**
	   * @memberof NgMap
	   * @function initMap
	   * @param id optional, id of the map. default 0
	   */
	  var initMap = function(id) {
	    var ctrl = mapControllers[id || 0];
	    if (!(ctrl.map instanceof google.maps.Map)) {
	      ctrl.initializeMap();
	      return ctrl.map;
	    } else {
	      void 0;
	    }
	  };

	  /**
	   * @memberof NgMap
	   * @function getMap
	   * @param {String} optional, id e.g., 'foo'
	   * @returns promise
	   */
	  var getMap = function(id) {
	    id = typeof id === 'object' ? id.id : id;
	    id = id || 0;

	    var deferred = $q.defer();
	    var timeout = 2000;

	    function waitForMap(timeElapsed){
	      if(mapControllers[id]){
	        deferred.resolve(mapControllers[id].map);
	      } else if (timeElapsed > timeout) {
	        deferred.reject('could not find map');
	      } else {
	        $window.setTimeout( function(){
	          waitForMap(timeElapsed+100);
	        }, 100);
	      }
	    }
	    waitForMap(0);

	    return deferred.promise;
	  };

	  /**
	   * @memberof NgMap
	   * @function addMap
	   * @param mapController {__MapContoller} a map controller
	   * @returns promise
	   */
	  var addMap = function(mapCtrl) {
	    if (mapCtrl.map) {
	      var len = Object.keys(mapControllers).length;
	      mapControllers[mapCtrl.map.id || len] = mapCtrl;
	    }
	  };

	  /**
	   * @memberof NgMap
	   * @function deleteMap
	   * @param mapController {__MapContoller} a map controller
	   */
	  var deleteMap = function(mapCtrl) {
	    var len = Object.keys(mapControllers).length - 1;
	    var mapId = mapCtrl.map.id || len;
	    if (mapCtrl.map) {
	      for (var eventName in mapCtrl.eventListeners) {
	        void 0;
	        var listener = mapCtrl.eventListeners[eventName];
	        google.maps.event.removeListener(listener);
	      }
	      if (mapCtrl.map.controls) {
	        mapCtrl.map.controls.forEach(function(ctrl) {
	          ctrl.clear();
	        });
	      }
	    }

	    //Remove Heatmap Layers
	    if (mapCtrl.map.heatmapLayers) {
	      Object.keys(mapCtrl.map.heatmapLayers).forEach(function (layer) {
	        mapCtrl.deleteObject('heatmapLayers', mapCtrl.map.heatmapLayers[layer]);
	      });
	    }

	    delete mapControllers[mapId];
	  };

	  /**
	   * @memberof NgMap
	   * @function getGeoLocation
	   * @param {String} address
	   * @param {Hash} options geo options
	   * @returns promise
	   */
	  var getGeoLocation = function(string, options) {
	    var deferred = $q.defer();
	    if (!string || string.match(/^current/i)) { // current location
	      NavigatorGeolocation.getCurrentPosition(options).then(
	        function(position) {
	          var lat = position.coords.latitude;
	          var lng = position.coords.longitude;
	          var latLng = new google.maps.LatLng(lat,lng);
	          deferred.resolve(latLng);
	        },
	        function(error) {
	          deferred.reject(error);
	        }
	      );
	    } else {
	      GeoCoder.geocode({address: string}).then(
	        function(results) {
	          deferred.resolve(results[0].geometry.location);
	        },
	        function(error) {
	          deferred.reject(error);
	        }
	      );
	      // var geocoder = new google.maps.Geocoder();
	      // geocoder.geocode(options, function (results, status) {
	      //   if (status == google.maps.GeocoderStatus.OK) {
	      //     deferred.resolve(results);
	      //   } else {
	      //     deferred.reject(status);
	      //   }
	      // });
	    }

	    return deferred.promise;
	  };

	  /**
	   * @memberof NgMap
	   * @function observeAndSet
	   * @param {String} attrName attribute name
	   * @param {Object} object A Google maps object to be changed
	   * @returns attribue observe function
	   */
	  var observeAndSet = function(attrName, object) {
	    void 0;
	    return function(val) {
	      if (val) {
	        var setMethod = camelCaseFilter('set-'+attrName);
	        var optionValue = Attr2MapOptions.toOptionValue(val, {key: attrName});
	        if (object[setMethod]) { //if set method does exist
	          void 0;
	          /* if an location is being observed */
	          if (attrName.match(/center|position/) &&
	            typeof optionValue == 'string') {
	            getGeoLocation(optionValue).then(function(latlng) {
	              object[setMethod](latlng);
	            });
	          } else {
	            object[setMethod](optionValue);
	          }
	        }
	      }
	    };
	  };

	  /**
	   * @memberof NgMap
	   * @function setStyle
	   * @param {HtmlElement} map contriner element
	   * @desc set display, width, height of map container element
	   */
	  var setStyle = function(el) {
	    //if style is not given to the map element, set display and height
	    var defaultStyle = el.getAttribute('default-style');
	    if (defaultStyle == "true") {
	      el.style.display = 'block';
	      el.style.height = '300px';
	    } else {
	      if (getStyle(el, 'display') != "block") {
	        el.style.display = 'block';
	      }
	      if (getStyle(el, 'height').match(/^(0|auto)/)) {
	        el.style.height = '300px';
	      }
	    }
	  };

	  angular.module('ngMap').provider('NgMap', function() {
	    var defaultOptions = {};

	    /**
	     * @memberof NgMap
	     * @function setDefaultOptions
	     * @param {Hash} options
	     * @example
	     *  app.config(function(NgMapProvider) {
	     *    NgMapProvider.setDefaultOptions({
	     *      marker: {
	     *        optimized: false
	     *      }
	     *    });
	     *  });
	     */
	    this.setDefaultOptions = function(options) {
	      defaultOptions = options;
	    };

	    var NgMap = function(
	        _$window_, _$document_, _$q_,
	        _NavigatorGeolocation_, _Attr2MapOptions_,
	        _GeoCoder_, _camelCaseFilter_
	      ) {
	      $window = _$window_;
	      $document = _$document_[0];
	      $q = _$q_;
	      NavigatorGeolocation = _NavigatorGeolocation_;
	      Attr2MapOptions = _Attr2MapOptions_;
	      GeoCoder = _GeoCoder_;
	      camelCaseFilter = _camelCaseFilter_;

	      return {
	        defaultOptions: defaultOptions,
	        addMap: addMap,
	        deleteMap: deleteMap,
	        getMap: getMap,
	        initMap: initMap,
	        setStyle: setStyle,
	        getGeoLocation: getGeoLocation,
	        observeAndSet: observeAndSet
	      };
	    };
	    NgMap.$inject = [
	      '$window', '$document', '$q',
	      'NavigatorGeolocation', 'Attr2MapOptions',
	      'GeoCoder', 'camelCaseFilter'
	    ];

	    this.$get = NgMap;
	  });
	})();

	/**
	 * @ngdoc service
	 * @name StreetView
	 * @description
	 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
	 *  service for [Google StreetViewService]
	 *  (https://developers.google.com/maps/documentation/javascript/streetview)
	 */
	(function() {
	  'use strict';
	  var $q;

	  /**
	   * Retrieves panorama id from the given map (and or position)
	   * @memberof StreetView
	   * @param {map} map Google map instance
	   * @param {LatLng} latlng Google LatLng instance
	   *   default: the center of the map
	   * @example
	   *   StreetView.getPanorama(map).then(function(panoId) {
	   *     $scope.panoId = panoId;
	   *   });
	   * @returns {HttpPromise} Future object
	   */
	  var getPanorama = function(map, latlng) {
	    latlng = latlng || map.getCenter();
	    var deferred = $q.defer();
	    var svs = new google.maps.StreetViewService();
	    svs.getPanoramaByLocation( (latlng||map.getCenter), 100,
	      function (data, status) {
	        // if streetView available
	        if (status === google.maps.StreetViewStatus.OK) {
	          deferred.resolve(data.location.pano);
	        } else {
	          // no street view available in this range, or some error occurred
	          deferred.resolve(false);
	          //deferred.reject('Geocoder failed due to: '+ status);
	        }
	      }
	    );
	    return deferred.promise;
	  };

	  /**
	   * Set panorama view on the given map with the panorama id
	   * @memberof StreetView
	   * @param {map} map Google map instance
	   * @param {String} panoId Panorama id fro getPanorama method
	   * @example
	   *   StreetView.setPanorama(map, panoId);
	   */
	  var setPanorama = function(map, panoId) {
	    var svp = new google.maps.StreetViewPanorama(
	      map.getDiv(), {enableCloseButton: true}
	    );
	    svp.setPano(panoId);
	  };

	  var StreetView = function(_$q_) {
	    $q = _$q_;

	    return {
	      getPanorama: getPanorama,
	      setPanorama: setPanorama
	    };
	  };
	  StreetView.$inject = ['$q'];

	  angular.module('ngMap').service('StreetView', StreetView);
	})();

	return 'ngMap';
	}));

/***/ },
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var attlApp = angular.module('attlApp');
	var HomeService = __webpack_require__(7);
	var ActorService = __webpack_require__(8);

	attlApp.controller("HomeController", ["$scope", "NgMap", "HomeService", "ActorService", function ($scope, NgMap, HomeService, ActorService) {
	  $scope.vm = {};
	  $scope.vm.showtimes = HomeService.showtimes;
	  $scope.vm.photos = HomeService.photos;
	  $scope.vm.actors = ActorService.all;
	  $scope.selectedPhoto = 'app/img/puppy1.jpg';

	  //api key
	  $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyB5uWq_OelNUbXyUKUhr23Tj3enH6tqQfI";
	  //google map
	  NgMap.getMap().then(function (map) {
	    console.log(map.getCenter());
	    console.log('markers', map.markers);
	    console.log('shapes', map.shapes);
	  });

	  $scope.changeSelectedPhoto = function (url) {
	    $scope.selectedPhoto = url;
	  };
	}]);

	module.exports = attlApp;

/***/ },
/* 7 */
/***/ function(module, exports) {

	var attlApp = angular.module('attlApp');

	attlApp.factory('HomeService', function () {
	  return {
	    showtimes: [{
	      day: 'Friday',
	      date: 'March 24',
	      time: '7 pm'
	    }, {
	      day: 'Saturday',
	      date: 'March 25',
	      time: '7 pm'
	    }, {
	      day: 'Sunday',
	      date: 'March 26',
	      time: '3 pm'
	    }, {
	      day: 'Friday',
	      date: 'March 31',
	      time: '7 pm'
	    }, {
	      day: 'Saturday',
	      date: 'April 1',
	      time: '7 pm'
	    }, {
	      day: 'Sunday',
	      date: 'April 2',
	      time: '3 pm'
	    }],
	    photos: [{
	      thumbnail: 'app/img/puppy1.jpg',
	      fullSize: 'app/img/puppy1.jpg'
	    }, {
	      thumbnail: 'app/img/puppy2.jpg',
	      fullSize: 'app/img/puppy2.jpg'
	    }, {
	      thumbnail: 'app/img/puppy3.jpg',
	      fullSize: 'app/img/puppy3.jpg'
	    }, {
	      thumbnail: 'app/img/puppy4.jpg',
	      fullSize: 'app/img/puppy4.jpg'
	    }, {
	      thumbnail: 'app/img/placeholder.jpg',
	      fullSize: 'app/img/placeholder.jpg'
	    }, {
	      thumbnail: 'app/img/puppy3.jpg',
	      fullSize: 'app/img/puppy3.jpg'
	    }, {
	      thumbnail: 'app/img/puppy1.jpg',
	      fullSize: 'app/img/puppy1.jpg'
	    }, {
	      thumbnail: 'app/img/puppy2.jpg',
	      fullSize: 'app/img/puppy2.jpg'
	    }, {
	      thumbnail: 'app/img/puppy4.jpg',
	      fullSize: 'app/img/puppy4.jpg'
	    }]
	  };
	});

/***/ },
/* 8 */
/***/ function(module, exports) {

	var attlApp = angular.module('attlApp');

	attlApp.factory('ActorService', function () {
	  return {
	    all: [{
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }]
	  };
	});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var attlApp = angular.module('attlApp');
	var AboutService = __webpack_require__(10);

	attlApp.controller("AboutController", ["$scope", "AboutService", function ($scope, AboutService) {
	  $scope.vm = {};
	  $scope.vm.writers = AboutService.writers;
	  $scope.vm.actors = AboutService.actors;
	}]);

	module.exports = attlApp;

/***/ },
/* 10 */
/***/ function(module, exports) {

	var attlApp = angular.module('attlApp');

	attlApp.factory('AboutService', function () {
	  return {
	    writers: [{
	      name: 'Kathee Lyndon',
	      title: 'Author - book',
	      photo: 'app/img/kathee_lyndon.jpg',
	      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	    }, {
	      name: 'Brenda Giordano',
	      title: 'Composer - music and lyrics',
	      photo: 'app/img/brenda_giordano.jpg',
	      bio: "Brenda starting writing songs for her own amusement while in high school assuming this was normal and never took her songwriting very seriously until much, much later. Acting and singing was taken seriously starting in middle school, through college, and into her adult years. Favorite roles during school included Kate Hardcastle in \"She Stoops to Conquor\"; Irene Malloy in \"The Matchmaker\", and Doc in \"Snow White and the Seven Dwarfs\". She was a member of the North Park University (Chicago) drama gospel team \"Illustrations\" for two years with a summer tour of Eastern and Mid-west states. After moving to Seattle, she took vocal coaching from Marianne Weltmann and sang one season with the Opus 7 Vocal Ensemble directed by Loren Pontén. Brenda's musical theatre roles have included Miss Minchin in \"A Little Princess\" at Bethany Community Church and productions on the Newport Covenant Church stage in \"Godspell\", \"The Sound of Music\", and \"Fiddler on the Roof\". In her adulthood, Brenda found that that seed of songwriting had grown deeper and the songs she best loved to write were for musicals. Brenda wrote two songs for the original youth musical \"High Flying Guitars\" with book by Wendy Wiley which was presented at Newport Covenant in 2008. She partnered with Kathleen Lyndon about 10 years ago to write \"A Time to Live\" which has had three readings and multiple revisions (with many songs relegated to 'the trunk'). In 2013, the song \"Wherever You Go\" from \"A Time to Live\" was selected to be presented at The First Act Feedback Fest in New York, which was sponsored by Theatre Resources Unlimited (TRU) and MusicalWriters.com. It received very favorable and constructive feedback from a panel of industry veterans, including a Tony winner. Brenda is delighted to see \"A Time to Live\" as a full production and is honored to have this as her directorial premier as well. For the software geeks reading this, Brenda is an experienced software product manager and is applying Agile development principles to the production process of \"A Time to Live\", complete with a Scrum Master (who doubles as Ahaz). Agile, as of this writing, appears to be working exceedingly well in the application of producing a musical!"
	    }],
	    actors: [{
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }, {
	      name: "Vanessa O'Francia",
	      photo: 'app/img/puppy2.jpg',
	      bio: 'Vanessa Ignacio O’Francia (Milcah) is a Seattle native and a woman after God’s own heart. She is absolutely honored to make her debut here with Newport Covenant Church. You may have seen Vanessa in some of her favorite theatre productions such as The Dream Girls (Lorrell Robinson), The Coming of the Messiah (Mother Mary), and The Snow Queen (Gerda) . As she pursues the arts Vanessa also balances her graduate studies at the UW School of Social Work and service as an Art/Mental Health Therapist. She would like to thank the staff for this wonderful opportunity, the love of her life for all of his support, and God for pushing her to be a “lion-hearted-lamb” Hebrews 10:35-36.'
	    }]
	  };
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var attlApp = angular.module('attlApp');
	var NewsService = __webpack_require__(12);

	module.exports = attlApp.controller('NewsController', ["$scope", "NewsService", function ($scope, NewsService) {
	  $scope.vm = {};
	  $scope.vm.news = NewsService.all;
	}]);

/***/ },
/* 12 */
/***/ function(module, exports) {

	var attlApp = angular.module('attlApp');

	attlApp.factory('NewsService', function () {
	  return {
	    all: [{
	      title: 'Example Title',
	      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
	      photo: null
	    }, {
	      title: 'Example Title',
	      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
	      photo: null
	    }, {
	      title: 'Example Title',
	      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
	      photo: null
	    }]
	  };
	});

/***/ }
]);