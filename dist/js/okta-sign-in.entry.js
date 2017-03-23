(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("handlebars/dist/handlebars"), require("jquery"), require("q"), require("@okta/okta-auth-js/jquery"), require("backbone"), require("qtip2"), require("jquery.cookie"), require("u2f-api-polyfill"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "handlebars", "jquery", "q", "@okta/okta-auth-js/jquery", "backbone", "qtip2", "jquery.cookie", "u2f-api-polyfill"], factory);
	else if(typeof exports === 'object')
		exports["OktaSignIn"] = factory(require("underscore"), require("handlebars/dist/handlebars"), require("jquery"), require("q"), require("@okta/okta-auth-js/jquery"), require("backbone"), require("qtip2"), require("jquery.cookie"), require("u2f-api-polyfill"));
	else
		root["OktaSignIn"] = factory(root["underscore"], root["handlebars"], root["jQuery"], root["q"], root["@okta/okta-auth-js/jquery"], root["backbone"], root["qtip2"], root["jquery.cookie"], root["u2f-api-polyfill"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_9__, __WEBPACK_EXTERNAL_MODULE_18__, __WEBPACK_EXTERNAL_MODULE_23__, __WEBPACK_EXTERNAL_MODULE_73__, __WEBPACK_EXTERNAL_MODULE_114__, __WEBPACK_EXTERNAL_MODULE_125__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*globals module */
	/*jshint unused:false, camelcase: false */

	var OktaSignIn = (function () {

	  var config  = __webpack_require__(1),
	      _ = __webpack_require__(2);

	  function getProperties(authClient, LoginRouter, Util, config) {

	    /**
	     * Check if a session exists
	     * @param callback - callback function invoked with 'true'/'false' as the argument.
	     */
	    function checkSession(callback) {
	      authClient.session.exists().then(callback);
	    }

	    /**
	     * Close the current session (sign-out). Callback is invoked with an error message
	     * if the operation was not successful.
	     * @param callback - function to invoke after closing the session.
	     */
	    function closeSession(callback) {
	      authClient.session.close().then(callback)
	      .fail(function () {
	        callback('There was a problem closing the session');
	      });
	    }

	    /**
	     * Keep-alive for the session. The callback is invoked with the object containing
	     * the session if successful and {status: 'INACTIVE'} if it is not successful.
	     * @param callback - function to invoke after refreshing the session.
	     */
	    function refreshSession(callback) {
	      authClient.session.refresh().then(callback)
	      .fail(function() {
	        callback({status: 'INACTIVE'});
	      });
	    }

	    /**
	     * Refresh the idToken
	     * @param idToken - idToken generated from the OAUTH call
	     * @param callback - function to invoke after refreshing the idToken.
	     *        The callback will be passed a new idToken if successful and
	     *        an error message if not.
	     * @param opts - OAUTH options to refresh the idToken
	     */
	    function refreshIdToken(idToken, callback, opts) {
	      authClient.idToken.refresh(opts).then(callback)
	      .fail(function () {
	        callback('There was a problem refreshing the id_token');
	      });
	    }

	    /**
	     * Check if there is an active session. If there is one, the callback is invoked with
	     * the session and user information (similar to calling the global success callback)
	     * and if not, the callback is invoked with {status: 'INACTIVE'}, at which point,
	     * the widget can be rendered using renderEl().
	     * @param callback - function to invoke after checking if there is an active session.
	     */
	    function getSession(callback) {
	      authClient.session.get()
	      .then(function(res) {
	        if (res.status === 'ACTIVE' && res.user) {
	          // only include the attributes that are passed into the successFn on primary auth.
	          res.user = _.pick(res.user, 'id', 'profile', 'passwordChanged');
	        }
	        callback(res);
	      });
	    }

	    /**
	     * Render the sign in widget to an element.
	     * @param options - options for the signin widget.
	     *        Must have an el or $el property to render the widget to.
	     * @param success - success callback function
	     * @param error - error callback function
	     */
	    function render(options, success, error) {
	      var router = new LoginRouter(_.extend({}, config, options, {
	        authClient: authClient,
	        globalSuccessFn: success,
	        globalErrorFn: error
	      }));
	      router.start();
	    }

	    /**
	     * Check if tokens have been passed back into the url, which happens in
	     * the social auth IDP redirect flow.
	     */
	    function hasTokensInUrl() {
	      return Util.hasTokensInHash(window.location.hash);
	    }

	    /**
	     * Parses tokens from the url.
	     * @param success - success callback function (usually the same as passed to render)
	     * @param error - error callback function (usually the same as passed to render)
	     */
	    function parseTokensFromUrl(success, error) {
	      authClient.token.parseFromUrl()
	      .then(success)
	      .fail(error);
	    }

	    // Properties exposed on OktaSignIn object.
	    return {
	      renderEl: render,
	      signOut: closeSession,
	      idToken: {
	        refresh: refreshIdToken
	      },
	      session: {
	        close: closeSession,
	        exists: checkSession,
	        get: getSession,
	        refresh: refreshSession
	      },
	      token: {
	        hasTokensInUrl: hasTokensInUrl,
	        parseTokensFromUrl: parseTokensFromUrl
	      },
	      tokenManager: authClient.tokenManager
	    };
	  }

	  function OktaSignIn(options) {
	    var OktaAuth, Util, authClient, LoginRouter;

	    // Modify the underscore, handlebars, and jquery modules
	    // Remove once these are explicitly required in Courage
	    __webpack_require__(3);
	    __webpack_require__(5);
	    __webpack_require__(17);

	    OktaAuth = __webpack_require__(18);
	    Util = __webpack_require__(19);
	    LoginRouter = __webpack_require__(81);

	    authClient = new OktaAuth({
	      url: options.baseUrl,
	      transformErrorXHR: Util.transformErrorXHR,
	      headers: {
	        'X-Okta-User-Agent-Extended': 'okta-signin-widget-' + config.version
	      },
	      clientId: options.clientId,
	      redirectUri: options.redirectUri
	    });
	    _.extend(this, LoginRouter.prototype.Events, getProperties(authClient, LoginRouter, Util, options));

	    // Triggers the event up the chain so it is available to the consumers of the widget.
	    this.listenTo(LoginRouter.prototype, 'all', this.trigger);

	  }

	  return OktaSignIn;

	})();

	module.exports = OktaSignIn;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {
		"version": "1.10.0",
		"supportedLanguages": [
			"en",
			"cs",
			"da",
			"de",
			"es",
			"fi",
			"fr",
			"hu",
			"id",
			"in",
			"it",
			"ja",
			"ko",
			"ms",
			"nl-NL",
			"pl",
			"pt-BR",
			"ro",
			"ru",
			"sv",
			"th",
			"uk",
			"zh-CN",
			"zh-TW"
		]
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function (underscore, Handlebars) {

	  var _ = underscore.noConflict();

	  _.mixin({

	    resultCtx: function (object, property, context, defaultValue) {
	      var value = _.isObject(object) ? object[property] : void 0;
	      if (_.isFunction(value)) {
	        value = value.call(context || object);
	      }
	      if (value) {
	        return value;
	      }
	      else {
	        return !_.isUndefined(defaultValue) ? defaultValue : value;
	      }
	    },

	    isInteger: function (x) {
	      return _.isNumber(x) && (x % 1 === 0);
	    },

	    template: function (source, data) {
	      var template = Handlebars.compile(source);
	      return data ? template(data) : function (data) { return template(data); };
	    }

	  });

	  return _;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(4),
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(7),
	  __webpack_require__(16),
	  __webpack_require__(16)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Handlebars, _, $, StringUtil, markdownToHtml, moment) {

	  var CACHE_BUST_URL_PREFIX = '/assets';

	  function formatDate(format, dateInISOString) {
	    return moment.utc(dateInISOString).zone('-07:00').format(format);
	  }

	  function trim(str) {
	    return str && str.replace(/^\s+|\s+$/g, '');
	  }

	  function prependCachebustPrefix(path) {
	    if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
	      return path;
	    }
	    return CACHE_BUST_URL_PREFIX + path;
	  }

	  Handlebars.registerHelper('i18n', function (options) {
	    var params,
	        key = trim(options.hash.code),
	        bundle = trim(options.hash.bundle),
	        args = trim(options.hash['arguments']);

	    if (args) {
	      params = _.map(trim(args).split(';'), function (param) {
	        param = trim(param);
	        var val,
	            data = this;
	        /*
	         * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
	         * arguments may be 'user.name'
	         * return data['user']['name']
	         */
	        _.each(param.split('.'), function (p) {
	          val = val ? val[p] : data[p];
	        });
	        return val;
	      }, this);
	    }

	    return StringUtil.localize(key, bundle, params);
	  });

	  Handlebars.registerHelper('xsrfTokenInput', function () {
	    return '<input type="hidden" class="hide" name="_xsrfToken" ' +
	           'value="' + $('#_xsrfToken').text() + '">';
	  });

	  Handlebars.registerHelper('img', function (options) {
	    /*global okta */
	    var cdn = (typeof okta != 'undefined' && okta.cdnUrlHostname || '');
	    var hash = _.pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);
	    hash.src = '' + cdn + prependCachebustPrefix(hash.src);
	    var attrs = _.map(hash, function (value, attr) {
	      return attr + '="' + _.escape(value) + '"';
	    });
	    return '<img ' + attrs.join(' ') + '/>';
	  });

	  Handlebars.registerHelper('shortDate',  _.partial(formatDate, 'MMM DD'));
	  Handlebars.registerHelper('mediumDate', _.partial(formatDate, 'MMMM DD, YYYY'));
	  Handlebars.registerHelper('longDate',   _.partial(formatDate, 'MMMM DD, YYYY, h:mma'));
	  Handlebars.registerHelper('formatDate', formatDate);


	  Handlebars.registerHelper('markdown', function (mdText) {
	    return markdownToHtml(Handlebars, mdText);
	  });

	  return Handlebars;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(8),
	  __webpack_require__(15)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, $, Bundles) {

	  /**
	   * @class StringUtil
	   * @private
	   *
	   * Handy utility functions to handle strings.
	   */

	  var entityMap = {
	    '&amp;': '&',
	    '&lt;': '<',
	    '&gt;': '>',
	    '&quot;': '"',
	    '&#39;': '\'',
	    '&#039;': '\'',
	    '&#x2F;': '/'
	  };

	  /* eslint max-len: 0*/
	  var emailValidator = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(?!-)((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	  var StringUtil = {
	    sprintf: function () {
	      /* eslint max-statements: [2, 11] */

	      var args = Array.prototype.slice.apply(arguments),
	          value = args.shift(),
	          oldValue = value;

	      function triggerError() {
	        throw new Error('Mismatch number of variables: ' + arguments[0] + ', ' + JSON.stringify(args));
	      }

	      for (var i = 0, l = args.length; i < l; i++) {
	        var entity = args[i];
	        value = value.replace('{' + i + '}', entity);
	        if (entity === undefined || entity === null || value === oldValue) {
	          triggerError();
	        }
	        oldValue = value;
	      }

	      if (/\{[\d+]\}/.test(value)) {
	        triggerError();
	      }

	      return value;
	    },

	    /**
	     * Converts a URI encoded query string into a hash map
	     *
	     * ### Example:
	     *
	     *  ```javascript
	     *  StringUtil.parseQuery('foo=bar&baz=qux') // {foo: 'bar', baz: 'qux'}
	     *
	     * ```
	     * @static
	     * @param  {String} query The query string
	     * @return {Object} The map
	     */
	    parseQuery: function (query) {
	      var params = {};
	      var pairs = decodeURIComponent(query.replace(/\+/g, ' ')).split('&');
	      for (var i = 0; i < pairs.length; i++) {
	        var pair = pairs[i];
	        var data = pair.split('=');
	        params[data.shift()] = data.join('=');
	      }
	      return params;
	    },

	    encodeJSObject: function (jsObj) {
	      return encodeURIComponent(JSON.stringify(jsObj));
	    },

	    decodeJSObject: function (jsObj) {
	      try {
	        return JSON.parse(decodeURIComponent(jsObj));
	      } catch (e) {
	        return null;
	      }
	    },

	    unescapeHtml: function (string) {
	      return String(string).replace(/&[\w\#\d]{2,};/g, function (s) {
	        return entityMap[s] || s;
	      });
	    },

	    /**
	     * Translate a key to the localized value
	     * @static
	     * @param  {String} key The key
	     * @param  {String} [bundle="messages"] The name of the i18n bundle. Defaults to the first bundle in the list.
	     * @param  {Array} [params] A list of parameters to apply as tokens to the i18n value
	     * @return {String} The localized value
	     */
	    localize: function (key, bundleName, params) {
	      var bundle = bundleName ? Bundles[bundleName] : Bundles[_.keys(Bundles)[0]];

	      if (!bundle) {
	        return 'L10N_ERROR[' + (bundleName) + ']';
	      }

	      var value = bundle[key];

	      try {
	        params = params && params.slice ? params.slice(0) : [];
	        params.unshift(value);
	        value = StringUtil.sprintf.apply(null, params);
	      }
	      catch (e) {
	        value = null;
	      }

	      return value || 'L10N_ERROR[' + key + ']';
	    },

	    /**
	    * Convert a string to a float if valid, otherwise return the string.
	    * Valid numbers may contain a negative sign and a decimal point.
	    * @static
	    * @param {String} string The string to convert to a number
	    * @return {String|Number} Returns a number if the string can be casted, otherwise returns the original string
	    */
	    parseFloat: function (string) {
	      var number = +string;
	      return typeof string == 'string' && number === parseFloat(string) ? number : string;
	    },

	    /**
	     * Returns a random string from [a-z][A-Z][0-9] of a given length
	     * @static
	     * @param {Number} length The length of the random string.
	     * @return {String} Returns a random string from [a-z][A-Z][0-9] of a given length
	     */
	    randomString: function (length) {
	      var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

	      if (length === undefined) {
	        length = _.random(characters.length); 
	      } else if (length === 0) {
	        return '';
	      }

	      var stringArray = [];
	      while (length--) {
	        stringArray.push(characters[_.random(characters.length)]);
	      }
	      return stringArray.join('');
	    },

	    /**
	     * Returns if a str ends with another string
	     * @static
	     * @param {String} str The string to search
	     * @param {String} ends The string it should end with
	     *
	     * @return {Boolean} Returns if the str ends with ends
	     */
	    endsWith: function (str, ends) {
	      str += '';
	      ends += '';
	      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;
	    },

	    isEmail: function (str) {
	      var target = $.trim(str);
	      return !_.isEmpty(target) && emailValidator.test(target);
	    }

	  };

	  return StringUtil;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint newcap:false */
	/*global JSON */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(9),
	  __webpack_require__(6),
	  __webpack_require__(10),
	  __webpack_require__(11),
	  __webpack_require__(12),
	  __webpack_require__(1),
	  __webpack_require__(14)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Q, $, login, country, Logger, config, BrowserFeatures) {

	  var STORAGE_KEY = 'osw.languages';

	  var bundlePathTpl = _.template('/labels/jsonp/{{bundle}}_{{languageCode}}.jsonp');

	  /**
	   * Converts options to our internal format, which distinguishes between
	   * login and country bundles.
	   *
	   * Example options.i18n passed in by the developer:
	   * {
	   *   'en': {
	   *     'needhelp': 'need help override',
	   *     'primaryauth.title': 'new sign in text',
	   *     'country.JP' = 'Japan, Japan'
	   *   }
	   * }
	   *
	   * Parsed:
	   * {
	   *  'en': {
	   *    'login': {
	   *      'needhelp': 'need help override',
	   *      'primaryauth.title': 'new sign in text',
	   *    },
	   *    'country': {
	   *      'JP': 'Japan, Japan'
	   *    }
	   *  }
	   * }
	   */
	  function parseOverrides(i18n) {
	    if (!i18n) {
	      return {};
	    }
	    return _.mapObject(i18n, function (props) {
	      var mapped = { login: {}, country: {} };
	      if (!_.isObject(props)) {
	        throw new Error('Invalid format for "i18n"');
	      }
	      _.each(props, function (val, key) {
	        var split = key.split(/^country\./);
	        if (split.length > 1) {
	          mapped.country[split[1]] = val;
	        }
	        else {
	          mapped.login[split[0]] = val;
	        }
	      });
	      return mapped;
	    });
	  }

	  // Caching: We only bundle English by default in the Sign-In Widget. Other
	  // languages are loaded on demand and cached in localStorage. These languages
	  // are tied to the version of the widget - when it bumps, we reset the cache.

	  function getCachedLanguages() {
	    var storage = JSON.parse(localStorage.getItem(STORAGE_KEY));
	    if (!storage || storage.version !== config.version) {
	      storage = {
	        version: config.version
	      };
	    }
	    return storage;
	  }

	  function addLanguageToCache(language, loginJson, countryJson) {
	    var current = getCachedLanguages();
	    current[language] = {
	      login: loginJson,
	      country: countryJson
	    };
	    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
	  }

	  // We use jsonp to get around any CORS issues if the developer is using
	  // the hosted version of the widget - by default, the assets.bundleUrl is
	  // tied to the Okta CDN.
	  //
	  // There are two overrides available for modifying where we load the asset
	  // bundles from:
	  //
	  // 1. assets.baseUrl
	  //
	  //    This is the base path the OSW pulls assets from, which in this case is
	  //    the Okta CDN. Override this config option if you want to host the
	  //    files on your own domain, or if you're using a new version of the
	  //    widget whose language files haven't been published to the CDN yet.
	  //
	  // 2. assets.rewrite
	  //
	  //    This is a function that can be used to modify the path + fileName of
	  //    the bundle we're loading, relative to the baseUrl. When called, it
	  //    will pass the current path, and expect the new path to be returned.
	  //    This is useful, for example, if your build process has an extra
	  //    cachebusting step, i.e:
	  //
	  //    function rewrite(file) {
	  //      // file: /labels/jsonp/login_ja.jsonp
	  //      return file.replace('.jsonp', '.' + md5file(file) + '.jsonp');
	  //    }
	  //
	  // Note: Most developers will not need to use these overrides - the default
	  // is to use the Okta CDN and to use the same path + file structure the
	  // widget module publishes by default.
	  function fetchJsonp(bundle, language, assets) {
	    var languageCode, path;

	    // Our bundles use _ to separate country and region, i.e:
	    // zh-CN -> zh_CN
	    languageCode = language.replace('-', '_');

	    path = assets.rewrite(bundlePathTpl({
	      bundle: bundle,
	      languageCode: languageCode
	    }));

	    return $.ajax({
	      url: assets.baseUrl + path,
	      dataType: 'jsonp',
	      cache: true,
	      // jQuery jsonp doesn't handle errors, so set a long timeout as a
	      // fallback option
	      timeout: 5000,
	      jsonpCallback: 'jsonp_' + bundle
	    });
	  }

	  function getBundles(language, assets) {
	    // Two special cases:
	    // 1. English is already bundled with the widget
	    // 2. If the language is not in our config file, it means that they've
	    //    probably defined it on their own.
	    if (language === 'en' || !_.contains(config.supportedLanguages, language)) {
	      return Q({});
	    }

	    //local storage does not work correctly with android web views (embeded browers)
	    //so skip the caching and just make the request to get the local info
	    var localStorageIsSupported = !BrowserFeatures.localStorageIsNotSupported();
	    if (localStorageIsSupported) {
	      var cached = getCachedLanguages();
	      if (cached[language]) {
	        return Q(cached[language]);
	      }
	    }

	    return Q.all([
	      fetchJsonp('login', language, assets),
	      fetchJsonp('country', language, assets)
	    ])
	    .spread(function (loginJson, countryJson) {
	      if (localStorageIsSupported) {
	        addLanguageToCache(language, loginJson, countryJson);
	      }
	      return { login: loginJson, country: countryJson };
	    })
	    .fail(function () {
	      // If there is an error, this will default to the bundled language and
	      // we will no longer try to load the language this session.
	      Logger.warn('Unable to load language: ' + language);
	      return {};
	    });
	  }

	  return {
	    login: login,
	    country: country,

	    currentLanguage: null,

	    isLoaded: function (language) {
	      return this.currentLanguage === language;
	    },

	    loadLanguage: function (language, overrides, assets) {
	      var parsedOverrides = parseOverrides(overrides);
	      return getBundles(language, assets)
	      .then(_.bind(function (bundles) {
	        // Always extend from the built in defaults in the event that some
	        // properties are not translated
	        this.login = _.extend({}, login, bundles.login);
	        this.country = _.extend({}, country, bundles.country);
	        if (parsedOverrides[language]) {
	          _.extend(this.login, parsedOverrides[language]['login']);
	          _.extend(this.country, parsedOverrides[language]['country']);
	        }
	        this.currentLanguage = language;
	      }, this));
	    }

	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = {
		"signout": "Sign Out",
		"remember": "Remember me",
		"rememberDevice": "Trust this device",
		"rememberDevice.timebased": "Do not challenge me on this device for the next {0}",
		"rememberDevice.devicebased": "Do not challenge me on this device again",
		"autoPush": "Send push automatically",
		"unlockaccount": "Unlock account?",
		"needhelp": "Need help signing in?",
		"goback": "Back to Sign In",
		"forgotpassword": "Forgot password?",
		"help": "Help",
		"minutes.oneMinute": "minute",
		"minutes": "{0} minutes",
		"hours": "{0} hours",
		"days": "{0} days",
		"error.config": "There was a configuration error",
		"error.required.authParams": "Missing parameters for the configured authentication scheme - \"OAUTH2\"",
		"error.required.baseUrl": "\"baseUrl\" is a required widget parameter",
		"error.required.success": "A success handler is required",
		"error.required.el": "\"el\" is a required widget parameter",
		"error.unsupported.browser": "Unsupported browser",
		"error.unsupported.cors": "Unsupported browser - missing CORS support",
		"error.unsupported.localStorage": "Unsupported browser - missing localStorage support",
		"error.enabled.cors": "There was an error sending the request - have you enabled CORS?",
		"error.expired.session": "Your session has expired. Please try to log in again.",
		"error.auth.lockedOut": "Your account is locked. Please contact your administrator.",
		"error.oauth.idToken": "There was a problem generating the id_token for the user. Please try again.",
		"error.network.connection": "Unable to connect to the server. Please check your network connection.",
		"errors.E0000004": "Sign in failed!",
		"errors.E0000069": "Your account was locked due to excessive MFA attempts.",
		"errors.E0000047": "You exceeded the maximum number of requests. Try again in a while.",
		"oform.next": "Next",
		"oform.verify": "Verify",
		"oform.send": "Send",
		"oform.back": "Back",
		"oform.save": "Save",
		"oform.cancel": "Cancel",
		"oform.edit": "Edit",
		"oform.previous": "Previous",
		"oform.errorbanner.title": "We found some errors. Please review the form and make corrections.",
		"oform.errormsg.title": "Please review the form to correct the following errors:",
		"oform.error.unexpected": "There was an unexpected internal error. Please try again.",
		"model.validation.field.blank": "The field cannot be left blank",
		"model.validation.field.wrong.type": "The field is of the wrong type",
		"model.validation.field.invalid": "The field has an invalid value",
		"model.validation.field.value.not.allowed": "The field value is not allowed",
		"model.validation.field.array.minItems": "The array does not have enough items",
		"model.validation.field.array.unique": "The array can only have unique values",
		"model.validation.field.username": "Please check your username",
		"factor.totpSoft.oktaVerify": "Okta Verify",
		"factor.totpSoft.googleAuthenticator": "Google Authenticator",
		"factor.totpSoft.description": "Enter single-use code from the mobile app.",
		"factor.totpHard.rsaSecurId": "RSA SecurID",
		"factor.totpHard.symantecVip": "Symantec VIP",
		"factor.totpHard.description": "Enter a single-use code from a hardware token.",
		"factor.totpHard.yubikey": "Yubikey",
		"factor.totpHard.yubikey.description": "Insert your Yubikey and tap it to get a verification code.",
		"factor.totpHard.yubikey.placeholder": "Click here, then tap your Yubikey",
		"factor.oktaVerifyPush": "Okta Verify",
		"factor.push.description": "Use a push notification sent to the mobile app.",
		"factor.duo": "Duo Security",
		"factor.duo.description": "Use Push Notification, SMS, or Voice call to authenticate.",
		"factor.sms": "SMS Authentication",
		"factor.sms.description": "Enter a single-use code sent to your mobile phone.",
		"factor.call": "Voice Call Authentication",
		"factor.call.description": "Use a phone to authenticate by following voice instructions.",
		"factor.securityQuestion": "Security Question",
		"factor.securityQuestion.description": "Use the answer to a security question to authenticate.",
		"factor.windowsHello": "Windows Hello",
		"factor.windowsHello.signin.description": "Sign in to Okta using Windows Hello.",
		"factor.u2f": "Security Key (U2F)",
		"factor.u2f.description": "Use a Universal 2nd Factor (U2F) security key to sign on to Okta.",
		"mfa.challenge.verify": "Verify",
		"mfa.challenge.answer.placeholder": "Answer",
		"mfa.challenge.answer.tooltip": "Answer",
		"mfa.challenge.answer.showAnswer": "Show",
		"mfa.challenge.answer.hideAnswer": "Hide",
		"mfa.challenge.enterCode.placeholder": "Enter Code",
		"mfa.challenge.enterCode.tooltip": "Enter Code",
		"mfa.backToFactors": "Back to factor list",
		"mfa.phoneNumber.placeholder": "Phone number",
		"mfa.phoneNumber.ext.placeholder": "Extension",
		"mfa.sendCode": "Send code",
		"mfa.sent": "Sent",
		"mfa.resendCode": "Re-send code",
		"mfa.call": "Call",
		"mfa.calling": "Calling",
		"mfa.redial": "Redial",
		"mfa.scanBarcode": "Scan barcode",
		"mfa.noAccessToEmail": "Can't access email",
		"password.reset": "Reset Password",
		"password.oldPassword.placeholder": "Old password",
		"password.oldPassword.tooltip": "Old password",
		"password.newPassword.placeholder": "New password",
		"password.newPassword.tooltip": "New password",
		"password.confirmPassword.placeholder": "Repeat password",
		"password.confirmPassword.tooltip": "Repeat password",
		"password.error.match": "New passwords must match",
		"recovery.sms.hint": "SMS can only be used if a mobile phone number has been configured.",
		"recovery.mobile.hint": "{0} can only be used if a mobile phone number has been configured.",
		"recovery.sms": "SMS",
		"recovery.call": "Voice Call",
		"recovery.smsOrCall": "SMS or Voice Call",
		"enroll.choices.title": "Set up multifactor authentication",
		"enroll.choices.description": "Your company requires multifactor authentication to add an additional layer of security when signing into your Okta account",
		"enroll.choices.optional": "You can configure any additional optional factor or click finish",
		"enroll.choices.list.setup": "Setup required",
		"enroll.choices.list.enrolled": "Enrolled factors",
		"enroll.choices.list.optional": "Additional optional factors",
		"enroll.choices.step": "{0} of {1}",
		"enroll.choices.setup": "Setup",
		"enroll.choices.submit.finish": "Finish",
		"enroll.choices.submit.configure": "Configure factor",
		"enroll.choices.submit.next": "Configure next factor",
		"enroll.securityQuestion.setup": "Setup secret question authentication",
		"security.disliked_food": "What is the food you least liked as a child?",
		"security.name_of_first_plush_toy": "What is the name of your first stuffed animal?",
		"security.first_award": "What did you earn your first medal or award for?",
		"security.favorite_security_question": "What is your favorite security question?",
		"security.favorite_toy": "What is the toy/stuffed animal you liked the most as a kid?",
		"security.first_computer_game": "What was the first computer game you played?",
		"security.favorite_movie_quote": "What is your favorite movie quote?",
		"security.first_sports_team_mascot": "What was the mascot of the first sports team you played on?",
		"security.first_music_purchase": "What music album or song did you first purchase?",
		"security.favorite_art_piece": "What is your favorite piece of art?",
		"security.grandmother_favorite_desert": "What was your grandmother's favorite dessert?",
		"security.first_thing_cooked": "What was the first thing you learned to cook?",
		"security.childhood_dream_job": "What was your dream job as a child?",
		"security.first_kiss_location": "Where did you have your first kiss?",
		"security.place_where_significant_other_was_met": "Where did you meet your spouse/significant other?",
		"security.favorite_vacation_location": "Where did you go for your favorite vacation?",
		"security.new_years_two_thousand": "Where were you on New Year's Eve in the year 2000?",
		"security.favorite_speaker_actor": "Who is your favorite speaker/orator?",
		"security.favorite_book_movie_character": "Who is your favorite book/movie character?",
		"security.favorite_sports_player": "Who is your favorite sports player?",
		"enroll.sms.setup": "Receive a code via SMS to authenticate",
		"enroll.call.setup": "Follow phone call instructions to authenticate",
		"enroll.onprem.username.placeholder": "Enter {0} username",
		"enroll.onprem.username.tooltip": "Enter {0} username",
		"enroll.onprem.passcode.placeholder": "Enter {0} passcode",
		"enroll.onprem.passcode.tooltip": "Enter {0} passcode",
		"enroll.symantecVip.subtitle": "Enter Credential ID and two consecutive generated codes",
		"enroll.symantecVip.credentialId.placeholder": "Enter credential ID",
		"enroll.symantecVip.credentialId.tooltip": "Enter credential ID",
		"enroll.symantecVip.passcode1.placeholder": "Security code 1",
		"enroll.symantecVip.passcode1.tooltip": "Security code 1",
		"enroll.symantecVip.passcode2.placeholder": "Security code 2",
		"enroll.symantecVip.passcode2.tooltip": "Security code 2",
		"enroll.yubikey.title": "Setup Yubikey",
		"enroll.yubikey.subtitle": "Insert your Yubikey into a USB port and tap it to generate a verification code",
		"enroll.totp.title": "Setup {0}",
		"enroll.totp.selectDevice": "Select your device type",
		"enroll.totp.downloadApp": "Download <a href=\"{0}\" class=\"inline-link\">{1} from the {2}</a> onto your mobile device.",
		"enroll.totp.installApp": "Install {0}",
		"enroll.duo.title": "Setup Duo Security",
		"enroll.windowsHello.title": "Enroll Windows Hello",
		"enroll.windowsHello.subtitle": "Click below to enroll Windows Hello as a second form of authentication",
		"enroll.windowsHello.subtitle.loading": "Please wait while Windows Hello is loading...",
		"enroll.windowsHello.save": "Enroll Windows Hello",
		"enroll.windowsHello.error.notWindows": "Windows Hello can only be used on Windows Edge with Windows 10. Contact your admin for assistance.",
		"enroll.windowsHello.error.notConfiguredHtml": "Windows Hello is not configured. Select the <b>Start</b> button, then select <b>Settings</b> &gt; <b>Accounts</b> &gt; <b>Sign-in</b> to configure Windows Hello.",
		"verify.windowsHello.subtitle": "Verify your identity with Windows Hello",
		"verify.windowsHello.subtitle.loading": "Please wait while Windows Hello is loading...",
		"verify.windowsHello.subtitle.signingIn": "Signing into Okta...",
		"verify.windowsHello.save": "Verify with Windows Hello",
		"verify.windowsHello.error.notFound": "Your Windows Hello enrollment does not match our records. Contact your administrator for assistance.",
		"verify.windowsHello.error.notFound.selectAnother": "Your Windows Hello enrollment does not match our records. Select another factor or contact your administrator for assistance.",
		"enroll.u2f.title": "Setup Security Key (U2F)",
		"enroll.u2f.save": "Register Security Key",
		"enroll.u2f.general1": "If using Firefox download and install the U2F browser extension.",
		"enroll.u2f.general2": "Make sure you have a Security Key. If already inserted, remove it now.<br>If you have a Bluetooth Security Key, turn on your computer's Bluetooth.",
		"enroll.u2f.general3": "Click the button below to register",
		"enroll.u2f.instructions": "Insert your Security Key into a USB port on this computer. If it has a button or gold disk, tap it.",
		"enroll.u2f.instructionsBluetooth": "If you are using a Bluetooth Security Key, press the button.",
		"u2f.error.notSupportedBrowser": "The Security Key is only supported for Chrome or Firefox browsers. Select another factor or contact your admin for assistance.",
		"u2f.error.notSupportedBrowser.oneFactor": "The Security Key is only supported for Chrome or Firefox browsers. Contact your admin for assistance.",
		"u2f.error.noFirefoxExtension": "<a target=\"_blank\" href=\"https://addons.mozilla.org/en-US/firefox/addon/u2f-support-add-on/\">Download</a> and install the Firefox U2F browser extension before proceeding. You may be required to restart your browser after installation.",
		"u2f.error.other": "An unknown error has occured. Try again or select another factor.",
		"u2f.error.other.oneFactor": "An unknown error has occured. Try again or contact your admin for assistance.",
		"u2f.error.badRequest": "There was an error with the U2F request. Try again or select another factor.",
		"u2f.error.badRequest.oneFactor": "There was an error with the U2F request. Try again or contact your admin for assistance.",
		"u2f.error.unsupported": "The security key is unsupported. Select another factor.",
		"u2f.error.unsupported.oneFactor": "The security key is unsupported. Contact your admin for assistance.",
		"u2f.error.timeout": "You have timed out of the authentication period. Please try again.",
		"verify.u2f.instructions": "Insert your Security Key. If it has a button or gold disk, tap it.",
		"verify.u2f.instructionsBluetooth": "If you are using a Bluetooth Security Key, turn on your computer's Bluetooth and press the button.",
		"verify.u2f.retry": "Retry",
		"enroll.totp.enterCode": "Enter code displayed from the application",
		"enroll.totp.setupApp": "Launch {0} application on your mobile device and select Add an account.",
		"enroll.totp.setupGoogleAuthApp": "Launch {0}, tap the \"+\" icon, then select \"Scan barcode\".",
		"enroll.totp.cannotScan": "Can't scan?",
		"enroll.totp.refreshBarcode": "Refresh code",
		"enroll.totp.cannotScanBarcode": "Can't scan barcode?",
		"enroll.totp.manualSetupInstructions": "To set up manually enter your Okta Account username and then input the following in the Secret Key Field",
		"enroll.totp.sharedSecretInstructions": "Enter your Okta Account username and enter the following in the Secret Key Field",
		"enroll.totp.sendSms": "Send activation link via SMS",
		"enroll.totp.sendEmail": "Send activation link via email",
		"enroll.totp.setupManually": "Setup manually without push notification",
		"enroll.totp.enrollViaEmail.title": "Activation email sent!",
		"enroll.totp.enrollViaEmail.msg": "Open the email from your mobile device.",
		"enroll.totp.enrollViaSms.title": "SMS sent!",
		"enroll.totp.enrollViaSms.msg": "View the SMS on your mobile device.",
		"recoveryChallenge.sms.title": "Enter verification code sent via SMS",
		"recoveryChallenge.call.title": "Enter verification code received via Voice Call",
		"mfa.factors.dropdown.title": "Select an authentication factor",
		"mfa.duoSecurity.push": "Push — {0}",
		"mfa.duoSecurity.sms": "SMS — {0}",
		"mfa.duoSecurity.call": "Call — {0}",
		"mfa.challenge.title": "Enter your {0} passcode",
		"mfa.challenge.orEnterCode": "Or enter code",
		"oktaverify.send": "Send Push",
		"oktaverify.sent": "Push sent!",
		"oktaverify.rejected": "You have chosen to reject this login.",
		"oktaverify.timeout": "Your push notification has expired.",
		"primaryauth.title": "Sign In",
		"primaryauth.username.placeholder": "Username",
		"primaryauth.username.tooltip": "Username",
		"primaryauth.password.placeholder": "Password",
		"primaryauth.password.tooltip": "Password",
		"primaryauth.submit": "Sign In",
		"primaryauth.newUser.tooltip": "This is the first time you are connecting to {0} from this browser",
		"primaryauth.newUser.tooltip.close": "Close",
		"password.forgot.email.or.username.placeholder": "Email or Username",
		"password.forgot.email.or.username.tooltip": "Email or Username",
		"password.forgot.sendText": "Reset via SMS",
		"password.forgot.sendEmail": "Reset via Email",
		"password.forgot.call": "Reset via Voice Call",
		"password.forgot.emailSent.title": "Email sent!",
		"password.forgot.emailSent.desc": "Email has been sent to {0} with instructions on resetting your password.",
		"password.forgot.question.title": "Answer Forgotten Password Challenge",
		"password.forgot.question.submit": "Reset Password",
		"password.forgot.sms.notReceived": "Didn't receive an SMS? Reset via email",
		"password.forgot.code.notReceived": "Didn't receive a code? Reset via email",
		"password.reset.title": "Reset your Okta password",
		"password.complexity.description": "Your password must have {0}.",
		"password.complexity.length": "at least {0} characters",
		"password.complexity.list.element": ", {0}",
		"password.complexity.lowercase": "a lowercase letter",
		"password.complexity.uppercase": "an uppercase letter",
		"password.complexity.number": "a number",
		"password.complexity.symbol": "a symbol",
		"password.complexity.no_username": "no parts of your username",
		"password.expired.submit": "Change Password",
		"password.expired.title": "Your Okta password has expired",
		"password.expiring.later": "Remind me later",
		"password.expiring.title": "Your password will expire in {0} days",
		"password.expiring.today": "Your password will expire later today",
		"password.expiring.subtitle": "When password expires you may be locked out of Okta Mobile, mobile email, and other services.",
		"password.expired.custom.submit": "Go to {0}",
		"password.expired.custom.subtitle": "This password is set on another website. Click the button below to go there and set a new password.",
		"account.unlock.title": "Unlock account",
		"account.unlock.email.or.username.placeholder": "Email or username",
		"account.unlock.email.or.username.tooltip": "Email or username",
		"account.unlock.sendText": "Send SMS",
		"account.unlock.sendEmail": "Send Email",
		"account.unlock.emailSent.title": "Email sent!",
		"account.unlock.emailSent.desc": "Email has been sent to {0} with instructions on unlocking your account.",
		"account.unlock.question.title": "Answer Unlock Account Challenge",
		"account.unlock.question.submit": "Unlock Account",
		"account.unlock.unlocked.title": "Account successfully unlocked!",
		"account.unlock.unlocked.desc": "You can log in using your existing username and password.",
		"account.unlock.sms.notReceived": "Didn't receive an SMS? Unlock via email",
		"contact.support": "If you didn't provide a secondary email address or don't have access to email, please contact your administrator at {0}",
		"socialauth.divider.text": "OR",
		"socialauth.facebook.label": "Sign in with Facebook",
		"socialauth.google.label": "Sign in with Google",
		"socialauth.linkedin.label": "Sign in with LinkedIn",
		"socialauth.microsoft.label": "Sign in with Microsoft",
		"socialauth.popup.title": "External Identity Provider User Authentication",
		"unsupported.oneDrive.title": "Your OneDrive version is not supported",
		"unsupported.oneDrive.desc": "Upgrade now by installing the OneDrive for Business Next Generation Sync Client to login to Okta",
		"unsupported.oneDrive.action": "Learn how to upgrade"
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = {
		"AF": "Afghanistan",
		"AX": "Åland Islands",
		"AL": "Albania",
		"DZ": "Algeria",
		"AS": "American Samoa",
		"AD": "Andorra",
		"AO": "Angola",
		"AI": "Anguilla",
		"AQ": "Antarctica",
		"AG": "Antigua and Barbuda",
		"AR": "Argentina",
		"AM": "Armenia",
		"AW": "Aruba",
		"AU": "Australia",
		"AT": "Austria",
		"AZ": "Azerbaijan",
		"BS": "Bahamas",
		"BH": "Bahrain",
		"BD": "Bangladesh",
		"BB": "Barbados",
		"BY": "Belarus",
		"BE": "Belgium",
		"BZ": "Belize",
		"BJ": "Benin",
		"BM": "Bermuda",
		"BT": "Bhutan",
		"BO": "Bolivia, Plurinational State of",
		"BA": "Bosnia and Herzegovina",
		"BW": "Botswana",
		"BV": "Bouvet Island",
		"BR": "Brazil",
		"IO": "British Indian Ocean Territory",
		"VG": "Virgin Islands, British",
		"BN": "Brunei Darussalam",
		"BG": "Bulgaria",
		"BF": "Burkina Faso",
		"BI": "Burundi",
		"KH": "Cambodia",
		"CM": "Cameroon",
		"CA": "Canada",
		"CV": "Cape Verde",
		"KY": "Cayman Islands",
		"CF": "Central African Republic",
		"TD": "Chad",
		"CL": "Chile",
		"CN": "China",
		"CX": "Christmas Island",
		"CO": "Colombia",
		"KM": "Comoros",
		"CG": "Congo",
		"CK": "Cook Islands",
		"CR": "Costa Rica",
		"CI": "Côte d'Ivoire",
		"HR": "Croatia",
		"CU": "Cuba",
		"CY": "Cyprus",
		"CZ": "Czech Republic",
		"CD": "Congo, the Democratic Republic of the",
		"DK": "Denmark",
		"DJ": "Djibouti",
		"DM": "Dominica",
		"DO": "Dominican Republic",
		"TL": "Timor-Leste",
		"EC": "Ecuador",
		"EG": "Egypt",
		"SV": "El Salvador",
		"GQ": "Equatorial Guinea",
		"ER": "Eritrea",
		"EE": "Estonia",
		"ET": "Ethiopia",
		"FK": "Falkland Islands (Malvinas)",
		"FO": "Faroe Islands",
		"FJ": "Fiji",
		"FI": "Finland",
		"FR": "France",
		"GF": "French Guiana",
		"PF": "French Polynesia",
		"TF": "French Southern Territories",
		"GA": "Gabon",
		"GM": "Gambia",
		"GE": "Georgia",
		"DE": "Germany",
		"GH": "Ghana",
		"GI": "Gibraltar",
		"GR": "Greece",
		"GL": "Greenland",
		"GD": "Grenada",
		"GP": "Guadeloupe",
		"GU": "Guam",
		"GT": "Guatemala",
		"GG": "Guernsey",
		"GN": "Guinea",
		"GW": "Guinea-Bissau",
		"GY": "Guyana",
		"HT": "Haiti",
		"HM": "Heard Island and McDonald Islands",
		"HN": "Honduras",
		"HK": "Hong Kong",
		"HU": "Hungary",
		"IS": "Iceland",
		"IN": "India",
		"ID": "Indonesia",
		"IR": "Iran, Islamic Republic of",
		"IQ": "Iraq",
		"IE": "Ireland",
		"IL": "Israel",
		"IT": "Italy",
		"JM": "Jamaica",
		"JP": "Japan",
		"JE": "Jersey",
		"JO": "Jordan",
		"KZ": "Kazakhstan",
		"KE": "Kenya",
		"KI": "Kiribati",
		"KR": "Korea, Republic of",
		"KW": "Kuwait",
		"KG": "Kyrgyzstan",
		"LA": "Lao People's Democratic Republic",
		"LV": "Latvia",
		"LB": "Lebanon",
		"LS": "Lesotho",
		"LR": "Liberia",
		"LY": "Libya",
		"LI": "Liechtenstein",
		"LT": "Lithuania",
		"LU": "Luxembourg",
		"MO": "Macao",
		"MK": "Macedonia, the former Yugoslav Republic of",
		"MG": "Madagascar",
		"MW": "Malawi",
		"MY": "Malaysia",
		"MV": "Maldives",
		"ML": "Mali",
		"MT": "Malta",
		"MH": "Marshall Islands",
		"MQ": "Martinique",
		"MR": "Mauritania",
		"MU": "Mauritius",
		"YT": "Mayotte",
		"MX": "Mexico",
		"FM": "Micronesia, Federated States of",
		"MD": "Moldova, Republic of",
		"MC": "Monaco",
		"MN": "Mongolia",
		"ME": "Montenegro",
		"MS": "Montserrat",
		"MA": "Morocco",
		"MZ": "Mozambique",
		"MM": "Myanmar",
		"NA": "Namibia",
		"NR": "Nauru",
		"NP": "Nepal",
		"NL": "Netherlands",
		"AN": "Netherlands Antilles",
		"NC": "New Caledonia",
		"NZ": "New Zealand",
		"NI": "Nicaragua",
		"NE": "Niger",
		"NG": "Nigeria",
		"NU": "Niue",
		"NF": "Norfolk Island",
		"KP": "Korea, Democratic People's Republic of",
		"MP": "Northern Mariana Islands",
		"NO": "Norway",
		"OM": "Oman",
		"PK": "Pakistan",
		"PW": "Palau",
		"PS": "Palestine, State of",
		"PA": "Panama",
		"PG": "Papua New Guinea",
		"PY": "Paraguay",
		"PE": "Peru",
		"PH": "Philippines",
		"PN": "Pitcairn",
		"PL": "Poland",
		"PT": "Portugal",
		"PR": "Puerto Rico",
		"QA": "Qatar",
		"RE": "Réunion",
		"RO": "Romania",
		"RU": "Russian Federation",
		"RW": "Rwanda",
		"SH": "Saint Helena, Ascension and Tristan da Cunha",
		"KN": "Saint Kitts and Nevis",
		"LC": "Saint Lucia",
		"PM": "Saint Pierre and Miquelon",
		"VC": "Saint Vincent and the Grenadines",
		"WS": "Samoa",
		"SM": "San Marino",
		"ST": "São Tomé and Príncipe",
		"SA": "Saudi Arabia",
		"SN": "Senegal",
		"RS": "Serbia",
		"SC": "Seychelles",
		"SL": "Sierra Leone",
		"SG": "Singapore",
		"SK": "Slovakia",
		"SI": "Slovenia",
		"SB": "Solomon Islands",
		"SO": "Somalia",
		"ZA": "South Africa",
		"GS": "South Georgia and the South Sandwich Islands",
		"SS": "South Sudan",
		"ES": "Spain",
		"LK": "Sri Lanka",
		"SD": "Sudan",
		"SR": "Suriname",
		"SJ": "Svalbard and Jan Mayen",
		"SZ": "Swaziland",
		"SE": "Sweden",
		"CH": "Switzerland",
		"SY": "Syrian Arab Republic",
		"TW": "Taiwan",
		"TJ": "Tajikistan",
		"TZ": "Tanzania, United Republic of",
		"TH": "Thailand",
		"TG": "Togo",
		"TK": "Tokelau",
		"TO": "Tonga",
		"TT": "Trinidad and Tobago",
		"TN": "Tunisia",
		"TR": "Turkey",
		"TM": "Turkmenistan",
		"TC": "Turks and Caicos Islands",
		"TV": "Tuvalu",
		"VI": "Virgin Islands, U.S.",
		"UG": "Uganda",
		"UA": "Ukraine",
		"AE": "United Arab Emirates",
		"GB": "United Kingdom",
		"US": "United States",
		"UM": "United States Minor Outlying Islands",
		"UY": "Uruguay",
		"UZ": "Uzbekistan",
		"VU": "Vanuatu",
		"VA": "Holy See (Vatican City State)",
		"VE": "Venezuela, Bolivarian Republic of",
		"VN": "Viet Nam",
		"WF": "Wallis and Futuna",
		"EH": "Western Sahara",
		"YE": "Yemen",
		"ZM": "Zambia",
		"ZW": "Zimbabwe"
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	// Note: The reason to create a separate logger (instead of placing these
	// functions in util/Util) is because this is used in places like Bundles that
	// need to be loaded before Okta is defined.
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(13)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Logger) {

	  return _.extend(Logger, {

	    deprecate: function (msg) {
	      Logger.warn('[okta-signin-widget] DEPRECATED:', msg);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {

	  function log(level, args) {
	    if (window.console) {
	      window.console[level].apply(window.console, args);
	    }
	  }

	  /**
	   * @class Okta.Logger
	   * See [window.console](https://developer.mozilla.org/en-US/docs/Web/API/Console)
	   */
	  return {
	    /**
	     * @static
	     * See: [console.trace](https://developer.mozilla.org/en-US/docs/Web/API/Console.trace)
	     */
	    trace: function () {
	      return log('trace', arguments);
	    },
	    /**
	     * @static
	     * See: [console.dir](https://developer.mozilla.org/en-US/docs/Web/API/Console.dir)
	     */
	    dir: function () {
	      return log('dir', arguments);
	    },
	    /**
	     * @static
	     * See: [console.time](https://developer.mozilla.org/en-US/docs/Web/API/Console.time)
	     */
	    time: function () {
	      return log('time', arguments);
	    },
	    /**
	     * @static
	     * See: [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.timeEnd)
	     */
	    timeEnd: function () {
	      return log('timeEnd', arguments);
	    },
	    /**
	     * @static
	     * See: [console.group](https://developer.mozilla.org/en-US/docs/Web/API/Console.group)
	     */
	    group: function () {
	      return log('group', arguments);
	    },
	    /**
	     * @static
	     * See: [console.groupEnd](https://developer.mozilla.org/en-US/docs/Web/API/Console.groupEnd)
	     */
	    groupEnd: function () {
	      return log('groupEnd', arguments);
	    },
	    /**
	     * @static
	     * See: [console.assert](https://developer.mozilla.org/en-US/docs/Web/API/Console.assert)
	     */
	    assert: function () {
	      return log('assert', arguments);
	    },
	    /**
	     * @static
	     * See: [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console.log)
	     */
	    log: function () {
	      return log('log', arguments);
	    },
	    /**
	     * @static
	     * See: [console.info](https://developer.mozilla.org/en-US/docs/Web/API/Console.info)
	     */
	    info: function () {
	      return log('info', arguments);
	    },
	    /**
	     * @static
	     * See: [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console.warn)
	     */
	    warn: function () {
	      return log('warn', arguments);
	    },
	    /**
	     * @static
	     * See: [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console.error)
	     */
	    error: function () {
	      return log('error', arguments);
	    }
	  };
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {

	  var fn = {},
	      hasFullCorsSupport = 'withCredentials' in new window.XMLHttpRequest(),
	      hasXDomainRequest = typeof XDomainRequest !== 'undefined';

	  fn.corsIsNotSupported = function () {
	    return !(hasFullCorsSupport || hasXDomainRequest);
	  };

	  fn.corsIsNotEnabled = function (jqXhr) {
	    // Not a definitive check, but it's the best we've got.
	    // Note: This will change when OktaAuth is updated
	    return jqXhr.status === 0;
	  };

	  // This is currently not being used, but we'll keep it around for when we
	  // want a fallback mechanism - i.e. use localStorage if it exists, else fall
	  // back to cookies.
	  fn.localStorageIsNotSupported = function () {
	    var test = 'test';
	    try {
	        localStorage.setItem(test, test);
	        localStorage.removeItem(test);
	        return false;
	    } catch(e) {
	        return true;
	    }
	  };

	  fn.supportsPushState = function (win) {
	    win = win || window;
	    return !!(win.history && win.history.pushState);
	  };

	  fn.isIE = function () {
	    return /(msie|trident)/i.test(navigator.userAgent);
	  };

	  fn.isFirefox = function () {
	    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	  };

	  // Returns a list of languages the user has configured for their browser, in
	  // order of preference.
	  fn.getUserLanguages = function () {
	    var languages, properties;

	    // Chrome, Firefox
	    if (navigator.languages) {
	      return navigator.languages;
	    }

	    languages = [];
	    properties = [
	      'language',         // Safari, IE11
	      'userLanguage',     // IE
	      'browserLanguage',  // IE
	      'systemLanguage'    // IE
	    ];

	    _.each(properties, function (property) {
	      if (navigator[property]) {
	        languages.push(navigator[property]);
	      }
	    });

	    return languages;
	  };

	  return fn;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 15 */
/***/ function(module, exports) {

	/*
	    json2.js
	    2012-10-08

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    See http://www.JSON.org/js.html


	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.


	    This file creates a global JSON object containing two methods: stringify
	    and parse.

	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.

	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.

	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as '\t' or '&nbsp;'),
	                        it contains the characters used to indent at each level.

	            This method produces a JSON text from a JavaScript value.

	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value

	            For example, this would serialize Dates as ISO strings.

	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? '0' + n : n;
	                    }

	                    return this.getUTCFullYear()   + '-' +
	                         f(this.getUTCMonth() + 1) + '-' +
	                         f(this.getUTCDate())      + 'T' +
	                         f(this.getUTCHours())     + ':' +
	                         f(this.getUTCMinutes())   + ':' +
	                         f(this.getUTCSeconds())   + 'Z';
	                };

	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.

	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.

	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.

	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.

	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.

	            Example:

	            text = JSON.stringify(['e', {pluribus: 'unum'}]);
	            // text is '["e",{"pluribus":"unum"}]'


	            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
	            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    'Date(' + this[key] + ')' : value;
	            });
	            // text is '["Date(---current time---)"]'


	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = JSON.parse(text, function (key, value) {
	                var a;
	                if (typeof value === 'string') {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
	                var d;
	                if (typeof value === 'string' &&
	                        value.slice(0, 5) === 'Date(' &&
	                        value.slice(-1) === ')') {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });


	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/

	/*jslint evil: true, regexp: true */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	    lastIndex, length, parse, prototype, push, replace, slice, stringify,
	    test, toJSON, toString, valueOf
	*/


	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.

	if (typeof JSON !== 'object') {
	    JSON = {};
	}

	(function () {
	    'use strict';

	    function f(n) {
	        // Format integers to have at least two digits.
	        return n < 10 ? '0' + n : n;
	    }

	    if (typeof Date.prototype.toJSON !== 'function') {

	        Date.prototype.toJSON = function (key) {

	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear()     + '-' +
	                    f(this.getUTCMonth() + 1) + '-' +
	                    f(this.getUTCDate())      + 'T' +
	                    f(this.getUTCHours())     + ':' +
	                    f(this.getUTCMinutes())   + ':' +
	                    f(this.getUTCSeconds())   + 'Z'
	                : null;
	        };

	        String.prototype.toJSON      =
	            Number.prototype.toJSON  =
	            Boolean.prototype.toJSON = function (key) {
	                return this.valueOf();
	            };
	    }

	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;


	    function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string'
	                ? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }


	    function str(key, holder) {

	// Produce a string from holder[key].

	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];

	// If the value has a toJSON method, call it to obtain a replacement value.

	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }

	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.

	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }

	// What happens next depends on the value's type.

	        switch (typeof value) {
	        case 'string':
	            return quote(value);

	        case 'number':

	// JSON numbers must be finite. Encode non-finite numbers as null.

	            return isFinite(value) ? String(value) : 'null';

	        case 'boolean':
	        case 'null':

	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.

	            return String(value);

	// If the type is 'object', we might be dealing with an object or an array or
	// null.

	        case 'object':

	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.

	            if (!value) {
	                return 'null';
	            }

	// Make an array to hold the partial results of stringifying this object value.

	            gap += indent;
	            partial = [];

	// Is the value an array?

	            if (Object.prototype.toString.apply(value) === '[object Array]') {

	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.

	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }

	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.

	                v = partial.length === 0
	                    ? '[]'
	                    : gap
	                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }

	// If the replacer is an array, use it to select the members to be stringified.

	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {

	// Otherwise, iterate through all of the keys in the object.

	                for (k in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }

	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.

	            v = partial.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }

	// If the JSON object does not yet have a stringify method, give it one.

	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = function (value, replacer, space) {

	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.

	            var i;
	            gap = '';
	            indent = '';

	// If the space parameter is a number, make an indent string containing that
	// many spaces.

	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }

	// If the space parameter is a string, it will be used as the indent string.

	            } else if (typeof space === 'string') {
	                indent = space;
	            }

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.

	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                    typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }

	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.

	            return str('', {'': value});
	        };
	    }


	// If the JSON object does not yet have a parse method, give it one.

	    if (typeof JSON.parse !== 'function') {
	        JSON.parse = function (text, reviver) {

	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.

	            var j;

	            function walk(holder, key) {

	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.

	                var k, v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            if (v !== undefined) {
	                                value[k] = v;
	                            } else {
	                                delete value[k];
	                            }
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }


	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.

	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return '\\u' +
	                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }

	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with '()' and 'new'
	// because they can cause invocation, and '=' because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.

	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	// replace all simple value tokens with ']' characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or ']' or
	// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

	            if (/^[\],:{}\s]*$/
	                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.

	                j = eval('(' + text + ')');

	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.

	                return typeof reviver === 'function'
	                    ? walk({'': j}, '')
	                    : j;
	            }

	// If the text is not JSON parseable, then a SyntaxError is thrown.

	            throw new SyntaxError('JSON.parse');
	        };
	    }
	}());


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6), __webpack_require__(15)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
	  $(function () {
	    $.ajaxSetup({
	      headers: {
	        'X-Okta-XsrfToken': $('#_xsrfToken').text()
	      },
	      converters : {
	        'text secureJSON' : function (str) {
	          if (str.substring(0, 11) === 'while(1){};') {
	            str = str.substring(11);
	          }
	          return JSON.parse(str);
	        }
	      }
	    });
	  });
	  // Selenium Hook
	  // Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
	  // We have 2 versions of jQuery running in parallel and they don't share the same events bus
	  window.jQueryCourage = $;
	  return $;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_18__;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*global JSON */
	/*jshint maxcomplexity:8 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  var Util = {};
	  var _ = Okta._;

	  Util.hasTokensInHash = function (hash) {
	    return /((id|access)_token=)/i.test(hash);
	  };

	  Util.transformErrorXHR = function (xhr) {
	    // Handle network connection error
	    if (xhr.status === 0 && _.isEmpty(xhr.responseJSON)) {
	      xhr.responseJSON = { errorSummary: Okta.loc('error.network.connection', 'login') };
	      return xhr;
	    }
	    if (!xhr.responseJSON) {
	      try {
	        xhr.responseJSON = JSON.parse(xhr.responseText);
	      } catch (parseException) {
	        xhr.responseJSON = { errorSummary: Okta.loc('oform.error.unexpected', 'login') };
	        return xhr;
	      }
	    }
	    // Temporary solution to display field errors
	    // Assuming there is only one field error in a response
	    if (xhr.responseJSON && xhr.responseJSON.errorCauses && xhr.responseJSON.errorCauses.length) {
	      xhr.responseJSON.errorSummary = xhr.responseJSON.errorCauses[0].errorSummary;
	    }
	    // Replace error messages
	    if (!_.isEmpty(xhr.responseJSON)) {
	      var errorMsg = Okta.loc('errors.' + xhr.responseJSON.errorCode, 'login');
	      if (errorMsg.indexOf('L10N_ERROR[') === -1) {
	        xhr.responseJSON.errorSummary = errorMsg;
	      }
	    }
	    return xhr;
	  };

	  // Simple helper function to lowercase all strings in the given array
	  Util.toLower = function (strings) {
	    return _.map(strings, function (str) {
	      return str.toLowerCase();
	    });
	  };

	  // A languageCode can be composed of multiple parts, i.e:
	  // {{langage}}-{{region}}-{{dialect}}
	  //
	  // In these cases, it's necessary to generate a list of other possible
	  // combinations that we might support (in preferred order).
	  //
	  // For example:
	  // en-US -> [en-US, en]
	  // de-DE-bavarian -> [de-DE-bavarian, de-DE, de]
	  function expandLanguage(language) {
	    var expanded = [language],
	        parts = language.split('-');
	    while (parts.pop() && parts.length > 0) {
	      expanded.push(parts.join('-'));
	    }
	    return expanded;
	  }

	  // Following the rules of expanding one language, this will generate
	  // all potential languages in the given order (where higher priority is
	  // given to expanded languages over other downstream languages).
	  Util.expandLanguages = function (languages) {
	    return _.chain(languages)
	      .map(expandLanguage)
	      .flatten()
	      .uniq()
	      .value();
	  };

	  return Util;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: 0 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(4),
	  __webpack_require__(21),
	  __webpack_require__(24),
	  __webpack_require__(25),
	  __webpack_require__(27),
	  __webpack_require__(30),
	  __webpack_require__(16),
	  __webpack_require__(32),
	  __webpack_require__(16),
	  __webpack_require__(35),
	  __webpack_require__(16),
	  __webpack_require__(16),
	  __webpack_require__(37),
	  __webpack_require__(16),
	  __webpack_require__(16),
	  __webpack_require__(16),
	  __webpack_require__(79),
	  __webpack_require__(16),
	  __webpack_require__(16),
	  __webpack_require__(7),
	  __webpack_require__(28),
	  __webpack_require__(62),
	  __webpack_require__(13),
	  __webpack_require__(16)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, Handlebars, Model, BaseModel, BaseCollection, BaseView, ListView, TableView, BaseRouter,
	          TabbedRouter, BaseController, DataListController, DeadSimpleDataList, BaseForm, BaseFormDialog,
	          BaseModalDialog, MultiViewModalDialog, Callout, DropDown, BaseWizard, StringUtil, TemplateUtil,
	          ButtonFactory, Logger, Metrics) {

	  /**
	   * @class Okta
	   * @singleton
	   *
	   * #### The Okta module holds reference to many frequently used objects and functions
	   *
	   * A quick example:
	   *
	   * ```javascript
	   * define(['okta'], function (Okta) {
	   *
	   *   var Form = Okta.FormDialog.extend({
	   *     title: Okta.loc('my.i18n.key'),
	   *     inputs: [
	   *       {
	   *         type: 'text',
	   *         name: 'name'
	   *       }
	   *     ]
	   *   });
	   *
	   *   var View = Okta.View.extend({
	   *     children: [
	   *       Okta.createButton({
	   *         title: 'Click Me',
	   *         click: function () {
	   *           new Form({model: new Okta.Model()}).render();
	   *         }
	   *       })
	   *     ]
	   *   });
	   *
	   * });
	   *
	   * ```
	   */

	  return {

	    /**
	     * A reference to jQuery
	     * @type {jQuery}
	     */
	    $: $,

	    /**
	     * A reference to underscore
	     * @type {underscore}
	     */
	    _: _,

	    /**
	     * A reference to Handlebars
	     * @type {Handlebars}
	     */
	    Handlebars: Handlebars,

	    /**
	     * @method
	     * @inheritdoc StringUtil#static-method-localize
	     */
	    loc: StringUtil.localize,

	    /**
	     * @method
	     * @inheritdoc ButtonFactory#create
	     */
	    createButton: ButtonFactory.create,

	    /**
	     * @method
	     * @inheritdoc Callout#static-method-create
	     */
	    createCallout: Callout.create,

	    /**
	     * @method
	     * @inheritdoc TemplateUtil#tpl
	     */
	    tpl: TemplateUtil.tpl,


	    Model: Model,
	    BaseModel: BaseModel,
	    Collection: BaseCollection,

	    View: BaseView,
	    ListView: ListView,
	    TableView: TableView,

	    Router: BaseRouter,
	    TabbedRouter: TabbedRouter,

	    Controller: BaseController,
	    DataListController: DataListController,

	    DataList: DeadSimpleDataList,

	    ModalDialog: BaseModalDialog,
	    MultiViewModalDialog: MultiViewModalDialog,

	    Form: BaseForm,
	    FormDialog: BaseFormDialog,

	    DropDown: DropDown,

	    Wizard: BaseWizard,

	    Logger: Logger,

	    Metrics: Metrics

	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(22)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Model) {

	  /**
	  * @class Okta.Model
	  * @extends Archer.Model
	  * @inheritDoc Archer.Model
	  */
	  return Model.extend({

	    /**
	     * Is the end point using the legacy "secureJSON" format
	     * @type {Function|Boolean}
	     */
	    secureJSON: false,

	    _builtInLocalProps: {
	      '__edit__': 'boolean',
	      '__pending__': 'boolean'
	    },

	    constructor: function () {
	      this.local = _.defaults({}, _.result(this, 'local'), this._builtInLocalProps);

	      if (_.result(this, 'secureJSON')) {
	        this.sync = _.wrap(this.sync, function (sync, method, model, options) {
	          return sync.call(this, method, model, _.extend({dataType: 'secureJSON'}, options));
	        });
	      }

	      Model.apply(this, arguments);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(23)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  /* global module, exports */
	  else if (typeof require === 'function' && typeof exports === 'object') {
	    module.exports = factory(require('underscore'), require('backbone'));
	  }
	  else {
	    root.Archer || (root.Archer = {});
	    root.Archer.Model = factory(root._, root.Backbone);
	  }
	}(this, function (_, Backbone) {
	  var Model;

	  /**
	  * @class Archer.Model
	  * @extend Backbone.Model
	  *
	  * Archer.Model is a standard [Backbone.Model](http://backbonejs.org/#Model) with a few additions:
	  *
	  * - {@link #derived Derived properties}
	  * - {@link #props Built in schema validation}
	  * - {@link #local Private properties (with schema validation)}
	  * - {@link #flat Flattening of nested objects}
	  *
	  * Both derived and private properties are filtered out when sending the data to the server.
	  *
	  * Example:
	  *
	  * ```javascript
	  * var Person = Archer.Model.extend({
	  *   props: {
	  *     'fname': 'string',
	  *     'lname': 'string'
	  *   },
	  *   local: {
	  *     isLoggedIn: 'boolean'
	  *   },
	  *   derived: {
	  *     name: {
	  *       deps: ['fname', 'lname'],
	  *       fn: function (fname, lname) {
	  *         return fname + ' ' + lname;
	  *       }
	  *     }
	  *   }
	  * });
	  * var model = new Person({fname: 'Joe', lname: 'Doe'});
	  * model.get('name'); //=> "Joe Doe"
	  * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
	  *
	  * model.set('isLoggedIn', true);
	  * model.get('isLoggedIn'); //=> true
	  * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
	  * ```
	  * See: [Backbone.Model](http://backbonejs.org/#Model-constructor)
	  */

	  function flatten(value, objectTypeFields, key, target) {
	    var filter = _.contains(objectTypeFields, key);
	    target || (target = {});
	    if (!filter && _.isObject(value) && !_.isArray(value) && !_.isFunction(value)) {
	      _.each(value, function (val, i) {
	        flatten(val, objectTypeFields, key ? (key + '.' + i) : i, target);
	      });
	    }
	    // Case where target is an empty object. Guard against returning {undefined: undefined}.
	    else if (key !== undefined) {
	      target[key] = value;
	    }
	    return target;
	  }

	  function unflatten(data) {
	    _.each(data, function (value, key, data) {
	      if (key.indexOf('.') == -1) {
	        return;
	      }
	      var part,
	          ref = data,
	          parts = key.split('.');
	      while ((part = parts.shift()) !== undefined) {
	        if (!ref[part]) {
	          ref[part] = parts.length ? {} : value;
	        }
	        ref = ref[part];
	      }
	      delete data[key];
	    });
	    return data;
	  }

	  function createMessage(field, msg) {
	    var obj = {};
	    obj[field.name] = msg;
	    return obj;
	  }

	  function normalizeSchemaDef(field, name) {
	    var target;
	    if (_.isString(field)) {
	      target = {
	        type: field
	      };
	    }
	    else if (_.isArray(field)) {
	      target = {
	        type: field[0],
	        required: field[1],
	        value: field[2]
	      };
	    }
	    else {
	      target = _.clone(field);
	    }
	    _.defaults(target, {required: false, name: name});
	    return target;
	  }

	  function capitalize(string) {
	    return string.toLowerCase().replace(/\b[a-z]/g, function (letter) {
	      return letter.toUpperCase();
	    });
	  }

	  function allowExtraProperties(rule, key) {
	    if (_.isBoolean(rule)) {
	      return rule;
	    }
	    else if (_.isRegExp(rule)) {
	      return rule.test(key);
	    }
	    else if (_.isFunction(rule)) {
	      return rule.call(this, key);
	    }
	    return false;
	  }

	  function _validateRegex(value, pattern, error) {
	    if (!pattern.test(value)) {
	      return error;
	    }
	  }

	  var StringFormatValidators = {
	    /*eslint max-len: 0 */
	    email: function (value) {
	      // source: http://emailregex.com/
	      var pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
	      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_EMAIL);
	    },
	    uri: function (value) {
	      // source: https://mathiasbynens.be/demo/url-regex
	      var pattern = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
	      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_URI);
	    },
	    ipv4: function (value) {
	      // source: https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	      var pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_IPV4);
	    },
	    hostname: function (value) {
	      // source: http://www.regextester.com/23
	      var pattern = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
	      return _validateRegex(value, pattern, Model.ERROR_INVALID_FORMAT_HOSTNAME);
	    }
	  };

	  function validateStringFormat(field, value) {
	    var validator = StringFormatValidators[field.format];
	    if (field.format && !validator) {
	      throw new TypeError(field.format + ' is not a supported string format');
	    }
	    return validator && validator(value);
	  }

	  function validateString(field, value) {
	    var createMessageWith = _.partial(createMessage, field),
	        invalidFormat = validateStringFormat(field, value);
	    if (invalidFormat) {
	      return createMessageWith(invalidFormat);
	    }
	    if (value && field.minLength && value.length < field.minLength) {
	      return createMessageWith(Model.ERROR_STRING_STRING_MIN_LENGTH, value.length);
	    }
	    if (value && field.maxLength && value.length > field.maxLength) {
	      return createMessageWith(Model.ERROR_STRING_STRING_MAX_LENGTH, value.length);
	    }
	  }

	  function validateField(field, value) {
	    /* eslint complexity: [2, 13], max-statements: [2, 19]*/
	    var createMessageWith = _.partial(createMessage, field),
	        isDefined = !_.isUndefined(value) && !_.isNull(value),
	        checkType,
	        errorMessage;

	    // check required fields
	    if (field.required && (!isDefined || _.isNull(value) || value === '')) {
	      return createMessageWith(Model.ERROR_BLANK);
	    }
	    // check type
	    checkType = _['is' + capitalize(field.type)];
	    if (isDefined && field.type != 'any' && (!_.isFunction(checkType) || !checkType(value))) {
	      return createMessageWith(Model.ERROR_WRONG_TYPE);
	    }
	    // validate string format
	    if (value && field.type == 'string') {
	      var error = validateString(field, value);
	      if (error) {
	        return error;
	      }
	    }
	    // check pre set values (enum)
	    if (isDefined && field.values && !_.contains(field.values, value)) {
	      return createMessageWith(Model.ERROR_NOT_ALLOWED);
	    }
	    // check validate method
	    if (_.isFunction(field.validate)) {
	      var result = field.validate(value);
	      if (_.isString(result) && result) {
	        return createMessageWith(result);
	      }
	      else if (result === false) {
	        return createMessageWith(Model.ERROR_INVALID);
	      }
	    }
	     // check array items
	    if (isDefined && field.type == 'array' && (errorMessage = validateArrayField(field, value))) {
	      return createMessageWith(errorMessage);
	    }
	  }

	  function validateArrayField(field, arr) {
	    if (field.minItems && arr.length < field.minItems) {
	      return 'model.validation.field.array.minItems';
	    }
	    else if (field.maxItems && arr.length > field.maxItems) {
	      return 'model.validation.field.array.maxItems';
	    }
	    else if (field.uniqueItems && arr.length > _.uniq(arr).length) {
	      return Model.ERROR_IARRAY_UNIQUE;
	    }
	    else if (field.items) {
	      /* eslint max-depth: [2, 3] */
	      var arrayField = normalizeSchemaDef(field.items, 'placeholder');
	      for (var i = 0; i < arr.length; i++) {
	        var value = arr[i];
	        var error = validateField(arrayField, value);
	        if (error) {
	          return error['placeholder'];
	        }
	      }
	    }
	  }

	  Model = Backbone.Model.extend({

	    /**
	     * Pass props as an object to extend, describing the observable properties of your model. The props
	     * properties should not be set on an instance, as this won't define new properties, they should only be passed to
	     * extend.
	     * Properties can be defined in three different ways:
	     *
	     * - As a string with the expected dataType. One of string, number, boolean, array, object, date, or any.
	     * Eg: `name: 'string'`.
	     * - An array of `[dataType, required, default]`
	     * - An object `{type: 'string', format: '', required: true, value: '', values: [], validate: function() {}`
	     *   - `value` will be the value that the property will be set to if it is undefined, either by not being set during
	     *   initialization, or by being explicitly set to undefined.
	     *   - `format` is a json-schame derived string format. Supported formats are: `email`, `uri`, `hostname` and `ipv4`.
	     *   - If `required` is true, one of two things will happen. If a default is set for the property, the property will
	     *   start with that value. If a default is not set for the property, validation will fail
	     *   - If `values` array is passed, then you'll be able to change a property to one of those values only.
	     *   - If `validate` is defined, it should return false or a custom message string when the validation fails.
	     *   - If the type is defined as `array`, the array elements could be defined by `minItems` (Number),
	     *   `uniqueItems` (Boolean) and `items` (a field definition such as this one that will validate each array member)
	     *   To the `validate` method
	     *   - Trying to set a property to an invalid type will raise an exception.
	     *
	     * ```javascript
	     * var Person = Model.extend({
	     *   props: {
	     *     name: 'string',
	     *     age: 'number',
	     *     paying: ['boolean', true, false], //required attribute, defaulted to false
	     *     type: {
	     *       type: 'string',
	     *       values: ['regular-hero', 'super-hero', 'mega-hero']
	     *     },
	     *     likes: {
	     *       type: 'string',
	     *       validate: function (value) {
	     *         return /^[\w]+ing$/.test(value)
	     *       }
	     *     }
	     *   }
	     * });
	     * ```
	     *
	     * @type {Mixed}
	     */
	    props: {},

	    /**
	     * Derived properties (also known as computed properties) are properties of the model that depend on the
	     * other (props, local or even derived properties to determine their value. Best demonstrated with an example:
	     *
	     * ```javascript
	     * var Person = Model.extend({
	     *   props: {
	     *     firstName: 'string',
	     *     lastName: 'string'
	     *   },
	     *   derived: {
	     *     fullName: {
	     *       deps: ['firstName', 'lastName'],
	     *       fn: function (firstName, lastName) {
	     *         return firstName + ' ' + lastName;
	     *       }
	     *     }
	     *   }
	     * });
	     *
	     * var person = new Person({ firstName: 'Phil', lastName: 'Roberts' })
	     * console.log(person.get('fullName')) //=> "Phil Roberts"
	     *
	     * person.set('firstName', 'Bob');
	     * console.log(person.get('fullName')) //=> "Bob Roberts"
	     * ```
	     *
	     * Each derived property, is defined as an object with the current properties:
	     *
	     * - `deps` {Array} - An array of property names which the derived property depends on.
	     * - `fn` {Function} - A function which returns the value of the computed property. It is called in the context of
	     * the current object, so that this is set correctly.
	     * - `cache` {Boolean} -  - Whether to cache the property. Uncached properties are computed every time they are
	     * accessed. Useful if it depends on the current time for example. Defaults to `true`.
	     *
	     * Derived properties are retrieved and fire change events just like any other property. They cannot be set
	     * directly.
	     * @type {Object}
	     */
	    derived: {},

	    /**
	     * local properties are defined and work in exactly the same way as {@link #props}, but generally only exist for
	     * the lifetime of the page.
	     * They would not typically be persisted to the server, and are not returned by calls to {@link #toJSON}.
	     *
	     * ```javascript
	     * var Person = Model.extend({
	     *   props: {
	     *     name: 'string',
	     *   },
	     *   local: {
	     *     isLoggedIn: 'boolean'
	     *   }
	     * );
	     * ```
	     * @type {Object}
	     */
	    local: {},

	    /**
	     * A boolean, a regexp or a predicate function to sanitize arbitrary extra model properties.
	     *
	     * Useful for embedded values such as [HAL](http://stateless.co/hal_specification.html) `_links` and `_embedded`.
	     *
	     * ```javascript
	     * var Person = Model.extend({
	     *   flat: true, //defaults to true, emphasizing for this example
	     *   extraProperties: /^_(links|embedded)\./
	     * );
	     * model.set('_links', '/orders'); // => throws an error
	     * model.set('links.self.href', '/orders'); // => throws an error
	     * model.set('_links.self.href', '/orders'); //=> no error
	     * ```
	     * @type {Boolean|RegExp|Function}
	     */
	    extraProperties: false,


	    /**
	    * Flatten the payload into dot notation string keys:
	    *
	    * ```javascript
	    * var Person = Model.extend({
	    *   props: {
	    *     'profile.fname': 'string',
	    *     'profile.lname': 'string',
	    *     'profile.languages': 'object'
	    *   },
	    *   flat: true
	    * });
	    * var person = new Person({'profile': {
	    *                            'fname': 'John',
	    *                            'lname': 'Doe',
	    *                            'languages': {name: "English", value: "EN"}
	    *                         }}, {parse: true});
	    * person.get('profile'); //=> undefined
	    * person.get('profile.fname'); //=> 'John'
	    * person.get('profile.lname'); //=> 'Doe'
	    * person.get('profile.languages'); //=> {name: "English", value: "EN"}
	    * person.get('profile.languages.name'); //=> undefined
	    * person.toJSON(); //=> {'profile': {'fname': 'John'} }
	    * ```
	     * @type {Boolean}
	     */
	    flat: true,

	    /**
	     * @deprecated
	     * @alias Backbone.Model#defaults
	     */
	    defaults: {},

	    /**
	    * @constructor
	    * @param {Object} [attributes] - Initial model attributes (data)
	    * @param {Object} [options] - Options hash
	    */
	    constructor: function (options) {
	      this.options = options || {};

	      var schema = this['__schema__'] = {},
	          objectTypeFields = [];

	      schema.computedProperties = {};

	      schema.extraProperties = this.extraProperties;
	      schema.props = _.clone(_.result(this, 'props') || {});
	      schema.derived = _.clone(_.result(this, 'derived') || {});
	      schema.local = _.clone(_.result(this, 'local') || {});

	      var defaults = {};
	      _.each(_.extend({}, schema.props, schema.local), function (options, name) {
	        var schemaDef = normalizeSchemaDef(options, name);
	        if (!_.isUndefined(schemaDef.value)) {
	          defaults[name] = schemaDef.value;
	        }
	        if (schemaDef.type === 'object') {
	          objectTypeFields.push(name);
	        }
	      }, this);
	      if (_.size(defaults)) {
	        var localDefaults = _.result(this, 'defaults');
	        this.defaults = function () {
	          return _.defaults({}, defaults, localDefaults);
	        };
	      }

	      // override `validate`
	      this.validate = _.wrap(this.validate, function (validate) {
	        var args = _.rest(arguments),
	            res = _.extend(this._validateSchema.apply(this, args), validate.apply(this, args));
	        return _.size(res) && res || undefined;
	      });

	      // override `parse`
	      this.parse = _.wrap(this.parse, function (parse) {
	        var target = parse.apply(this, _.rest(arguments));
	        if (this.flat) {
	          target = flatten(target, objectTypeFields);
	        }
	        return target;
	      });

	      Backbone.Model.apply(this, arguments);

	      _.each(schema.derived, function (options, name) {
	        schema.computedProperties[name] = this.__getDerivedValue(name); // set initial value;
	        var deps = options.deps || [];
	        if (deps.length) {
	          this.on('cache:clear change:' + deps.join(' change:'), function () {
	            var value = this.__getDerivedValue(name);
	            if (value !== schema.computedProperties[name]) {
	              schema.computedProperties[name] = value;
	              this.trigger('change:' + name, this, value);
	            }
	          }, this);
	        }
	      }, this);

	      this.on('sync', function () {
	        this.__syncedData = this.toJSON();
	      }, this);
	    },

	    validate: function () {},

	    /**
	     * Check if the schema settings allow this field to exist in the model
	     * @param  {String} key
	     * @return {Boolean}
	     */
	    allows: function (key) {
	      var schema = this['__schema__'],
	          all = _.extend({}, schema.props, schema.local);
	      if (_.has(all, key)) {
	        return true;
	      }
	      else if (allowExtraProperties.call(this, schema.extraProperties, key)) {
	        return true;
	      }
	      else {
	        return false;
	      }
	    },

	    /**
	     * Returns the schema for the specific property
	     *
	     * @param propName - The name of the property
	     * @returns {*} | null
	     */
	    getPropertySchema: function (propName) {
	      var schema = this['__schema__'];
	      return _.reduce([schema.props, schema.local], function (result, options) {
	        return result || normalizeSchemaDef(options[propName], propName);
	      }, null);
	    },

	    set: function (key, val) {
	      var attrs;
	      if (typeof key === 'object') {
	        attrs = key;
	      } else {
	        (attrs = {})[key] = val;
	      }

	       // Don't override a computed properties
	      _.each(attrs, function (value, key) {
	        if (_.has(this['__schema__'].derived, key)) {
	          throw 'overriding derived properties is not supported: ' + key;
	        }
	      }, this);

	      // Schema validation
	      var errorFields = [];
	      _.each(attrs, function (value, key) {
	        this.allows(key) || errorFields.push(key);
	      }, this);
	      if (errorFields.length) {
	        throw 'field not allowed: ' + errorFields.join(', ');
	      }

	      return Backbone.Model.prototype.set.apply(this, arguments);
	    },

	    get: function (attr) {
	      var schema = this['__schema__'];
	      if (_.has(schema.derived, attr)) {
	        if (schema.derived[attr].cache !== false) {
	          return schema.computedProperties[attr];
	        }
	        else {
	          return this.__getDerivedValue(attr);
	        }
	      }
	      return Backbone.Model.prototype.get.apply(this, arguments);
	    },

	    /**
	     * Return a shallow copy of the model's attributes for JSON stringification.
	     * This can be used for persistence, serialization, or for augmentation before being sent to the server.
	     * The name of this method is a bit confusing, as it doesn't actually return a JSON string —
	     *  but I'm afraid that it's the way that the JavaScript API for JSON.stringify works.
	     *
	     * ```javascript
	     * var artist = new Model({
	     *   firstName: 'Wassily',
	     *   lastName: 'Kandinsky'
	     * });
	     *
	     * artist.set({birthday: 'December 16, 1866'});
	     * JSON.stringify(artist); //=> {'firstName':'Wassily','lastName':'Kandinsky','birthday':'December 16, 1866'}
	     * ```
	     * See [Backbone.Model.toJSON](http://backbonejs.org/#Model-toJSON)
	     * @param  {Object} options
	     * @return {Object}
	     */
	    toJSON: function (options) {
	      options || (options = {});
	      var res = _.clone(Backbone.Model.prototype.toJSON.apply(this, arguments)),
	          schema = this['__schema__'];

	      // cleanup local properties
	      if (!options.verbose) {
	        res = _.omit(res, _.keys(schema.local));
	      }
	      else { // add derived properties
	        _.each(schema.derived, function (options, name) {
	          res[name] = this.get(name);
	        }, this);
	      }

	      if (this.flat) {
	        res = unflatten(res);
	      }

	      return res;
	    },

	    /**
	     * Removes all attributes from the model, including the id attribute.
	     * Fires a `"change"` event unless `silent` is passed as an option.
	     * Sets the default values to the model
	     * @param {Object} [options]
	     */
	    reset: function (options) {
	      this.clear(options);
	      this.set(_.result(this, 'defaults'), options);
	    },

	    /**
	     * Is the data on the model has local modifications since the last sync event?
	     * @return {Boolean} is the model in sync with the server
	     */
	    isSynced: function () {
	      return _.isEqual(this.__syncedData, this.toJSON());
	    },

	    /**
	     * validate a specific field in the model.
	     * @param  {String} key
	     * @return {Object} returns `{fieldName: errorMessage}` if invalid, otherwise undefined.
	     * @readonly
	     */
	    validateField: function (key) {
	      var schema = key && this.getPropertySchema(key);
	      return schema && validateField(schema, this.get(key));
	    },

	    /**
	     * Runs local schema validation. Invoked internally by {@link #validate}.
	     * @return {Object}
	     * @protected
	     */
	    _validateSchema: function () {
	      var schema = this['__schema__'];
	      return _.reduce(_.extend({}, schema.props, schema.local), function (memo, options, name) {
	        return _.extend(memo, this.validateField(name) || {});
	      }, {}, this);
	    },

	    __getDerivedValue: function (name) {
	      var options = this['__schema__'].derived[name];
	      if (_.isString(options)) {
	        var key = options;
	        options = {
	          deps: [key],
	          fn: function () {
	            return this.get(key);
	          }
	        };
	      }
	      var deps = options.deps || [];
	      return options.fn.apply(this, _.map(deps, this.get, this));
	    }

	  },
	    {
	      ERROR_BLANK: 'model.validation.field.blank',
	      ERROR_WRONG_TYPE: 'model.validation.field.wrong.type',
	      ERROR_NOT_ALLOWED: 'model.validation.field.value.not.allowed',
	      ERROR_INVALID: 'model.validation.field.invalid',
	      ERROR_IARRAY_UNIQUE: 'model.validation.field.array.unique',
	      ERROR_INVALID_FORMAT_EMAIL: 'model.validation.field.invalid.format.email',
	      ERROR_INVALID_FORMAT_URI: 'model.validation.field.invalid.format.uri',
	      ERROR_INVALID_FORMAT_IPV4: 'model.validation.field.invalid.format.ipv4',
	      ERROR_INVALID_FORMAT_HOSTNAME: 'model.validation.field.invalid.format.hostname',
	      ERROR_STRING_STRING_MIN_LENGTH: 'model.validation.field.string.minLength',
	      ERROR_STRING_STRING_MAX_LENGTH: 'model.validation.field.string.maxLength'
	    }
	  );

	  return Model;

	}));


/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_23__;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(21)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Model) {

	  /**
	   * @class Okta.BaseModel
	   * @extends {Okta.Model}
	   * @deprecated Use `{@link Okta.Model}` instead
	   *
	   * ```javascript
	   * var Model = BaseModel.extend({
	   *   defaults: {
	   *     name: BaseModel.ComputedProperty(['fname', 'lname'], function (fname, lname) {
	   *       return fname + ' ' + lname;
	   *     })
	   *   }
	   * });
	   * var model = new Model({fname: 'Joe', lname: 'Doe'});
	   * model.get('name'); //=> "Joe Doe"
	   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
	   *
	   * model.set('__private__', 'private property');
	   * model.get('__private__'); //=> "private property"
	   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
	   * ```
	   */

	  var hasProps = function (model) {
	    var local = _.omit(model.local, _.keys(model._builtInLocalProps));
	    return _.size(model.props) + _.size(local) > 0;
	  };

	  var BaseModel = Model.extend({
	    /**
	     * @inheritdoc Okta.Model#flat
	     * @type {Boolean}
	     */
	    flat: false,

	    constructor: function () {
	      Model.apply(this, arguments);
	      this.on('sync', this._setSynced);
	    },

	    allows: function () {
	      if (hasProps(this)) {
	        return Model.prototype.allows.apply(this, arguments);
	      }
	      else {
	        return true;
	      }
	    },

	    // bw compatibility support for old computed properties
	    set: function (key, val) {
	      var attrs;
	      if (typeof key === 'object') {
	        attrs = key;
	      } else {
	        (attrs = {})[key] = val;
	      }

	      // computed properties
	      _(attrs).each(function (fn, attr) {
	        if (!fn || !_.isArray(fn.__attributes)) { return; }
	        this.on('change:' + fn.__attributes.join(' change:'), function () {
	          var val = this.get(attr);
	          if (val !== this['__schema__'].computedProperties[attr]) {
	            this['__schema__'].computedProperties[attr] = val;
	            this.trigger('change:' + attr, val);
	          }
	        }, this);
	      }, this);

	      return Model.prototype.set.apply(this, arguments);
	    },

	    /**
	     * Get the current value of an attribute from the model. For example: `note.get("title")`
	     *
	     * See [Model.get](http://backbonejs.org/#Model-get)
	     * @param {String} attribute
	     * @return {Mixed} The value of the model attribute
	     */
	    get: function () {
	      var value = Model.prototype.get.apply(this, arguments);
	      if (_.isFunction(value)) {
	        return value.apply(this, _.map(value.__attributes || [], this.get, this));
	      }
	      return value;
	    },

	    /**
	     * Return a shallow copy of the model's attributes for JSON stringification.
	     * This can be used for persistence, serialization, or for augmentation before being sent to the server.
	     * The name of this method is a bit confusing, as it doesn't actually return a JSON string —
	     *  but I'm afraid that it's the way that the JavaScript API for JSON.stringify works.
	     *
	     * ```javascript
	     * var artist = new Model({
	     *   firstName: "Wassily",
	     *   lastName: "Kandinsky"
	     * });
	     *
	     * artist.set({birthday: "December 16, 1866"});
	     * alert(JSON.stringify(artist)); // {"firstName":"Wassily","lastName":"Kandinsky","birthday":"December 16, 1866"}
	     * ```
	     * See [Model.toJSON](http://backbonejs.org/#Model-toJSON)
	     * @param  {Object} options
	     * @return {Object}
	     */
	    toJSON: function (options) {
	      options || (options = {});
	      var res = Model.prototype.toJSON.apply(this, arguments);

	      // cleanup computed properties
	      _(res).each(function (value, key) {
	        if (typeof value == 'function') {
	          if (options.verbose) {
	            res[key] = this.get(key);
	          } else {
	            delete res[key];
	          }
	        }
	      }, this);

	      // cleanup private properties
	      if (!options.verbose) {
	        _(res).each(function (value, key) {
	          if (/^__\w+__$/.test(key)) {
	            delete res[key];
	          }
	        });
	      }

	      return res;
	    },

	    sanitizeAttributes: function (attributes) {
	      var attrs = {};
	      _.each(attributes, function (value, key) {
	        if (!_.isFunction(value)) {
	          attrs[key] = value;
	        }
	      });
	      return attrs;
	    },

	    reset: function (options) {
	      this.clear(options);
	      this.set(this.sanitizeAttributes(this.defaults), options);
	    },

	    clear: function (options) {
	      var attrs = {};
	      _.each(this.sanitizeAttributes(this.attributes), function (value, key) {
	        attrs[key] = void 0;
	      });
	      return this.set(attrs, _.extend({}, options, {unset: true}));
	    },

	    /**
	     * @private
	     */
	    _setSynced: function (newModel) {
	      this._syncedData = newModel && _.isFunction(newModel.toJSON) ? newModel.toJSON() : {};
	    },

	    /**
	     * @private
	     */
	    _getSynced: function () {
	      return this._syncedData;
	    },

	    isSynced: function () {
	      return _.isEqual(this._getSynced(), this.toJSON());
	    }
	  }, {
	    /**
	     * @static
	     *
	     * Example:
	     *
	     * ```javascript
	     * var Model = BaseModel.extend({
	     *   defaults: {
	     *     name: BaseModel.ComputedProperty(['fname', 'lname'], function (fname, lname) {
	     *       return fname + ' ' + lname;
	     *     })
	     *   }
	     * });
	     * var model = new Model({fname: 'Joe', lname: 'Doe'});
	     * model.get('name'); // Joe Doe
	     * model.toJSON(); // {fname: 'Joe', lname: 'Doe'}
	     * ```
	     *
	     * @param {Array} attributes - an array of the attribute names this method depends on
	     * @param {Function} callback the function that computes the value of the property
	     *
	     * @deprecated Use {@link #derived} instead
	     */
	    ComputedProperty: function () {
	      var args = _.toArray(arguments);
	      var fn = args.pop();
	      fn.__attributes = args.pop();
	      return fn;
	    }
	  });

	  return BaseModel;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(26)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Collection) {
	  /**
	  * @class Okta.Collection
	  * @extend Archer.Collection
	  * @inheritDoc Archer.Collection
	  */
	  return Collection.extend({

	    /**
	     * Is the end point using the legacy "secureJSON" format
	     * @type {Function|Boolean}
	     */
	    secureJSON: false,

	    constructor: function () {
	      if (_.result(this, 'secureJSON')) {
	        this.sync = _.wrap(this.sync, function (sync, method, collection, options) {
	          return sync.call(this, method, collection, _.extend({dataType: 'secureJSON'}, options));
	        });
	      }
	      Collection.apply(this, arguments);
	    }

	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(23)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  /* global module, exports */
	  else if (typeof require == 'function' && typeof exports == 'object') {
	    module.exports = factory(require('underscore'), require('backbone'));
	  }
	  else {
	    root.Archer || (root.Archer = {});
	    root.Archer.Collection = factory(root._, root.Backbone);
	  }
	}(this, function (_, Backbone) {
	  var STATE = '__STATE__',
	      FETCH_DATA = 'FETCH_DATA',
	      PAGINATION_DATA = 'PAGINATION_DATA',
	      DEFAULT_PARAMS = 'DEFAULT_PARAMS',
	      LINK_BY_HEADER = 'LINK_BY_HEADER',
	      XHR = 'XHR';

	  /*
	   * Sets the next page URL on the collection from link headers
	   * See: http://www.rfc-editor.org/rfc/rfc5988.txt
	   *
	   * This method is looking for a link header with `rel="next"`
	   * An set's it as the next page's URL.
	   *
	   * If it doesn't find a next page, and current page is set by a link header
	   * it assumes we are at the last page and deletes the current `next`
	   */
	  function setLinkHeadersPagination(collection, xhr) {
	    try {
	      var links = parseLinkHeader(xhr.getResponseHeader('link'));
	      collection[STATE].set(LINK_BY_HEADER, true);
	      collection.setPagination(links['next'].href);
	    }
	    catch (e) {
	      if (collection[STATE].get(LINK_BY_HEADER)) {
	        collection.setPagination(null);
	      }
	    }
	  }

	  function parseQuery(url) {
	    var params = {},
	        rawQueryStr = url && url.split('?')[1],
	        queryString = rawQueryStr && decodeURIComponent(rawQueryStr.split('#')[0]).replace(/\+/g, ' '),
	        props = queryString ? queryString.split('&') : [];
	    for (var i = 0; i < props.length; i++) {
	      var parts = props[i].split('=');
	      params[parts.shift()] = parts.join('=');
	    }
	    return params;
	  }

	  // ################################################
	  // # Source: https://gist.github.com/deiu/9335803
	  // ################################################

	  // unquote string (utility)
	  function unquote(value) {
	    if (value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
	      return value.substring(1, value.length - 1);
	    }
	    return value;
	  }
	  /*
	  parse a Link header
	  Link:<https://example.org/.meta>; rel=meta
	  var r = parseLinkHeader(xhr.getResponseHeader('Link');
	  r['meta']['href'] outputs https://example.org/.meta
	  */
	  function parseLinkHeader(header) {
	    /* eslint max-statements: 0 */
	    var linkexp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g,
	        paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

	    var matches = header.match(linkexp);
	    var rels = {};
	    for (var i = 0; i < matches.length; i++) {
	      var split = matches[i].split('>');
	      var href = split[0].substring(1);
	      var link = {};
	      link.href = href;
	      var s = split[1].match(paramexp);
	      for (var j = 0; j < s.length; j++) {
	        var paramsplit = s[j].split('=');
	        var name = paramsplit[0];
	        link[name] = unquote(paramsplit[1]);
	      }

	      if (link.rel !== undefined) {
	        rels[link.rel] = link;
	      }
	    }

	    return rels;
	  }

	  // ################################################
	  // # /Source
	  // ################################################
	  //

	  /**
	  * @class Archer.Collection
	  * @extend Backbone.Collection
	  *
	  * Archer.Collection is a standard [Backbone.Collection](http://backbonejs.org/#Collection) with pre-set `data`
	  * parameters and built in pagination - works with [http link headers](https://tools.ietf.org/html/rfc5988)
	  * out of the box:
	  *
	  * ```javascript
	  * var Users = Archer.Collection.extend({
	  *   url: '/api/v1/users'
	  *   params: {expand: true}
	  * });
	  * var users = new Users(null, {params: {type: 'new'}}),
	  *     $button = this.$('a.fetch-more');
	  *
	  * $button.click(function () {
	  *   users.fetchMore();
	  * });
	  *
	  * this.listenTo(users, 'sync', function () {
	  *   $button.toggle(users.hasMore());
	  * });
	  *
	  * collection.fetch(); //=> '/api/v1/users?expand=true&type=new'
	  *
	  * ```
	  */
	  return Backbone.Collection.extend({

	    /**
	     * Default fetch parametrers
	     * @type {Object}
	     */
	    params: {},

	    constructor: function (models, options) {
	      var state = this[STATE] = new Backbone.Model();
	      state.set(DEFAULT_PARAMS, _.defaults(options && options.params || {}, this.params || {}));
	      Backbone.Collection.apply(this, arguments);
	    },

	    sync: function (method, collection, options) {
	      var self = this,
	          success = options.success;
	      options.success = function (resp, status, xhr) {
	        // its important to set the pagination data *before* we call the success callback
	        // because we want the pagination data to be ready when the collection triggers the `sync` event
	        setLinkHeadersPagination(self, xhr);
	        success.apply(null, arguments);
	      };
	      return Backbone.Collection.prototype.sync.call(this, method, collection, options);
	    },

	    fetch: function (options) {
	      options || (options = {});
	      var state = this[STATE],
	          xhr = state.get(XHR);

	      options.data = _.extend({}, state.get(DEFAULT_PARAMS), options.data || {});
	      options.fromFetch = true;

	      state.set(FETCH_DATA, options.data);
	      if (xhr && xhr.abort && options.abort !== false) {
	        xhr.abort();
	      }
	      xhr = Backbone.Collection.prototype.fetch.call(this, options);
	      state.set(XHR, xhr);
	      return xhr;
	    },

	    /**
	     * Set pagination data to get to the next page
	     *
	     * ```javascript
	     * collection.setPagination({q: 'foo', page: '2'}); //=> {q: 'foo', page: '2'}
	     *
	     * collection.setPagination('/path/to/resource?q=baz&page=4'); //=> {q: 'baz', page: '4'}
	     *
	     * collection.setPagination('/path/to/resource'); //=> {}
	     *
	     * collection.fetch({data: {q: 'foo'}});
	     * collection.setPagination({page: 2}, {fromFetch: true}); //=> {q: 'foo', page: 2}
	     *
	     * any "falsy" value resets pagination
	     * collection.setPagination(); //=> {}
	     * collection.setPagination(null); //=> {}
	     * collection.setPagination(false); //=> {}
	     * collection.setPagination(''); //=> {}
	     * collection.setPagination(0); //=> {}
	     * ```
	     *
	     * @param {Mixed} params
	     * @param {Object} [options]
	     * @param {Boolean} [options.fromFetch] should we include data from the previous fetch call in this object
	     * @protected
	     *
	     */
	    setPagination: function (params, options) {
	      if (_.isString(params) && params) {
	        params = parseQuery(params);
	      }
	      if (!_.isObject(params) || _.isArray(params) || !_.size(params)) {
	        params = null;
	      }
	      else if (options && options.fromFetch) {
	        params = _.extend({}, this.getFetchData(), params);
	      }
	      this[STATE].set(PAGINATION_DATA, params);
	    },

	    /**
	     * Returns the `data` parameters applied in th most recent `fetch` call
	     * It will include parameters set by {@link #params} and optios.params passed to the constructor
	     * @return {Object}
	     * @protected
	     */
	    getFetchData: function () {
	      return this[STATE].get(FETCH_DATA) || {};
	    },

	    /**
	     * Data object for constructing a request to fetch the next page
	     * @return {Object}
	     * @protected
	     */
	    getPaginationData: function () {
	      return this[STATE].get(PAGINATION_DATA) || {};
	    },

	    /**
	     * Does this collection have more data on the server (e.g is there a next "page")
	     * @return {Boolean}
	     */
	    hasMore: function () {
	      return _.size(this.getPaginationData()) > 0;
	    },

	    /**
	     * Get the next page from the server
	     * @return {Object} xhr returned by {@link #fetch}
	     */
	    fetchMore: function () {
	      if (!this.hasMore()) {
	        throw new Error('Invalid Request');
	      }
	      return this.fetch({data: this.getPaginationData(), add: true, remove: false, update: true});
	    },

	    reset: function (models, options) {
	      options || (options = {});
	      // only reset the pagination when reset is being called explicitly.
	      // this is to avoid link headers pagination being overriden and reset when
	      // fetching the collection using `collection.fetch({reset: true})`
	      if (!options.fromFetch) {
	        this.setPagination(null);
	      }
	      return Backbone.Collection.prototype.reset.apply(this, arguments);
	    },

	    // we want "where" to be able to search through derived properties as well
	    where: function (attrs, first) {
	      if (_.isEmpty(attrs)) {
	        return first ? void 0 : [];
	      }
	      return this[first ? 'find' : 'filter'](function (model) {
	        for (var key in attrs) {
	          if (attrs[key] !== model.get(key)) {
	            return false;
	          }
	        }
	        return true;
	      });
	    },

	    create: function (model, options) {
	      options || (options = {});
	      if (!_.result(model, 'urlRoot')) {
	        options.url = _.result(this, 'url');
	      }
	      return Backbone.Collection.prototype.create.call(this, model, options);
	    }

	  });

	}));


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(23),
	  __webpack_require__(28),
	  __webpack_require__(29)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Backbone, TemplateUtil, View) {

	  // add `broadcast` and `listen` functionality to all views
	  // We use one event emitter per all views
	  // This means we need to be very careful with event names

	  var eventBus = _.clone(Backbone.Events);

	  var proto = {

	    /**
	    * @class Okta.View
	    * @extend Archer.View
	    * @inheritdoc Archer.View
	    */

	    constructor: function () {
	      View.apply(this, arguments);
	      this.module && this.$el.attr('data-view', this.module.id);
	    },

	    /**
	     * @deprecated Use {@link #removeChildren}
	     */
	    empty: function () {
	      return this.removeChildren();
	    },

	    compileTemplate: TemplateUtil.tpl,

	    /**
	    * Broadcasts a global event that all views and controllers can subscribe to
	    * for framework use only - prefer using a shared model
	    *
	    * @param {String} eventName A unique identifier for the event
	    * @param {...String} param Parameter to pass with the event (can pass more than one parameter)
	    * @deprecated For internal use only
	    * @private
	    */
	    broadcast: function () {
	      eventBus.trigger.apply(eventBus, arguments);
	      return this;
	    },

	    /**
	    * Subscribe to broadcast events
	    * for framework use only - prefer using a shared model
	    *
	    * @param {String} eventName The event identifier to subscribe
	    * @param {Function} fn The callback function to invoke
	    * @deprecated For internal use only
	    * @private
	    */
	    listen: function (name, fn) {
	      this.listenTo(eventBus, name, fn);
	      return this;
	    },

	    /**
	    * Shows a notification box
	    *
	    * Examples:
	    *
	    * ```javascript
	    * view.notify('success', 'Group created successfully');
	    * ```
	    *
	    * @param {String} level success / warning / error
	    * @param {String} message The message to display
	    * @param {Object} [options]
	    * @param {Number} [options.width] Set a custom width
	    * @param {String} [options.title] Set a custom title
	    * @param {Boolean} [options.hide=true] Do we want to auto-hide this notification?
	    * @param {Boolean} [options.dismissable] Show a dismiss button
	    */
	    notify: function (level, message, options) {
	      this.broadcast('notification', _.defaults({message: message, level: level}, options));
	      return this;
	    },

	    /**
	    * Shows a confirmation dialog
	    *
	    * The main difference between this and the native javascript `confirm` method
	    * Is this method is non blocking (note the callback pattern).
	    *
	    * The callback function will run in the context (`this`) of the invoking view.
	    *
	    * Examples:
	    *
	    * ```javascript
	    * view.confirm('Delete Group', 'Are you sure you want to delete the selected group?', function () {
	    *   model.destroy();
	    * });
	    *
	    * // title will be auto-set to "Okta"
	    * view.confirm('Are you sure you want to delete the selected group?', function () {
	    *   model.destroy();
	    * });
	    *
	    * view.confirm({
	    *   title: 'Delete Group', //=> Modal title
	    *   subtitle: 'Are you sure you want to delete the selected group?', //=> Modal subtitle
	    *   content: '<h3 color="red">THIS WILL DELETE THE GROUP!</h3>', //=> A template or a view to add to the modal
	    *   save: 'Delete Group', //=> Button label
	    *   ok: _.bind(model.save, model) // Callback function on hitting "ok" button
	    *   cancel: 'Cancel', //=> Button label
	    *   cancelFn: _.bind(model.destroy, model) // Callback function on hitting "cancel" button
	    * });
	    *
	    * ```
	    *
	    * @param {String} [title] The title of the confirmation dialog
	    * @param {String} [message] The message of the confirmation dialog
	    * @param {Function} [okfn] The callback to run when the user hits "OK" (runs in the context of the invoking view)
	    * @param {Function} [cancelfn] The callback to run when the user hits "Cancel"
	    *        (runs in the context of the invoking view)
	    */
	    confirm: function (title, message, okfn, cancelfn) {
	      /* eslint max-statements: [2, 12] */

	      var options;
	      if (typeof title == 'object') {
	        options = title;
	      }
	      else {
	        if (arguments.length == 2 && _.isFunction(message)) {
	          options = {
	            title: 'Okta',
	            subtitle: title,
	            ok: message
	          };
	        }
	        else {
	          options = {
	            title: title,
	            subtitle: message,
	            ok: okfn,
	            cancelFn: cancelfn
	          };
	        }
	      }
	      if (_.isFunction(options.ok)) {
	        options.ok = _.bind(options.ok, this);
	      }
	      if (_.isFunction(options.cancelFn)) {
	        options.cancelFn = _.bind(options.cancelFn, this);
	      }
	      this.broadcast('confirmation', options);
	      return this;
	    },

	    /**
	    * Shows a alert box
	    *
	    * The main difference between this and the native javascript `alert` method
	    * Is this method is non blocking.
	    *
	    * Examples:
	    *
	    * ```javascript
	    * view.alert('Mission complete');
	    * ```
	    *
	    * @param {String} message The message
	    */
	    alert: function (params) {
	      if (_.isString(params)) {
	        params = {
	          subtitle: params
	        };
	      }
	      this.confirm(_.extend({}, params, {
	        noCancelButton: true
	      }));
	      return this;
	    }
	  };

	  return View.extend(proto, {
	    decorate: function (TargetView) {
	      var View = TargetView.extend({});
	      _.defaults(View.prototype, proto);
	      return View;
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Handlebars) {

	  /**
	   * @class TemplateUtil
	   * @private
	   */

	  return {

	    /**
	     * @method
	     * Compiles a Handlebars template
	     */
	    tpl: _.memoize(function (tpl) {
	      /* eslint okta/no-specific-methods: 0 */
	      return Handlebars.compile(tpl);
	    })

	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(23)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  /* global module, exports */
	  else if (typeof require === 'function' && typeof exports === 'object') {
	    module.exports = factory(require('underscore'), require('backbone'));
	  }
	  else {
	    root.Archer || (root.Archer = {});
	    root.Archer.View = factory(root._, root.Backbone);
	  }
	}(this, function (_, Backbone) {

	  var CHILDREN = '__children__',
	      RENDERED = '__rendered__',
	      PARENT = '__parent__',
	      CHILD_DEFINITIONS = '__children_definitions__',
	      ADD_TO_CONTAINER = '__add_to_container__';

	  function getIndex(container, view) {
	    for (var i = 0; i < container[CHILDREN].length; i++) {
	      if (view.cid === container[CHILDREN][i].cid) {
	        return i;
	      }
	    }
	  }

	  function noop() {}

	  function doRender(view) {
	    view[RENDERED] = true;

	    var html = view.renderTemplate(view.template);
	    if (html) {
	      view.$el.html(html);
	    }
	    else if (view.length) {
	      view.$el.empty();
	    }

	    view.each(function (view) {
	      view[ADD_TO_CONTAINER]();
	    });
	  }

	  function subscribeEvents(view) {
	    var isEventPropertyRe = /^(?!(?:delegate|undelegate|_))([a-zA-Z0-9]+)(?:Events)$/;
	    _.each(_.allKeys(view), function (key) {
	      var matchKeys = key.match(isEventPropertyRe);
	      if (!matchKeys) {
	        return;
	      }
	      var bindings = _.result(view, key),
	          entity = view.options[matchKeys[1]] || view[matchKeys[1]];
	      if (!entity || !_.isObject(bindings) || !_.isFunction(entity.trigger)) {
	        return;
	      }
	      _.each(bindings, function (callback, event) {
	        var callbacks = _.isFunction(callback) ? [callback] : _.reduce(callback.split(/\s+/), function (arr, name) {
	          if (_.isFunction(view[name])) {
	            arr.push(view[name]);
	          }
	          return arr;
	        }, []);
	        _.each(callbacks, function (cb) {
	          view.listenTo(entity, event, cb);
	        });
	      });
	    });
	  }

	  var View = Backbone.View.extend({

	    /**
	    * @class Archer.View
	    * @extend Backbone.View
	    *
	    * A View operates on a string template, an token based template, or a model based template, with a few added hooks.
	    * It provides a collection of child views, when a child view could be a View or another View.
	    * Conceptually, if we were in a file system, the View is a folder, when the concrete child views are files,
	    * and the child Views are sub folders.
	    *
	    * *Technically, when using a View as a container, it could have its own concrete logic,
	    * but conceptually we like to keep it separated so a view is either a concrete view or a collection of child views.*
	    *
	    * ```javascript
	    * var DocumentView = Archer.View.extend({
	    *   template: [
	    *     '<header></header>',
	    *     '<article></article>',
	    *     '<footer></footer>'
	    *   ].join(''),
	    *   children: [[HeaderView, 'header'], [ContentView, 'article'], [FooterView, 'footer']]
	    * });
	    * ```
	    * @constructor
	    *
	    * In addition to the standard backbone options, we added `settings` and `state` as first class options.
	    * it will automatically assign `options` to `this.options` as an instance member.
	    * @param {Object} [options] options hash
	    */

	    /**
	     * @property {Object|Function} [entityEvents] an object listing events and callback bind to this.{entity}
	     *
	     * ```javascript
	     * var FooView = View.extend({
	     *   modelEvents: {
	     *     'change:name': 'render'
	     *   }
	     * })
	     * //equivalent to ==>
	     * var FooView = View.extend({
	     *   initialize: function() {
	     *     this.listenTo(this.model, 'change:name', this.render);
	     *   }
	     * });
	     *
	     *
	     * //Multiple callbacks:
	     * var FooView = View.extend({
	     *   modelEvents: {
	     *     'change:name': 'render foo'
	     *   },
	     *   foo: function() {}
	     * });
	     *
	     * //Callbacks As Function:
	     * var FooView = View.extend({
	     *   stateEvents: {
	     *     'change': function() {
	     *   }
	     * });
	     *
	     * //Event Configuration As Function
	     * var FooView = View.extend({
	     *   collectionEvents: function() {
	     *     var events = { 'change:name deleteItem': 'render' };
	     *     events['changeItem'] = 'spin';
	     *     events['addItem'] = function() {};
	     *     return events;
	     *   }
	     * });
	     * ```
	     */
	    constructor: function (options) {
	      /* eslint max-statements: [2, 17] */
	      this.options = options || {};
	      _.extend(this, _.pick(this.options, 'state', 'settings'));

	      // init per-instance children collection
	      this[CHILDREN] = [];
	      this[RENDERED] = false;
	      this[PARENT] = null;
	      this[CHILD_DEFINITIONS] = this.children;

	      // we want to make sure initialize is triggered *after* we append the views from the `this.views` array
	      var initialize = this.initialize;
	      this.initialize = noop;

	      Backbone.View.apply(this, arguments);

	      _.each(_.result(this, CHILD_DEFINITIONS), function (childDefinition) {
	        this.add.apply(this, _.isArray(childDefinition) ? childDefinition : [childDefinition]);
	      }, this);
	      delete this[CHILD_DEFINITIONS];

	      if (this.autoRender && this.model) {
	        var event = _.isArray(this.autoRender) ? _.map(this.autoRender, function (field) {
	          return 'change:' + field;
	        }).join(' ') : 'change';
	        this.listenTo(this.model, event, function () {
	          this.render();
	        });
	      }

	      this.initialize = initialize;
	      this.initialize.apply(this, arguments);
	      subscribeEvents(this);
	    },

	    /**
	    * Unregister view from container
	    * Note: this will not remove the view from the dom
	    * and will not call the `remove` method on the view
	    *
	    * @param {Archer.View} view the view to unregister
	    * @private
	    */
	    unregister: function (view) {

	      this.stopListening(view);
	      var viewIndex = getIndex(this, view);
	      // viewIndex is undefined when the view is not found (may have been removed)
	      // check if it is undefined to prevent unexpected thing to happen
	      // array.splice(undefined, x) removes the first x element(s) from the array
	      // this protects us against issues when calling `remove` on a child view multiple times
	      if (_.isNumber(viewIndex)) {
	        this[CHILDREN].splice(viewIndex, 1);
	      }
	    },

	    /**
	     * Should we auto render the view upon model change. Boolean or array of field names to listen to.
	     * @type {Boolean|Array}
	     * @deprecated Instead, please use modelEvents
	     * modelEvents: {
	     *   change:name: 'render'
	     * }
	     */
	    autoRender: false,

	    /**
	    * @type {(String|Function)}
	    * @alias Backbone.View#template
	    *
	    * When the template is an underscore template, the render method will pass the options has to the template
	    * And the associated model, if exists, when it will prefer the model over the options in case of a conflict.
	    * {@link #render View.render}
	    *
	    * Example:
	    *
	    * ```javascript
	    * var View = View.extend({
	    *   template: '<p class="name">{{name}}</p>'
	    * };
	    * ```
	    */
	    template: null,

	    /**
	     * A list of child view definitions to be passed to {@link #add this.add()}
	     *
	     * ```javascript
	     * var Container = View.extend({
	     *    template: '<p class="content"></p>',
	     *    children: [
	     *      [ContentView, '.content'],
	     *      [OtherContentView, '.content'],
	     *      OtherView
	     *    ]
	     *  })
	     *
	     * var Container = View.extend({
	     *    template: '<dov class="form-wrap"></div>',
	     *    children: function () {
	     *      return [
	     *        [FormView, '.form-wrap', {options: {model: this.optiosn.otherModel}}]
	     *      ]
	     *    }
	     *  })
	     * ```
	     * Note: these definitions will be added **before** the {@link #constructor initiliaze} method invokes.
	     * @type {Array|Function}
	     */
	    children: [],

	    /**
	    * Add a child view to the container.
	    * If the container is already rendered, will also render the view  and append it to the DOM.
	    * Otherwise will render and append once the container is rendered.
	    *
	    * Examples:
	    *
	    * ```javascript
	    * var Container = View.extend({
	    *
	    *   template: [
	    *     '<h1></h1>',
	    *     '<section></section>',
	    *   ].join(''),
	    *
	    *   initalize: function () {
	    *
	    *     this.add(TitleView, 'h1'); // will be added to <h1>
	    *
	    *     this.add(ContentView1, 'section'); // will be added to <section>
	    *
	    *     this.add(ContentView2, 'section', {prepend: true}); // will be add into <section> **before** ContentView1
	    *
	    *     this.add(OtherView, {
	    *       options: {
	    *         model: new Model()
	    *       }
	    *     }); // will be added **after** the <section> element
	    *
	    *     this.add('<p class="name">some html</p>'); //=> "<p class="name">some html</p>"
	    *     this.add('<p class="name">{{name}}</p>'); //=> "<p class="name">John Doe</p>"
	    *     this.add('{{name}}') //=> "<div>John Doe</div>"
	    *     this.add('<span>{{name}}</span> w00t') //=> "<div><span>John Doe</span> w00t</div>"
	    *   }
	    *
	    * });
	    *
	    * var container - new View({name: 'John Doe'});
	    *
	    * ```
	    * *We believe that for the sake of encapsulation, a view should control its own chilren, so we treat this method as
	    * protected and even though technically you can call `view.add` externally we strongly discourage it.*
	    *
	    * @param {(Archer.View|String)} view A class (or an instance which is discouraged) of a View - or an HTML
	    * string/template
	    * @param {String} [selector] selector in the view's template on which the view will be added to
	    * @param {Object} [options]
	    * @param {Boolean} [options.bubble=false] Bubble (proxy) events from this view up the chain
	    * @param {Boolean} [options.prepend=false] Prepend the view instend of appending
	    * @param {String} [options.selector] Selector in the view's template on which the view will be added to
	    * @param {Object} [options.options] Extra options to pass to the child constructor
	    * @protected
	    * @returns {Archer.View} - The instance of itself for the sake of chaining
	    */
	    add: function (view, selector, bubble, prepend, extraOptions) {
	      /* eslint max-statements: [2, 28], complexity: [2, 8] */

	      var options = {},
	          args = _.toArray(arguments);

	      if (_.isObject(selector)) {
	        options = selector;
	        selector = options.selector;
	        bubble = options.bubble;
	        prepend = options.prepend;
	        extraOptions = options.options;
	      }
	      else if (_.isObject(bubble)) {
	        options = bubble;
	        bubble = options.bubble;
	        prepend = options.prepend;
	        extraOptions = options.options;
	      }

	      if (_.isString(view)) {
	        view = (function (template) {
	          return View.extend({
	            constructor: function () {
	              try {
	                var $el = Backbone.$(template);
	                if ($el.length != 1) { throw 'invalid Element'; }
	                this.template = $el.html();
	                this.el = $el.empty()[0];
	              }
	              catch (e) { // not a valid html tag.
	                this.template = template;
	              }
	              View.apply(this, arguments);
	            }
	          });
	        }(view));
	      }

	      if (view.prototype && view.prototype instanceof View) {
	        /* eslint new-cap: 0 */
	        var viewOptions = _.omit(_.extend({}, this.options, extraOptions), 'el');
	        args[0] = new view(viewOptions);
	        return this.add.apply(this, args);
	      }

	      // prevent dups
	      if (_.isNumber(getIndex(this, view))) {
	        throw new Error('Duplicate child');
	      }

	      view[PARENT] = this;

	      // make the view responsible for adding itself to the parent:
	      // * register the selector in the closure
	      // * register a reference the parent in the closure
	      view[ADD_TO_CONTAINER] = (function (selector) {
	        return function () {
	          if (selector && view[PARENT].$(selector).length != 1) {
	            throw new Error('Invalid selector: ' + selector);
	          }
	          var $el = selector ? this[PARENT].$(selector) : this[PARENT].$el;
	          this.render();
	          // we need to delegate events in case
	          // the view was added and removed before
	          this.delegateEvents();

	          // this[PARENT].at(index).$el.before(this.el);
	          prepend ? $el.prepend(this.el) : $el.append(this.el);
	        };
	      }).call(view, selector);

	      // if flag to bubble events is set
	      // proxy all child view events
	      if (bubble) {
	        this.listenTo(view, 'all', function () {
	          this.trigger.apply(this, arguments);
	        });
	      }

	      // add to the dom if `render` has been called
	      if (this.rendered()) {
	        view[ADD_TO_CONTAINER]();
	      }

	      // add view to child views collection
	      this[CHILDREN].push(view);

	      return this;

	    },

	    /**
	    * Remove all children from container
	    */
	    removeChildren: function () {
	      this.each(function (view) {
	        view.remove();
	      });
	      return this;
	    },

	    /**
	    *  Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.
	    *  Also removes all childern of the view if any, and removes itself from its parent view(s)
	    */
	    remove: function () {
	      this.removeChildren();
	      if (this[PARENT]) {
	        this[PARENT].unregister(this);
	      }
	      return Backbone.View.prototype.remove.apply(this, arguments);
	    },

	    /**
	     * Compile the template to function you can apply tokens on on render time.
	     * Uses the underscore tempalting engine by default
	     * @protected
	     * @param  {String} template
	     * @return {Function} a compiled template
	     */
	    compileTemplate: function (template) {
	      /* eslint  okta/no-specific-methods: 0*/
	      return _.template(template);
	    },

	    /**
	     * Render a template with `this.model` and `this.options` as parameters
	     * preferring the model over the options.
	     *
	     * @param  {(String|Function)} template The template to build
	     * @return {String} An HTML string
	     * @protected
	     */
	    renderTemplate: function (template) {
	      if (_.isString(template)) {
	        template = this.compileTemplate(template);
	      }
	      if (_.isFunction(template)) {
	        return template(this.getTemplateData());
	      }
	    },

	    /**
	     * The data hash passed to the compiled template
	     * @return {Object}
	     * @protected
	     */
	    getTemplateData: function () {
	      var modelData = this.model && this.model.toJSON({verbose: true}) || {};
	      var options = _.omit(this.options, ['state', 'settings', 'model', 'collection']);
	      return _.defaults({}, modelData, options);
	    },

	    /**
	    * Renders the template to `$el` and append all children in order
	    * {@link #template View.template}
	    */
	    render: function () {
	      this.preRender();
	      doRender(this);
	      this.postRender();
	      return this;
	    },

	    /**
	     * Pre render routine. Will be called right *before* the logic in {@link #render} is executed
	     * @method
	     */
	    preRender: noop,

	    /**
	     * Post render routine. Will be called right *after* the logic in {@link #render} is executed
	     * @method
	     */
	    postRender: noop,

	    /**
	     * Was this instance rendered
	     */
	    rendered: function () {
	      return this[RENDERED];
	    },

	    /**
	     * get all direct child views.
	     *
	     * ```javascript
	     * var container = View.extend({
	     *   children: [View1, View2]
	     * }).render();
	     * container.getChildren() //=> [view1, view2];
	     * ```
	     *
	     * @return {Archer.View[]}
	     */
	    getChildren: function () {
	      return this.toArray();
	    },

	    /**
	    * Get a child by index
	    * @param {number} index
	    * @returns {Archer.View} The child view
	    */
	    at: function (index) {
	      return this.getChildren()[index];
	    },

	    /**
	    * Invokes a method on all children down the tree
	    *
	    * @param {String} method The method to invoke
	    */
	    invoke: function (methodName) {
	      var args = _.toArray(arguments);
	      this.each(function (child) {
	        // if child has children, bubble down the tree
	        if (child.size()) {
	          child.invoke.apply(child, args);
	        }
	        // run the function on the child
	        if (_.isFunction(child[methodName])) {
	          child[methodName].apply(child, args.slice(1));
	        }
	      });
	      return this;
	    }
	  });

	  // Code borrowed from Backbone.js source
	  // Underscore methods that we want to implement on the Container.
	  var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every',
	    'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without',
	    'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

	  _.each(methods, function (method) {
	    View.prototype[method] = function () {
	      var args = _.toArray(arguments);
	      args.unshift(_.toArray(this[CHILDREN]));
	      return _[method].apply(_, args);
	    };
	  }, this);

	  return View;


	  /**
	   * @method each
	   * @param {Function} iterator
	   * @param {Object} [context]
	   * See [_.each](http://underscorejs.org/#each)
	   */
	  /**
	   * @method map
	   * @param {Function} iterator
	   * @param {Object} [context]
	   * See [_.map](http://underscorejs.org/#map)
	   */
	  /**
	   * @method reduce
	   * @param {Function} iterator
	   * @param {Mixed} memo
	   * @param {Object} [context]
	   * See [_.reduce](http://underscorejs.org/#reduce)
	   */
	  /**
	   * @method reduceRight
	   * @param {Function} iterator
	   * @param {Mixed} memo
	   * @param {Object} [context]
	   * See [_.reduceRight](http://underscorejs.org/#reduceRight)
	   */
	  /**
	   * @method find
	   * @param {Function} predicate
	   * @param {Object} [context]
	   * See [_.find](http://underscorejs.org/#find)
	   */
	  /**
	   * @method filter
	   * @param {Function} predicate
	   * @param {Object} [context]
	   * See [_.filter](http://underscorejs.org/#filter)
	   */
	  /**
	   * @method reject
	   * @param {Function} predicate
	   * @param {Object} [context]
	   * See [_.reject](http://underscorejs.org/#reject)
	   */
	  /**
	   * @method every
	   * @param {Function} [predicate]
	   * @param {Object} [context]
	   * See [_.every](http://underscorejs.org/#every)
	   */
	  /**
	   * @method some
	   * @param {Function} [predicate]
	   * @param {Object} [context]
	   * See [_.some](http://underscorejs.org/#some)
	   */
	  /**
	   * @method contains
	   * @param {Mixed} value
	   * See [_.contains](http://underscorejs.org/#contains)
	   */
	  /**
	   * @method toArray
	   * See [_.toArray](http://underscorejs.org/#toArray)
	   */
	  /**
	   * @method size
	   * See [_.size](http://underscorejs.org/#size)
	   */
	  /**
	   * @method first
	   * @param {Number} [n]
	   * See [_.first](http://underscorejs.org/#first)
	   */
	  /**
	   * @method initial
	   * @param {Number} [n]
	   * See [_.initial](http://underscorejs.org/#initial)
	   */
	  /**
	   * @method last
	   * @param {Number} [n]
	   * See [_.last](http://underscorejs.org/#last)
	   */
	  /**
	   * @method rest
	   * @param {Number} [index]
	   * See [_.rest](http://underscorejs.org/#rest)
	   */
	  /**
	   * @method without
	   * See [_.without](http://underscorejs.org/#without)
	   */
	  /**
	   * @method indexOf
	   * @param {Mixed} value
	   * @param {Boolean} [isSorted]
	   * See [_.indexOf](http://underscorejs.org/#indexOf)
	   */
	  /**
	   * @method shuffle
	   * See [_.shuffle](http://underscorejs.org/#shuffle)
	   */
	  /**
	   * @method lastIndexOf
	   * @param {Mixed} value
	   * @param {Number} [fromIndex]
	   * See [_.shuffle](http://underscorejs.org/#lastIndexOf)
	   */
	  /**
	   * @method isEmpty
	   * See [_.isEmpty](http://underscorejs.org/#isEmpty)
	   */
	  /**
	   * @method chain
	   * See [_.chain](http://underscorejs.org/#chain)
	   */
	  /**
	   * @method where
	   * @param {Object} properties
	   * See [_.where](http://underscorejs.org/#where)
	   */
	  /**
	   * @method findWhere
	   * @param {Object} properties
	   * See [_.findWhere](http://underscorejs.org/#findWhere)
	   */


	}));


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(27),
	  __webpack_require__(31)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (BaseView, ListView) {
	   /**
	   * @class Okta.ListView
	   * @extends Archer.ListView
	   * @inheritdoc Archer.ListView
	   */
	  return BaseView.decorate(ListView);
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(29)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  /* global module, exports */
	  else if (typeof require == 'function' && typeof exports == 'object') {
	    module.exports = factory(require('underscore'), require('./View'));
	  }
	  else {
	    root.Archer || (root.Archer = {});
	    root.Archer.ListView = factory(root._, root.Archer.View);
	  }
	}(this, function (_, View) {

	  return View.extend({

	    /**
	    * @class Archer.ListView
	    * @extends Archer.View
	    * Archer.ListView is a {@link Archer.View} that operates on a collection and builds a list of "things" of the
	    * same type.
	    *
	    * Automagically adds, removes and sorts upon standard collection events.
	    *
	    * Example:
	    *
	    * ```javascript
	    * var UserList = Archer.ListView.extend({
	    *   tagName: 'ul',
	    *   item: '<li>{{fname}} {{lname}}</li>'
	    * });
	    *
	    * var users = new Archer.Collection([
	    *   {fname: 'John', lname: 'Doe'},
	    *   {fname: 'Jane', lname: 'Doe'}
	    * ]);
	    *
	    * var userList = new UserList({collection: users}).render();
	    * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li></ul>"
	    *
	    * users.push({fname: 'Jim', lname: 'Doe'});
	    * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li><li>Jim Doe</li></ul>"
	    *
	    * users.first().destroy();
	    * userList.el; //=> "<ul><li>Jane Doe</li><li>Jim Doe</li></ul>"
	    * ```
	    *
	    * @constructor
	    * @param {Object} options options hash
	    * @param {Object} options.collection The collection which this view operates on
	    *
	    * Listen to collection events so the ListView will do the right thing when a model is added or the collection
	    * is reset or sorted
	    *
	    */
	    constructor: function () {
	      View.apply(this, arguments);
	      if (!this.collection) {
	        throw new Error('Missing collection');
	      }
	      this.listenTo(this.collection, 'reset sort', this.reset);
	      this.listenTo(this.collection, 'add', this.addItem);
	      this.collection.each(this.addItem, this);
	    },

	   /**
	    * The view/template we will use to render each model in the collection.
	    * @type {String|Archer.View}
	    */
	    item: null,

	    /**
	     * A selector in the local template where to append each item
	     * @type {String}
	     */
	    itemSelector: null,


	    /**
	    * Empty the list and re-add everything from the collection.
	    * Usefull for handling `collection.reset()` or for handling the initial load
	    * @protected
	    */
	    reset: function () {
	      this.removeChildren();
	      this.collection.each(this.addItem, this);
	      return this;
	    },

	    /**
	    * Add an item view to the list that will represent one model from the collection
	    *
	    * Listen to the model so when it is destoyed or removed from the collection
	    * this item will remove itself from the list
	    *
	    * @param {Backbone.Model} model The model this row operates on
	    * @protected
	    */
	    addItem: function (model) {
	      var view = this.add(this.item, this.itemSelector, {options: {model: model}}).last();
	      view.listenTo(model, 'destroy remove', view.remove);
	      return this;
	    }

	  });

	}));


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-len: [2, 150], max-params: [2, 6] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(23),
	  __webpack_require__(33),
	  __webpack_require__(34),
	  __webpack_require__(16)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, Backbone, SettingsModel, Notification, ConfirmationDialog) {

	  return Backbone.Router.extend({

	    listen: Notification.prototype.listen,

	    /**
	    * @class Okta.Router
	    * A simple state machine that maps a route to a controller
	    *
	    *  Typically it will:
	    *
	    * - define which routes/modules the application has
	    * - Map a route to a controller
	    *
	    * See:
	    * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
	    * [Jasmine Spec](https://github.com/okta/okta-core/blob/master/WebContent/js/test/unit/spec/shared/util/BaseRouter_spec.js),
	    * [Backbone.Router](http://backbonejs.org/#Router)
	    *
	    * @constructor
	    *
	    * Creates the application settings object
	    *
	    * @param {Object} options options hash
	    * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
	    *
	    * @extends {Backbone.Router}
	    *
	    */
	    constructor: function (options) {
	      options || (options = {});
	      this.el = options.el;
	      this.settings = new SettingsModel(_.omit(options, 'el'));

	      Backbone.Router.apply(this, arguments);

	      this.listen('notification', this._notify);
	      this.listen('confirmation', this._confirm);
	    },

	    /**
	     * Fires up a confirmation dialog
	     *
	     * @param  {Object} options Options Hash
	     * @param  {String} options.title The title
	     * @param  {String} options.subtitle The explain text
	     * @param  {String} options.save The text for the save button
	     * @param  {Function} options.ok The callback function to run when hitting "OK"
	     * @param  {String} options.cancel The text for the cancel button
	     * @param  {Function} options.cancelFn The callback function to run when hitting "Cancel"
	     * @param  {Boolean} options.noCancelButton Don't render the cancel button (useful for alert dialogs)
	     *
	     * @private
	     *
	     * @return {Okta.View} the dialog view
	     */
	    _confirm: function (options) {
	      options || (options = {});
	      var Dialog = ConfirmationDialog.extend(
	       _.pick(options, 'title', 'subtitle', 'save', 'ok', 'cancel', 'cancelFn', 'noCancelButton', 'content', 'danger'));
	      // The model is here because itsa part of the BaseForm paradigm.
	      // It will be ignored in the context of a confirmation dialog.
	      var dialog = new Dialog({model: this.settings});
	      dialog.render();
	      return dialog; // test hook
	    },

	    /**
	     * Fires up a notification banner
	     *
	     * @param  {Object} options Options Hash
	     * @return {Okta.View} the notification view
	     * @private
	     */
	    _notify: function (options) {
	      var notification = new Notification(options);
	      $('#content').prepend(notification.render().el);
	      return notification; // test hook
	    },

	    /**
	     * Renders a Controller
	     * This will initialize new instance of a controller and call render on it
	     *
	     * @param  {Okta.Controller} Controller The controller Class we which to render
	     * @param  {Object} [options] Extra options to the controller constructor
	     */
	    render: function (Controller, options) {
	      if (this.controller) {
	        this.stopListening(this.controller);
	        this.stopListening(this.controller.state);
	        this.controller.remove();
	      }
	      options = _.extend(_.pick(this, 'settings', 'el'), options || {});
	      this.controller = new Controller(options);
	      this.controller.render();
	    },

	    /**
	    * Starts the backbone history object
	    *
	    * Waits for the dom to be ready before calling `Backbone.history.start()` (IE issue)
	    *
	    * See: [Backbone History](http://backbonejs.org/#History)
	    */
	    start: function () {
	      var args = arguments;
	      $(function () {
	        Backbone.history.start.apply(Backbone.history, args);
	      });
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Model) {

	  /**
	   * @class SettingsModel
	   * @extends {Okta.Model}
	   * @private
	   */

	  return Model.extend({
	    local: function () {
	      var settings = (window.okta && window.okta.settings) || {};
	      return {
	        orgId: ['string', false, settings.orgId],
	        orgName: ['string', false, settings.orgName],
	        isPreview: ['boolean', false, settings.isPreview],
	        serverStatus: ['string', false, settings.serverStatus],
	        permissions: ['array', true, settings.permissions || []]
	      };
	    },

	    extraProperties: true,

	    constructor: function () {
	      this.features = window._features || [];
	      Model.apply(this, arguments);
	    },

	    /**
	     * Checks if the user have a feature flag enabled (Based of the org level feature flag)
	     * @param  {String}  feature Feature name
	     * @return {Boolean}
	     */
	    hasFeature: function (feature) {
	      return _.contains(this.features, feature);
	    },

	    /**
	     * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
	     * @param  {Array}  featureArray Features names
	     * @return {Boolean} true if any of the give features are enabled. False otherwise
	     */
	    hasAnyFeature: function (featureArray) {
	      return _.some(featureArray, this.hasFeature, this);
	    },

	    /**
	     * Checks if the user have a specific permission (based on data passed from JSP)
	     * @param  {String}  permission Permission name
	     * @return {Boolean}
	     */
	    hasPermission: function (permission) {
	      return _.contains(this.get('permissions'), permission);
	    }
	    
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6), __webpack_require__(2), __webpack_require__(27)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, BaseView) {

	  var defaults = {
	    level: 'success',
	    message: 'Great Success!',
	    hide: true,
	    fade: 400,
	    delay: 3000,
	    width: 0,
	    dismissable: false
	  };

	  return BaseView.extend({

	    className: 'infobox infobox-confirm infobox-confirm-fixed',

	    events: {
	      'click .infobox-dismiss-link': 'fadeOut'
	    },

	    template: '\
	      {{#if dismissable}}\
	      <a class="infobox-dismiss-link" title="Dismiss" href="#">\
	        <span class="dismiss-icon"></span>\
	      </a>\
	      {{/if}}\
	      <span class="icon {{level}}-16"></span>\
	      {{#if title}}<h3>{{title}}</h3>{{/if}}\
	      <p>{{message}}</p>\
	    ',

	    initialize: function () {
	      this.options = _.defaults({}, this.options, defaults);
	      this.$el.addClass('infobox-' + this.options.level);
	      if (this.options.width) {
	        this.$el.width(this.options.width).css({
	          'margin-left': '0px',
	          'left': Math.round(($(window).width() - this.options.width) / 2)
	        });
	      }
	    },

	    getTemplateData: function () {
	      return _.extend(_.pick(this.options, 'level', 'message', 'title'), {
	        dismissable: this.options.hide === false || this.options.dismissable === true
	      });
	    },

	    postRender: function () {
	      if (this.options.hide) {
	        _.delay(_.bind(this.fadeOut, this), this.options.delay);
	      }
	    },

	    fadeOut: function () {
	      this.$el.fadeOut(this.options.fade, _.bind(this.remove, this));
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: [2, 6], max-len: [2, 150] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(27),
	  __webpack_require__(36),
	  __webpack_require__(33),
	  __webpack_require__(32)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, BaseView, StateMachine, SettingsModel, BaseRouter) {

	  function clean(obj) {
	    var res = {};
	    _.each(obj, function (value, key) {
	      if (!_.isNull(value)) {
	        res[key] = value;
	      }
	    });
	    return res;
	  }

	  return BaseView.extend({

	    /**
	    * @class Okta.Controller
	    * A Controller is our application control flow component.
	    *
	    *  Typically it will:
	    *
	    * - Initialize the models, controller and main views
	    * - Listen to events
	    * - Create, read, update and delete models
	    * - Create modal dialogs, confirmation dialogs and alert dialogs
	    * - Control the application flow
	    *
	    * See:
	    * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
	    * [Jasmine Spec](https://github.com/okta/okta-core/blob/master/WebContent/js/test/unit/spec/shared/util/BaseController_spec.js)
	    *
	    * @constructor
	    *
	    * The constructor is responsible for:
	    *
	    * - Create the application state object
	    * - Assign or creates the application settings object
	    * - Create an instance of the main view with the relevant parameters
	    *
	    * @param {Object} options Options Hash
	    * @param {SettingsModel} [options.settings] Application Settings Model
	    * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
	    *
	    */
	    constructor: function (options) {
	      /* eslint max-statements: [2, 13], complexity: [2, 7]*/
	      options || (options = {});

	      var stateData = _.defaults(clean(options.state), this.state || {});
	      this.state = new StateMachine(stateData);
	      delete options.state;

	      if (options.settings) {
	        this.settings = options.settings;
	      }
	      else { // allow the controller to live without a router
	        this.settings = new SettingsModel(_.omit(options || {}, 'el'));
	        this.listen('notification', BaseRouter.prototype._notify);
	        this.listen('confirmation', BaseRouter.prototype._confirm);
	      }

	      BaseView.call(this, options);

	      this.listenTo(this.state, '__invoke__', function () {
	        var args = _.toArray(arguments),
	            method = args.shift();
	        if (_.isFunction(this[method])) {
	          this[method].apply(this, args);
	        }
	      });


	      if (this.View) {
	        this.add(new this.View(this.toJSON()));
	      }
	    },

	    /**
	     * @property {Object} [state={}]
	     * The default values of our application state
	     */
	    state: {},


	    /**
	     * @property {Okta.View} [View=null]
	     * The main view this controller operate on
	     */
	    View: null,

	    /**
	     * Renders the {@link Okta.Controller#View main view} after the DOM is ready
	     * in case the controller is the root component of the page (e.g there's no router)
	     */
	    render: function () {
	      var args = arguments,
	          self = this;
	      $(function () {
	        BaseView.prototype.render.apply(self, args);
	      });
	      return this;
	    },

	    /**
	     * Creates the view constructor options
	     * @param {Object} [options] Extra options
	     * @return {Object} The view constructor options
	     */
	    toJSON: function (options) {
	      return _.extend(_.pick(this, 'state', 'settings', 'collection', 'model'), options || {});
	    },

	    /**
	     * Removes the child views, empty the DOM element and stop listening to events
	     */
	    remove: function () {
	      this.removeChildren();
	      this.stopListening();
	      this.$el.empty();
	      return this;
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Model) {

	  /**
	   * @class StateMachine
	   * @extends Okta.Model
	   * @private
	   *
	   * A state object that holds the applciation state
	   */

	  return Model.extend({
	    extraProperties: true,
	    /**
	     * Invokes a method on the applicable {@link Okta.Controller}
	     *
	     * ```javascript
	     * state.invoke('methodName', 'param1', 'param2')
	     * // Will call
	     * contoller.methodName('param1', 'param2')
	     * ```
	     * @param {String} methodName the name of the controller method to invoke on the controller
	     */
	    invoke: function () {
	      var args = _.toArray(arguments);
	      args.unshift('__invoke__');
	      this.trigger.apply(this, args);
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: [2, 14], max-statements: [2, 11] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(28),
	  __webpack_require__(7),
	  __webpack_require__(27),
	  __webpack_require__(39),
	  __webpack_require__(72),
	  __webpack_require__(38),
	  __webpack_require__(74),
	  __webpack_require__(76),
	  __webpack_require__(68),
	  __webpack_require__(75),
	  __webpack_require__(77),
	  __webpack_require__(78)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, $, TemplateUtil, StringUtil, BaseView,
	          InputFactory, InputLabel, InputContainer, InputWrapper,
	          ErrorBanner, ErrorParser, FormUtil, ReadModeBar, Toolbar) {

	  var template = '\
	    {{#if hasReadMode}}\
	      <h2 class="o-form-title-bar" data-se="o-form-title-bar">\
	        {{title}}\
	      </h2>\
	    {{/if}}\
	    <div data-se="o-form-content" class="o-form-content {{layout}} clearfix">\
	      {{#unless hasReadMode}}\
	        {{#if title}}\
	          <h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>\
	        {{/if}}\
	      {{/unless}}\
	      {{#if subtitle}}\
	        <p class="okta-form-subtitle o-form-explain" data-se="o-form-explain">{{subtitle}}</p>\
	      {{/if}}\
	      <div class="o-form-error-container" data-se="o-form-error-container"></div>\
	      <div class="o-form-fieldset-container" data-se="o-form-fieldset-container"></div>\
	    </div>\
	  ';

	  // polyfill for `pointer-events: none;` in IE < 11
	  // Logic borrowed from https://github.com/kmewhort/pointer_events_polyfill (BSD)
	  var pointerEventsSupported = ($('<div>').css({'pointer-events': 'auto'})[0].style.pointerEvents === 'auto');
	  function pointerEventsPolyfill(e) {
	    if (!pointerEventsSupported && this.$el.hasClass('o-form-saving')) {
	      var $el = $(e.currentTarget);

	      $el.css('display', 'none');
	      var underneathElem = document.elementFromPoint(e.clientX, e.clientY);
	      $el.css('display', 'block');

	      e.target = underneathElem;
	      $(underneathElem).trigger(e);

	      return false;
	    }
	  }


	  var events = {
	    submit: function (e) {
	      e.preventDefault();
	      this.__save();
	    }
	  };

	  _.each(['click', 'dblclick', 'mousedown', 'mouseup'], function (event) {
	    events[event + ' .o-form-input'] = pointerEventsPolyfill;
	  });

	  var attributes = function (model) {
	    model || (model = {});
	    var collection = model && model.collection || {};
	    return {
	      method: 'POST',
	      action: _.result(model, 'urlRoot') || _.result(collection, 'url') || window.location.pathname,
	      'data-se': 'o-form'
	    };
	  };

	  var convertSavingState = function (rawSavingStateEvent, defaultEvent) {
	    rawSavingStateEvent || (rawSavingStateEvent = '');
	    var savingStateEvent = [];
	    if (_.isString(rawSavingStateEvent)) {
	      savingStateEvent = rawSavingStateEvent.split(' ');
	    }
	    savingStateEvent = _.union(savingStateEvent, defaultEvent);
	    return savingStateEvent.join(' ');
	  };

	  /**
	  * @class Okta.Form
	  *
	  * A Form utility framework
	  *
	  * Okta.Form is a form that operates on one flat model
	  * It expose one main factory method, {@link #addInput}, which add inputs to the form,
	  * and each inputs operates on one field in the model, identified by the `name` field.
	  *
	  * See:
	  * [Basic O-Form Tutorial](https://github.com/okta/courage/wiki/Basic-O-Form)
	  *
	  * @extends Okta.View
	  */

	  /**
	  * @event save
	  * Fired when the "Save" button is clicked
	  * @param {Okta.BaseModel} model Model used in the form
	  */
	  /**
	  * @event saved
	  * Fired after the model is successfully saved - applies when {@link Okta.Form#autoSave} is set to true
	  * @param {Okta.BaseModel} model Model used in the form
	  */
	  /**
	  * @event error
	  * Fired when the model fires an invalid event or an error event;
	  * @param {Okta.BaseModel} model Model used in the form
	  */
	  /**
	  * @event resize
	  * Fired when the form layout is likely to be resized
	  * @param {Okta.BaseModel} model Model used in the form
	  */
	  /**
	  * @event cancel
	  * Fired when the "Cancel" button is clicked
	  */
	  /**
	   * @property {String|Array|Function} [validate]
	   * Specifies how to validate form:
	   * - In case "local" string provided as a value of the property,
	   * the form will validate only fields added as inputs to the form;
	   * - In case array is provided, the validation will be performed only for fields specified in array;
	   * - In case function is provided, provided function will be used as a validation function,
	   * it must return an error object with the format {fieldName: 'error text'} with as many fields as you need.
	   */

	  return BaseView.extend({

	    /**
	    * @constructor
	    * @param {Object} options options hash (See {@link Okta.View})
	    * @param {Object} options.model the model this form operates on
	    * @param {Boolean} [options.label-top=false] position label on top of inputs
	    * @param {Boolean} [options.wide=false] Use a wide input layout for all input
	    */

	    constructor: function (options) {
	      /* eslint max-statements: 0, complexity: 0 */
	      options || (options = {});
	      this.options = options;

	      this.id = _.uniqueId('form');
	      this.tagName = 'form';

	      _.defaults(this.events, events);
	      _.defaults(this.attributes, attributes(options.model));

	      this.__buttons = [];
	      this.__errorFields = {};

	      this.__saveModelState(options.model);

	      if (this.step) {
	        if (!this.save) {
	          this.save = (!this.totalSteps || this.step === this.totalSteps) ? 'Finish' : 'Next';
	        }
	        this.className += ' wizard';
	      }
	      this.className += ' o-form';

	      this.__toolbar = this.__createToolbar(options);

	      BaseView.call(this, options);

	      _.each(_.result(this, 'inputs') || [], function (input) {
	        // to ingore extra argumests from `each` iteratee function
	        // http://underscorejs.org/#each
	        this.__addLayoutItem(input);
	      }, this);

	      this.add(this.__toolbar, '');

	      this.listenTo(this.model, 'change:__edit__', this.__applyMode);

	      this.listenTo(this.model, 'invalid error', _.throttle(function (model, resp, showBanner) {
	        this.__showErrors(model, resp, showBanner !== false);
	      }, 100, {trailing: false}));

	      this.listenTo(this.model, 'form:resize', function () {
	        this.trigger('resize');
	      });

	      this.listenTo(this.model, 'form:cancel', _.throttle(this.__cancel, 100, {trailing: false}));
	      this.listenTo(this.model, 'form:previous', _.throttle(this.__previous, 100, {trailing: false}));

	      this.__save = _.throttle(this.__save, 200, {trailing: false});
	      this.listenTo(this.model, 'form:save', function () {
	        this.$el.submit();
	      });

	      this.listenTo(this.model, 'sync', function () {
	        if (this.model.get('__edit__')) {
	          this.model.set('__edit__', false, {silent: true});
	        }
	        this.__saveModelState(this.model);
	        this.render();
	      });

	      var hasSavingState = this.getAttribute('hasSavingState');

	      if (this.getAttribute('autoSave')) {
	        this.listenTo(this, 'save', function (model) {
	          var xhr = model.save();
	          if (xhr && xhr.done) {
	            xhr.done(_.bind(function () {
	              this.trigger('saved', model);
	            }, this));
	          }
	        });
	        if (_.isUndefined(hasSavingState)) {
	          hasSavingState = true;
	        }
	      }

	      /*
	       * Attach model event listeners
	       * by default, model's request event starts the form saving state,
	       * error and sync event stops it
	       * you can define customized saving start and stop state, like
	       * customSavingState: {start: 'requestingAdditionalInfo', stop: 'retrievedAdditionalInfo'}
	       * doing this does not override the default events
	       */
	      if (hasSavingState) {
	        var customSavingState = this.getAttribute('customSavingState', {});
	        this.listenTo(
	          this.model,
	          convertSavingState(customSavingState.start || '', ['request']),
	          this.__setSavingState
	        );
	        this.listenTo(
	          this.model,
	          convertSavingState(customSavingState.stop || '', ['error', 'sync']),
	          this.__clearSavingState
	        );
	      }
	    },

	    /**
	     * Create the bottom button bar
	     * @param  {Object} options options h
	     * @return {Okta.View} The toolbar
	     * @private
	     */
	    __createToolbar: function (options) {

	      var danger = this.getAttribute('danger'),
	          saveBtnClassName = danger === true ? 'button-error' : 'button-primary';

	      var toolbar = new Toolbar(_.extend({
	        save: this.save || StringUtil.localize('oform.save'),
	        saveClassName: saveBtnClassName,
	        cancel: this.cancel || StringUtil.localize('oform.cancel'),
	        noCancelButton: this.noCancelButton || false,
	        hasPrevStep: this.step && this.step > 1
	      }, options || this.options));

	      _.each(this.__buttons, function (args) {
	        toolbar.addButton.apply(toolbar, args);
	      });

	      return toolbar;
	    },

	    className: '',

	    attributes: {},

	    events: {},

	    /**
	    * @property {Array} [inputs] An array of input configurations to render in the form
	    */
	    inputs: [],

	    /**
	     * @private
	     */
	    template: null,

	    /**
	     * @property {Boolean|Function} [read=false] does the form support read/edit toggle.
	     */
	    read: false,

	    /**
	     * @property {Boolean|Function} [readOnly=false] Is the form in readOnly mode.
	     */
	    readOnly: false,

	    /**
	     * @property {Boolean|Function} [noButtonBar=false] Should we not render the button bar
	     */
	    noButtonBar: false,

	    /**
	     * @property {Boolean|Function} [noCancelButton=false] Should we not render a cancel button
	     */
	    noCancelButton: false,

	    /**
	     * @property {String} [save="Save"] The text on the save button
	     */
	    save: null,

	    /**
	     * @property {String} [cancel="Cancel"] The text on the cancel button
	     */
	    cancel: null,

	    /**
	     * @property {Boolean|Function} [danger=false] To use button-error to stylish the submit button
	     * instead of button-primary.
	     */
	    danger: false,

	    /**
	     * @property {String|Function} [layout=""] A layout CSS class to add to the form
	     */
	    layout: '',

	    /**
	     * @property {Number} [step] The step this form is in the context of a wizard
	     */
	    step: undefined,

	    /**
	     * @property {Number} [totalSteps] The total numbers of steps the wizard this form is a part of has
	     */
	    totalSteps: undefined,

	    /**
	     * @property {String|Function} [title] The form's title
	     */
	    title: null,

	    /**
	     * @property {String|Function} [subtitle] The form's subtitle
	     */
	    subtitle: null,

	    /**
	     * @property {Boolean} [autoSave=false]
	     * auto-save the model when hitting save.
	     * Trigger a `saved` event when done
	     */
	    autoSave: false,

	    /**
	     * @property {Boolean|Function} [scrollOnError=true] Scroll to the top of the form on error
	     */
	    scrollOnError: true,

	    /**
	     * @property {Boolean|Function} [showErrors=true] Show the error banner upon error
	     */
	    showErrors: true,

	    /**
	     * @property {String} [resizeSelector='.o-form-content'] The form's scrollable area
	     */
	    resizeSelector: '.o-form-content',

	    /**
	     * @property {Boolean} [hasSavingState=false] Sets whether or not the form shows the saving state when
	     * the model is saved.  Has no effect on setSavingState and clearSavingState as those are manual calls
	     * to trigger/clear the saving state.
	     */

	    /**
	     * Get an attribute value from options or instance
	     * Prefer options value over instance value
	     * @param  {String} name Name of the attribute
	     * @param  {Object} defaultValue the default value to return if the attribute is not found
	     * @return {Object} The value
	     */
	    getAttribute: function (name, defaultValue) {
	      var value = _.resultCtx(this.options, name, this);
	      if (_.isUndefined(value)) {
	        value = _.result(this, name);
	      }
	      return !_.isUndefined(value) ? value : defaultValue;
	    },

	    /**
	     * Does this form has a "read" mode
	     * @return {Boolean}
	     */
	    hasReadMode: function () {
	      return !!this.getAttribute('read');
	    },

	    /**
	     * Is this form in "read only" mode
	     * @return {Boolean}
	     */
	    isReadOnly: function () {
	      return !!this.getAttribute('readOnly');
	    },

	    /**
	     * Does this form have a button bar
	     * @return {Boolean}
	     */
	    hasButtonBar: function () {
	      return !(this.getAttribute('noButtonBar') || this.isReadOnly());
	    },

	    render: function () {

	      this.__readModeBar && this.__readModeBar.remove();
	      if (this.hasReadMode() && !this.isReadOnly()) {
	        var readModeBar = ReadModeBar.extend({
	          formTitle: this.getAttribute('title', '')
	        });
	        this.__readModeBar = this.add(readModeBar, '.o-form-title-bar').last();
	      }

	      var html = TemplateUtil.tpl(template)({
	        layout: this.getAttribute('layout', ''),
	        title: this.getAttribute('title', '', true),
	        subtitle: this.getAttribute('subtitle', '', true),
	        hasReadMode: this.hasReadMode()
	      });

	      this.$el.html(html);
	      delete this.template;

	      BaseView.prototype.render.apply(this, arguments);

	      this.__applyMode();

	      return this;
	    },

	    /**
	     * Changes form UI to indicate saving.  Disables all inputs and buttons.  Use this function if you have set
	     * hasSavingState to false on the the form
	     * @private
	     */
	    __setSavingState: function () {
	      this.model.trigger('form:set-saving-state');
	      this.$el.addClass('o-form-saving');
	    },

	    /**
	     * Changes form UI back to normal from the saving state.  Use this function if you are have set hasSavingState
	     * to false on the form
	     * @private
	     */
	    __clearSavingState: function () {
	      this.model.trigger('form:clear-saving-state');
	      this.$el.removeClass('o-form-saving');
	    },

	    /**
	     * Toggles the visibility of the bottom button bar
	     * @private
	     */
	    __toggleToolbar: function () {
	      this.__toolbar && this.__toolbar.remove();
	      if (this.hasButtonBar() && this._editMode()) {
	        this.__toolbar = this.__createToolbar();
	        this.add(this.__toolbar, '');
	      }
	      this.trigger('resize');
	    },

	    /**
	     * Cancels this form
	     * - Reset the model to the previous state
	     * - Clears all errors
	     * - Triggers a `cancel` event
	     * - Sets the model to read mode (if applicable)
	     * @private
	     * @fires cancel
	     */
	    __cancel: function () {
	      /* eslint max-statements: [2, 12] */
	      var edit = this.model.get('__edit__');
	      this.model.clear({silent: true});
	      var data;
	      if (this.model.sanitizeAttributes) {
	        data = this.model.sanitizeAttributes(this.__originalModel);
	      }
	      else {
	        data = _.clone(this.__originalModel);
	      }
	      this.model.set(data, {silent: true});
	      this.trigger('cancel', this.model);
	      this.model.trigger('cache:clear');
	      if (edit) {
	        this.model.set('__edit__', false, {silent: true});
	        this.model.trigger('change:__edit__', this.model, false);
	      }
	      this.clearErrors();
	    },

	    /**
	     * Runs {@link #validate} to check the model state
	     * triggers an "invalid" event on the model if validation fails
	     * @returns {Boolean}
	     */

	    isValid: function () {
	      var res,
	          self = this;

	      function validateArray(arr) {
	        return _.reduce(arr, function (memo, fieldName) {
	          return _.extend(memo, self.model.validateField(fieldName));
	        }, {});
	      }

	      if (_.isUndefined(this.validate)) {
	        return this.model.isValid();
	      }
	      else if (_.isFunction(this.validate)) {
	        res = this.validate();
	      }
	      else if (_.isArray(this.validate)) {
	        res = validateArray(this.validate);
	      }
	      else if (this.validate === 'local') {
	        res = validateArray(this.getInputs().map(function (input) {
	          return input.options.name;
	        }));
	      }

	      if (!_.isEmpty(res)) {
	        this.model.trigger('invalid', this.model, res);
	        return false;
	      }
	      else {
	        return true;
	      }
	    },

	    /**
	     * A throttled function that saves the form not more than once every 100 ms
	     * Basically all this method does is trigger a `save` event
	     * @fires save
	     * @private
	     */
	    __save: function () {
	      this.clearErrors();
	      if (this.isValid()) {
	        this.trigger('save', this.model);
	      }
	    },

	    /**
	     * In the context of a wizard, go to previous state
	     * Technically all this method does is trigger a `previous` event
	     * @param  {Event} e
	     * @private
	     */
	    __previous: function () {
	      this.trigger('previous', this.model);
	    },

	    /**
	     * Renders the form in the correct mode based on the model.
	     * @private
	     */
	    __applyMode: function () {
	      this.clearErrors();
	      this.__toggleToolbar();

	      if (this._editMode()) {
	        this.$el.addClass('o-form-edit-mode');
	        this.$el.removeClass('o-form-read-mode');
	        this.$('.o-form-content').removeClass('rounded-btm-4');
	        this.focus();
	      }
	      else {
	        this.$el.removeClass('o-form-edit-mode');
	        this.$el.addClass('o-form-read-mode');
	        this.$('.o-form-content').addClass('rounded-btm-4');
	      }
	    },

	    /**
	     * Is the form in edit mode
	     * @return {Boolean}
	     * @private
	     */
	    _editMode: function () {
	      return this.model.get('__edit__') || !this.hasReadMode();
	    },

	    /**
	     * Function can be overridden to alter error summary
	     * @param {Object} responseJSON
	     */
	    parseErrorMessage: _.identity,

	    /**
	     * Show an error message based on an XHR error
	     * @param  {Okta.BaseModel} model the model
	     * @param  {jqXHR} xhr The jQuery XmlHttpRequest Object
	     * @private
	     */
	    __showErrors: function (model, resp, showBanner) {
	      this.trigger('error', model);

	      /* eslint max-statements: 0 */
	      if (this.getAttribute('showErrors')) {

	        var errorSummary;

	        // trigger events for field validation errors
	        var validationErrors = ErrorParser.parseFieldErrors(resp);
	        if (_.size(validationErrors)) {
	          _.each(validationErrors, function (errors, field) {
	            this.model.trigger('form:field-error', this.__errorFields[field] || field, _.map(errors, function (error) {
	              return (/^model\.validation/).test(error) ? StringUtil.localize(error) : error;
	            }));
	          }, this);
	        }
	        else {
	          var responseJSON = ErrorParser.getResponseJSON(resp);
	          responseJSON = this.parseErrorMessage(responseJSON);
	          errorSummary = responseJSON && responseJSON.errorSummary;
	        }

	        // show the error message
	        if (showBanner) {
	          this.$('.o-form-error-container').addClass('o-form-has-errors');
	          this.add(ErrorBanner, '.o-form-error-container', {options: {errorSummary: errorSummary}});
	        }

	        // slide to and focus on the error message
	        if (this.getAttribute('scrollOnError')) {
	          var $el = $('#' + this.id + ' .o-form-error-container');
	          $el.length && $('html, body').animate({scrollTop: $el.offset().top}, 400);
	        }

	        this.model.trigger('form:resize');

	      }
	    },

	    /**
	     * Clears the error banner
	     * @private
	     */
	    clearErrors: function () {
	      this.$('.o-form-error-container').removeClass('o-form-has-errors');
	      this.model.trigger('form:clear-errors');
	      this.model.trigger('form:resize');
	    },


	    /**
	     * Toggles between edit and read mode
	     */
	    toggle: function () {
	      this.model.set('__edit__', !this.hasReadMode() || !this.model.get('__edit__'));
	      return this;
	    },

	    __addLayoutItem: function (input) {
	      if (InputFactory.supports(input)) {
	        this.addInput(input);
	      }
	      else {
	        this.__addNonInputLayoutItem(input);
	      }
	    },

	    __addNonInputLayoutItem: function (item) {
	      var itemOptions = _.omit(item, 'type');
	      switch (item.type) {
	      case 'sectionTitle':
	        this.addSectionTitle(item.title, _.omit(itemOptions, 'title'));
	        break;
	      case 'divider':
	        this.addDivider(itemOptions);
	        break;
	      default:
	        throw new Error('unknown input: ' + item.type);
	      }
	    },

	    /**
	     * Adds a view to the buttons tool bar
	     * @param {Object} params parameterized button options
	     * @param {Object} options options to send to {@link Okta.View#add}
	     */
	    addButton: function (params, options) {
	      this.__toolbar && this.__toolbar.addButton(params, options);
	      this.__buttons.push([params, options]);
	    },

	    /**
	     * Adds a divider
	     */
	    addDivider: function (options) {
	      this.add('<div class="okta-form-divider form-divider"></div>');
	      FormUtil.applyShowWhen(this.last(), options && options.showWhen);
	      return this;
	    },

	    /**
	     * Adds section header
	     * @param {String} title
	     */
	    addSectionTitle: function (title, options) {
	      this.add(TemplateUtil.tpl('<h2 class="o-form-head">{{title}}</h2>')({title: title}));
	      FormUtil.applyShowWhen(this.last(), options && options.showWhen);
	      return this;
	    },

	    /**
	     * Add a form input
	     * @param {Object} options Options to describe the input
	     * @param {String} options.type The input type.
	     * The options are: `text`, `textarea`, `select`, `checkbox`, `radio`,
	     * `password`, `number`, `textselect`, `date`, `grouppicker`, `su-orgspicker`
	     * `file/image`, `file/cert`
	     * @param {String} options.name The name of the model field this input mutates
	     * @param {String|Function} [options.label]
	     * The input label text.
	     * When passed as a function, will invoke the function (in the context of the {@link InputLabel})
	     * on render time, and use the returned value.
	     * @param {String} [options.sublabel] The input sub label text
	     * @param {String} [options.tooltip] A popover tooltip to be displayed next to the label
	     * @param {String} [options.placeholder] Placeholder text.
	     * @param {String} [options.explain] Explanation text to render below the input
	     * @param {Okta.View} [options.customExplain] A custom view to render below the input (deprecated)
	     * @param {Boolean} [options.disabled=false] Make this input disabled
	     * @param {Boolean} [options.wide=false] Use a wide input layout
	     * @param {Boolean} [options.label-top=false] position label on top of an input
	     * @param {Number} [options.multi] have multiple in-line inputs. useful when `input` is passed as an array of inputs
	     * @param {String} [options.errorField] The API error field here that maps to this input
	     * @param {Boolean} [options.inlineValidation=true] Validate input on focusout

	     * @param {Object} [options.options]
	     * In the context of `radio` and `select`, a key/value set of options
	     *
	     * @param {Object} [options.params]
	     * Widget specific parameters. Varies per input.
	     *
	     * @param {BaseInput|Object[]} [options.input]
	     * - A custom input "class" or instance - preferably a **class**, so we can automagically assign the right
	     * parameters when initializing it
	     * - An array of input definition object literals (such as this one)
	     *
	     * @param {Object} [options.showWhen]
	     * Setting to define when to show (or hide) the input
	     * In the following example the field will be visible when `advanced` is set to `true`
	     * and `mode` is set to `"ON"`:
	     *
	     * ```javascript
	     * showWhen: {
	     *   'advanced': true,
	     *   'mode': function (value) {
	     *     return value == 'ON' // this is identical to this.model.get('mode') == 'ON'
	     *   }
	     * }
	     * ```
	     * The input is visible by default
	     *
	     * @param {Object} [options.bindings]
	     * Bind a certain model attribute to a callback function, so the function is being called on render,
	     * and any time this model field changes.
	     * This is similar to `showWhen` but is not limited to toggling.
	     *
	     * ```javascript
	     * bindings: {
	     *   'status mode': function (status, mode) {
	     *      var labelView = this.getLabel();
	     *      if (status == 1) {
	     *        labelView.options.label = 'Something';
	     *      }
	     *      else {
	     *        labelView.options.label = mode;
	     *      }
	     *      labelView.render();
	     *   }
	     * }
	     * ```
	     *
	     * @param {Function} [options.render]
	     * A post-render hook that will run upon render on InputWrapper
	     *
	     * @param {String|Function} className   A className to apply on the {@link InputWrapper}
	     *
	     * @param {Function} [options.initialize]
	     * An `initialize` function to run when initializing the {@link InputWrapper}
	     * Useful for state mutation on start time, and complex state logic
	     */
	    addInput: function (_options) {

	      _options = _.clone(_options);

	      FormUtil.validateInput(_options, this.model);

	      var inputsOptions = FormUtil.generateInputOptions(_options, this, this.__createInput).reverse(),
	          inputs = _.map(inputsOptions, this.__createInput, this);

	      _.each(inputsOptions, function (input) {
	        if (input.errorField) {
	          this.__errorFields[input.errorField] = input.name;
	        }
	      }, this);

	      var options = {
	        inputId: _.last(inputs).options.inputId,
	        input: inputs,
	        multi: inputsOptions.length > 1 ? inputsOptions.length : undefined
	      };
	      _.extend(options, _.omit(this.options, 'input'), _.omit(_options, 'input'));

	      var inputWrapper = this.__createWrapper(options);
	      if (options.label !== false) {
	        inputWrapper.add(this.__createLabel(options));
	      }
	      inputWrapper.add(this._createContainer(options));
	      inputWrapper.type = options.type || options.input.type || 'custom';

	      var args = [inputWrapper].concat(_.drop(arguments, 1));
	      return this.add.apply(this, args);
	    },

	    /**
	     * @private
	     */
	    __createInput: function (options) {
	      options = _.pick(options, FormUtil.INPUT_OPTIONS);
	      return InputFactory.create(options);
	    },

	    /**
	     * @private
	     */
	    __createWrapper: function (options) {
	      options = _.pick(options, FormUtil.WRAPPER_OPTIONS);
	      return new InputWrapper(options);
	    },

	    /**
	     * @private
	     */
	    __createLabel: function (options) {
	      options = _.pick(options, FormUtil.LABEL_OPTIONS);
	      return new InputLabel(options);
	    },

	    /**
	     * @private
	     */
	    _createContainer: function (options) {
	      options = _.pick(options, FormUtil.CONTAINER_OPTIONS);
	      return new InputContainer(options);
	    },

	    /**
	     * Stores the current attributes of the model to a private property
	     * @param  {Okta.BaseModel} model The model
	     * @private
	     */
	    __saveModelState: function (model) {
	      this.__originalModel = model.clone().attributes;
	    },

	    /**
	     * @override
	     * @ignore
	     */
	    add: function () {
	      var args = _.toArray(arguments);
	      typeof args[1] === 'undefined' && (args[1] = '> div.o-form-content > .o-form-fieldset-container');
	      return BaseView.prototype.add.apply(this, args);
	    },

	    /**
	     * Set the focus on the first input in the form
	     */
	    focus: function () {
	      var first = this.getInputs().first();
	      if (first && first.focus) {
	        first.focus();
	      }
	      return this;
	    },

	    /**
	     * Disable all inputs in the form
	     * @deprecated not currently in use
	     */
	    disable: function () {
	      this.invoke('disable');
	      return this;
	    },

	    /**
	     * Enable all inputs in the form
	     * @deprecated not currently in use
	     */
	    enable: function () {
	      this.invoke('enable');
	    },

	    /**
	     * Set the max-height for o-form-content class container within the form if a height is provided,
	     * otherwise, get its computed inner height
	     * @param {Number} the height in pixel to set for class o-form-content
	     * @return {Number}
	     */
	    contentHeight: function (height) {
	      var content = this.$('.o-form-content');
	      if (_.isNumber(height)) {
	        content.css('max-height', height);
	      } else {
	        return content.height();
	      }
	    },

	    /**
	     * Get only the input children
	     * @return {InputWrapper[]} An underscore wrapped array of {@link InputWrapper} instances
	     */
	    getInputs: function () {
	      return _(this.filter(function (view) {
	        return view instanceof InputWrapper;
	      }));
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(28),
	  __webpack_require__(13),
	  __webpack_require__(27)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, TemplateUtil, Logger, BaseView) {

	  function extendsBaseView(obj) {
	    return obj instanceof BaseView || obj.prototype instanceof BaseView;
	  }

	  /**
	   * @class InputContainer
	   * @private
	   *
	   * TODO: OKTA-80796
	   * Attention: Please change with caution since this is used in other places
	   */
	  return BaseView.extend({

	    attributes: function () {
	      return {
	        'data-se': 'o-form-input-container'
	      };
	    },

	    className: function () {
	      var className = 'o-form-input';
	      if (this.options.wide) {
	        className += ' o-form-wide';
	      }
	      if (_.contains([1, 2, 3, 4], this.options.multi)) {
	        className += ' o-form-multi-input-' + this.options.multi;
	        if (_.isArray(this.options.input)) {
	          var inputGroup = _.find(this.options.input, function (input) {
	            return _.contains(['text+select', 'select+text'], input.options.type);
	          });
	          inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
	        }
	      }
	      return className;
	    },

	    _getNames: function () {
	      /*eslint complexity: 0 */
	      var names = _.isArray(this.options.name) ? this.options.name : [this.options.name];
	      if (this.options.type == 'group') {
	        names.push.apply(names, _.pluck(this.options.input[0].options.params.inputs, 'name'));
	      }
	      else if (_.isArray(this.options.name)) {
	        if (this.options.input && this.options.input.options && this.options.input.options.name) {
	          names.push(this.options.input.options.name);
	        }
	      }
	      else if (this.options.input) {
	        if (_.isArray(this.options.input)) {
	          _.each(this.options.input, function (inputItem) {
	            names.push(inputItem.options.name);
	          });
	        }
	        else {
	          names.push(this.options.input.options.name);
	        }
	      }
	      return _.uniq(_.compact(names));
	    },

	    constructor: function () {
	      /* eslint max-statements: [2, 18] */
	      BaseView.apply(this, arguments);

	      // we want to append the input *before* the explain text
	      if (this.options.input) {
	        if (_.isArray(this.options.input)) {
	          _.each(this.options.input, function (inputItem) {
	            this.add(inputItem, {prepend: true});
	          }, this);
	        } else {
	          this.add(this.options.input, {prepend: true});
	        }
	      }

	      this.__setExplain(this.options);

	      var names = this._getNames();

	      this.listenTo(this.model, 'form:field-error', function (name, errors) {
	        if (_.contains(names, name)) {
	          this.__setError(errors);
	        }
	      });

	      this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
	      this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

	      if (_.resultCtx(this.options, 'autoRender', this)) {
	        this.listenTo(this.model, 'change:' + this.options.name, this.render);
	      }

	      this.__errorState = false;

	    },

	    /**
	     * Populates the explain on the input container (if it exists). There are
	     * two ways to use this:
	     * 1. Raw text - wraps in the correct html template
	     * 2. Custom html
	     *    - pass in a View class (preferred)
	     *    - pass in an instance of a View
	     * Some additional notes:
	     * - You can pass a function that returns any of the above
	     * - This maintains support for the deprecated "customExplain" property
	     *   that was used before. This pattern is superseded by explain, so use
	     *   that instead.
	     * @private
	     */
	    __setExplain: function (options) {
	      var explain;

	      // Deprecated - if you need custom html, use explain instead
	      if (options.customExplain) {
	        Logger.warn('Deprecated - use explain instead of customExplain');
	        this.add(this.options.customExplain);
	        return;
	      }

	      explain = options.explain;
	      if (_.isFunction(explain) && !extendsBaseView(explain)) {
	        explain = _.resultCtx(this.options, 'explain', this);
	      }
	      if (!explain) {
	        return;
	      }

	      if (extendsBaseView(explain)) {
	        this.template = '<p class="o-form-explain"></p>';
	        this.add(explain, '.o-form-explain');
	      }
	      else {
	        this.template = '<p class="o-form-explain">{{explain}}</p>';
	      }
	    },

	    /**
	     * Highlight the input as invalid (validation failed)
	     * Adds an explaination message of the error
	     * @private
	     */
	    __setError: function (errors) {

	      this.__errorState = true;
	      this.$el.addClass('o-form-has-errors');

	      var tmpl = [
	        '<p class="okta-form-input-error o-form-input-error o-form-explain" role="alert">',
	        '<span class="icon icon-16 error-16-small"></span>',
	        '{{text}}',
	        '</p>'
	      ].join('');

	      var html = TemplateUtil.tpl(tmpl)({text: errors.join(', ')});
	      var $elExplain = this.$('.o-form-explain').not('.o-form-input-error').first();

	      if ($elExplain.length) {
	        $elExplain.before(html);
	      }
	      else {
	        this.$el.append(html);
	      }


	    },

	    /**
	     * Un-highlight the input and remove explaination text
	     * @private
	     */
	    __clearError: function () {
	      if (this.__errorState) {
	        this.$('.o-form-input-error').remove();
	        this.$el.removeClass('o-form-has-errors');
	        this.__errorState = false;
	        _.defer(_.bind(function () {
	          this.model.trigger('form:resize');
	        }, this));
	      }
	    },


	    focus: function () {
	      this.each(function (view) {
	        if (view.focus) {
	          return view.focus();
	        }
	      });

	      return this;
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: 0 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(42),
	  __webpack_require__(41),
	  __webpack_require__(45),
	  __webpack_require__(46),
	  __webpack_require__(48),
	  __webpack_require__(50),
	  __webpack_require__(51),
	  __webpack_require__(52),
	  __webpack_require__(53),
	  __webpack_require__(54),
	  __webpack_require__(40),
	  __webpack_require__(55),
	  __webpack_require__(56),
	  __webpack_require__(57),
	  __webpack_require__(58),
	  __webpack_require__(59),
	  __webpack_require__(60),
	  __webpack_require__(61),
	  __webpack_require__(65),
	  __webpack_require__(66),
	  __webpack_require__(71)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseInput, TextBox, TextArea, Select, Radio, CheckBox, TextSelect, TextPlusSelect, DateBox, NumberBox,
	          GroupPicker, UserPicker, AppPicker, AppInstancePicker, SUOrgsPicker, ZonePicker, ListInput, InputGroup,
	          SimpleCheckBoxSet, ImageFileUploader, CertificationFileUploader) {

	  var inputTypesMap = {
	    'file/image': ImageFileUploader,
	    'file/cert': CertificationFileUploader,
	    'select': Select,
	    'textarea': TextArea,
	    'radio': Radio,
	    'checkbox': CheckBox,
	    'text': TextBox,
	    'password': TextBox,
	    'number': NumberBox,
	    'textselect': TextSelect,
	    'text+select': TextPlusSelect,
	    'select+text': TextPlusSelect,
	    'date': DateBox,
	    'grouppicker': GroupPicker,
	    'userpicker': UserPicker,
	    'apppicker': AppPicker,
	    'appinstancepicker': AppInstancePicker,
	    'su-orgspicker': SUOrgsPicker,
	    'zonepicker': ZonePicker,
	    'list': ListInput,
	    'group': InputGroup,
	    'checkboxset': SimpleCheckBoxSet
	  };

	  function createInput(Input, options) {
	    if (Input.prototype instanceof BaseInput) {
	      return new Input(_.omit(options, 'input'));
	    }
	    else {
	      return Input;
	    }
	  }

	  function create(options) {
	    /* eslint complexity: 0 */
	    options = _.clone(options);

	    if (options.input) {
	      return createInput(options.input, options);
	    }

	    var Input;
	    if (inputTypesMap[options.type]) {
	      Input = inputTypesMap[options.type];
	    }
	    else {
	      throw new Error('unknown input: ' + options.type);
	    }
	    return createInput(Input, options);
	  }

	  function supports(input) {
	    if (input.input || input.type in inputTypesMap) {
	      return true;
	    }
	    return false;
	  }

	  return {
	    create: create,
	    supports: supports
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 40 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(28),
	  __webpack_require__(42),
	  __webpack_require__(43),
	  __webpack_require__(44)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (TemplateUtil, BaseInput, Keys) {

	  var className = 'okta-form-input-field input-fix';

	  return BaseInput.extend({

	    template: TemplateUtil.tpl('<input type="{{type}}" placeholder="{{placeholder}}"\
	      name="{{name}}" id="{{inputId}}" value="{{value}}"/>'),

	    /**
	    * @Override
	    */
	    events: {
	      'input input': 'update',
	      'change input': 'update',
	      'keydown input': 'update',
	      'keyup input': function (e) {
	        if (Keys.isEnter(e)) {
	          this.model.trigger('form:save');
	        }
	        else if (Keys.isEsc(e)) {
	          this.model.trigger('form:cancel');
	        }
	      }
	    },

	    constructor: function () {
	      BaseInput.apply(this, arguments);
	      this.$el.addClass('o-form-control');
	    },

	    /**
	    * @Override
	    */
	    editMode: function () {
	      this.$el.addClass(className);
	      BaseInput.prototype.editMode.apply(this, arguments);
	      this.$('input').placeholder();
	    },

	    /**
	    * @Override
	    */
	    readMode: function () {
	      BaseInput.prototype.readMode.apply(this, arguments);
	      if (this.options.type == 'password') {
	        this.$el.text('********');
	      }
	      this.$el.removeClass(className);
	    },

	    /**
	    * @Override
	    */
	    val: function () {
	      //IE will only read clear text pw if type="password" is explicitly in selector
	      return this.$('input[type="' + this.options.type + '"]').val();
	    },

	    /**
	    * @Override
	    */
	    focus: function () {
	      return this.$('input').focus();
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-statements: [2, 13] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(27)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView) {

	  /**
	   * @class BaseInput
	   * @private
	   * An abstract object that defines an input for {@link Okta.Form}
	   *
	   * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
	   * @extends Okta.View
	   */

	  return BaseView.extend({

	    tagName: 'span',

	    attributes: function () {
	      return {
	        'data-se': 'o-form-input-' + this.getNameString()
	      };
	    },

	    /**
	    * default placeholder text when options.placeholder is not defined
	    */
	    defaultPlaceholder: '',

	    constructor: function (options) {
	      options = _.defaults(
	        options || {},
	        {
	          inputId: options.id || _.uniqueId('input'),
	          placeholder: this.defaultPlaceholder,
	          inlineValidation: true
	        }
	      );

	      delete options.id;

	      // decorate the `enable` and `disable` and toggle the `o-form-disabled` class.
	      // so we wont need to worry about this when overriding the methods
	      var self = this;
	      _.each({enable: 'removeClass', disable: 'addClass'}, function (method, action) {
	        self[action] = _.wrap(self[action], function (fn) {
	          fn.apply(self, arguments);
	          self.$el[method]('o-form-disabled');
	        });
	      });

	      BaseView.call(this, options);

	      if (_.result(options, 'readOnly') !== true && _.result(options, 'read') === true) {
	        this.listenTo(this.model, 'change:__edit__', this.render);
	      }

	      if (_.isFunction(this.focus)) {
	        this.focus = _.debounce(_.bind(this.focus, this), 50);
	      }

	      if (_.result(options, 'inlineValidation')) {
	        this.$el.on('focusout', ':input', _.bind(this.validate, this));
	      }

	      this.addModelListeners();
	      this.$el.addClass('o-form-input-name-' + this.getNameString());
	    },

	    toModelValue: function () {
	      var value = this.val();
	      if (_.isFunction(this.to)) {
	        value = this.to.call(this, value);
	      }
	      if (_.isFunction(this.options.to)) {
	        value = this.options.to.call(this, value);
	      }
	      return value;
	    },

	    /**
	     * updates the model with the input's value
	     */
	    update: function () {
	      this.model.set(this.options.name, this.toModelValue());
	    },

	    /**
	     * Is the input in edit mode
	     * @return {Boolean}
	     */
	    isEditMode: function () {
	      var ret = !_.result(this.options, 'readOnly') &&
	        (_.result(this.options, 'read') !== true || this.model.get('__edit__') === true);
	      return ret;
	    },

	    /**
	     * Renders the input
	     * @readonly
	     */
	    render: function () {
	      this.preRender();
	      var params = this.options.params;
	      this.options.params = _.resultCtx(this.options, 'params', this);

	      if (this.isEditMode()) {
	        this.editMode();
	        if (_.resultCtx(this.options, 'disabled', this)) {
	          this.disable();
	        } else {
	          this.enable();
	        }
	      }
	      else {
	        this.readMode();
	      }

	      this.options.params = params;
	      this.postRender();

	      return this;
	    },

	    /**
	     * checks if the current value in the model is valid for this field
	     */
	    validate: function () {
	      if (!this.model.get('__pending__') && this.isEditMode() && _.isFunction(this.model.validateField)) {
	        var validationError = this.model.validateField(this.options.name);
	        if (validationError) {
	          _.delay(function () {
	            this.model.trigger('form:clear-error:' + this.options.name);
	            this.model.trigger('invalid', this.model, validationError, false);
	          }.bind(this), 100);
	        }
	      }
	    },

	    /**
	    * Add model event listeners
	    */
	    addModelListeners: function () {
	      this.listenTo(this.model, 'form:field-error', function (name) {
	        if (this.options.name === name) {
	          this.__markError();
	        }
	      });
	      this.listenTo(this.model, 'form:clear-errors change:' + this.options.name, this.__clearError);
	      this.listenTo(this.model, 'form:clear-error:' + this.options.name, this.__clearError);
	    },

	    /**
	    * The value of the input
	    * @return {Mixed}
	    */
	    val: function () {
	      throw new Error('val() is an abstract method');
	    },

	    /**
	    * Set focus on the input
	    */
	    focus: function () {
	      throw new Error('focus() is an abstract method');
	    },

	    /**
	    * Default value in read mode
	    * When model has no value for the field
	    */
	    defaultValue: function () {
	      return '';
	    },

	    /**
	    * Renders the input in edit mode
	    */
	    editMode: function () {
	      var options = _.extend({}, this.options, {
	        value: this.getModelValue()
	      });
	      this.$el.html(this.template(options));
	      this.options.multi && this.$el.removeClass('margin-r');
	      return this;
	    },

	    /**
	    * Renders the readable value of the input in read mode
	    */
	    readMode: function () {
	      this.$el.text(this.getReadModeString());
	      this.$el.removeClass('error-field');
	      this.options.multi && this.$el.addClass('margin-r');
	      return this;
	    },

	    getReadModeString: function () {
	      var readModeStr = _.resultCtx(this.options, 'readModeString', this);
	      if (readModeStr) {
	        return readModeStr;
	      }
	      return this.toStringValue();
	    },

	    /**
	     * The model value off the field associated with the input
	     * @return {Mixed}
	     */
	    getModelValue: function () {
	      var value = this.model.get(this.options.name);

	      if (_.isFunction(this.from)) {
	        value = this.from.call(this, value);
	      }
	      if (_.isFunction(this.options.from)) {
	        value = this.options.from.call(this, value);
	      }
	      return value;
	    },

	    /*
	    * convenience method to get the textual value from the model
	    * will return the textual label rather than value in case of select/radio
	    * @return {String}
	    */
	    toStringValue: function () {
	      var value = this.getModelValue();
	      if (this.options.options) { // dropdown or radio
	        value = this.options.options[value];
	      }
	      return value || this.defaultValue();
	    },

	    /**
	     * Triggers a form:resize event in order to tell dialogs content size has changed
	     */
	    resize: function () {
	      this.model.trigger('form:resize');
	    },

	    /**
	     * Disable the input
	     */
	    disable: function () {
	      this.$(':input').prop('disabled', true);
	    },

	    /**
	     * Enable the input
	     */
	    enable: function () {
	      this.$(':input').prop('disabled', false);
	    },

	    /**
	     * Change the type of the input field. (e.g., text <--> password)
	     * @param type
	     */
	    changeType: function (type) {
	      this.$(':input').prop('type', type);
	      // Update the options so that it keeps the uptodate state
	      this.options.type = type;
	    },

	    getNameString: function () {
	      if (_.isArray(this.options.name)) {
	        return this.options.name.join('-');
	      }
	      return this.options.name;
	    },

	    __markError: function () {
	      this.$el.addClass('o-form-has-errors');
	    },

	    __clearError: function () {
	      this.$el.removeClass('o-form-has-errors');
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	!(module.exports = {
	  UP: 38,
	  DOWN: 40,
	  DEL: 46,
	  TAB: 9,
	  RETURN: 13,
	  ENTER: 13,
	  ESC: 27,
	  COMMA: 188,
	  PAGEUP: 33,
	  PAGEDOWN: 34,
	  SPACE: 32,
	  BACKSPACE: 8,
	  __isKey: function (e, key) {
	    return (e.which || e.keyCode) == this[key];
	  },
	  isEnter: function (e) {
	    return this.__isKey(e, 'ENTER');
	  },
	  isEsc: function (e) {
	    return this.__isKey(e, 'ESC');
	  },
	  isSpaceBar: function (e) {
	    return this.__isKey(e, 'SPACE');
	  }
	});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	(function() {
	var jQuery = __webpack_require__(6);

	/*! http://mths.be/placeholder v2.0.7 by @mathias */
	;(function(window, document, $) {

		var isInputSupported = 'placeholder' in document.createElement('input');
		var isTextareaSupported = 'placeholder' in document.createElement('textarea');
		var prototype = $.fn;
		var valHooks = $.valHooks;
		var propHooks = $.propHooks;
		var hooks;
		var placeholder;

		if (isInputSupported && isTextareaSupported) {

			placeholder = prototype.placeholder = function() {
				return this;
			};

			placeholder.input = placeholder.textarea = true;

		} else {

			placeholder = prototype.placeholder = function() {
				var $this = this;
				$this
					.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
					.not('.placeholder')
					.bind({
						'focus.placeholder': clearPlaceholder,
						'blur.placeholder': setPlaceholder
					})
					.data('placeholder-enabled', true)
					.trigger('blur.placeholder');
				return $this;
			};

			placeholder.input = isInputSupported;
			placeholder.textarea = isTextareaSupported;

			hooks = {
				'get': function(element) {
					var $element = $(element);

					var $passwordInput = $element.data('placeholder-password');
					if ($passwordInput) {
						return $passwordInput[0].value;
					}

					return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
				},
				'set': function(element, value) {
					var $element = $(element);

					var $passwordInput = $element.data('placeholder-password');
					if ($passwordInput) {
						return $passwordInput[0].value = value;
					}

					if (!$element.data('placeholder-enabled')) {
						return element.value = value;
					}
					if (value == '') {
						element.value = value;
						// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
						if (element != safeActiveElement()) {
							// We can't use `triggerHandler` here because of dummy text/password inputs :(
							setPlaceholder.call(element);
						}
					} else if ($element.hasClass('placeholder')) {
						clearPlaceholder.call(element, true, value) || (element.value = value);
					} else {
						element.value = value;
					}
					// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
					return $element;
				}
			};

			if (!isInputSupported) {
				valHooks.input = hooks;
				propHooks.value = hooks;
			}
			if (!isTextareaSupported) {
				valHooks.textarea = hooks;
				propHooks.value = hooks;
			}

			$(function() {
				// Look for forms
				$(document).delegate('form', 'submit.placeholder', function() {
					// Clear the placeholder values so they don't get submitted
					var $inputs = $('.placeholder', this).each(clearPlaceholder);
					setTimeout(function() {
						$inputs.each(setPlaceholder);
					}, 10);
				});
			});

			// Clear placeholder values upon page reload
			$(window).bind('beforeunload.placeholder', function() {
				$('.placeholder').each(function() {
					this.value = '';
				});
			});

		}

		function args(elem) {
			// Return an object of element attributes
			var newAttrs = {};
			var rinlinejQuery = /^jQuery\d+$/;
			$.each(elem.attributes, function(i, attr) {
				if (attr.specified && !rinlinejQuery.test(attr.name)) {
					newAttrs[attr.name] = attr.value;
				}
			});
			return newAttrs;
		}

		function clearPlaceholder(event, value) {
			var input = this;
			var $input = $(input);
			if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
				if ($input.data('placeholder-password')) {
					$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
					// If `clearPlaceholder` was called from `$.valHooks.input.set`
					if (event === true) {
						return $input[0].value = value;
					}
					$input.focus();
				} else {
					input.value = '';
					$input.removeClass('placeholder');
					input == safeActiveElement() && input.select();
				}
			}
		}

		function setPlaceholder() {
			var $replacement;
			var input = this;
			var $input = $(input);
			var id = this.id;
			if (input.value == '') {
				if (input.type == 'password') {
					if (!$input.data('placeholder-textinput')) {
						try {
							$replacement = $input.clone().attr({ 'type': 'text' });
						} catch(e) {
							$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
						}
						$replacement
							.removeAttr('name')
							.data({
								'placeholder-password': $input,
								'placeholder-id': id
							})
							.bind('focus.placeholder', clearPlaceholder);
						$input
							.data({
								'placeholder-textinput': $replacement,
								'placeholder-id': id
							})
							.before($replacement);
					}
					$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
					// Note: `$input[0] != input` now!
				}
				$input.addClass('placeholder');
				$input[0].value = $input.attr('placeholder');
			} else {
				$input.removeClass('placeholder');
			}
		}

		function safeActiveElement() {
			// Avoid IE9 `document.activeElement` of death
			// https://github.com/mathiasbynens/jquery-placeholder/pull/99
			try {
				return document.activeElement;
			} catch (err) {}
		}

	}(this, document, jQuery));

	}.call(window));

/***/ },
/* 45 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(43),
	  __webpack_require__(28),
	  __webpack_require__(42),
	  __webpack_require__(47)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, Keys, TemplateUtil, BaseInput) {

	  var template = TemplateUtil.tpl('<select id="{{inputId}}" name="{{name}}"></select>');
	  var option = TemplateUtil.tpl('<option value="{{key}}">{{value}}</option>');

	  // Chosen has known problems when it's at the bottom of a container that has
	  // overflow:hidden set. Because it attaches to the parent container, its
	  // dropdown will be cut off in the UI. Any modal with a chosen select element
	  // at the bottom will manifest this behavior.
	  //
	  // The fix (aside from replacing Chosen) is to change Chosen's behavior -
	  // use the existing styles, but attach it to 'body' and position it correctly
	  // so that it is not affected by a parent overflow.
	  //
	  // More details can be found in OKTA-46489, OKTA-83570
	  var CHOSEN_WINDOW_MARGIN = 20;
	  var CHOSEN_MAX_HEIGHT = 240;
	  var CHOSEN_Z_INDEX = 50000;

	  function defer(fn) {
	    if (this.params.autoWidth) {
	      return fn.call(this);
	    }
	    else {
	      return _.defer(_.bind(fn, this));
	    }
	  }

	  function findSelectWidth(self) {
	    self.$select.hide();
	    var select = $(self.$select[0]).hide();
	    $('body').append(select);
	    var width = self.params.width = (select.width() * 1.2) + 'px';
	    self.$el.append(select.show());
	    return width;
	  }

	  function recalculateChosen($chosen, $results, $clone) {
	    var offset = $clone.offset();
	    $chosen.css({
	      left: offset.left,
	      top: offset.top
	    });
	    // Update the max-height to fit within the constraints of the window. This
	    // is especially important for modals because page scrolling is disabled.
	    var $win = $(window),
	        rHeight = $results.outerHeight(),
	        rBottom = rHeight + $results.offset().top - $win.scrollTop(),
	        wHeight = $win.height() - CHOSEN_WINDOW_MARGIN,
	        maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);
	    $results.css('max-height', maxHeight);
	  }

	  function fixChosenModal($select) {
	    var $chosen = $select.next('.chzn-container'),
	        $clone = $chosen.clone(),
	        $results = $chosen.find('.chzn-results');

	    // Use a hidden clone to maintain layout and calculate offset. This is
	    // necessary for more complex layouts (like adding a group rule) where
	    // the chosen element is floated.
	    $clone.css('visibility', 'hidden');
	    $clone.removeAttr('id');
	    $clone.find('li').removeAttr('id');

	    // Save the original styles - we'll revert to them when the select closes
	    var baseStyles = {
	      'left': $chosen.css('left'),
	      'top': $chosen.css('top'),
	      'position': $chosen.css('position'),
	      'float': $chosen.css('float'),
	      'z-index': $chosen.css('z-index')
	    };
	    $results.hide();

	    // Handler for any resize events that happen when the results list is open
	    var resizeHandler = _.debounce(function () {
	      recalculateChosen($chosen, $results, $clone);
	    }, 10);

	    // When the dropdown opens, attach it to body, with the correct absolute
	    // position coordinates
	    $select.on('liszt:showing_dropdown', function () {
	      $chosen.width($chosen.width());
	      $select.after($clone);
	      // .chzn-container can trigger the vertical scrollbar if it causes scrollHeight > window height after append to
	      // the body. Force top -999999 to avoid the scrollbar so $chosen can find the right offset for relocation.
	      $chosen.css({
	        'position': 'absolute',
	        'float': 'none',
	        'z-index': CHOSEN_Z_INDEX,
	        'top': -999999
	      });
	      $('body').append($chosen);
	      $results.show();
	      recalculateChosen($chosen, $results, $clone);
	      // Capture scroll events:
	      // - for forms that use fixed positioning (like editing attributes in
	      //   Profile Editor) - window scroll
	      // - for forms that are too long for the modal - o-form-content scroll
	      $select.parents().scroll(resizeHandler);
	      $(window).on('resize scroll', resizeHandler);
	    });

	    // When the dropdown closes or the element is removed, revert to the
	    // original styles and reattach it to its original placement in the dom.
	    $select.on('liszt:hiding_dropdown remove', function () {
	      $select.parents().off('scroll', resizeHandler);
	      $(window).off('resize scroll', resizeHandler);
	      $chosen.css(baseStyles);
	      $results.hide();
	      $results.css('max-height', CHOSEN_MAX_HEIGHT);
	      $clone.remove();
	      $select.after($chosen);
	    });
	  }

	  return BaseInput.extend({

	    className: 'o-form-select',

	    /**
	    * @Override
	    */
	    events: {
	      'change select': 'update',
	      'keyup .chzn-search > :text': function (e) {
	        if (Keys.isEsc(e)) {
	          this.$('.chzn-search > :text').val('');
	          e.stopPropagation();
	        }
	      }
	    },

	    constructor: function () {
	      BaseInput.apply(this, arguments);
	      this.params = this.options.params || {};
	    },

	    /**
	    * @Override
	    */
	    editMode: function () {
	      /* eslint max-statements: [2, 13] */

	      this.$el.html(template(this.options));
	      this.$select = this.$('select');


	      var options = this.getOptions();
	      _.each(options, function (value, key) {
	        this.$select.append(option({key: key, value: value}));
	      }, this);

	      // Fix a regression in jQuery 1.x on Firefox
	      // jQuery.val(value) prepends an empty option to the dropdown
	      // if value doesnt exist in the dropdown.
	      // http://bugs.jquery.com/ticket/13514
	      var value = this.getModelValue();
	      if (value) {
	        this.$select.val(value);
	      }
	      else {
	        this.$('option:first-child').prop('selected', true);
	      }
	      this.$el.addClass('o-form-control');

	      if (this.params.chosen !== false) {
	        this.__applyChosen();
	      }
	      return this;
	    },

	    __applyChosen: function () {
	      var width = this.options.wide ? '100%' : this.params.width || '62%';
	      if (this.params.autoWidth) {
	        width = findSelectWidth(this);
	      }

	      defer.call(this, function () {
	        var searchThreshold;
	        if (this.params && this.params.searchThreshold) {
	          searchThreshold = _.result(this.params, 'searchThreshold');
	        } else {
	          searchThreshold = 10;
	        }
	        if (!_.result(this.options, 'autoRender')) {
	          this.update();
	        }
	        this.$select.chosen({
	          'width': width,
	          'disable_search_threshold': searchThreshold,
	          'placeholder_text': this.options['placeholder']
	        });
	        fixChosenModal(this.$select);

	        if (this.params.autoWidth) { // fix a chosen css bug
	          this.$el.width(0);
	        }

	        this.model.trigger('form:resize');
	      });
	    },


	    /**
	    * @Override
	    */
	    val: function () {
	      return this.$select && this.$select.val();
	    },

	    /**
	    * @Override
	    */
	    focus: function () {
	      if (this.$select) {
	        return this.$select.focus();
	      }
	    },

	    /**
	     * @Override
	     */
	    toStringValue: function () {
	      var selectedOption = this.getModelValue(),
	          displayString = selectedOption,
	          options = this.getOptions();
	      if (!_.isEmpty(options)) {
	        displayString = options[selectedOption];
	      }
	      if (_.isUndefined(displayString)) {
	        displayString = this.defaultValue();
	      }
	      return displayString || '';
	    },

	    /**
	     * Convert options to an object
	     * support input options that is a
	     * 1. a static object such as {key1: val1, key2: val2...}
	     * 2. a function to be called to return a static object
	     * will return an object with key-value pairs or with empty content
	     * @return {Object} The value
	     */
	    getOptions: function () {
	      var options = this.options.options;

	      if (_.isFunction(options)) {
	        options = options.call(this);
	      }

	      return _.isObject(options) ? options : {};
	    },

	    remove: function () {
	      if (this.$select) {
	        this.$select.trigger('remove');
	      }
	      return BaseInput.prototype.remove.apply(this, arguments);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Chosen, a Select Box Enhancer for jQuery and Prototype
	// by Patrick Filler for Harvest, http://getharvest.com
	//
	// Version 0.11.1
	// Full source at https://github.com/harvesthq/chosen
	// Copyright (c) 2011 Harvest http://getharvest.com

	// MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
	// This file is generated by `grunt build`, do not edit it by hand.

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = function (jQuery) {
	  (function() {
	    var SelectParser;

	    SelectParser = (function() {
	      function SelectParser() {
	        this.options_index = 0;
	        this.parsed = [];
	      }

	      SelectParser.prototype.add_node = function(child) {
	        if (child.nodeName.toUpperCase() === "OPTGROUP") {
	          return this.add_group(child);
	        } else {
	          return this.add_option(child);
	        }
	      };

	      SelectParser.prototype.add_group = function(group) {
	        var group_position, option, _i, _len, _ref, _results;

	        group_position = this.parsed.length;
	        this.parsed.push({
	          array_index: group_position,
	          group: true,
	          label: group.label,
	          children: 0,
	          disabled: group.disabled
	        });
	        _ref = group.childNodes;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          option = _ref[_i];
	          _results.push(this.add_option(option, group_position, group.disabled));
	        }
	        return _results;
	      };

	      SelectParser.prototype.add_option = function(option, group_position, group_disabled) {
	        if (option.nodeName.toUpperCase() === "OPTION") {
	          if (option.text !== "") {
	            if (group_position != null) {
	              this.parsed[group_position].children += 1;
	            }
	            this.parsed.push({
	              array_index: this.parsed.length,
	              options_index: this.options_index,
	              value: option.value,
	              text: option.text,
	              html: option.innerHTML,
	              selected: option.selected,
	              disabled: group_disabled === true ? group_disabled : option.disabled,
	              group_array_index: group_position,
	              classes: option.className,
	              style: option.style.cssText
	            });
	          } else {
	            this.parsed.push({
	              array_index: this.parsed.length,
	              options_index: this.options_index,
	              empty: true
	            });
	          }
	          return this.options_index += 1;
	        }
	      };

	      return SelectParser;

	    })();

	    SelectParser.select_to_array = function(select) {
	      var child, parser, _i, _len, _ref;

	      parser = new SelectParser();
	      _ref = select.childNodes;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        child = _ref[_i];
	        parser.add_node(child);
	      }
	      return parser.parsed;
	    };

	    this.SelectParser = SelectParser;

	  }).call(this);

	  (function() {
	    var AbstractChosen, root;

	    root = this;

	    AbstractChosen = (function() {
	      function AbstractChosen(form_field, options) {
	        this.form_field = form_field;
	        this.options = options != null ? options : {};
	        if (!AbstractChosen.browser_is_supported()) {
	          return;
	        }
	        this.is_multiple = this.form_field.multiple;
	        this.set_default_text();
	        this.set_default_values();
	        this.setup();
	        this.set_up_html();
	        this.register_observers();
	        this.finish_setup();
	      }

	      AbstractChosen.prototype.set_default_values = function() {
	        var _this = this;

	        this.click_test_action = function(evt) {
	          return _this.test_active_click(evt);
	        };
	        this.activate_action = function(evt) {
	          return _this.activate_field(evt);
	        };
	        this.active_field = false;
	        this.mouse_on_container = false;
	        this.results_showing = false;
	        this.result_highlighted = null;
	        this.result_single_selected = null;
	        this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
	        this.disable_search_threshold = this.options.disable_search_threshold || 0;
	        this.disable_search = this.options.disable_search || false;
	        this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
	        this.search_contains = this.options.search_contains || false;
	        this.single_backstroke_delete = this.options.single_backstroke_delete || false;
	        this.max_selected_options = this.options.max_selected_options || Infinity;
	        return this.inherit_select_classes = this.options.inherit_select_classes || false;
	      };

	      AbstractChosen.prototype.set_default_text = function() {
	        if (this.form_field.getAttribute("data-placeholder")) {
	          this.default_text = this.form_field.getAttribute("data-placeholder");
	        } else if (this.is_multiple) {
	          this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
	        } else {
	          this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
	        }
	        return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
	      };

	      AbstractChosen.prototype.mouse_enter = function() {
	        return this.mouse_on_container = true;
	      };

	      AbstractChosen.prototype.mouse_leave = function() {
	        return this.mouse_on_container = false;
	      };

	      AbstractChosen.prototype.input_focus = function(evt) {
	        var _this = this;

	        if (this.is_multiple) {
	          if (!this.active_field) {
	            return setTimeout((function() {
	              return _this.container_mousedown();
	            }), 50);
	          }
	        } else {
	          if (!this.active_field) {
	            return this.activate_field();
	          }
	        }
	      };

	      AbstractChosen.prototype.input_blur = function(evt) {
	        var _this = this;

	        if (!this.mouse_on_container) {
	          this.active_field = false;
	          return setTimeout((function() {
	            return _this.blur_test();
	          }), 100);
	        }
	      };

	      AbstractChosen.prototype.result_add_option = function(option) {
	        var classes, style;

	        option.dom_id = this.container_id + "_o_" + option.array_index;
	        classes = [];
	        if (!option.disabled && !(option.selected && this.is_multiple)) {
	          classes.push("active-result");
	        }
	        if (option.disabled && !(option.selected && this.is_multiple)) {
	          classes.push("disabled-result");
	        }
	        if (option.selected) {
	          classes.push("result-selected");
	        }
	        if (option.group_array_index != null) {
	          classes.push("group-option");
	        }
	        if (option.classes !== "") {
	          classes.push(option.classes);
	        }
	        style = option.style.cssText !== "" ? " style=\"" + option.style + "\"" : "";
	        return '<li id="' + option.dom_id + '" class="' + classes.join(' ') + '"' + style + '>' + option.html + '</li>';
	      };

	      AbstractChosen.prototype.results_update_field = function() {
	        this.set_default_text();
	        if (!this.is_multiple) {
	          this.results_reset_cleanup();
	        }
	        this.result_clear_highlight();
	        this.result_single_selected = null;
	        return this.results_build();
	      };

	      AbstractChosen.prototype.results_toggle = function() {
	        if (this.results_showing) {
	          return this.results_hide();
	        } else {
	          return this.results_show();
	        }
	      };

	      AbstractChosen.prototype.results_search = function(evt) {
	        if (this.results_showing) {
	          return this.winnow_results();
	        } else {
	          return this.results_show();
	        }
	      };

	      AbstractChosen.prototype.choices_count = function() {
	        var option, _i, _len, _ref;

	        if (this.selected_option_count != null) {
	          return this.selected_option_count;
	        }
	        this.selected_option_count = 0;
	        _ref = this.form_field.options;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          option = _ref[_i];
	          if (option.selected) {
	            this.selected_option_count += 1;
	          }
	        }
	        return this.selected_option_count;
	      };

	      AbstractChosen.prototype.choices_click = function(evt) {
	        evt.preventDefault();
	        if (!(this.results_showing || this.is_disabled)) {
	          return this.results_show();
	        }
	      };

	      AbstractChosen.prototype.keyup_checker = function(evt) {
	        var stroke, _ref;

	        stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
	        this.search_field_scale();
	        switch (stroke) {
	          case 8:
	            if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) {
	              return this.keydown_backstroke();
	            } else if (!this.pending_backstroke) {
	              this.result_clear_highlight();
	              return this.results_search();
	            }
	            break;
	          case 13:
	            evt.preventDefault();
	            if (this.results_showing) {
	              return this.result_select(evt);
	            }
	            break;
	          case 27:
	            if (this.results_showing) {
	              this.results_hide();
	            }
	            return true;
	          case 9:
	          case 38:
	          case 40:
	          case 16:
	          case 91:
	          case 17:
	            break;
	          default:
	            return this.results_search();
	        }
	      };

	      AbstractChosen.prototype.generate_field_id = function() {
	        var new_id;

	        new_id = this.generate_random_id();
	        this.form_field.id = new_id;
	        return new_id;
	      };

	      AbstractChosen.prototype.generate_random_char = function() {
	        var chars, newchar, rand;

	        chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	        rand = Math.floor(Math.random() * chars.length);
	        return newchar = chars.substring(rand, rand + 1);
	      };

	      AbstractChosen.prototype.container_width = function() {
	        if (this.options.width != null) {
	          return this.options.width;
	        } else {
	          return "" + this.form_field.offsetWidth + "px";
	        }
	      };

	      AbstractChosen.browser_is_supported = function() {
	        var _ref;

	        if (window.navigator.appName === "Microsoft Internet Explorer") {
	          return (null !== (_ref = document.documentMode) && _ref >= 8);
	        }
	        return true;
	      };

	      AbstractChosen.default_multiple_text = "Select Some Options";

	      AbstractChosen.default_single_text = "Select an Option";

	      AbstractChosen.default_no_result_text = "No results match";

	      return AbstractChosen;

	    })();

	    root.AbstractChosen = AbstractChosen;

	  }).call(this);

	  (function() {
	    var $, Chosen, root, _ref,
	      __hasProp = {}.hasOwnProperty,
	      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	    root = this;

	    // OKTA-93521 - plugin assumes root is global scope
	    var AbstractChosen = root.AbstractChosen;

	    $ = jQuery;

	    $.fn.extend({
	      chosen: function(options) {
	        if (!AbstractChosen.browser_is_supported()) {
	          return this;
	        }
	        return this.each(function(input_field) {
	          var $this;

	          $this = $(this);
	          if (!$this.hasClass("chzn-done")) {
	            return $this.data('chosen', new Chosen(this, options));
	          }
	        });
	      }
	    });

	    Chosen = (function(_super) {
	      __extends(Chosen, _super);

	      function Chosen() {
	        _ref = Chosen.__super__.constructor.apply(this, arguments);
	        return _ref;
	      }

	      Chosen.prototype.setup = function() {
	        this.form_field_jq = $(this.form_field);
	        this.current_selectedIndex = this.form_field.selectedIndex;
	        return this.is_rtl = this.form_field_jq.hasClass("chzn-rtl");
	      };

	      Chosen.prototype.finish_setup = function() {
	        return this.form_field_jq.addClass("chzn-done");
	      };

	      Chosen.prototype.set_up_html = function() {
	        var container_classes, container_props;

	        this.container_id = this.form_field.id.length ? this.form_field.id.replace(/[^\w]/g, '_') : this.generate_field_id();
	        this.container_id += "_chzn";
	        container_classes = ["chzn-container"];
	        container_classes.push("chzn-container-" + (this.is_multiple ? "multi" : "single"));
	        if (this.inherit_select_classes && this.form_field.className) {
	          container_classes.push(this.form_field.className);
	        }
	        if (this.is_rtl) {
	          container_classes.push("chzn-rtl");
	        }
	        container_props = {
	          'id': this.container_id,
	          'class': container_classes.join(' '),
	          'style': "width: " + (this.container_width()) + ";",
	          'title': this.form_field.title
	        };
	        this.container = $("<div />", container_props);
	        if (this.is_multiple) {
	          this.container.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop"><ul class="chzn-results"></ul></div>');
	        } else {
	          this.container.html('<a href="javascript:void(0)" class="chzn-single chzn-default" tabindex="-1"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chzn-drop"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>');
	        }
	        this.form_field_jq.hide().after(this.container);
	        this.dropdown = this.container.find('div.chzn-drop').first();
	        this.search_field = this.container.find('input').first();
	        this.search_results = this.container.find('ul.chzn-results').first();
	        this.search_field_scale();
	        this.search_no_results = this.container.find('li.no-results').first();
	        if (this.is_multiple) {
	          this.search_choices = this.container.find('ul.chzn-choices').first();
	          this.search_container = this.container.find('li.search-field').first();
	        } else {
	          this.search_container = this.container.find('div.chzn-search').first();
	          this.selected_item = this.container.find('.chzn-single').first();
	        }
	        this.results_build();
	        this.set_tab_index();
	        this.set_label_behavior();
	        return this.form_field_jq.trigger("liszt:ready", {
	          chosen: this
	        });
	      };

	      Chosen.prototype.register_observers = function() {
	        var _this = this;

	        this.container.mousedown(function(evt) {
	          _this.container_mousedown(evt);
	        });
	        this.container.mouseup(function(evt) {
	          _this.container_mouseup(evt);
	        });
	        this.container.mouseenter(function(evt) {
	          _this.mouse_enter(evt);
	        });
	        this.container.mouseleave(function(evt) {
	          _this.mouse_leave(evt);
	        });
	        this.search_results.mouseup(function(evt) {
	          _this.search_results_mouseup(evt);
	        });
	        this.search_results.mouseover(function(evt) {
	          _this.search_results_mouseover(evt);
	        });
	        this.search_results.mouseout(function(evt) {
	          _this.search_results_mouseout(evt);
	        });
	        this.search_results.bind('mousewheel DOMMouseScroll', function(evt) {
	          _this.search_results_mousewheel(evt);
	        });
	        this.form_field_jq.bind("liszt:updated", function(evt) {
	          _this.results_update_field(evt);
	        });
	        this.form_field_jq.bind("liszt:activate", function(evt) {
	          _this.activate_field(evt);
	        });
	        this.form_field_jq.bind("liszt:open", function(evt) {
	          _this.container_mousedown(evt);
	        });
	        this.search_field.blur(function(evt) {
	          _this.input_blur(evt);
	        });
	        this.search_field.keyup(function(evt) {
	          _this.keyup_checker(evt);
	        });
	        this.search_field.keydown(function(evt) {
	          _this.keydown_checker(evt);
	        });
	        this.search_field.focus(function(evt) {
	          _this.input_focus(evt);
	        });
	        if (this.is_multiple) {
	          return this.search_choices.click(function(evt) {
	            _this.choices_click(evt);
	          });
	        } else {
	          return this.container.click(function(evt) {
	            evt.preventDefault();
	          });
	        }
	      };

	      Chosen.prototype.search_field_disabled = function() {
	        this.is_disabled = this.form_field_jq[0].disabled;
	        if (this.is_disabled) {
	          this.container.addClass('chzn-disabled');
	          this.search_field[0].disabled = true;
	          if (!this.is_multiple) {
	            this.selected_item.unbind("focus", this.activate_action);
	          }
	          return this.close_field();
	        } else {
	          this.container.removeClass('chzn-disabled');
	          this.search_field[0].disabled = false;
	          if (!this.is_multiple) {
	            return this.selected_item.bind("focus", this.activate_action);
	          }
	        }
	      };

	      Chosen.prototype.container_mousedown = function(evt) {
	        if (!this.is_disabled) {
	          if (evt && evt.type === "mousedown" && !this.results_showing) {
	            evt.preventDefault();
	          }
	          if (!((evt != null) && ($(evt.target)).hasClass("search-choice-close"))) {
	            if (!this.active_field) {
	              if (this.is_multiple) {
	                this.search_field.val("");
	              }
	              $(document).click(this.click_test_action);
	              this.results_show();
	            } else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chzn-single").length)) {
	              evt.preventDefault();
	              this.results_toggle();
	            }
	            return this.activate_field();
	          }
	        }
	      };

	      Chosen.prototype.container_mouseup = function(evt) {
	        if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
	          return this.results_reset(evt);
	        }
	      };

	      Chosen.prototype.search_results_mousewheel = function(evt) {
	        var delta, _ref1, _ref2;

	        delta = -((_ref1 = evt.originalEvent) != null ? _ref1.wheelDelta : void 0) || ((_ref2 = evt.originialEvent) != null ? _ref2.detail : void 0);
	        if (delta != null) {
	          evt.preventDefault();
	          if (evt.type === 'DOMMouseScroll') {
	            delta = delta * 40;
	          }
	          return this.search_results.scrollTop(delta + this.search_results.scrollTop());
	        }
	      };

	      Chosen.prototype.blur_test = function(evt) {
	        if (!this.active_field && this.container.hasClass("chzn-container-active")) {
	          return this.close_field();
	        }
	      };

	      Chosen.prototype.close_field = function() {
	        $(document).unbind("click", this.click_test_action);
	        this.active_field = false;
	        this.results_hide();
	        this.container.removeClass("chzn-container-active");
	        this.clear_backstroke();
	        this.show_search_field_default();
	        return this.search_field_scale();
	      };

	      Chosen.prototype.activate_field = function() {
	        this.container.addClass("chzn-container-active");
	        this.active_field = true;
	        this.search_field.val(this.search_field.val());
	        return this.search_field.focus();
	      };

	      Chosen.prototype.test_active_click = function(evt) {
	        if ($(evt.target).parents('#' + this.container_id).length) {
	          return this.active_field = true;
	        } else {
	          return this.close_field();
	        }
	      };

	      Chosen.prototype.results_build = function() {
	        var content, data, _i, _len, _ref1;

	        this.parsing = true;
	        this.selected_option_count = null;
	        this.results_data = root.SelectParser.select_to_array(this.form_field);
	        if (this.is_multiple) {
	          this.search_choices.find("li.search-choice").remove();
	        } else if (!this.is_multiple) {
	          this.selected_item.addClass("chzn-default").find("span").text(this.default_text);
	          if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
	            this.search_field[0].readOnly = true;
	            this.container.addClass("chzn-container-single-nosearch");
	          } else {
	            this.search_field[0].readOnly = false;
	            this.container.removeClass("chzn-container-single-nosearch");
	          }
	        }
	        content = '';
	        _ref1 = this.results_data;
	        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	          data = _ref1[_i];
	          if (data.group) {
	            content += this.result_add_group(data);
	          } else if (!data.empty) {
	            content += this.result_add_option(data);
	            if (data.selected && this.is_multiple) {
	              this.choice_build(data);
	            } else if (data.selected && !this.is_multiple) {
	              this.selected_item.removeClass("chzn-default").find("span").text(data.text);
	              if (this.allow_single_deselect) {
	                this.single_deselect_control_build();
	              }
	            }
	          }
	        }
	        this.search_field_disabled();
	        this.show_search_field_default();
	        this.search_field_scale();
	        this.search_results.html(content);
	        return this.parsing = false;
	      };

	      Chosen.prototype.result_add_group = function(group) {
	        group.dom_id = this.container_id + "_g_" + group.array_index;
	        return '<li id="' + group.dom_id + '" class="group-result">' + $("<div />").text(group.label).html() + '</li>';
	      };

	      Chosen.prototype.result_do_highlight = function(el) {
	        var high_bottom, high_top, maxHeight, visible_bottom, visible_top;

	        if (el.length) {
	          this.result_clear_highlight();
	          this.result_highlight = el;
	          this.result_highlight.addClass("highlighted");
	          maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
	          visible_top = this.search_results.scrollTop();
	          visible_bottom = maxHeight + visible_top;
	          high_top = this.result_highlight.position().top + this.search_results.scrollTop();
	          high_bottom = high_top + this.result_highlight.outerHeight();
	          if (high_bottom >= visible_bottom) {
	            return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
	          } else if (high_top < visible_top) {
	            return this.search_results.scrollTop(high_top);
	          }
	        }
	      };

	      Chosen.prototype.result_clear_highlight = function() {
	        if (this.result_highlight) {
	          this.result_highlight.removeClass("highlighted");
	        }
	        return this.result_highlight = null;
	      };

	      Chosen.prototype.results_show = function() {
	        if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
	          this.form_field_jq.trigger("liszt:maxselected", {
	            chosen: this
	          });
	          return false;
	        }
	        this.container.addClass("chzn-with-drop");
	        this.form_field_jq.trigger("liszt:showing_dropdown", {
	          chosen: this
	        });
	        this.results_showing = true;
	        this.search_field.focus();
	        this.search_field.val(this.search_field.val());
	        return this.winnow_results();
	      };

	      Chosen.prototype.results_hide = function() {
	        if (this.results_showing) {
	          this.result_clear_highlight();
	          this.container.removeClass("chzn-with-drop");
	          this.form_field_jq.trigger("liszt:hiding_dropdown", {
	            chosen: this
	          });
	        }
	        return this.results_showing = false;
	      };

	      Chosen.prototype.set_tab_index = function(el) {
	        var ti;

	        if (this.form_field_jq.attr("tabindex")) {
	          ti = this.form_field_jq.attr("tabindex");
	          this.form_field_jq.attr("tabindex", -1);
	          return this.search_field.attr("tabindex", ti);
	        }
	      };

	      Chosen.prototype.set_label_behavior = function() {
	        var _this = this;

	        this.form_field_label = this.form_field_jq.parents("label");
	        if (!this.form_field_label.length && this.form_field.id.length) {
	          this.form_field_label = $("label[for='" + this.form_field.id + "']");
	        }
	        if (this.form_field_label.length > 0) {
	          return this.form_field_label.click(function(evt) {
	            if (_this.is_multiple) {
	              return _this.container_mousedown(evt);
	            } else {
	              return _this.activate_field();
	            }
	          });
	        }
	      };

	      Chosen.prototype.show_search_field_default = function() {
	        if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
	          this.search_field.val(this.default_text);
	          return this.search_field.addClass("default");
	        } else {
	          this.search_field.val("");
	          return this.search_field.removeClass("default");
	        }
	      };

	      Chosen.prototype.search_results_mouseup = function(evt) {
	        var target;

	        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
	        if (target.length) {
	          this.result_highlight = target;
	          this.result_select(evt);
	          return this.search_field.focus();
	        }
	      };

	      Chosen.prototype.search_results_mouseover = function(evt) {
	        var target;

	        target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
	        if (target) {
	          return this.result_do_highlight(target);
	        }
	      };

	      Chosen.prototype.search_results_mouseout = function(evt) {
	        if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
	          return this.result_clear_highlight();
	        }
	      };

	      Chosen.prototype.choice_build = function(item) {
	        var choice, close_link,
	          _this = this;

	        choice = $('<li />', {
	          "class": "search-choice"
	        }).html("<span>" + item.html + "</span>");
	        if (item.disabled) {
	          choice.addClass('search-choice-disabled');
	        } else {
	          close_link = $('<a />', {
	            href: '#',
	            "class": 'search-choice-close',
	            rel: item.array_index
	          });
	          close_link.click(function(evt) {
	            return _this.choice_destroy_link_click(evt);
	          });
	          choice.append(close_link);
	        }
	        return this.search_container.before(choice);
	      };

	      Chosen.prototype.choice_destroy_link_click = function(evt) {
	        evt.preventDefault();
	        evt.stopPropagation();
	        if (!this.is_disabled) {
	          return this.choice_destroy($(evt.target));
	        }
	      };

	      Chosen.prototype.choice_destroy = function(link) {
	        if (this.result_deselect(link.attr("rel"))) {
	          this.show_search_field_default();
	          if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
	            this.results_hide();
	          }
	          link.parents('li').first().remove();
	          return this.search_field_scale();
	        }
	      };

	      Chosen.prototype.results_reset = function() {
	        this.form_field.options[0].selected = true;
	        this.selected_option_count = null;
	        this.selected_item.find("span").text(this.default_text);
	        if (!this.is_multiple) {
	          this.selected_item.addClass("chzn-default");
	        }
	        this.show_search_field_default();
	        this.results_reset_cleanup();
	        this.form_field_jq.trigger("change");
	        if (this.active_field) {
	          return this.results_hide();
	        }
	      };

	      Chosen.prototype.results_reset_cleanup = function() {
	        this.current_selectedIndex = this.form_field.selectedIndex;
	        return this.selected_item.find("abbr").remove();
	      };

	      Chosen.prototype.result_select = function(evt) {
	        var high, high_id, item, position;

	        if (this.result_highlight) {
	          high = this.result_highlight;
	          high_id = high.attr("id");
	          this.result_clear_highlight();
	          if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
	            this.form_field_jq.trigger("liszt:maxselected", {
	              chosen: this
	            });
	            return false;
	          }
	          if (this.is_multiple) {
	            high.removeClass("active-result");
	          } else {
	            this.search_results.find(".result-selected").removeClass("result-selected");
	            this.result_single_selected = high;
	            this.selected_item.removeClass("chzn-default");
	          }
	          high.addClass("result-selected");
	          position = high_id.substr(high_id.lastIndexOf("_") + 1);
	          item = this.results_data[position];
	          item.selected = true;
	          this.form_field.options[item.options_index].selected = true;
	          this.selected_option_count = null;
	          if (this.is_multiple) {
	            this.choice_build(item);
	          } else {
	            this.selected_item.find("span").first().text(item.text);
	            if (this.allow_single_deselect) {
	              this.single_deselect_control_build();
	            }
	          }
	          if (!((evt.metaKey || evt.ctrlKey) && this.is_multiple)) {
	            this.results_hide();
	          }
	          this.search_field.val("");
	          if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
	            this.form_field_jq.trigger("change", {
	              'selected': this.form_field.options[item.options_index].value
	            });
	          }
	          this.current_selectedIndex = this.form_field.selectedIndex;
	          return this.search_field_scale();
	        }
	      };

	      Chosen.prototype.result_activate = function(el, option) {
	        if (option.disabled) {
	          return el.addClass("disabled-result");
	        } else if (this.is_multiple && option.selected) {
	          return el.addClass("result-selected");
	        } else {
	          return el.addClass("active-result");
	        }
	      };

	      Chosen.prototype.result_deactivate = function(el) {
	        return el.removeClass("active-result result-selected disabled-result");
	      };

	      Chosen.prototype.result_deselect = function(pos) {
	        var result, result_data;

	        result_data = this.results_data[pos];
	        if (!this.form_field.options[result_data.options_index].disabled) {
	          result_data.selected = false;
	          this.form_field.options[result_data.options_index].selected = false;
	          this.selected_option_count = null;
	          result = $("#" + this.container_id + "_o_" + pos);
	          result.removeClass("result-selected").addClass("active-result").show();
	          this.result_clear_highlight();
	          this.winnow_results();
	          this.form_field_jq.trigger("change", {
	            deselected: this.form_field.options[result_data.options_index].value
	          });
	          this.search_field_scale();
	          return true;
	        } else {
	          return false;
	        }
	      };

	      Chosen.prototype.single_deselect_control_build = function() {
	        if (!this.allow_single_deselect) {
	          return;
	        }
	        if (!this.selected_item.find("abbr").length) {
	          this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
	        }
	        return this.selected_item.addClass("chzn-single-with-deselect");
	      };

	      Chosen.prototype.winnow_results = function() {
	        var found, option, part, parts, regex, regexAnchor, result, result_id, results, searchText, startpos, text, zregex, _i, _j, _len, _len1, _ref1;

	        this.no_results_clear();
	        results = 0;
	        searchText = this.search_field.val() === this.default_text ? "" : $('<div/>').text($.trim(this.search_field.val())).html();
	        regexAnchor = this.search_contains ? "" : "^";
	        regex = new RegExp(regexAnchor + searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
	        zregex = new RegExp(searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
	        _ref1 = this.results_data;
	        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	          option = _ref1[_i];
	          if (!option.empty) {
	            if (option.group) {
	              $('#' + option.dom_id).css('display', 'none');
	            } else {
	              found = false;
	              result_id = option.dom_id;
	              result = $("#" + result_id);
	              if (regex.test(option.html)) {
	                found = true;
	                results += 1;
	              } else if (this.enable_split_word_search && (option.html.indexOf(" ") >= 0 || option.html.indexOf("[") === 0)) {
	                parts = option.html.replace(/\[|\]/g, "").split(" ");
	                if (parts.length) {
	                  for (_j = 0, _len1 = parts.length; _j < _len1; _j++) {
	                    part = parts[_j];
	                    if (regex.test(part)) {
	                      found = true;
	                      results += 1;
	                    }
	                  }
	                }
	              }
	              if (found) {
	                if (searchText.length) {
	                  startpos = option.html.search(zregex);
	                  text = option.html.substr(0, startpos + searchText.length) + '</em>' + option.html.substr(startpos + searchText.length);
	                  text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
	                } else {
	                  text = option.html;
	                }
	                result.html(text);
	                this.result_activate(result, option);
	                if (option.group_array_index != null) {
	                  $("#" + this.results_data[option.group_array_index].dom_id).css('display', 'list-item');
	                }
	              } else {
	                if (this.result_highlight && result_id === this.result_highlight.attr('id')) {
	                  this.result_clear_highlight();
	                }
	                this.result_deactivate(result);
	              }
	            }
	          }
	        }
	        if (results < 1 && searchText.length) {
	          return this.no_results(searchText);
	        } else {
	          return this.winnow_results_set_highlight();
	        }
	      };

	      Chosen.prototype.winnow_results_set_highlight = function() {
	        var do_high, selected_results;

	        if (!this.result_highlight) {
	          selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
	          do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
	          if (do_high != null) {
	            return this.result_do_highlight(do_high);
	          }
	        }
	      };

	      Chosen.prototype.no_results = function(terms) {
	        var no_results_html;

	        no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
	        no_results_html.find("span").first().html(terms);
	        return this.search_results.append(no_results_html);
	      };

	      Chosen.prototype.no_results_clear = function() {
	        return this.search_results.find(".no-results").remove();
	      };

	      Chosen.prototype.keydown_arrow = function() {
	        var next_sib;

	        if (this.results_showing && this.result_highlight) {
	          next_sib = this.result_highlight.nextAll("li.active-result").first();
	          if (next_sib) {
	            return this.result_do_highlight(next_sib);
	          }
	        } else {
	          return this.results_show();
	        }
	      };

	      Chosen.prototype.keyup_arrow = function() {
	        var prev_sibs;

	        if (!this.results_showing && !this.is_multiple) {
	          return this.results_show();
	        } else if (this.result_highlight) {
	          prev_sibs = this.result_highlight.prevAll("li.active-result");
	          if (prev_sibs.length) {
	            return this.result_do_highlight(prev_sibs.first());
	          } else {
	            if (this.choices_count() > 0) {
	              this.results_hide();
	            }
	            return this.result_clear_highlight();
	          }
	        }
	      };

	      Chosen.prototype.keydown_backstroke = function() {
	        var next_available_destroy;

	        if (this.pending_backstroke) {
	          this.choice_destroy(this.pending_backstroke.find("a").first());
	          return this.clear_backstroke();
	        } else {
	          next_available_destroy = this.search_container.siblings("li.search-choice").last();
	          if (next_available_destroy.length && !next_available_destroy.hasClass("search-choice-disabled")) {
	            this.pending_backstroke = next_available_destroy;
	            if (this.single_backstroke_delete) {
	              return this.keydown_backstroke();
	            } else {
	              return this.pending_backstroke.addClass("search-choice-focus");
	            }
	          }
	        }
	      };

	      Chosen.prototype.clear_backstroke = function() {
	        if (this.pending_backstroke) {
	          this.pending_backstroke.removeClass("search-choice-focus");
	        }
	        return this.pending_backstroke = null;
	      };

	      Chosen.prototype.keydown_checker = function(evt) {
	        var stroke, _ref1;

	        stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
	        this.search_field_scale();
	        if (stroke !== 8 && this.pending_backstroke) {
	          this.clear_backstroke();
	        }
	        switch (stroke) {
	          case 8:
	            this.backstroke_length = this.search_field.val().length;
	            break;
	          case 9:
	            if (this.results_showing && !this.is_multiple) {
	              this.result_select(evt);
	            }
	            this.mouse_on_container = false;
	            break;
	          case 13:
	            evt.preventDefault();
	            break;
	          case 38:
	            evt.preventDefault();
	            this.keyup_arrow();
	            break;
	          case 40:
	            evt.preventDefault();
	            this.keydown_arrow();
	            break;
	        }
	      };

	      Chosen.prototype.search_field_scale = function() {
	        var div, h, style, style_block, styles, w, _i, _len;

	        if (this.is_multiple) {
	          h = 0;
	          w = 0;
	          style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
	          styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
	          for (_i = 0, _len = styles.length; _i < _len; _i++) {
	            style = styles[_i];
	            style_block += style + ":" + this.search_field.css(style) + ";";
	          }
	          div = $('<div />', {
	            'style': style_block
	          });
	          div.text(this.search_field.val());
	          $('body').append(div);
	          w = div.width() + 25;
	          div.remove();
	          if (!this.f_width) {
	            this.f_width = this.container.outerWidth();
	          }
	          if (w > this.f_width - 10) {
	            w = this.f_width - 10;
	          }
	          return this.search_field.css({
	            'width': w + 'px'
	          });
	        }
	      };

	      Chosen.prototype.generate_random_id = function() {
	        var string;

	        string = "sel" + this.generate_random_char() + this.generate_random_char() + this.generate_random_char();
	        while ($("#" + string).length > 0) {
	          string += this.generate_random_char();
	        }
	        return string;
	      };

	      return Chosen;

	    })(AbstractChosen);

	    root.Chosen = Chosen;

	  }).call(this);

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(43),
	  __webpack_require__(28),
	  __webpack_require__(42),
	  __webpack_require__(49)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, $, Keys, TemplateUtil, BaseInput) {

	  var template = TemplateUtil.tpl('\
	      <input type="radio" name="{{name}}" data-se-name="{{realName}}" value="{{value}}" id="{{id}}">\
	      <label for="{{id}}" data-se-for-name="{{realName}}">\
	        {{label}}\
	        {{#if explain}}\
	        <p class="o-form-explain">{{explain}}</p>\
	        {{/if}}\
	      </label>\
	  ');

	  return BaseInput.extend({

	    /**
	    * @Override
	    */
	    events: {
	      'change :radio': 'update',
	      'keyup': function (e) {
	        if (Keys.isSpaceBar(e)) {
	          $(e.target).click();
	        }
	        else if (Keys.isEnter(e)) {
	          this.model.trigger('form:save');
	        }
	      }
	    },

	    /**
	    * @Override
	    */
	    editMode: function () {
	      this.$el.empty();

	      _.each(this.options.options, function (value, key) {
	        var options = {
	          id: _.uniqueId('option'),
	          name: this.options.inputId,
	          realName: this.options.name,
	          value: key
	        };

	        if (!_.isObject(value)) {
	          value = { label: value };
	        }
	        _.extend(options, value);

	        this.$el.append(template(options));
	      }, this);

	      var value = this.getModelValue();
	      if (value) {
	        this.$(':radio[value=' + value + ']').prop('checked', true);
	      }

	      this.$('input').customInput();
	      this.model.trigger('form:resize');

	      if (!_.isUndefined(this.options.params) && this.options.params.inline === true) {
	        this.$('div.custom-radio').addClass('inline');
	      }

	      return this;
	    },

	    /**
	    * @Override
	    */
	    readMode: function () {
	      this.editMode();
	      this.$(':radio').prop('disabled', true);
	      return this;
	    },

	    /**
	    * @Override
	    */
	    val: function () {
	      return this.$(':radio:checked').val();
	    },

	    /**
	    * @Override
	    */
	    focus: function () {
	      return this.$('label:eq(0)').focus();
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * There are following local modifications:
	 * - Author: Uzi Kilon ukilon@okta.com
	 *   Bug: OKTA-20830 - solves the conflict when there are multiple labels
	 */
	/**
	 * --------------------------------------------------------------------
	 * jQuery customInput plugin
	 * Author: Maggie Costello Wachs maggie@filamentgroup.com, Scott Jehl, scott@filamentgroup.com
	 * Copyright (c) 2009 Filament Group
	 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
	 * --------------------------------------------------------------------
	*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = function (jQuery) {
	  var $ = jQuery;
	  jQuery.fn.customInput = function(){
	    return $(this).each(function(){
	      if($(this).is('[type=checkbox],[type=radio]')){
	        var input = $(this);

	        // get the associated label using the input's id
	        var label = input.siblings('label[for="'+input.attr('id')+'"]:first');
	        if (!label.length) {
	          label = input.closest('label[for="'+input.attr('id')+'"]:first');
	        }
	        // wrap the input + label in a div
	        input.add(label).wrapAll('<div class="custom-'+ input.attr('type') +'"></div>');

	        // necessary for browsers that don't support the :hover pseudo class on labels
	        label.hover(
	          function(){ $(this).addClass('hover'); },
	          function(){ $(this).removeClass('hover'); }
	        );

	        //bind custom event, trigger it, bind click,focus,blur events
	        input.bind('updateState', function(){
	          input.is(':checked') ? label.addClass('checked') : label.removeClass('checked checkedHover checkedFocus');
	        })
	        .trigger('updateState')
	        .click(function(){
	          $('input[name="'+ $(this).attr('name') +'"]').trigger('updateState');
	        })
	        .focus(function(){
	          label.addClass('focus');
	          if(input.is(':checked')){  $(this).addClass('checkedFocus'); }
	        })
	        .blur(function(){ label.removeClass('focus checkedFocus'); });
	      }
	    });
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(43),
	  __webpack_require__(28),
	  __webpack_require__(42),
	  __webpack_require__(49)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, Keys, TemplateUtil, BaseInput) {

	  var template = TemplateUtil.tpl('\
	    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>\
	    <label for="{{inputId}}" data-se-for-name="{{name}}">{{placeholder}}</label>\
	  ');

	  return BaseInput.extend({
	    template: template,
	    /**
	    * @Override
	    */
	    events: {
	      'change :checkbox': 'update',
	      'keyup': function (e) {
	        if (Keys.isSpaceBar(e)) {
	          this.$(':checkbox').click();
	        }
	        else if (Keys.isEnter(e)) {
	          this.model.trigger('form:save');
	        }
	      }
	    },

	    /**
	    * @Override
	    */
	    editMode: function () {
	      var placeholder = _.resultCtx(this.options, 'placeholder', this);
	      if (placeholder === '') {
	        placeholder = _.resultCtx(this.options, 'label', this);
	      } else if (placeholder === false) {
	        placeholder = '';
	      }

	      this.$el.html(this.template(_.extend(_.omit(this.options, 'placeholder'), { placeholder: placeholder })));
	      var $input = this.$(':checkbox');
	      $input.prop('checked', this.getModelValue() || false);

	      this.$('input').customInput();
	      this.model.trigger('form:resize');

	      return this;
	    },

	    /**
	     * @Override
	    */
	    readMode: function () {
	      this.editMode();
	      this.$(':checkbox').prop('disabled', true);
	      return this;
	    },

	    /**
	    * @Override
	    */
	    val: function () {
	      return this.$(':checkbox').prop('checked');
	    },

	    /**
	    * @Override
	    */
	    focus: function () {
	      return this.$(':checkbox').focus();
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 51 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 52 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 53 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 54 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 55 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 56 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 57 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 58 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 59 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 60 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(42),
	  __webpack_require__(27),
	  __webpack_require__(62)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseInput, BaseView, ButtonFactory) {


	  function countInputs(inputs) {
	    return _.filter(inputs || [], function (input) {
	      return !_.contains(['label', 'button', 'select'], input.type);
	    }).length;
	  }

	  var LabelInput = BaseInput.extend({
	    tagName: 'span',
	    initialize: function () {
	      this.$el.text(this.getModelValue());
	    },
	    editMode: function () {
	      this.toggle(true);
	    },
	    readMode: function () {
	      this.toggle(false);
	    },
	    getModelValue: function () {
	      return this.options.label;
	    },
	    toggle: function (isEditMode) {
	      this.$el.toggleClass('o-form-label-inline', isEditMode);
	      this.$el.toggleClass('o-form-control', !isEditMode);
	    },
	    focus: _.noop
	  });

	  function createButtonInput(options) {
	    return ButtonFactory.create(_.defaults({
	      getReadModeString: _.constant(' '),
	      focus: _.noop
	    }, _.pick(options, 'click', 'title', 'href')));
	  }

	  var InputGroupView = BaseView.extend({

	    className: function () {
	      var className;
	      if (this.options.params && this.options.params.display === 'text') {
	        className = 'o-form-input-group-subtle';
	      } else {
	        className = 'o-form-input-group';
	      }
	      if (countInputs(this.options.params && this.options.params.inputs) > 1) {
	        className += ' o-form-input-group-2';
	      }
	      return className;
	    },

	    initialize: function () {
	      _.each(this.options.params && this.options.params.inputs, function (input) {
	        switch (input.type) {
	        case 'label':
	          this.add(LabelInput, {options: input});
	          break;
	        case 'button':
	          this.add(createButtonInput(input));
	          break;
	        default:
	          input = _.defaults({
	            model: this.model,
	            params: _.extend({
	              autoWidth: true
	            }, input.params || {})
	          }, input);
	          this.add(this.options.params.create(input));
	        }
	      }, this);
	    },

	    focus: function () {
	      this.first().focus();
	    }
	  });


	  return BaseInput.extend({

	    constructor: function (options) {
	      this.inputGroupView = new InputGroupView(options);
	      BaseInput.apply(this, arguments);
	    },

	    editMode: function () {
	      this.inputGroupView.remove();
	      this.inputGroupView = new InputGroupView(this.options);
	      this.$el.html(this.inputGroupView.render().el);
	    },

	    toStringValue: function () {
	      var strings = this.inputGroupView.map(function (input) {
	        return input.getReadModeString();
	      });
	      return strings.length && _.every(strings) ? strings.join(' ') : ' ';
	    },

	    focus: function () {
	      this.inputGroupView.focus();
	    }

	  },
	    {  // test hooks
	      LabelInput: LabelInput,
	      InputGroupView: InputGroupView
	    });


	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(63)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseButtonLink) {
	  /**
	   * @class ButtonFactory
	   * @private
	   *
	   * A factory method wrapper for {@link BaseButtonLink} creation
	   */

	  function normalizeEvents(options) {
	    var events = _.extend(options.click ? {click: options.click} : {}, options.events || {}),
	        target = {};
	    _.each(events, function (fn, eventName) {
	      target[eventName] = function (e) {
	        if (!options.href) {
	          e.preventDefault();
	          e.stopPropagation();
	        }
	        fn.apply(this, arguments);
	      };
	    });
	    return target;
	  }

	  return {
	    /**
	     * Creates a BaseButtonLink
	     * @param  {Object} options Options hash
	     * @param  {String} [options.title] The button text
	     * @param  {String} [options.icon]
	     * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
	     * @param {String} [options.href] The button link
	     * @param {Function} [options.click] On click callback
	     * @param {Object} [options.events] a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
	     * @return {BaseButtonLink} BaseButtonLink prototype ("class")
	     */
	    create: function (options) {
	      options = _.clone(options);
	      return BaseButtonLink.extend(_.extend(options, {
	        events: normalizeEvents(options)
	      }));
	    }
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(27), __webpack_require__(64)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView, ViewUtil) {

	  var disabledEvents = {
	    click: function (e) {
	      e.preventDefault();
	      e.stopPropagation();
	    }
	  };

	  return BaseView.extend({

	    /**
	     * @class BaseButtonLink
	     * @extends Okta.View
	     * @private
	     * A configurable button.
	     *
	     * ```javascript
	     * var View = BaseButtonLink.extend({
	     *   title: 'Click Me',
	     *   icon: 'help-text'
	     * })
	     * ```
	     */

	    /**
	     * @property {String | Function} [title] The main text for the button
	     */

	    /**
	     * @property {String | Function} [href] The link for the button
	     */

	    /**
	     * @property {String | Function } [icon]
	     * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
	     */

	    /**
	     * @property {Object} [events] a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
	     */

	    /*
	     * @property {Boolean | Function} [visible] visible=true make this button visible, default to true.
	     */

	    /*
	     * @property {Boolean | Function} [enabled] enabled=true make this button enabled, default to true.
	     */

	    /*
	     * @property {Object | Function} [enableWhen] The setting to determine when the button is enabled,
	         default to {} and enabled takes a higher priority.
	     */

	    /*
	     * @property {Object | Function} [showWhen] The setting to determine when the button is visible,
	         default to {} and visible takes a higher priority.
	     */


	    tagName: 'a',

	    template: '{{#if icon}}<span class="icon {{icon}}"></span>{{/if}}{{#if title}}{{title}}{{/if}}',

	    visible: true,

	    enabled: true,

	    enableWhen: {},

	    showWhen: {},

	    constructor: function (options) {
	      this.options = options || {};
	      var data = this.getTemplateData();

	      this.disabled = false;

	      BaseView.apply(this, arguments);

	      this.$el.addClass('link-button');
	      if (data.icon) {
	        this.$el.addClass('link-button-icon');
	        if (!data.title) {
	          this.$el.addClass('icon-only');
	        }
	      }
	    },

	    getTemplateData: function () {
	      return {
	        href: this.__getAttribute('href'),
	        title: this.__getAttribute('title'),
	        icon: this.__getAttribute('icon')
	      };
	    },

	    initialize: function () {
	      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'enableWhen', this), this.toggle);
	      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'showWhen', this), this.toggleVisible);
	    },

	    render: function () {

	      BaseView.prototype.render.apply(this, arguments);

	      if (!_.result(this, 'enabled')) {
	        this.toggle(false);
	      }

	      if (!_.result(this, 'visible')) {
	        this.toggleVisible(false);
	      }
	      
	      var data = this.getTemplateData();
	      this.$el.attr('href', data.href || '#');

	      return this;
	    },

	    __getAttribute: function (name, defaultValue) {
	      var value = _.resultCtx(this.options, name, this);
	      if (_.isUndefined(value)) {
	        value = _.result(this, name);
	      }
	      return !_.isUndefined(value) ? value : defaultValue;
	    },

	    enable: function () {
	      this.toggle(true);
	    },

	    disable: function () {
	      this.toggle(false);
	    },

	    show: function () {
	      this.toggleVisible(true);
	    },

	    hide: function () {
	      this.toggleVisible(false);
	    },

	    toggle: function (enable) {
	      //this is to toggle the enability
	      var bool = !!enable && _.result(this, 'enabled');
	      this.disabled = !bool;
	      this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);

	      // delegateEvents asynchronously in case the button is not yet added to the DOM
	      // in these cases the alternate events won't work
	      _.defer(_.bind(function () {
	        this.delegateEvents(this.disabled ? disabledEvents : null);
	      }, this));
	    },

	    toggleVisible: function (visible) {
	      var hidden = !visible || !_.result(this, 'visible');
	      this.$el.toggleClass('hide', hidden);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {

	  function changeEventString(doWhen) {
	    return 'change:' + _.keys(doWhen).join(' change:');
	  }

	  function calcDoWhen(value, key) {
	    var modelValue = this.model.get(key);
	    if (_.isFunction(value)) {
	      return value.call(this, modelValue);
	    }
	    else {
	      return value == modelValue;
	    }
	  }

	  function _doWhen(view, doWhen, fn) {
	    var toggle = _.bind(fn, view, view, doWhen);

	    view.render = _.wrap(view.render, function (render) {
	      var val = render.call(view);
	      toggle({animate: false});
	      return val;
	    });

	    view.listenTo(view.model, changeEventString(doWhen), function () {
	      toggle({animate: true});
	    });
	  }

	  return {
	    applyDoWhen: function (view, doWhen, fn) {
	      if (!(view.model && _.isObject(doWhen) && _.size(doWhen) && _.isFunction(fn))) {
	        return;
	      }
	      _doWhen(view, doWhen, function (view, doWhen, options) {
	        var result = _.every(_.map(doWhen, calcDoWhen, view));
	        fn.call(view, result, options);
	      });
	    }
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 65 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(67)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseFileUploader) {

	  return BaseFileUploader.extend({

	    className: 'image-file-upload',

	    parse: function (src) {
	      var target = _.clone(src || {});
	      if (target.size) {
	        target.fileSizeKB = Math.round(target.size / 1000);
	      }
	      return target;
	    },

	    previewTemplate: '\
	      <div class="image-file-thumbnail float-l">\
	        <img src="{{imageUrl}}" >\
	      </div>\
	      <div class="image-file-info float-l">\
	        <ul>\
	          {{#if name}}<li>{{name}}</li>{{/if}}\
	          {{#if fileSizeKB}}<li>{{fileSizeKB}}(KB)</li>{{/if}}\
	        </ul>\
	      </div>',

	    fileTypes: ['.png', '.gif', '.jpeg', '.jpg']

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: [2, 11] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(42),
	  __webpack_require__(21),
	  __webpack_require__(25),
	  __webpack_require__(68),
	  __webpack_require__(7),
	  __webpack_require__(28),
	  __webpack_require__(69),
	  __webpack_require__(70)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, BaseInput, Model, BaseCollection, ErrorParser, StringUtil, TemplateUtil, FileUploadInput,
	             PreviewListView) {

	  function parseJSON(source) {
	    if (!_.isString(source)) {
	      return _.clone(source);
	    }
	    try {
	      return JSON.parse(source);
	    }
	    catch (e) {
	      return ;
	    }
	  }

	  return BaseInput.extend({

	    idAttribute: 'id',

	    /**
	     * @property {String} template for rendering preview content.
	     * @abstract
	     */
	    previewTemplate: null,

	    /**
	     * @property {Array|Function} to suggest only to select particular file types otherwise any type of files.
	     * @link https://www.w3.org/TR/html-markup/input.file.html
	     *
	     * @example
	     * ['.png','.jpg']
	     * ['.csv']
	     * ['.crt', '.pem']
	     *
	     */
	    fileTypes: null,

	    /**
	     * Transform/normalise the response before rendering if necessary. default is _.identity.
	     * @type {Function}
	     */
	    parse: _.identity,

	    /**
	     * @property {String|Function} form field for file submit request.
	     */
	    fileFieldName: 'file',

	    fileUploadInputEvents: {
	      clear: 'clearError',
	      success: 'addFileData',
	      error: 'showError'
	    },

	    constructor: function (options) {
	      /* eslint max-statements: [2, 18] */

	      var opts = _.extend({
	        fileTypes: _.result(this, 'fileTypes'),
	        fileFieldName: _.result(options.params, 'fileFieldName') || _.result(this, 'fileFieldName'),
	        endpoint: _.result(this, 'endpoint')
	      }, options, this.getParams(options));
	      this.fileUploadInput = new FileUploadInput(opts);

	      BaseInput.apply(this, arguments);

	      var Collection = BaseCollection.extend({
	        model: Model.extend({
	          extraProperties: true,
	          idAttribute: this.getParamOrAttribute('idAttribute')
	        })
	      });

	      this.collection = new Collection();

	      this.previewListView = new PreviewListView({
	        collection: this.collection,
	        params: options.params,
	        parse: this.parse,
	        previewTemplate: this.previewTemplate
	      });

	      this.fileUploadInput.setCollection(this.collection);

	      this.listenTo(this.collection, 'update', this.update);
	      this.listenTo(this.collection, 'update', this.resize);

	      this.$el.append(this.fileUploadInput.render().el);
	      this.$el.append(this.previewListView.render().el);

	      this.$el.addClass('o-form-control file-upload clearfix');
	    },

	    previewFromModel: function () {
	      this.collection.reset();

	      var id = this.getModelValue(),
	          previewData = this.getParam('previewData'),
	          previewEndpoint = this.options.params && this.options.params.previewEndpoint,
	          collection = this.collection;

	      if (id) {
	        if (previewData) {
	          collection.set(previewData);
	        }
	        else if (previewEndpoint) {
	          var url = _.isString(previewEndpoint) ? TemplateUtil.tpl(previewEndpoint) : previewEndpoint;

	          var promisses = _.map(_.isArray(id) ? id : [id], function (id) {
	            return $.get(url({id: id}));
	          });

	          $.when.apply($, promisses).then(function () {
	            var data = promisses.length == 1 ? arguments[0] : _.pluck(arguments, 0);
	            collection.set(data);
	          });

	        }
	      }
	    },

	    clearError: function () {
	      this.model.trigger('form:clear-error:' + this.options.name);
	    },

	    addFileData: function (resp) {
	      var model = parseJSON(resp);
	      if (model) {
	        this.collection.add(model);
	      }
	    },


	    showError: function (resp) {
	      this.clearError();

	      if (resp && resp.status === 0 && resp.statusText == 'abort') {
	        return ;
	      }

	      var errorSummary;
	      if (_.isString(resp)) {
	        errorSummary = resp;
	      }
	      else {
	        var data = ErrorParser.getResponseJSON(resp);
	        errorSummary = data && data.errorSummary || StringUtil.localize('oform.file.upload.error');
	      }

	      var validationError = {};
	      validationError[this.options.name] = errorSummary;
	      this.model.trigger('invalid', this.model, validationError, false);
	    },

	    /**
	     * BASE INPUT OVERRIDES
	     */

	    editMode: function () {
	      this.previewFromModel();
	      this.fileUploadInput.toggle(true);
	    },

	    readMode: function () {
	      return this.editMode();
	    },

	    val: function () {
	      var data = this.collection.pluck(this.getParamOrAttribute('idAttribute'));
	      return this.getParam('multi') ? data : data[0];
	    },

	    focus: function () {
	      this.fileUploadInput.focus();
	    },

	    // skip inline validation
	    validate: _.noop,

	    /**
	     * HELPER FUNCTIONS
	     */

	    getParamOrAttribute: function (name) {
	      return this.getParam(name) || _.result(this, name);
	    },

	    getParams: function (options) {
	      var opts = options || this.options;
	      return _.clone(opts && opts.params || {});
	    },

	    getParam: function (key, defaultValue) {
	      var params = this.getParams();
	      var res = _.resultCtx(params, key, this);
	      return !_.isUndefined(res) ? res : defaultValue;
	    }

	  }, {
	    // test hooks
	    parseJSON: parseJSON
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {

	  return {

	    /**
	     * Helper function that returns the json output of an xhr objext
	     * @param  {jqXhr} xhr
	     * @return {Object}
	     */
	    getResponseJSON: function (xhr) {
	      try {
	        return xhr.responseJSON || JSON.parse(xhr.responseText);
	      }
	      catch (e) {
	        return;
	      }
	    },

	    /**
	     * Parses an error summary to extract a field name and an error message
	     * @param  {String} errorSummary The raw error summary
	     * @return {String[]} An array with two members: [field name, error message]
	     */
	    parseErrorSummary: function (errorSummary) {
	      // error format is: `fieldName: The field cannot be left blank`
	      var matches = errorSummary.match(/^([^\:]+)\: (.+)$/);
	      if (matches) {
	        return [matches[1], matches[2]];
	      }
	    },

	    /**
	     * Parses the response for errors
	     * Returns a map of field names > array or error messages
	     * Example:
	     * ```javascript
	     * {
	     *   url: ['The field cannot be left blank', 'The field has to be a valid URI'],
	     *   name: ['The field cannot be left blank']
	     * }
	     * ```
	     * @param  {Object} resp
	     * @return {Object}
	     */
	    parseFieldErrors: function (resp) {
	      var responseJSON = this.getResponseJSON(resp),
	          errors = {};

	      // xhr error object
	      if (responseJSON) {
	        _.each(responseJSON.errorCauses || [], function (cause) {
	          var res = this.parseErrorSummary(cause && cause.errorSummary || '');
	          if (res) {
	            var fieldName = res[0], message = res[1];
	            errors[fieldName] || (errors[fieldName] = []);
	            errors[fieldName].push(message);
	          }
	        }, this);
	      }
	      // validation key/value object
	      else if (_.isObject(resp) && _.size(resp)) {
	        _.each(resp, function (msg, field) {
	          errors[field] = [msg];
	        });
	      }
	      return _.size(errors) ? errors : undefined;
	    }
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(27),
	  __webpack_require__(13),
	  __webpack_require__(7)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, BaseView, Logger, StringUtil) {


	  function createAcceptFileTypes(fileTypes) {
	    return (fileTypes || []).join(',');
	  }

	  return BaseView.extend({

	    className: 'file-upload-wrap',

	    template: '\
	      <span class="file-upload-progress-indicator-wrap input-fix o-form-control hide">\
	        <span class="file-upload-progress-indicator"></span>\
	        <div class="file-upload-cancel file-upload-uploading"></div>\
	      </span>\
	      <div class="facade">\
	        <input type="text" class="file-name-text-field" placeholder="{{placeholder}}" \
	               title="{{browseFilesTitle}}" readonly>\
	        <a title="{{browseFilesTitle}}" class="browse-file-button link-button" href="#">{{browseFilesTitle}}</a>\
	      </div>\
	      <div class="o-form-explain hide"></div>\
	      <input type="file" class="m-file hide"{{#if accept}} accept="{{accept}}"{{/if}}\
	             {{#if multiple}} multiple="multiple"{{/if}}>\
	    ',

	    events: {
	      'click .file-upload-cancel': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        this.abortRequest();
	        this.render();
	      },
	      'click .facade': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        this.browseFiles();
	      },
	      'change .m-file': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        this.makeRequest(e.target.files);
	      }
	    },

	    initialize: function () {
	      _.bindAll(this, 'onProgress', 'onProgressComplete');
	      this.onSuccess = _.debounce(this.onSuccess, 1000);

	      this.listenTo(this.model, 'change:__edit__', this.render);
	    },

	    getTemplateData: function () {
	      return {
	        browseFilesTitle: StringUtil.localize('oform.browse.files'),
	        accept: createAcceptFileTypes(this.options.fileTypes),
	        multiple: this.options.multi,
	        placeholder: this.options.placeholder
	      };
	    },

	    postRender: function () {
	      this.delegateEvents();
	    },

	    browseFiles: function () {
	      this.$('.m-file').val('').click();

	      // delay hiding errors, so it does it after the file browser dialog is open (on the "background")
	      _.delay(function () {
	        this.trigger('clear');
	      }.bind(this), 2000);
	    },

	    setCollection: function (collection) {
	      this.collection = this.options.collection = collection;
	      this.listenTo(collection, 'update', function () {
	        this.toggle(collection.length === 0);
	      });
	    },

	    setFileName: function (displayName) {
	      this.$('.file-name-text-field').val(displayName || '');
	      this.$('.file-upload-progress-indicator').html(displayName || '');
	    },

	    startUploading: function (displayName) {
	      this.$('.file-upload-progress-indicator-wrap').removeClass('hide');
	      this.$('.file-upload-progress-indicator').css('width', '0px');
	      this.$('.facade').hide();
	      this.$('.file-upload-cancel').show();
	      this.setFileName(displayName);
	    },

	    /**
	     * As long as user chooses an file, upload to server and then display meta data.
	     * It will do nothing if File API is not supported or no file selected.
	     */
	    makeRequest: function (files) {
	      if (files.length === 0) {
	        Logger.warn('No files have been selected.');
	        return;
	      }

	      var displayFileName = _.pluck(files, 'name').join(', '),
	          maxItems = this.getMaxItems();

	      if (files.length + this.collection.length > maxItems) {
	        this.trigger(
	          'error',
	          StringUtil.localize('oform.file.upload.too.many.files', 'messages', [maxItems])
	        );
	        return;
	      }

	      this.trigger('clear');

	      this.startUploading(displayFileName);

	      this.sendUploadRequest(files)
	        .done(_.bind(this.onSuccess, this))
	        .fail(_.bind(this.onFailure, this));
	    },

	    sendUploadRequest: function (files) {
	      var self = this,
	          formData = new FormData(),
	          fileFieldName = this.options.fileFieldName;

	      _.each(files, function (file) {
	        formData.append(fileFieldName, file);
	      });

	      formData.append('_xsrfToken', $('#_xsrfToken').text());

	      var options = {
	        url: this.options.endpoint,
	        method: 'POST',
	        data: formData,
	        xhr: function () {
	          var xhr = $.ajaxSettings.xhr() ;
	          xhr.upload.addEventListener('progress', self.onProgress, false);
	          xhr.upload.addEventListener('load', self.onProgressComplete, false);
	          return xhr ;
	        },
	        // do not convert data to string
	        processData: false,
	        // to avoid override header content type. particularly for boundary
	        contentType: false
	      };
	      this._xhr = $.ajax(options);
	      return this._xhr;
	    },

	    abortRequest: function () {
	      Logger.warn('Upload aborted...');
	      if (this._xhr) {
	        this._xhr.abort();
	      }
	    },

	    onProgress: function (e) {
	      if (e.lengthComputable) {
	        var percentage = Math.round((e.loaded * 100) / e.total);
	        Logger.info('Upload in progress...', percentage + '%');
	        this.$('.file-upload-progress-indicator').css('width', (percentage + '%'));
	        return percentage; // test hook
	      }
	    },

	    onProgressComplete: function () {
	      Logger.info('Upload complete, processing...');
	      this.$('.file-upload-cancel').fadeOut();
	    },

	    onSuccess: function (resp) {
	      Logger.info('Upload processing complete...');
	      this.$('.file-upload-progress-indicator-wrap').addClass('hide');
	      this.toggle(false);
	      this.trigger('success', resp);
	    },

	    onFailure: function (xhr) {
	      Logger.warn('Upload failed...');
	      this.setFileName();
	      this.$('.file-upload-progress-indicator-wrap').addClass('hide');
	      this.$('.facade').show();
	      this.toggle(true);
	      this.trigger('error', xhr);
	    },

	    toggle: function (bool) {
	      this.$el.addClass('hide');

	      var doShow = bool;
	      if (this.options.multi) {
	        doShow = this.collection.length < this.getMaxItems();
	      }
	      else if (this.collection.length > 0) {
	        doShow = false;
	      }

	      if (doShow) {
	        this.render().$el.removeClass('hide');
	      }
	      return doShow; // test hook
	    },

	    focus: function () {
	      this.$('.facade').focus();
	    },

	    getMaxItems: function () {
	      var schema = this.model.getPropertySchema(this.options.name) || {};
	      return schema.maxItems || Infinity;
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(27),
	  __webpack_require__(30)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView, ListView) {

	  function createItem(options) {

	    function parse(src) {
	      var data = (options.params && options.params.parse || _.identity).call(null, src);
	      // run the per-uploder parse later, after the data is normalized by the per-intance parser
	      return (options.parse || _.identity).call(null, data);
	    }

	    return BaseView.extend({

	      className: 'file-upload-preview',

	      events: {
	        'click .file-upload-cancel': function (e) {
	          e.preventDefault();
	          e.stopPropagation();
	          this.collection.remove(this.model);
	        },
	      },

	      getTemplateData: function () {
	        var item = parse(this.model.toJSON()),
	            items = [_.omit(item, 'chain')].concat((item.chain || []).map(parse));

	        return _.extend({}, item, {
	          certNames: _.pluck(items, 'certName').join(' > '),
	          multiItems: items.length > 1,
	          items: items.map(function (val) {
	            return _.extend({}, val, {
	              multiItems: items.length > 1
	            });
	          })
	        });

	      },

	      template: options.previewTemplate,

	      postRender: function () {
	        this.$el.prepend('<div class="file-upload-cancel"></div>');
	        this.delegateEvents();
	      }
	    });
	  }

	  return ListView.extend({
	    className: 'file-upload-preview-wrap',
	    constructor: function (options) {
	      this.item = createItem(options);
	      ListView.apply(this, arguments);
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(2),
	  __webpack_require__(16),
	  __webpack_require__(7),
	  __webpack_require__(67)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, _, moment, StringUtil, BaseFileUploader) {

	  return BaseFileUploader.extend({

	    className: 'cert-file-upload',

	    events: {
	      'click .cert-expand-details': function (e) {
	        e && e.preventDefault();
	        var self = this,
	            $certDetails = $(e.target).siblings('.cert-details'),
	            duration = $certDetails.length * 75,
	            resize = function () {
	              self.model.trigger('form:resize');
	            };

	        if ($certDetails.is(':hidden') || $certDetails.hasClass('hide')) {
	          $certDetails.removeClass('hide').hide().slideDown(duration, resize);
	          $(e.target).text(StringUtil.localize('oform.certificate.hide.chain'));
	        }
	        else {
	          $certDetails.slideUp(duration, resize);
	          $(e.target).text(StringUtil.localize('oform.certificate.view.chain'));
	        }
	      }
	    },

	    parse: function (src) {
	      var target = _.clone(src || {});
	      if (target.notAfter) {
	        var diff = moment.utc(target.notAfter).diff(moment.utc(), 'days');
	        if (diff > 0) {
	          _.extend(target, {
	            expiresInDays: diff
	          });
	        }
	        if (diff < 14) {
	          target.expireClass = 'cert-expired';
	        }
	      }
	      return target;
	    },

	    previewTemplate: '\
	      <div class="cert-thumbnail"><span class="icon icon-32 icon-only file-cert-32"></span></div>\
	      <ul class="cert-details-header">\
	        {{#if certNames}}<li class="cert-names">{{certNames}}</li>{{/if}}\
	        {{#if uploadedBy}}{{#if uploadedOn}}\
	        <li class="cert-upload-info">\
	          {{i18n code="oform.certificate.uploaded" bundle="messages" arguments="uploadedBy;uploadedOn"}} \
	        </li>\
	        {{/if}}{{/if}}\
	      </ul>\
	      {{#each items}}\
	        <ul class="cert-details{{#if multiItems}} hide{{/if}}">\
	          {{#if multiItems}}{{#if certName}}\
	            <li class="cert-name">{{certName}}</li>\
	          {{/if}}{{/if}}\
	          {{#if issuer}}<li class="cert-issuer">{{issuer}}</li>{{/if}}\
	          {{#if notBefore}}{{#if notAfter}}\
	            <li class="cert-valid-date">\
	              {{i18n code="oform.certificate.valid" bundle="messages" arguments="notBefore;notAfter"}}\
	            </li>\
	          {{/if}}{{/if}}\
	          <li class="cert-expiration {{expireClass}}">\
	            {{#if expiresInDays}}\
	            {{i18n code="oform.certificate.expires" bundle="messages" arguments="expiresInDays"}}\
	            {{else}}\
	            {{i18n code="oform.certificate.expired" bundle="messages"}}\
	            {{/if}}\
	          </li>\
	        </ul>\
	      {{/each}}\
	      {{#if multiItems}}\
	        <a href="#" class="cert-expand-details">{{i18n code="oform.certificate.view.chain"}}</a>\
	      {{/if}}\
	      ',

	    fileTypes: ['.crt', '.pem']

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(28),
	  __webpack_require__(27),
	  __webpack_require__(73)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, TemplateUtil, BaseView) {

	  /**
	   * @class InputLabel
	   * @extends {Okta.View}
	   * @private
	   * The input's label.
	   */
	  return BaseView.extend({

	    className: 'okta-form-label o-form-label',

	    attributes: {
	      'data-se': 'o-form-label'
	    },

	    /**
	     * @constructor
	     * @param  {Object} options options hash
	     * @param  {String} [options.type] Input type
	     * @param  {String|Function} [options.label] Label text
	     * @param  {String|Function} [options.sublabel] Sub label text
	     * @param  {String|Function} [options.tooltip] Tooltip text
	     * @param  {String|Function} [options.inputId] Id of the inputs
	     * @param  {String|Function} [options.id] Id of the inputs
	     */
	    constructor: function (options) {
	      /* eslint max-statements: [2, 16] complexity: [2, 7]*/
	      _.defaults(options, {inputId: options.id});
	      delete options.id;

	      BaseView.apply(this, arguments);

	      var template;
	      if (this._isLabelView(options.label)) {
	        template = '<label for="{{inputId}}"></label>';
	      } else if (_.contains(['radio', 'checkbox'], options.type) || !options.label) {
	        template = '{{label}}';
	      } else {
	        //space added in the end of the label to avoid selecting label text with double click in read mode
	        template = '<label for="{{inputId}}">{{label}}&nbsp;</label>';
	      }
	      if (options.sublabel) {
	        template += '<span class="o-form-explain">{{sublabel}}</span>';
	      }
	      if (options.tooltip) {
	        if (_.isString(options.tooltip)) {
	          options.tooltip = {
	            text: options.tooltip
	          };
	        }
	        template += '<span class="o-form-tooltip icon-16 icon-only form-help-16" title="{{tooltip.text}}"></span>';
	      }
	      this.template = TemplateUtil.tpl(template);

	    },

	    getTemplateData: function () {
	      var options = {label: ''};
	      _.each(['inputId', 'label', 'sublabel', 'tooltip'], function (option) {
	        options[option] = _.resultCtx(this.options, option, this);
	      }, this);

	      return options;
	    },

	    _isLabelView: function (label) {
	      return !_.isUndefined(label) && label instanceof BaseView;
	    },

	    postRender: function () {
	      var options = this.getTemplateData();
	      if (this._isLabelView(options.label)) {
	        this.removeChildren();
	        this.add(options.label, 'label');
	      }

	      if (options.tooltip) {
	        this.$('.o-form-tooltip').qtip(_.extend({
	          style: {classes: 'qtip-custom qtip-shadow'},
	          position: {
	            my: 'bottom left',
	            at: 'top center'
	          },
	          hide: {fixed: true},
	          show: {delay: 0}
	        }, options.tooltip.options));
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_73__;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(27), __webpack_require__(75)], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView, FormUtil) {

	  function runCallback(callback, field) {
	    callback.apply(this, _.map(field.split(/\s+/), function (field) {
	      return this.model.get(field);
	    }, this));
	  }

	  function runIf(fn, ctx) {
	    if (_.isFunction(fn)) {
	      fn.call(ctx);
	    }
	  }

	  /**
	   * @class InputWrapper
	   * @extends Okta.View
	   * @private
	   * The outer wrapper that warps the label and the input container
	   */
	  return BaseView.extend({

	    className: function () {
	      var className = 'o-form-fieldset';

	      if (this.options['label-top']) {
	        className += ' o-form-label-top';
	      }

	      if (this.options.readOnly) {
	        className += ' o-form-read-mode';
	      }

	      return className;
	    },

	    attributes: function () {
	      return {
	        'data-se': this.options['data-se'] || 'o-form-fieldset'
	      };
	    },

	    /**
	     * @constructor
	     * @param  {Object} options options hash
	     * @param  {Object} [options.events]
	     * @param  {Object} [options.bindings]
	     * @param  {Object} [options.showWhen]
	     * @param  {Function} [options.initialize] post initialize callback
	     * @param  {Function} [options.render] post render callback
	     */
	    constructor: function (options) {
	      if (options.className) {
	        this.inputWrapperClassName = this.className;
	        this.optionsClassName = options.className;
	        options.className = function () {
	          return _.result(this, 'inputWrapperClassName', '') + ' ' + _.result(this, 'optionsClassName');
	        };
	      }
	      BaseView.apply(this, arguments);
	      _.each(options.events || {}, function (callback, event) {
	        this.listenTo(this.model, event, callback);
	      }, this);

	      _.each(options.bindings || {}, function (callback, field) {
	        this.listenTo(this.model, FormUtil.changeEventString(field.split(/\s+/)),
	          _.bind(runCallback, this, callback, field));
	      }, this);

	      FormUtil.applyShowWhen(this, options.showWhen);
	      FormUtil.applyToggleWhen(this, options.toggleWhen);

	      runIf(options.initialize, this);
	    },

	    postRender: function () {
	      _.each(this.options.bindings || {}, runCallback, this);
	      runIf(this.options.render, this);
	    },

	    /**
	     * @return {InputLabel}
	     */
	    getLabel: function () {
	      return this.size() > 1 ? this.at(0) : null;
	    },
	    /**
	     * @deprecated ambiguous naming, use {@link #getInputContainer}
	     */
	    getInput: function () {
	      return this.getInputContainer();
	    },

	    /**
	     * @return {InputContainer}
	     */
	    getInputContainer: function () {
	      return this.at(this.size() > 1 ? 1 : 0);
	    },

	    /**
	     * @return {BaseInput[]}
	     */
	    getInputs: function () {
	      return this.getInputContainer().toArray();
	    },

	    focus: function () {
	      return this.getInput().focus();
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint max-params: [2, 6] */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(7),
	  __webpack_require__(27),
	  __webpack_require__(43),
	  __webpack_require__(13),
	  __webpack_require__(64)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, StringUtil, BaseView, Keys, Logger, ViewUtil) {

	  var LABEL_OPTIONS = ['model', 'id', 'inputId', 'type', 'label', 'sublabel', 'tooltip', 'name'],

	      CONTAINER_OPTIONS = ['wide', 'multi', 'input', 'explain', 'customExplain', 'model', 'name', 'type', 'autoRender'],

	      WRAPPER_OPTIONS = ['model', 'name', 'label-top', 'readOnly', 'events', 'initialize', 'showWhen', 'bindings',
	        'render', 'className', 'data-se', 'toggleWhen'],

	      INPUT_OPTIONS = ['model', 'name', 'inputId', 'type', // base options
	        'input', // custom input
	        'placeholder', 'label', // labels
	        'readOnly', 'read', 'disabled', 'readModeString', // modes
	        'options', // select/radio
	        'from', 'to', // model transformers,
	        'autoRender', // model attributes change event to trigger rerendering of the input
	        'inlineValidation', // control inline validating against the model on focus lost
	        'params'], // widgets params - for input specific widgets

	      OTHER_OPTIONS = ['errorField'];


	  var ALL_OPTIONS = _.uniq(_.union(LABEL_OPTIONS, CONTAINER_OPTIONS, WRAPPER_OPTIONS, INPUT_OPTIONS, OTHER_OPTIONS));

	  var SAVE_BUTTON_PHASES = [
	    '•         ',
	    '•  •      ',
	    '•  •  •   ',
	    '•  •  •  •',
	    '   •  •  •',
	    '      •  •',
	    '         •',
	    '          ',
	    '          ',
	    '          '
	  ];

	  function decorateDoWhen(doWhen) {
	    if (doWhen && !doWhen['__edit__']) {
	      return _.extend({'__edit__': _.constant(true)}, doWhen);
	    }
	  }

	  function createButton(options) {

	    options = _.pick(options || {}, 'action', 'className', 'text', 'type');

	    var timeoutId, intervalId, phaseCount;

	    return BaseView.extend({
	      tagName: 'input',
	      className: 'button',
	      events: {
	        'click': function () {
	          if (options.action && !this.disabled()) {
	            options.action.call(this);
	          }
	        },
	        'keyup': function (e) {
	          if (Keys.isEnter(e) && options.action && !this.disabled()) {
	            options.action.call(this);
	          }
	        }
	      },

	      disabled: function () {
	        return this.$el.prop('disabled') === true;
	      },

	      disable: function () {
	        this.$el.prop('disabled', true);
	        this.$el.addClass('btn-disabled');
	      },

	      enable: function () {
	        this.$el.prop('disabled', false);
	        this.$el.removeClass('btn-disabled');
	      },

	      initialize: function () {
	        var self = this;

	        this.$el.attr('type', options.type == 'save' ? 'submit' : 'button');
	        this.$el.val(options.text);
	        if (options.className) {
	          this.$el.addClass(options.className);
	        }
	        if (options.type) {
	          this.$el.attr('data-type', options.type);
	        }

	        this.$el.mousedown(function () {
	          self.model.set('__pending__', true);
	        });

	        this.$el.mouseup(function () {
	          self.model.set('__pending__', false);
	        });

	        this.listenTo(this.model, 'form:set-saving-state', function () {
	          this.disable();
	          if (options.type == 'save') {
	            timeoutId = setTimeout(_.bind(this.__changeSaveText, this), 1000);
	          }
	        });
	        this.listenTo(this.model, 'form:clear-saving-state', function () {
	          this.enable();
	          if (options.type == 'save') {
	            clearTimeout(timeoutId);
	            clearInterval(intervalId);
	            this.$el.val(options.text);
	          }
	        });
	      },

	      __changeSaveText: function () {
	        phaseCount = 0;
	        intervalId = setInterval(_.bind(this.__showLoadingText, this), 200);
	      },

	      __showLoadingText: function () {
	        this.$el.val(SAVE_BUTTON_PHASES[phaseCount++ % SAVE_BUTTON_PHASES.length]);
	      }
	    });
	  }

	  function validateInput(options, model) {
	    /* eslint max-statements: 0, complexity: 0 */

	    options || (options = {});

	    if (options.type == 'label') {
	      if (!options.label) {
	        Logger.warn('A label input must have a "label" parameter', options);
	      }
	      return;
	    }

	    if (options.type == 'button') {
	      if (!options.title && !options.icon) {
	        Logger.warn('A button input must have a "title" and/or an "icon" parameter', options);
	      }
	      if (!options.click && !options.href) {
	        Logger.warn('A button input must have a "click" and/or an "href" parameter', options);
	      }
	      return;
	    }

	    if (!options.name && !options.input) {
	      Logger.warn('Missing "name" or "input" parameters', options);
	    }

	    if (_.isArray(options.name) && _.isArray(options.input)) {
	      throw new Error('Not allowed to have both "name" and "input" defined as array.');
	    }

	    if (options.type != 'list' && options.name && (model && model.allows)) {
	      var names = [];
	      if (_.isArray(options.name)) {
	        names = options.name;
	      } else {
	        names.push(options.name);
	      }
	      _.each(names, function (name) {
	        if (!model.allows(name)) {
	          throw new Error('field not allowed: ' + options.name);
	        }
	      });
	    }

	    if (_.isArray(options.input) && options.type != 'list') {
	      _.each(options.input, function (input) {
	        validateInput(input, model);
	      });
	    }

	    var keys = _.keys(options),
	        intersection = _.intersection(keys, ALL_OPTIONS);

	    if (_.size(intersection) != _.size(options)) {
	      var fields = _.clone(ALL_OPTIONS);
	      fields.unshift(keys);
	      Logger.warn('Invalid input parameters', _.without.apply(null, fields), options);
	    }
	  }

	  function generateInputOptions(options, form, createFn) {
	    options = _.clone(options);

	    if (_.contains(['list', 'group'], options.type)) {
	      options.params = _.defaults({
	        create: createFn,
	        inputs: _.map(_.isArray(options.input) ? options.input : [options.input], function (input) {
	          return _.first(generateInputOptions(input, form, createFn));
	        })
	      }, options.params || {});
	      delete options.input;
	    }

	    var inputs = _.isArray(options.input) ? _.clone(options.input) : [options];

	    return _.map(inputs, function (input) {
	      var target = _.defaults({model: form.model}, input, _.omit(options, 'input', 'inputs'), form.options, {
	        id: _.uniqueId('input'),
	        readOnly: form.isReadOnly(),
	        read: form.hasReadMode()
	      });
	      if (form.isReadOnly()) {
	        target.read = target.readOnly = true;
	      }
	      return target;
	    });

	  }

	  return {

	    LABEL_OPTIONS: LABEL_OPTIONS,
	    CONTAINER_OPTIONS: CONTAINER_OPTIONS,
	    WRAPPER_OPTIONS: WRAPPER_OPTIONS,
	    INPUT_OPTIONS: INPUT_OPTIONS,

	    generateInputOptions: generateInputOptions,

	    changeEventString: function (fieldNames) {
	      return 'change:' + fieldNames.join(' change:');
	    },

	    createReadFormButton: function (options) {

	      var action, text, ariaLabel;
	      if (options.type == 'cancel') {
	        text = ariaLabel = StringUtil.localize('oform.cancel');
	        action = function () {
	          this.model.trigger('form:cancel');
	        };
	      }
	      else {
	        text = StringUtil.localize('oform.edit');
	        ariaLabel = text + ' ' + options.formTitle;
	        action = function () {
	          this.model.set('__edit__', true);
	        };
	      }

	      return BaseView.extend({
	        tagName: 'a',
	        attributes: {
	          href: '#',
	          'aria-label': ariaLabel
	        },
	        template: function () {
	          return _.escape(text);
	        },
	        events: {
	          click: function (e) {
	            e.preventDefault();
	            action.call(this);
	          }
	        }
	      });

	    },

	    createButton: function (options) {
	      options = _.clone(options);
	      switch (options.type) {
	      case 'save':
	        _.defaults(options, {className: 'button-primary'});
	        break;
	      case 'cancel':
	        _.defaults(options, {
	          text: StringUtil.localize('oform.cancel'),
	          action: function () {
	            this.model.trigger('form:cancel');
	          }
	        });
	        break;
	      case 'previous':
	        _.defaults(options, {
	          text: StringUtil.localize('oform.previous'),
	          action: function () {
	            this.model.trigger('form:previous');
	          }
	        });
	        break;
	      }
	      return createButton(options);
	    },

	    validateInput: validateInput,

	    /**
	     * Applies a show-when logic on a view instance.
	     * The show-when is a map of a model field name -> a boolean or a function that returns a boolean.
	     * The view will toggle based on the field value.
	     *
	     * @param  {Okta.View} view a view instance that has a this.model attached to it
	     * @param  {Object} showWhen
	     */
	    applyShowWhen: function (view, showWhen) {
	      var toggleAndResize = function (bool) {
	        return function () {
	          // The `toggle` is here since an event may be triggered before the el is in the DOM
	          // and in that case slide events may not function as expected.
	          view.$el.toggle(bool);
	          view.model.trigger('form:resize');
	        };
	      };

	      ViewUtil.applyDoWhen(view, decorateDoWhen(showWhen), function (bool, options) {
	        if (!options.animate) {
	          view.$el.toggle(bool);
	        }
	        else {
	          view.$el['slide' + (bool ? 'Down' : 'Up')](200, toggleAndResize(bool));
	        }
	      });
	    },

	    applyToggleWhen: function (view, toggleWhen) {
	      ViewUtil.applyDoWhen(view, decorateDoWhen(toggleWhen), function (bool, options) {
	        view.$el.toggle(bool);
	        view.model.trigger('form:resize');
	        if (options.animate) {
	          view.render();
	        }
	      });
	    }
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(27)], __WEBPACK_AMD_DEFINE_RESULT__ = function (BaseView) {

	  var template = '\
	    <div class="okta-form-infobox-error infobox infobox-error" role="alert">\
	      <span class="icon error-16"></span>\
	      {{#if errorSummary}}\
	        <p>{{errorSummary}}</p>\
	      {{else}}\
	        <p>{{i18n code="oform.errorbanner.title"}}</p>\
	      {{/if}}\
	    </div>\
	  ';

	  return BaseView.extend({
	    template: template,
	    modelEvents: {
	      'form:clear-errors': 'remove'
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 77 */
/***/ function(module, exports) {

	// empty (null-loader)

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(27),
	  __webpack_require__(75)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView, FormUtil) {

	  return BaseView.extend({

	    className: 'o-form-button-bar',

	    initialize: function (options) {
	      this.addButton({
	        type: 'save',
	        text: _.resultCtx(options, 'save', this),
	        className: _.resultCtx(options, 'saveClassName', this)
	      });

	      if (!options.noCancelButton) {
	        this.addButton({type: 'cancel', text: _.resultCtx(options, 'cancel', this)});
	      }

	      if (options.hasPrevStep) {
	        this.addButton({type: 'previous'}, {prepend: true});
	      }
	    },

	    /**
	     * Adds a buttomn to the toolbar
	     * @param {Object} params button parameters
	     * @param {Object} options {@link Okta.View#add} options
	     */
	    addButton: function (params, options) {
	      return this.add(FormUtil.createButton(params), options);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(27),
	  __webpack_require__(80)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, BaseView, Time) {

	  function getOption(callout, option) {
	    return _.resultCtx(callout.options, option, callout) || _.result(callout, option);
	  }

	  function getTopClass(callout) {
	    var klass = 'infobox clearfix infobox-' + getOption(callout, 'type');
	    switch (getOption(callout, 'size')) {
	    case 'standard':
	      klass += '';
	      break;
	    case 'compact':
	      klass += ' infobox-compact';
	      break;
	    case 'large':
	      klass += ' infobox-md';
	      break;
	    }
	    if (getOption(callout, 'dismissible')) {
	      klass += ' infobox-dismiss';
	    }
	    return klass;
	  }

	  var events = {
	    'click .infobox-dismiss-link': function (e) {
	      e.preventDefault();
	      this.$el.fadeOut(Time.UNLOADING_FADE, _.bind(this.remove, this));
	    }
	  };

	  var template = '\
	    {{#if dismissible}}\
	      <a class="infobox-dismiss-link" title="Dismiss" href="#">\
	        <span class="dismiss-icon"></span>\
	      </a>\
	    {{/if}}\
	    <span class="icon {{icon}}"></span>\
	    {{#if title}}<h3>{{title}}</h3>{{/if}}\
	    {{#if subtitle}}<p>{{subtitle}}</p>{{/if}}\
	    {{#if bullets}}\
	      <ul class="bullets">\
	      {{#each bullets}}<li>{{this}}</li>{{/each}}\
	      </ul>\
	    {{/if}}\
	  ';

	  /**
	   * @class Callout
	   * @private
	   */

	  var Callout = BaseView.extend({

	    /**
	     * Custom HTML or view to inject to the callout
	     * @type {String|Okta.View}
	     */
	    content: null,

	    /**
	     * Size of icon. options are standard, large, compact
	     * @type {String}
	     */
	    size: 'standard',

	    /**
	     * Type of the callout. Valid values are: info, success, warning, error, tip
	     * @type {String}
	     */
	    type: 'info',

	    /**
	     * Can the callout be dismissed
	     * @type {Boolean}
	     */
	    dismissible: false,

	    /**
	     * Callout title
	     * @type {String}
	     */
	    title: null,

	    /**
	     * Callout subtitle
	     * @type {String}
	     */
	    subtitle: null,

	    /**
	     * Array of strings to render as bullet points
	     * @type {Array}
	     */
	    bullets: null,

	    constructor: function () {
	      this.events = _.defaults(this.events || {}, events);

	      BaseView.apply(this, arguments);

	      this.$el.addClass(getTopClass(this));

	      this.template = template;

	      var content = getOption(this, 'content');
	      if (content) {
	        this.add(content);
	      }
	    },

	    getTemplateData: function () {
	      var icon = getOption(this, 'type');
	      if (icon == 'tip') { // css is inconsistent
	        icon = 'light-bulb';
	      }
	      return {
	        icon: icon + '-' + (getOption(this, 'size') == 'large' ? '24' : '16'),
	        title: getOption(this, 'title'),
	        subtitle: getOption(this, 'subtitle'),
	        bullets: getOption(this, 'bullets'),
	        dismissible: getOption(this, 'dismissible')
	      };
	    }
	  });

	  return {
	    /**
	     * @static
	     * @param {Object} options
	     * @param {String|Function} [options.size] Size of icon. options are standard, large, compact
	     * @param {String|Okta.View} [options.content] Custom HTML or view to inject to the callout
	     * @param {String|Function} [options.title] Callout title
	     * @param {String|Function} [options.subtitle] Callout subtitle
	     * @param {Array|Function} [options.bullets] Array of strings to render as bullet points
	     * @param {Boolean|Function} [options.dismissible] Can the callout be dismissed
	     * @param {String|Function} [options.type] Callout type. Valid values are: info, success, warning, error, tip
	     *
	     * @return {Callout}
	     */
	    create: function (options) {
	      return new Callout(options);
	    }
	  };


	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	!(module.exports = {
	  DEBOUNCE_DELAY: 200,
	  LOADING_FADE: 400,
	  UNLOADING_FADE: 400,
	  ROW_EXPANDER_TRANSITION: 150,
	  HIDE_ADD_MAPPING_FORM: 300
	});

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* jshint maxparams: 100 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(96),
	  __webpack_require__(148),
	  __webpack_require__(106),
	  __webpack_require__(109),
	  __webpack_require__(120),
	  __webpack_require__(124),
	  __webpack_require__(126),
	  __webpack_require__(129),
	  __webpack_require__(131),
	  __webpack_require__(132),
	  __webpack_require__(133),
	  __webpack_require__(137),
	  __webpack_require__(138),
	  __webpack_require__(139),
	  __webpack_require__(140),
	  __webpack_require__(143),
	  __webpack_require__(144),
	  __webpack_require__(145),
	  __webpack_require__(146),
	  __webpack_require__(82),
	  __webpack_require__(153),
	  __webpack_require__(155),
	  __webpack_require__(156),
	  __webpack_require__(157),
	  __webpack_require__(160),
	  __webpack_require__(161),
	  __webpack_require__(163),
	  __webpack_require__(164),
	  __webpack_require__(165),
	  __webpack_require__(166),
	  __webpack_require__(167),
	  __webpack_require__(168),
	  __webpack_require__(169),
	  __webpack_require__(170),
	  __webpack_require__(98),
	  __webpack_require__(171),
	  __webpack_require__(103),
	  __webpack_require__(172)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (BaseLoginRouter,
	          PrimaryAuthController,
	          VerifyDuoController,
	          MfaVerifyController,
	          VerifyWindowsHelloController,
	          VerifyU2FController,
	          EnrollChoicesController,
	          EnrollDuoController,
	          EnrollQuestionController,
	          EnrollWindowsHelloController,
	          EnrollCallAndSmsController,
	          EnrollOnPremController,
	          EnrollSymantecVipController,
	          EnrollYubikeyController,
	          EnrollTotpController,
	          EnrollU2FController,
	          BarcodeTotpController,
	          BarcodePushController,
	          ActivateTotpController,
	          ManualSetupTotpController,
	          ManualSetupPushController,
	          EnrollmentLinkSentController,
	          EnterPasscodePushFlowController,
	          PasswordExpiredController,
	          CustomPasswordExpiredController,
	          ForgotPasswordController,
	          RecoveryChallengeController,
	          PwdResetEmailSentController,
	          RecoveryQuestionController,
	          PasswordResetController,
	          RecoveryLoadingController,
	          UnlockAccountController,
	          AccountUnlockedController,
	          UnlockEmailSentController,
	          RefreshAuthStateController,
	          QRLoginController,
	          SecurityBeacon,
	          FactorBeacon) {
	  return BaseLoginRouter.extend({

	    routes: {
	      '': 'primaryAuth',
	      'signin': 'primaryAuth',
	      'signin/verify/duo/web': 'verifyDuo',
	      'signin/verify/fido/webauthn': 'verifyWindowsHello',
	      'signin/verify/fido/u2f': 'verifyU2F',
	      'signin/verify/:provider/:factorType': 'verify',
	      'signin/enroll': 'enrollChoices',
	      'signin/enroll/duo/web': 'enrollDuo',
	      'signin/enroll/okta/question': 'enrollQuestion',
	      'signin/enroll/okta/sms': 'enrollSms',
	      'signin/enroll/okta/call': 'enrollCall',
	      'signin/enroll-activate/okta/sms': 'enrollSms',
	      'signin/enroll/rsa/token': 'enrollRsa',
	      'signin/enroll/del_oath/token': 'enrollOnPrem',
	      'signin/enroll/symantec/token': 'enrollSymantecVip',
	      'signin/enroll/yubico/token:hardware': 'enrollYubikey',
	      'signin/enroll/fido/webauthn': 'enrollWindowsHello',
	      'signin/enroll/fido/u2f': 'enrollU2F',
	      'signin/enroll/:provider/:factorType': 'enrollTotpFactor',
	      'signin/enroll-activate/okta/push': 'scanBarcodePushFactor',
	      'signin/enroll-activate/okta/push/manual': 'manualSetupPushFactor',
	      'signin/enroll-activate/okta/push/sent': 'activationLinkSent',
	      'signin/enroll-activate/okta/token:software:totp/passcode': 'enterPasscodeInPushEnrollmentFlow',
	      'signin/enroll-activate/:provider/:factorType': 'scanBarcodeTotpFactor',
	      'signin/enroll-activate/:provider/:factorType/activate': 'activateTotpFactor',
	      'signin/enroll-activate/:provider/:factorType/manual': 'manualSetupTotpFactor',
	      'signin/password-expired': 'passwordExpired',
	      'signin/custom-password-expired': 'customPasswordExpired',
	      'signin/forgot-password': 'forgotPassword',
	      'signin/recovery-challenge': 'recoveryChallenge',
	      'signin/recovery-emailed': 'recoveryEmailSent',
	      'signin/recovery-question': 'recoveryQuestion',
	      'signin/password-reset': 'passwordReset',
	      'signin/reset-password/:token': 'recoveryLoading',
	      'signin/user-unlock/:token': 'recoveryLoading',
	      'signin/recovery/:token': 'recoveryLoading',
	      'signin/unlock-emailed': 'unlockEmailSent',
	      'signin/unlock': 'unlockAccount',
	      'signin/account-unlocked': 'accountUnlocked',
	      'signin/refresh-auth-state(/:token)': 'refreshAuthState',
	      'signin/qr-login': 'qrLogin',
	      '*wildcard': 'primaryAuth'
	    },

	    // Route handlers that do not require a stateToken. If the page is refreshed,
	    // these functions will not require a status call to refresh the stateToken.
	    stateLessRouteHandlers: [
	      'primaryAuth', 'forgotPassword', 'recoveryLoading', 'unlockAccount', 'refreshAuthState', 'qrLogin'
	    ],

	    primaryAuth: function () {
	      this.render(PrimaryAuthController, { Beacon: SecurityBeacon });
	    },

	    qrLogin: function () {
	      this.render(QRLoginController, {
	        
	      });
	    },

	    verifyDuo: function () {
	      this.render(VerifyDuoController, {
	        provider: 'DUO',
	        factorType: 'web',
	        Beacon: FactorBeacon
	      });
	    },

	    verifyWindowsHello: function () {
	      this.render(VerifyWindowsHelloController, {
	        provider: 'FIDO',
	        factorType: 'webauthn',
	        Beacon: FactorBeacon
	      });
	    },

	    verifyU2F: function () {
	      this.render(VerifyU2FController, {
	        provider: 'FIDO',
	        factorType: 'u2f',
	        Beacon: FactorBeacon
	      });
	    },

	    verify: function (provider, factorType) {
	      this.render(MfaVerifyController, {
	        provider: provider.toUpperCase(),
	        factorType: factorType,
	        Beacon: FactorBeacon
	      });
	    },

	    enrollChoices: function () {
	      this.render(EnrollChoicesController, { Beacon: SecurityBeacon });
	    },

	    enrollDuo: function () {
	      this.render(EnrollDuoController, {
	        provider: 'DUO',
	        factorType: 'web',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollQuestion: function () {
	      this.render(EnrollQuestionController, {
	        provider: 'OKTA',
	        factorType: 'question',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollSms: function () {
	      this.render(EnrollCallAndSmsController, {
	        provider: 'OKTA',
	        factorType: 'sms',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollCall: function () {
	      this.render(EnrollCallAndSmsController, {
	        provider: 'OKTA',
	        factorType: 'call',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollRsa: function () {
	      this.render(EnrollOnPremController, {
	        provider: 'RSA',
	        factorType: 'token',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollOnPrem: function () {
	      this.render(EnrollOnPremController, {
	        provider: 'DEL_OATH',
	        factorType: 'token',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollSymantecVip: function () {
	      this.render(EnrollSymantecVipController, {
	        provider: 'SYMANTEC',
	        factorType: 'token',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollYubikey: function () {
	      this.render(EnrollYubikeyController, {
	        provider: 'YUBICO',
	        factorType: 'token:hardware',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollTotpFactor: function (provider, factorType) {
	      this.render(EnrollTotpController, {
	        provider: provider.toUpperCase(),
	        factorType: factorType,
	        Beacon: FactorBeacon
	      });
	    },

	    enrollWindowsHello: function () {
	      this.render(EnrollWindowsHelloController, {
	        provider: 'FIDO',
	        factorType: 'webauthn',
	        Beacon: FactorBeacon
	      });
	    },

	    enrollU2F: function () {
	      this.render(EnrollU2FController, {
	        provider: 'FIDO',
	        factorType: 'u2f',
	        Beacon: FactorBeacon
	      });
	    },

	    scanBarcodeTotpFactor: function (provider, factorType) {
	      this.render(BarcodeTotpController, {
	        provider: provider.toUpperCase(),
	        factorType: factorType,
	        Beacon: FactorBeacon
	      });
	    },

	    scanBarcodePushFactor: function () {
	      this.render(BarcodePushController, {
	        provider: 'OKTA',
	        factorType: 'push',
	        Beacon: FactorBeacon
	      });
	    },

	    activateTotpFactor: function (provider, factorType) {
	      this.render(ActivateTotpController, {
	        provider: provider.toUpperCase(),
	        factorType: factorType,
	        Beacon: FactorBeacon
	      });
	    },

	    manualSetupTotpFactor: function (provider, factorType) {
	      this.render(ManualSetupTotpController, {
	        provider: provider.toUpperCase(),
	        factorType: factorType,
	        Beacon: FactorBeacon
	      });
	    },

	    manualSetupPushFactor: function () {
	      this.render(ManualSetupPushController, {
	        provider: 'OKTA',
	        factorType: 'push',
	        Beacon: FactorBeacon
	      });
	    },

	    activationLinkSent: function () {
	      this.render(EnrollmentLinkSentController, {
	        provider: 'OKTA',
	        factorType: 'push',
	        Beacon: FactorBeacon
	      });
	    },

	    enterPasscodeInPushEnrollmentFlow: function () {
	      this.render(EnterPasscodePushFlowController, {
	        provider: 'OKTA',
	        factorType: 'token:software:totp',
	        Beacon: FactorBeacon
	      });
	    },

	    passwordExpired: function () {
	      this.render(PasswordExpiredController, { Beacon: SecurityBeacon });
	    },

	    customPasswordExpired: function () {
	      this.render(CustomPasswordExpiredController, { Beacon: SecurityBeacon });
	    },

	    forgotPassword: function () {
	      this.render(ForgotPasswordController);
	    },

	    recoveryChallenge: function () {
	      this.render(RecoveryChallengeController, { Beacon: SecurityBeacon });
	    },

	    recoveryEmailSent: function () {
	      this.render(PwdResetEmailSentController, { Beacon: SecurityBeacon });
	    },

	    unlockEmailSent: function () {
	      this.render(UnlockEmailSentController, { Beacon: SecurityBeacon });
	    },

	    recoveryQuestion: function () {
	      this.render(RecoveryQuestionController, { Beacon: SecurityBeacon });
	    },

	    passwordReset: function () {
	      this.render(PasswordResetController, { Beacon: SecurityBeacon });
	    },

	    recoveryLoading: function (token) {
	      this.render(RecoveryLoadingController, {
	        token: token,
	        Beacon: SecurityBeacon
	      });
	    },

	    unlockAccount: function () {
	      this.render(UnlockAccountController);
	    },

	    accountUnlocked: function () {
	      this.render(AccountUnlockedController, { Beacon: SecurityBeacon });
	    },

	    refreshAuthState: function (token) {
	      this.render(RefreshAuthStateController, {
	        token: token,
	        Beacon: SecurityBeacon
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88),
	  __webpack_require__(94),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, FormController, FormType, RouterUtil, ManualSetupFooter, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-manual-totp',
	    Model: function () {
	      return {
	        local: {
	          'sharedSecret': ['string', false, this.options.appState.get('sharedSecret')],
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        }
	      };
	    },

	    Form: {
	      title: function () {
	        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	        return Okta.loc('enroll.totp.title', 'login', [factorName]);
	      },
	      subtitle: _.partial(Okta.loc, 'enroll.totp.cannotScanBarcode', 'login'),
	      noButtonBar: true,
	      attributes: { 'data-se': 'step-manual-setup' },

	      formChildren: function () {
	        return [
	          FormType.View({View: '\
	            <p class="okta-form-subtitle o-form-explain text-align-c">\
	              {{i18n code="enroll.totp.manualSetupInstructions" bundle="login"}}\
	            </p>\
	          '}),

	          FormType.Input({
	            name: 'sharedSecret',
	            input: TextBox,
	            type: 'text',
	            disabled: true
	          }),

	          FormType.Toolbar({
	            noCancelButton: true,
	            save: Okta.loc('oform.next', 'login')
	          })
	        ];
	      }
	    },

	    Footer: ManualSetupFooter,

	    initialize: function () {
	      this.listenTo(this.form, 'save', function () {
	        var url = RouterUtil.createActivateFactorUrl(this.model.get('__provider__'),
	          this.model.get('__factorType__'), 'activate');
	        this.options.appState.trigger('navigate', url);
	      });
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  var _ = Okta._;

	  var fn = {};

	  var factorData = {
	    'OKTA_VERIFY': {
	      label: 'factor.totpSoft.oktaVerify',
	      description: 'factor.totpSoft.description',
	      iconClassName: 'mfa-okta-verify',
	      sortOrder: 1
	    },
	    'OKTA_VERIFY_PUSH': {
	      label: 'factor.oktaVerifyPush',
	      description: 'factor.push.description',
	      iconClassName: 'mfa-okta-verify',
	      sortOrder: 1
	    },
	    'SMS': {
	      label: 'factor.sms',
	      description: 'factor.sms.description',
	      iconClassName: 'mfa-okta-sms',
	      sortOrder: 2
	    },
	    'CALL': {
	      label: 'factor.call',
	      description: 'factor.call.description',
	      iconClassName: 'mfa-okta-call',
	      sortOrder: 3
	    },
	    'WINDOWS_HELLO': {
	      label: 'factor.windowsHello',
	      description: 'factor.windowsHello.signin.description',
	      iconClassName: 'mfa-windows-hello',
	      sortOrder: 4
	    },
	    'U2F': {
	      label: 'factor.u2f',
	      description: 'factor.u2f.description',
	      iconClassName: 'mfa-u2f',
	      sortOrder: 5
	    },
	    'YUBIKEY': {
	      label: 'factor.totpHard.yubikey',
	      description: 'factor.totpHard.yubikey.description',
	      iconClassName: 'mfa-yubikey',
	      sortOrder: 6
	    },
	    'DUO': {
	      label: 'factor.duo',
	      description: 'factor.duo.description',
	      iconClassName: 'mfa-duo',
	      sortOrder: 7
	    },
	    'GOOGLE_AUTH': {
	      label: 'factor.totpSoft.googleAuthenticator',
	      description: 'factor.totpSoft.description',
	      iconClassName: 'mfa-google-auth',
	      sortOrder: 8
	    },
	    'SYMANTEC_VIP': {
	      label: 'factor.totpHard.symantecVip',
	      description: 'factor.totpHard.description',
	      iconClassName: 'mfa-symantec',
	      sortOrder: 9
	    },
	    'RSA_SECURID': {
	      label: 'factor.totpHard.rsaSecurId',
	      description: 'factor.totpHard.description',
	      iconClassName: 'mfa-rsa',
	      sortOrder: 10
	    },
	    'ON_PREM': {
	      label: '',
	      description: 'factor.totpHard.description',
	      iconClassName: 'mfa-onprem',
	      sortOrder: 10
	    },
	    'QUESTION': {
	      label: 'factor.securityQuestion',
	      description: 'factor.securityQuestion.description',
	      iconClassName: 'mfa-okta-security-question',
	      sortOrder: 11
	    }
	  };

	  /* jshint maxstatements: 30, maxcomplexity: 15 */
	  fn.getFactorName = function (provider, factorType) {
	    if (provider === 'OKTA' && factorType === 'token:software:totp') {
	      return 'OKTA_VERIFY';
	    }
	    if (provider === 'OKTA' && factorType === 'push') {
	      return 'OKTA_VERIFY_PUSH';
	    }
	    if (provider === 'GOOGLE') {
	      return 'GOOGLE_AUTH';
	    }
	    if (provider === 'SYMANTEC' && factorType === 'token') {
	      return 'SYMANTEC_VIP';
	    }
	    if (provider === 'RSA' && factorType === 'token') {
	      return 'RSA_SECURID';
	    }
	    if (provider === 'DEL_OATH' && factorType === 'token') {
	      return 'ON_PREM';
	    }
	    if (provider === 'DUO' && factorType === 'web') {
	      return 'DUO';
	    }
	    if (provider === 'YUBICO' && factorType === 'token:hardware') {
	      return 'YUBIKEY';
	    }
	    if (provider === 'OKTA' && factorType === 'sms') {
	      return 'SMS';
	    }
	    if (provider === 'OKTA' && factorType === 'call') {
	      return 'CALL';
	    }
	    if (provider === 'OKTA' && factorType === 'question') {
	      return 'QUESTION';
	    }
	    if (provider === 'FIDO' && factorType === 'webauthn') {
	      return 'WINDOWS_HELLO';
	    }
	    if (provider === 'FIDO' && factorType === 'u2f') {
	      return 'U2F';
	    }
	  };

	  fn.isOktaVerify = function (provider, factorType) {
	    return provider === 'OKTA' && (factorType === 'token:software:totp' || factorType === 'push');
	  };

	  fn.getFactorLabel = function (provider, factorType) {
	    var key = factorData[fn.getFactorName(provider, factorType)].label;
	    return Okta.loc(key, 'login');
	  };

	  fn.getFactorDescription = function (provider, factorType) {
	    var key = factorData[fn.getFactorName(provider, factorType)].description;
	    return Okta.loc(key, 'login');
	  };

	  fn.getFactorIconClassName = function (provider, factorType) {
	    return factorData[fn.getFactorName(provider, factorType)].iconClassName;
	  };

	  fn.getFactorSortOrder = function (provider, factorType) {
	    return factorData[fn.getFactorName(provider, factorType)].sortOrder;
	  };

	  fn.getRememberDeviceValue = function (appState) {
	    return appState && appState.get('rememberDeviceByDefault');
	  };

	  fn.getSecurityQuestionLabel = function (questionObj) {
	    var localizedQuestion = Okta.loc('security.' + questionObj.question);
	    return localizedQuestion.indexOf('L10N_ERROR') < 0 ? localizedQuestion : questionObj.questionText;
	  };

	  fn.getPasswordComplexityDescription = function (policyComplexity) {
	    var fields = {
	      minLength: {i18n: 'password.complexity.length', args: true},
	      minLowerCase: {i18n: 'password.complexity.lowercase'},
	      minUpperCase: {i18n: 'password.complexity.uppercase'},
	      minNumber: {i18n: 'password.complexity.number'},
	      minSymbol: {i18n: 'password.complexity.symbol'},
	      excludeUsername: {i18n: 'password.complexity.no_username'}
	    };

	    var requirements = _.map(policyComplexity, function (complexityValue, complexityType) {
	      if(!complexityValue){
	        return;
	      }

	      var params = fields[complexityType];
	      return params.args ?
	        Okta.loc(params.i18n, 'login', [complexityValue]) : Okta.loc(params.i18n, 'login');
	    });

	    if (requirements.length) {
	      requirements = _.reduce(requirements, function (result, requirement) {
	        return result ?
	          (requirement ? (result + Okta.loc('password.complexity.list.element', 'login', [requirement])) : result) :
	          requirement;
	      });

	      return Okta.loc('password.complexity.description', 'login', [requirements]);
	    }
	  };


	  return fn;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(85),
	  __webpack_require__(78),
	  __webpack_require__(75),
	  __webpack_require__(86),
	  __webpack_require__(87)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormType, Toolbar, FormUtil, BaseLoginController, BaseLoginModel) {

	  var _ = Okta._;

	  var SimpleForm = Okta.Form.extend({
	    layout: 'o-form-theme',
	    noCancelButton: true,
	    constructor: function (options) {
	      Okta.Form.call(this, options);
	      _.each(_.result(this, 'formChildren') || [], function (child) {
	        switch (child.type) {
	        case FormType.INPUT:
	          this.addInput(_.extend({
	            label: false,
	            'label-top': true
	          }, child.viewOptions));
	          break;
	        case FormType.BUTTON:
	          this.add(Okta.createButton(_.extend({ model: this.model }, child.viewOptions)), child.addOptions);
	          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
	          break;
	        case FormType.DIVIDER:
	          this.addDivider(child.viewOptions);
	          break;
	        case FormType.TOOLBAR:
	          this.add(Toolbar, { options: child.viewOptions });
	          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
	          break;
	        case FormType.VIEW:
	          this.add(child.viewOptions.View, child.addOptions);
	          FormUtil.applyShowWhen(this.last(), child.viewOptions.showWhen);
	          break;
	        default:
	          throw new Error('Unrecognized child type: ' + child.type);
	        }
	      }, this);
	    }
	  });

	  return BaseLoginController.extend({

	    constructor: function () {
	      var initialize = this.initialize;
	      this.initialize = function () {};

	      BaseLoginController.apply(this, arguments);

	      if (this.Model && this.Form) {
	        var Model = BaseLoginModel.extend(_.extend({
	          parse: function (attributes) {
	            this.settings = attributes.settings;
	            this.appState = attributes.appState;
	            return _.omit(attributes, ['settings', 'appState']);
	          }
	        }, _.result(this, 'Model')));
	        this.model = new Model({
	          settings: this.settings,
	          appState: this.options.appState
	        }, { parse: true });
	        var Form = SimpleForm.extend(_.result(this, 'Form', this));
	        this.form = new Form(this.toJSON());
	        this.add(this.form);
	      }

	      if (this.Footer) {
	        this.footer = new this.Footer(this.toJSON());
	        this.add(this.footer);
	      }

	      this.addListeners();
	      initialize.apply(this, arguments);
	    },

	    toJSON: function () {
	      var data = BaseLoginController.prototype.toJSON.apply(this, arguments);
	      return _.extend(_.pick(this.options, 'appState'), data);
	    },

	    back: function () {
	      if (this.footer && this.footer.back) {
	        this.footer.back();
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {

	  // Syntactic sugar to provide some structure to SimpleForm inputs - Just
	  // wraps options with { type: type, viewOptions: viewOptions, addOptions: addOptions }

	  var INPUT = 'INPUT';
	  var BUTTON = 'BUTTON';
	  var DIVIDER = 'DIVIDER';
	  var TOOLBAR = 'TOOLBAR';
	  var VIEW = 'VIEW';

	  function wrap(type) {
	    return function (viewOptions, addOptions) {
	      return { type: type, viewOptions: viewOptions, addOptions: addOptions };
	    };
	  }

	  return {
	    Input: wrap(INPUT),
	    Button: wrap(BUTTON),
	    Divider: wrap(DIVIDER),
	    Toolbar: wrap(TOOLBAR),
	    View: wrap(VIEW),

	    INPUT: INPUT,
	    BUTTON: BUTTON,
	    DIVIDER: DIVIDER,
	    TOOLBAR: TOOLBAR,
	    VIEW: VIEW
	  };

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint newcap:false */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q) {
	  var _ = Okta._;

	  function getForm(controller) {
	    return _.find(controller.getChildren(), function (item) {
	      return (item instanceof Okta.Form);
	    });
	  }

	  return Okta.Controller.extend({

	    // Ideally we should be attaching the listeners in the constructor, but because of the way
	    // we construct the FormController (this.model is generated after the BaseLoginController's
	    // constructor is called), this.model is undefined in when try to attach the events and
	    // therefore we don't listen to events for such forms. And changing the order in which we call
	    // the constructor doesn't help either (JS errors etc.). This at least guarantees that we
	    // are listening to the model events.
	    // Note - Figure out a way to call the constructor in the right order.
	    addListeners: function () {
	      // TOTP model is special, its model will not be attached to a controller, but will
	      // tag along with the push factor model. We need to listen to the transaction
	      // changes on this as well (in case of the push+totp form).
	      var totpModel = this.model.get('backupFactor');

	      // Events to enable/disable the primary button on the forms
	      this.listenTo(this.model, 'save', function () {
	        //disable the submit button on forms while making the request
	        //to prevent users from hitting rate limiting exceptions of
	        //1 per second on the auth api
	        var form = getForm(this);
	        var disableSubmitButton = form.disableSubmitButton;
	        if (disableSubmitButton && !form.disableSubmitButton()) {
	          return;
	        }
	        this.toggleButtonState(true);
	      });

	      this.listenTo(this.model, 'error', function () {
	        this.toggleButtonState(false);
	      });

	      var setTransactionHandler = _.bind(function (transaction) {
	        this.options.appState.set('transaction', transaction);
	      }, this);
	      var transactionErrorHandler = _.bind(function (err) {
	        this.options.appState.set('transactionError', err);
	      }, this);

	      // Events to set the transaction attributes on the app state.
	      this.listenTo(this.model, 'setTransaction', setTransactionHandler);
	      this.listenTo(this.model, 'setTransactionError', transactionErrorHandler);

	      // For TOTP factor model
	      if (totpModel) {
	        this.listenTo(totpModel, 'setTransaction', setTransactionHandler);
	        this.listenTo(totpModel, 'setTransactionError', transactionErrorHandler);
	      }
	    },

	    // Override this method to delay switching to this screen until return
	    // promise is resolved. This is useful for cases like enrolling a security
	    // question, which requires an additional request to fetch the question
	    // list.
	    fetchInitialData: function () {
	      return Q();
	    },

	    // Override this method to prevent route navigation. This is useful for
	    // intermediate status changes that do not trigger a full refresh of the
	    // page, like MFA_ENROLL_ACTIVATE and MFA_CHALLENGE.
	    trapAuthResponse: function () {
	      return false;
	    },

	    toJSON: function () {
	      var data = Okta.Controller.prototype.toJSON.apply(this, arguments);
	      return _.extend(_.pick(this.options, 'appState'), data);
	    },

	    toggleButtonState: function (state) {
	      var button = this.$el.find('.button');
	      button.toggleClass('link-button-disabled', state).prop('disabled', state);
	    },


	    postRenderAnimation: function() {
	      // Event triggered after a page is rendered along with the classname to identify the page
	      this.trigger('pageRendered', {page: this.className});
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q) {

	  var _ = Okta._;
	  var KNOWN_ERRORS = [
	    'OAuthError', 
	    'AuthSdkError', 
	    'AuthPollStopError', 
	    'AuthApiError'
	  ];

	  return Okta.Model.extend({
	    doTransaction: function (fn, rethrow) {
	      var self = this;
	      return fn.call(this, this.appState.get('transaction'))
	      .then(function(trans) {
	        self.trigger('setTransaction', trans);
	        return trans;
	      })
	      .fail(function(err) {
	        // Q may still consider AuthPollStopError to be unhandled
	        if (err.name === 'AuthPollStopError') {
	          return;
	        }
	        self.trigger('setTransactionError', err);
	        self.trigger('error', self, err.xhr);
	        if (rethrow || _.indexOf(KNOWN_ERRORS, err.name) === -1) {
	          throw err;
	        }
	      });
	    },

	    manageTransaction: function (fn) {
	      var self = this,
	          res = fn.call(this, this.appState.get('transaction'), _.bind(this.setTransaction, this));
	      
	      // If it's a promise, listen for failures
	      if (Q.isPromise(res)) {
	        res.fail(function(err) {
	          if (err.name === 'AuthPollStopError') {
	            return;
	          }
	          self.trigger('setTransactionError', err);
	          self.trigger('error', self, err.xhr);
	        });
	      }

	      return Q.resolve(res);
	    },

	    startTransaction: function (fn) {
	      var self = this,
	          res = fn.call(this, this.settings.getAuthClient());

	      // If it's a promise, then chain to it
	      if (Q.isPromise(res)) {
	        return res.then(function(trans) {
	          self.trigger('setTransaction', trans);
	          return trans;
	        })
	        .fail(function(err) {
	          self.trigger('setTransactionError', err);
	          self.trigger('error', self, err.xhr);
	          throw err;
	        });
	      }

	      return Q.resolve(res);
	    },

	    setTransaction: function (trans) {
	      this.appState.set('transaction', trans);
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint maxcomplexity:24,maxstatements:25 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(89),
	  __webpack_require__(90),
	  __webpack_require__(91),
	  __webpack_require__(14),
	  __webpack_require__(92),
	  __webpack_require__(93)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Util, OAuth2Util, Enums, BrowserFeatures, Errors, ErrorCodes) {

	  var fn = {};

	  var verifyUrlTpl = Okta.tpl('signin/verify/{{provider}}/{{factorType}}');
	  var enrollFactorUrlTpl = Okta.tpl('signin/enroll/{{provider}}/{{factorType}}');
	  var activateFactorUrlTpl = Okta.tpl(
	    'signin/enroll-activate/{{provider}}/{{factorType}}{{#if step}}/{{step}}{{/if}}'
	  );
	  var recoveryUrlTpl = Okta.tpl('signin/recovery/{{recoveryToken}}');
	  var refreshUrlTpl = Okta.tpl('signin/refresh-auth-state{{#if token}}/{{token}}{{/if}}');
	  var sessionCookieRedirectTpl = Okta.tpl(
	    '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
	    '&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
	  );

	  fn.createVerifyUrl = function (provider, factorType) {
	    return verifyUrlTpl({
	      provider: encodeURIComponent(provider.toLowerCase()),
	      factorType: encodeURIComponent(factorType)
	    });
	  };

	  fn.createEnrollFactorUrl = function (provider, factorType) {
	    return enrollFactorUrlTpl({
	      provider: encodeURIComponent(provider.toLowerCase()),
	      factorType: encodeURIComponent(factorType)
	    });
	  };

	  fn.createActivateFactorUrl = function (provider, factorType, step) {
	    return activateFactorUrlTpl({
	      provider: encodeURIComponent(provider.toLowerCase()),
	      factorType: encodeURIComponent(factorType),
	      step: step ? encodeURIComponent(step) : false
	    });
	  };

	  fn.createRecoveryUrl = function (recoveryToken) {
	    return recoveryUrlTpl({
	      recoveryToken: encodeURIComponent(recoveryToken)
	    });
	  };

	  fn.createRefreshUrl = function (stateToken) {
	    var token = stateToken ? encodeURIComponent(stateToken) : null;
	    return refreshUrlTpl({ token: token });
	  };

	  fn.routeAfterAuthStatusChange = function (router, err, res) {

	    // Global error handling for CORS enabled errors
	    if (err && err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
	      router.settings.callGlobalError(new Errors.UnsupportedBrowserError(
	        Okta.loc('error.enabled.cors')
	      ));
	      return;
	    }

	    // Token has expired - no longer valid. Navigate back to primary auth.
	    if (err && err.errorCode === ErrorCodes.INVALID_TOKEN_EXCEPTION) {
	      router.appState.set('flashError', Okta.loc('error.expired.session'));
	      router.controller.state.set('navigateDir', Enums.DIRECTION_BACK);
	      router.navigate('', { trigger: true });
	      return;
	    }

	    // Other errors are handled by the function making the authClient request
	    if (err || !res || !res.status) {
	      return;
	    }

	    router.appState.setAuthResponse(res);

	    if (router.controller && router.controller.trapAuthResponse(res)) {
	      return;
	    }

	    switch (res.status) {
	    case 'SUCCESS':
	      // If the desired end result object needs to have idToken (and not sessionToken),
	      // get the id token from session token before calling the global success function.
	      if (router.settings.get('oauth2Enabled')) {
	        OAuth2Util.getTokens(router.settings, {sessionToken: res.sessionToken}, router.controller);
	        return;
	      }

	      if(res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK) {
	        router.navigate('signin/account-unlocked', {trigger: true});
	        return;
	      }

	      router.settings.callGlobalSuccess(Enums.SUCCESS, {
	        user: res._embedded.user,
	        session: {
	          token: res.sessionToken,
	          setCookieAndRedirect: function (redirectUrl) {
	            Util.redirect(sessionCookieRedirectTpl({
	              baseUrl: router.settings.get('baseUrl'),
	              token: encodeURIComponent(res.sessionToken),
	              redirectUrl: encodeURIComponent(redirectUrl)
	            }));
	          }
	        }
	      });
	      return;
	    case 'MFA_REQUIRED':
	      var factor = router.appState.get('factors').getDefaultFactor();
	      var url = fn.createVerifyUrl(factor.get('provider'), factor.get('factorType'));
	      router.navigate(url, { trigger: true });
	      return;
	    case 'MFA_CHALLENGE':
	      // Since we normally trap MFA_CHALLENGE, this will only get called on a
	      // page refresh. We need to return to MFA_REQUIRED to initialize the
	      // page correctly (i.e. factors dropdown, etc)
	      router.appState.get('transaction').prev()
	      .then(function(trans) {
	        router.appState.set('transaction', trans);
	      }).done();
	      return;
	    case 'MFA_ENROLL':
	      router.navigate('signin/enroll', { trigger: true });
	      return;
	    case 'MFA_ENROLL_ACTIVATE':
	      var activateUrl = fn.createActivateFactorUrl(router.appState.get('activatedFactorProvider'),
	        router.appState.get('activatedFactorType'));
	      router.navigate(activateUrl, { trigger: true });
	      return;
	    case 'PASSWORD_WARN':
	    case 'PASSWORD_EXPIRED':
	      if (router.settings.get('features.customExpiredPassword') && !router.appState.get('isPwdManagedByOkta')) {
	        router.navigate('signin/custom-password-expired', { trigger: true });
	      } else {
	        router.navigate('signin/password-expired', { trigger: true });
	      }
	      return;
	    case 'RECOVERY_CHALLENGE':
	      // Will use this workaround (lowercasing response) until OKTA-69083 is resolved
	      var fromEmail = res.factorType.toLowerCase() === Enums.RECOVERY_FACTOR_TYPE_EMAIL.toLowerCase(),
	          isForgotPassword = res.recoveryType === Enums.RECOVERY_TYPE_PASSWORD,
	          isUnlock = res.recoveryType === Enums.RECOVERY_TYPE_UNLOCK;
	      if (isForgotPassword && fromEmail) {
	        router.navigate('signin/recovery-emailed', { trigger: true });
	      }
	      else if (isUnlock && fromEmail) {
	        router.navigate('signin/unlock-emailed', { trigger: true });
	      }
	      else {
	        router.navigate('signin/recovery-challenge', { trigger: true });
	      }
	      return;
	    case 'RECOVERY':
	      router.navigate('signin/recovery-question', { trigger: true });
	      return;
	    case 'PASSWORD_RESET':
	      router.navigate('signin/password-reset', { trigger: true });
	      return;
	    case 'LOCKED_OUT':
	      if (router.settings.get('features.selfServiceUnlock')) {
	        router.navigate('signin/unlock', { trigger: true });
	      } else {
	        router.controller.model.trigger('error', router.controller.model, {
	          responseJSON: {
	            errorCauses: [],
	            errorSummary: Okta.loc('error.auth.lockedOut', 'login')
	          }
	        });
	      }
	      return;
	    default:
	      throw new Error('Unknown status: ' + res.status);
	    }
	  };

	  return fn;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_) {

	  return {
	    redirect: function (url) {
	      window.location = url;
	    },

	    constantError: function (errorMessage) {
	      return function () {
	        throw new Error(errorMessage);
	      };
	    },

	    /**
	     * Simply convert an URL query key value pair object into an URL query string.
	     * Remember NOT to escape the query string when using this util.
	     * example:
	     * input: {userId: 123, instanceId: undefined, expand: 'schema,app'}
	     * output: '?userId=123&expand=schema,app'
	     */
	    getUrlQueryString: function (queries) {
	      _.isObject(queries) || (queries = {});
	      var queriesString = _.without(_.map(queries, function (value, key) {
	        if (value !== undefined && value !== null) {
	          return key + '=' + encodeURIComponent(value);
	        }
	      }), undefined).join('&');
	      return _.isEmpty(queriesString) ? '' : '?' + queriesString;
	    }
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(91), __webpack_require__(92)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums, Errors) {

	  var util = {};
	  var _ = Okta._;

	  function hasResponseType(params, type) {
	    if (_.isArray(params.responseType)) {
	      return _.contains(params.responseType, type);
	    }
	    else {
	      return type === params.responseType;
	    }
	  }

	  /**
	   * Get the tokens in the OIDC/OAUTH flows
	   *
	   * @param settings - settings model object
	   * @param params - {idp: 'xxx'} for social auth
	   *                 {sessionToken: 'xxx'} for okta idp
	   */
	  util.getTokens = function (settings, params, controller) {

	    function success(result) {
	      settings.callGlobalSuccess(Enums.SUCCESS, result);
	    }

	    function error(error) {
	      // OKTA-104330- Handle error case where user is not assigned to OIDC client
	      if (error.errorCode === 'access_denied') {
	        controller.model.trigger('error', controller.model, {'responseJSON': error});
	        controller.model.appState.trigger('removeLoading');
	      } else {
	        settings.callGlobalError(new Errors.OAuthError(error.message));
	      }
	    }

	    var authClient = settings.getAuthClient(),
	        options = settings.toJSON({ verbose: true }),
	        oauthParams = {},
	        extraOptions = {};

	    _.extend(
	      oauthParams,
	      _.pick(options, 'clientId', 'redirectUri'),
	      _.pick(options.authParams, 'responseType', 'responseMode', 'display', 'scopes', 'state', 'nonce'),
	      params
	    );

	    // Extra Options for Social Idp popup window title and id_token response timeout
	    extraOptions.popupTitle = Okta.loc('socialauth.popup.title', 'login');
	    extraOptions.timeout = options.oAuthTimeout;

	    _.extend(
	      extraOptions,
	      _.pick(options.authParams, 'issuer', 'authorizeUrl')
	    );

	    // Redirect flow - this can be used when logging into an external IDP, or
	    // converting the Okta sessionToken to an access_token, id_token, and/or
	    // authorization code. Note: The authorization code flow will always redirect.
	    if (oauthParams.display === 'page' || hasResponseType(oauthParams, 'code')) {
	      authClient.token.getWithRedirect(oauthParams, extraOptions);
	    }

	    // Default flow if logging in with Okta as the IDP - convert sessionToken to
	    // tokens in a hidden iframe. Used in Single Page Apps where the app does
	    // not want to redirect away from the page to convert the token.
	    else if (oauthParams.sessionToken) {
	      authClient.token.getWithoutPrompt(oauthParams, extraOptions)
	      .then(success)
	      .fail(error)
	      .done();
	    }

	    // Default flow if logging in with an external IDP - opens a popup and
	    // gets the token from a postMessage response.
	    else {
	      authClient.token.getWithPopup(oauthParams, extraOptions)
	      .then(success)
	      .fail(error)
	      .done();
	    }
	  };

	  return util;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(module.exports = {

	  DIRECTION_BACK: 'DIRECTION_BACK',

	  RECOVERY_TYPE_PASSWORD: 'PASSWORD',
	  RECOVERY_TYPE_UNLOCK: 'UNLOCK',
	  RECOVERY_FACTOR_TYPE_SMS: 'SMS',
	  RECOVERY_FACTOR_TYPE_EMAIL: 'EMAIL',
	  RECOVERY_FACTOR_TYPE_CALL: 'CALL',

	  // Global success messages
	  SUCCESS: 'SUCCESS',
	  FORGOT_PASSWORD_EMAIL_SENT: 'FORGOT_PASSWORD_EMAIL_SENT',
	  UNLOCK_ACCOUNT_EMAIL_SENT: 'UNLOCK_ACCOUNT_EMAIL_SENT',

	  // Global error messages
	  CONFIG_ERROR: 'CONFIG_ERROR',
	  UNSUPPORTED_BROWSER_ERROR: 'UNSUPPORTED_BROWSER_ERROR',
	  OAUTH_ERROR: 'OAUTH_ERROR',

	  // Enroll choice page types
	  ALL_OPTIONAL_NONE_ENROLLED: 'ALL_OPTIONAL_NONE_ENROLLED',
	  ALL_OPTIONAL_SOME_ENROLLED: 'ALL_OPTIONAL_SOME_ENROLLED',
	  HAS_REQUIRED_NONE_ENROLLED: 'HAS_REQUIRED_NONE_ENROLLED',
	  HAS_REQUIRED_SOME_REQUIRED_ENROLLED: 'HAS_REQUIRED_SOME_REQUIRED_ENROLLED',
	  HAS_REQUIRED_ALL_REQUIRED_ENROLLED: 'HAS_REQUIRED_ALL_REQUIRED_ENROLLED',

	  // Operations
	  PRIMARY_AUTH: 'PRIMARY_AUTH',
	  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
	  UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT'

	});


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(91)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums) {

	  function ConfigError(message) {
	    this.name = Enums.CONFIG_ERROR;
	    this.message = message || Okta.loc('error.config');
	  }
	  ConfigError.prototype = new Error();

	  function UnsupportedBrowserError(message) {
	    this.name = Enums.UNSUPPORTED_BROWSER_ERROR;
	    this.message = message || Okta.loc('error.unsupported.browser');
	  }
	  UnsupportedBrowserError.prototype = new Error();

	  function OAuthError(message) {
	    this.name = Enums.OAUTH_ERROR;
	    this.message = message;
	  }
	  OAuthError.prototype = new Error();

	  return {
	    ConfigError: ConfigError,
	    UnsupportedBrowserError: UnsupportedBrowserError,
	    OAuthError: OAuthError
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(module.exports = {
	  INVALID_TOKEN_EXCEPTION: 'E0000011'
	});


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(88),
	  __webpack_require__(91)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, RouterUtil, Enums) {

	  return Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="mfa.backToFactors" bundle="login"}}\
	      </a>\
	      <a href="#" class="link help goto js-goto" data-se="goto-link">\
	        {{i18n code="mfa.scanBarcode" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      },
	      'click .js-goto' : function (e) {
	        e.preventDefault();
	        // go to a different screen with current auth status:
	        // refresh the latest response
	        this.model.startTransaction(function (authClient) {
	          return authClient.tx.resume();
	        });
	      }
	    },
	    back: function () {
	      this.state.set('navigateDir', Enums.DIRECTION_BACK);
	      if (this.options.appState.get('prevLink')) {
	        // Once we are in the MFA_ENROLL_ACTIVATE, we need to reset to the
	        // correct state. Fortunately, this means that the router will
	        // handle navigation once the request is finished.
	        this.model.doTransaction(function (transaction) {
	          return transaction.prev();
	        });
	      }
	      else {
	        this.options.appState.trigger('navigate', 'signin/enroll');
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	//note: not including Okta here and explicitly including jquery and Handlebars
	//because we want to be explicit about which TextBox we are extending here
	//and want to avoid the cirucular dependency that occurs if we
	//include Okta
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(6),
	  __webpack_require__(5),
	  __webpack_require__(14),
	  __webpack_require__(41),
	  __webpack_require__(73)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function ($, Handlebars, BrowserFeatures, TextBox) {

	  function hasTitleAndText(options) {
	    var title = options.title,
	        text = options.text;

	    if (title && text && title !== text) {
	      return true;
	    }
	    return false;
	  }

	  // options may be a string or an object.
	  function createQtipContent(options) {
	    if (hasTitleAndText(options)) {
	      return options;
	    }
	    return {text: options.text || options};
	  }

	  return TextBox.extend({

	    template: Handlebars.compile('\
	      {{#if params}}\
	        {{#if params.innerTooltip}}\
	          <span class="input-tooltip icon form-help-16"></span>\
	        {{/if}}\
	        {{#if params.icon}}\
	          <span class="icon input-icon {{params.icon}}"></span>\
	        {{/if}}\
	      {{/if}}\
	      <input type="{{type}}" placeholder="{{placeholder}}" aria-label="{{placeholder}}"\
	        name="{{name}}" id="{{inputId}}" value="{{value}}" autocomplete="off"/>\
	    '),

	    postRender: function () {
	      var params = this.options.params,
	          content;

	      if (this.options.type === 'number') {
	        var input = this.$('input');
	        input.attr({
	          pattern: '[0-9]*',
	          inputmode: 'numeric'
	        });
	      }

	      if (params && params.innerTooltip) {
	        content = createQtipContent(params.innerTooltip);
	        this.$('.input-tooltip').qtip({
	          content: content,
	          style: {classes: 'okta-sign-in-tooltip qtip-custom qtip-shadow'},
	          position: {
	            my: 'bottom left',
	            // Note: qTip2 has a known issue calculating the tooltip offset when:
	            // 1. A container element has both:
	            //    a) position: relative/absolute
	            //    b) overlay: value other than 'visible'
	            // 2. The page is scrolled
	            //
	            // We set position:relative and overlay:auto on the body element,
	            // where both are required for:
	            // - Positioning the footer correctly
	            // - Displaying long pages in embedded browsers
	            //
	            // The original design called for a fixed position relative to the
	            // tooltip icon - this has been switched to "relative to mouse, and
	            // update position when mouse moves" because of this constraint.
	            target: 'mouse',
	            adjust: {
	              method: 'flip',
	              mouse: true,
	              y: -5,
	              x: 5
	            },
	            viewport: $('body')
	          }
	        });
	      }
	    },

	    // Override the focus() to ignore focus in IE. IE (8-11) has a known bug where
	    // the placeholder text disappears when the input field is focused.
	    focus: function () {
	      if (BrowserFeatures.isIE()) {
	        return;
	      }
	      return TextBox.prototype.focus.apply(this, arguments);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* jshint maxparams: 100 */
	// BaseLoginRouter contains the more complicated router logic - rendering/
	// transition, etc. Most router changes should happen in LoginRouter (which is
	// responsible for adding new routes)
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(23),
	  __webpack_require__(14),
	  __webpack_require__(98),
	  __webpack_require__(99),
	  __webpack_require__(100),
	  __webpack_require__(103),
	  __webpack_require__(97),
	  __webpack_require__(104),
	  __webpack_require__(88),
	  __webpack_require__(101),
	  __webpack_require__(92),
	  __webpack_require__(8)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Backbone, BrowserFeatures, RefreshAuthStateController, Settings, Header,
	          SecurityBeacon, AuthContainer, AppState, RouterUtil, Animations, Errors, Bundles) {

	  var _ = Okta._,
	      $ = Okta.$;

	  function isStateLessRouteHandler(router, fn) {
	    return _.find(router.stateLessRouteHandlers, function (routeName) {
	      return fn === router[routeName];
	    });
	  }

	  function beaconIsAvailable(Beacon, settings) {
	    if (!Beacon) {
	      return false;
	    }
	    if (Beacon === SecurityBeacon) {
	      return settings.get('features.securityImage');
	    }
	    return true;
	  }

	  function loadLanguage(appState, i18n, assetBaseUrl, assetRewrite) {
	    var timeout = setTimeout(function () {
	      // Trigger a spinner if we're waiting on a request for a new language.
	      appState.trigger('loading', true);
	    }, 200);
	    return Bundles.loadLanguage(
	      appState.get('languageCode'),
	      i18n,
	      {
	        baseUrl: assetBaseUrl,
	        rewrite: assetRewrite
	      }
	    )
	    .then(function () {
	      clearTimeout(timeout);
	      appState.trigger('loading', false);
	    });
	  }

	  return Okta.Router.extend({
	    Events:  Backbone.Events,

	    initialize: function (options) {
	      this.settings = new Settings(_.omit(options, 'el', 'authClient'), { parse: true });
	      this.settings.setAuthClient(options.authClient);

	      if (!options.el) {
	        this.settings.callGlobalError(new Errors.ConfigError(
	          Okta.loc('error.required.el')
	        ));
	      }

	      $('body > div').on('click', function () {
	        // OKTA-69769 Tooltip wont close on iPhone/iPad
	        // Registering a click handler on the first div
	        // allows a tap that falls outside the tooltip
	        // to be registered as a tap by iOS
	        // and then the open tooltip will lose focus and close.
	      });

	      this.appState = new AppState({
	        baseUrl: this.settings.get('baseUrl'),
	        settings: this.settings
	      }, { parse: true });

	      var wrapper = new AuthContainer({appState: this.appState});
	      Okta.$(options.el).append(wrapper.render().$el);
	      this.el = '#okta-sign-in';

	      this.header = new Header({
	        el: this.el,
	        appState: this.appState,
	        settings: this.settings
	      });

	      this.listenTo(this.appState, 'change:transactionError', function (appState, err) {
	        RouterUtil.routeAfterAuthStatusChange(this, err);
	      });

	      this.listenTo(this.appState, 'change:transaction', function (appState, trans) {
	        RouterUtil.routeAfterAuthStatusChange(this, null, trans.data);
	      });

	      this.listenTo(this.appState, 'navigate', function (url) {
	        this.navigate(url, { trigger: true });
	      });
	    },

	    execute: function (cb, args) {
	      // Recovery flow with a token passed through widget settings
	      var recoveryToken = this.settings.get('recoveryToken');
	      if (recoveryToken) {
	        this.settings.unset('recoveryToken');
	        this.navigate(RouterUtil.createRecoveryUrl(recoveryToken), { trigger: true });
	        return;
	      }

	      // Refresh flow with a stateToken passed through widget settings
	      var stateToken = this.settings.get('stateToken');
	      if (stateToken) {
	        this.settings.unset('stateToken');
	        this.navigate(RouterUtil.createRefreshUrl(stateToken), { trigger: true });
	        return;
	      }

	      // Normal flow - we've either navigated to a stateless page, or are
	      // in the middle of an auth flow
	      var trans = this.appState.get('transaction');
	      if ((trans && trans.data) || isStateLessRouteHandler(this, cb)) {
	        cb.apply(this, args);
	        return;
	      }

	      // StateToken cookie exists on page load, and we are on a stateful url
	      if (this.settings.getAuthClient().tx.exists()) {
	        this.navigate(RouterUtil.createRefreshUrl(), { trigger: true });
	        return;
	      }

	      // We've hit a page that requires state, but have no stateToken - redirect
	      // back to primary auth
	      this.navigate('', { trigger: true });
	    },

	    // Overriding the default navigate method to allow the widget consumer
	    // to "turn off" routing - if features.router is false, the browser
	    // location bar will not update when the router navigates
	    navigate: function (fragment, options) {
	      if (this.settings.get('features.router')) {
	        return Okta.Router.prototype.navigate.apply(this, arguments);
	      }
	      if (options && options.trigger) {
	        return Backbone.history.loadUrl(fragment);
	      }
	    },

	    render: function (Controller, options) {
	      options || (options = {});

	      var Beacon = options.Beacon;
	      var controllerOptions = _.extend(
	        { settings: this.settings, appState: this.appState },
	        _.omit(options, 'Beacon')
	      );

	      // Since we have a wrapper view, render our wrapper and use its content
	      // element as our new el.
	      // Note: Render it here because we know dom is ready at this point
	      if (!this.header.rendered()) {
	        this.el = this.header.render().getContentEl();
	      }

	      // If we need to load a language (or apply custom i18n overrides), do
	      // this now and re-run render after it's finished.
	      if (!Bundles.isLoaded(this.appState.get('languageCode'))) {
	        return loadLanguage(
	          this.appState,
	          this.settings.get('i18n'),
	          this.settings.get('assets.baseUrl'),
	          this.settings.get('assets.rewrite')
	        )
	        .then(_.bind(this.render, this, Controller, options))
	        .done();
	      }

	      var oldController = this.controller;
	      this.controller = new Controller(controllerOptions);

	      // Bubble up all controller events
	      this.listenTo(this.controller, 'all', this.trigger);

	      // First run fetchInitialData, in case the next controller needs data
	      // before it's initial render. This will leave the current page in a
	      // loading state.
	      this.controller.fetchInitialData()
	      .then(_.bind(function () {

	        // Beacon transition occurs in parallel to page swap
	        if (!beaconIsAvailable(Beacon, this.settings)) {
	          Beacon = null;
	        }
	        this.header.setBeacon(Beacon, controllerOptions);

	        this.controller.render();

	        if (!oldController) {
	          this.el.append(this.controller.el);
	          this.controller.postRenderAnimation();
	          return;
	        }

	        return Animations.swapPages({
	          $parent: this.el,
	          $oldRoot: oldController.$el,
	          $newRoot: this.controller.$el,
	          dir: oldController.state.get('navigateDir'),
	          ctx: this,
	          success: function () {
	            var flashError = this.appState.get('flashError'),
	                model = this.controller.model;
	            oldController.remove();
	            oldController.$el.remove();
	            this.controller.postRenderAnimation();
	            if (flashError) {
	              model.trigger('error', model, {
	                responseJSON: {
	                  errorSummary: flashError
	                }
	              });
	              this.appState.unset('flashError');
	            }
	          }
	        });

	      }, this))
	      .fail(function () {
	        // OKTA-69665 - if an error occurs in fetchInitialData, we're left in
	        // a state with two active controllers. Therefore, we clean up the
	        // old one. Note: This explicitly handles the invalid token case -
	        // if we get some other type of error which doesn't force a redirect,
	        // we will probably be left in a bad state. I.e. old controller is
	        // dropped and new controller is not rendered.
	        if (oldController) {
	          oldController.remove();
	          oldController.$el.remove();
	        }
	      })
	      .done();

	    },

	    start: function () {
	      var pushState = false;
	      // Support for browser's back button.
	      if (window.addEventListener) {
	        window.addEventListener('popstate', _.bind(function(e) {
	          if (this.controller.back) {
	            e.preventDefault();
	            e.stopImmediatePropagation();
	            this.controller.back();
	          }
	        }, this));
	        pushState = BrowserFeatures.supportsPushState();
	      }
	      Okta.Router.prototype.start.call(this, { pushState: pushState });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {
	  var CAN_REMOVE_BEACON_CLS = 'can-remove-beacon';
	  return Okta.View.extend({
	    className: 'auth-container main-container',
	    id: 'okta-sign-in',
	    attributes: { 'data-se': 'auth-container' },
	    initialize: function (options) {
	      this.listenTo(options.appState, 'change:beaconType', function (model, type) {
	        this.$el.toggleClass(CAN_REMOVE_BEACON_CLS, type === 'security');
	      });
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(84)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController) {

	  return FormController.extend({
	    className: 'refresh-auth-state',

	    Model: {},

	    Form: {
	      noButtonBar: true
	    },

	    preRender: function () {
	      var token = this.options.token;
	      var appState = this.options.appState;
	      this.model.startTransaction(function(authClient) {
	        if (token) {
	          appState.trigger('loading', true);
	          return authClient.tx.resume({
	            stateToken: token
	          });
	        }

	        if (authClient.tx.exists()) {
	          appState.trigger('loading', true);
	          return authClient.tx.resume();
	        }

	        appState.trigger('navigate', '');
	      });
	    },

	    remove: function () {
	      this.options.appState.trigger('loading', false);
	      return FormController.prototype.remove.apply(this, arguments);
	    }

	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint maxcomplexity:8 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9),
	  __webpack_require__(92),
	  __webpack_require__(14),
	  __webpack_require__(19),
	  __webpack_require__(12),
	  __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, Errors, BrowserFeatures, Util, Logger, config) {

	  var DEFAULT_LANGUAGE = 'en';

	  var supportedIdps = ['facebook', 'google', 'linkedin', 'microsoft'],
	      supportedResponseTypes = ['token', 'id_token', 'code'],
	      oauthRedirectTpl = Okta.tpl('{{origin}}');

	  var _ = Okta._,
	      ConfigError = Errors.ConfigError,
	      UnsupportedBrowserError = Errors.UnsupportedBrowserError;

	  var assetBaseUrlTpl = Okta.tpl(
	    'https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/{{version}}'
	  );

	  return Okta.Model.extend({

	    flat: true,
	    authClient: undefined,

	    local: {
	      'baseUrl': ['string', true],
	      'recoveryToken': ['string', false, undefined],
	      'stateToken': ['string', false, undefined],
	      'username' : ['string', false],

	      // Function to transform the username before passing it to the API
	      // for Primary Auth, Forgot Password and Unlock Account.
	      'transformUsername' : ['function', false],

	      // CALLBACKS
	      'globalSuccessFn': 'function',
	      'globalErrorFn': 'function',
	      'processCreds': 'function',

	      // IMAGES
	      'logo': 'string',
	      'logoText' : ['string', false],
	      'helpSupportNumber': 'string',

	      // FEATURES
	      'features.router': ['boolean', true, false],
	      'features.securityImage': ['boolean', true, false],
	      'features.rememberMe': ['boolean', true, true],
	      'features.autoPush': ['boolean', true, false],
	      'features.smsRecovery': ['boolean', true, false],
	      'features.callRecovery': ['boolean', true, false],
	      'features.windowsVerify': ['boolean', true, false],
	      'features.selfServiceUnlock': ['boolean', true, false],
	      'features.multiOptionalFactorEnroll': ['boolean', true, false],
	      'features.preventBrowserFromSavingOktaPassword': ['boolean', true, true],
	      'features.deviceFingerprinting': ['boolean', false, false],
	      'features.hideSignOutLinkInMFA' : ['boolean', false, false],
	      'features.customExpiredPassword': ['boolean', true, false],

	      // I18N
	      'language': ['any', false], // Can be a string or a function
	      'i18n': ['object', false],

	      // ASSETS
	      'assets.baseUrl': ['string', false],
	      'assets.rewrite': {
	        type: 'function',
	        value: _.identity
	      },

	      // OAUTH2
	      'authScheme': ['string', false, 'OAUTH2'],
	      'authParams.display': {
	        type: 'string',
	        values: ['none', 'popup', 'page']
	      },

	      // Note: It shouldn't be necessary to override/pass in this property -
	      // it will be set correctly depending on what the value of display is
	      // and whether we are using Okta or a social IDP.
	      'authParams.responseMode': {
	        type: 'string',
	        values: ['query', 'fragment', 'form_post', 'okta_post_message']
	      },

	      // Can either be a string or an array, i.e.
	      // - Single value: 'id_token', 'token', or 'code'
	      // - Multiple values: ['id_token', 'token']
	      'authParams.responseType': ['any', false, 'id_token'],
	      'authParams.scopes': ['array', false],

	      'authParams.issuer': ['string', false],
	      'authParams.authorizeUrl': ['string', false],
	      'authParams.state': ['string', false],
	      'authParams.nonce': ['string', false],

	      'clientId': 'string',
	      'redirectUri': 'string',
	      'idps': ['array', false, []],
	      'idpDisplay': {
	        type: 'string',
	        values: ['PRIMARY', 'SECONDARY'],
	        value: 'SECONDARY'
	      },
	      'oAuthTimeout': ['number', false],

	      // HELP LINKS
	      'helpLinks.help': 'string',
	      'helpLinks.forgotPassword': 'string',
	      'helpLinks.unlock': 'string',
	      'helpLinks.custom': 'array'
	    },

	    derived: {
	      supportedLanguages: {
	        deps: ['i18n'],
	        fn: function (i18n) {
	          // Developers can pass in their own languages
	          return _.union(config.supportedLanguages, _.keys(i18n));
	        },
	        cache: true
	      },
	      languageCode: {
	        deps: ['language', 'supportedLanguages'],
	        fn: function (language, supportedLanguages) {
	          var userLanguages = BrowserFeatures.getUserLanguages(),
	              preferred = _.clone(userLanguages),
	              supportedLowerCase = Util.toLower(supportedLanguages),
	              expanded;

	          // Any developer defined "language" takes highest priority:
	          // As a string, i.e. 'en', 'ja', 'zh-CN'
	          if (_.isString(language)) {
	            preferred.unshift(language);
	          }
	          // As a callback function, which is passed the list of supported
	          // languages and detected user languages. This function must return
	          // a languageCode, i.e. 'en', 'ja', 'zh-CN'
	          else if (_.isFunction(language)) {
	            preferred.unshift(language(supportedLanguages, userLanguages));
	          }

	          // Add english as the default, and expand to include any language
	          // codes that do not include region, dialect, etc.
	          preferred.push(DEFAULT_LANGUAGE);
	          expanded = Util.toLower(Util.expandLanguages(preferred));

	          // Perform a case insensitive search - this is necessary in the case
	          // of browsers like Safari
	          var i, supportedPos;
	          for (i = 0; i < expanded.length; i++) {
	            supportedPos = supportedLowerCase.indexOf(expanded[i]);
	            if (supportedPos > -1) {
	              return supportedLanguages[supportedPos];
	            }
	          }
	        }
	      },
	      oauth2Enabled: {
	        deps: ['clientId', 'authScheme', 'authParams.responseType'],
	        fn: function (clientId, authScheme, responseType) {
	          if (!clientId) {
	            return false;
	          }
	          if (authScheme.toLowerCase() !== 'oauth2') {
	            return false;
	          }
	          var responseTypes = _.isArray(responseType) ? responseType : [responseType];
	          return _.intersection(responseTypes, supportedResponseTypes).length > 0;
	        },
	        cache: true
	      },
	      // Redirect Uri to provide in the oauth API
	      oauthRedirectUri: {
	        deps: ['redirectUri'],
	        fn: function (redirectUri) {
	          if (redirectUri) {
	            return redirectUri;
	          }

	          var origin = window.location.origin;
	          // IE8
	          if (!origin) {
	            var href = window.location.href;
	            var path = window.location.pathname;
	            if (path !== '') {
	              origin = href.substring(0, href.lastIndexOf(path));
	            }
	          }

	          return oauthRedirectTpl({
	            origin: origin
	          });
	        }
	      },
	      // filters the idps passed into the widget to include only the ones we support.
	      configuredSocialIdps: {
	        deps: ['idps'],
	        fn: function (idps) {
	          return _.filter(idps, function (idp) {
	            return _.contains(supportedIdps, idp.type.toLowerCase());
	          });
	        },
	        cache: true
	      },
	      // checks if there are any valid configured idps.
	      socialAuthConfigured: {
	        deps: ['configuredSocialIdps'],
	        fn: function (idps) {
	          return !_.isEmpty(idps);
	        },
	        cache: true
	      },
	      // social auth buttons order - 'above'/'below' the primary auth form (boolean)
	      socialAuthPositionTop: {
	        deps: ['socialAuthConfigured', 'idpDisplay'],
	        fn: function (socialAuthConfigured, idpDisplay) {
	          return !!(socialAuthConfigured && idpDisplay.toUpperCase() === 'PRIMARY');
	        },
	        cache: true
	      }
	    },

	    initialize: function (options) {
	      if (!options.baseUrl) {
	        this.callGlobalError(new ConfigError(Okta.loc('error.required.baseUrl')));
	      }
	      else if (!options.globalSuccessFn) {
	        this.callGlobalError(new ConfigError(Okta.loc('error.required.success')));
	      }
	      else if (BrowserFeatures.corsIsNotSupported()) {
	        this.callGlobalError(new UnsupportedBrowserError(Okta.loc('error.unsupported.cors')));
	      }
	    },

	    setAuthClient: function (authClient) {
	      this.authClient = authClient;
	    },

	    getAuthClient: function () {
	      return this.authClient;
	    },

	    set: function () {
	      try {
	        return Okta.Model.prototype.set.apply(this, arguments);
	      }
	      catch (e) {
	        var message = e.message ? e.message : e;
	        this.callGlobalError(new ConfigError(message));
	      }
	    },

	    // Invokes the global success function. This should only be called on a
	    // terminal part of the code (i.e. authStatus SUCCESS or after sending
	    // a recovery email)
	    callGlobalSuccess: function (status, data) {
	      // Defer this to ensure that our functions have rendered completely
	      // before invoking their function
	      var res = _.extend(data, { status: status });
	      _.defer(_.partial(this.get('globalSuccessFn'), res));
	    },

	    // Invokes the global error function. This should only be called on non
	    // recoverable errors (i.e. configuration errors, browser unsupported
	    // errors, etc)
	    callGlobalError: function (err) {
	      // Note: Must use "this.options.globalErrorFn" when they've passed invalid
	      // arguments - globalErrorFn will not have been set yet
	      var globalErrorFn = this.get('globalErrorFn') || this.options.globalErrorFn;
	      if (globalErrorFn) {
	        globalErrorFn(err);
	      }
	      else {
	        // Only throw the error if they have not registered a globalErrorFn
	        throw err;
	      }
	    },

	    // Get the username by applying the transform function if it exists.
	    transformUsername: function (username, operation) {
	      var transformFn = this.get('transformUsername');
	      if (transformFn && _.isFunction(transformFn)) {
	        return transformFn(username, operation);
	      }
	      return username;
	    },

	    processCreds: function (creds) {
	      var processCreds = this.get('processCreds');
	      return Q.Promise(function (resolve) {
	        if (!_.isFunction(processCreds)) {
	          resolve();
	        }
	        else if (processCreds.length === 2) {
	          processCreds(creds, resolve);
	        }
	        else {
	          processCreds(creds);
	          resolve();
	        }
	      });
	    },

	    // Use the parse function to transform config options to the standard
	    // settings we currently support. This is a good place to deprecate old
	    // option formats.
	    parse: function (options) {
	      if (options.authParams && options.authParams.scope) {
	        Logger.deprecate('Use "scopes" instead of "scope"');
	        options.authParams.scopes = options.authParams.scope;
	        delete options.authParams.scope;
	      }

	      if (options.labels || options.country) {
	        Logger.deprecate('Use "i18n" instead of "labels" and "country"');
	        var overrides = options.labels || {};
	        _.each(options.country, function (val, key) {
	          overrides['country.' + key] = val;
	        });
	        // Old behavior is to treat the override as a global override, so we
	        // need to add these overrides to each language
	        options.i18n = {};
	        _.each(config.supportedLanguages, function (language) {
	          options.i18n[language] = overrides;
	        });
	        delete options.labels;
	        delete options.country;
	      }

	      // Default the assets.baseUrl to the cdn, or remove any trailing slashes
	      if (!options.assets) {
	        options.assets = {};
	      }
	      var abu = options.assets.baseUrl;
	      if (!abu) {
	        options.assets.baseUrl = assetBaseUrlTpl({ version: config.version });
	      }
	      else if (abu[abu.length - 1] === '/') {
	        options.assets.baseUrl = abu.substring(0, abu.length - 1);
	      }

	      return options;
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint maxcomplexity:9*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(101),
	  __webpack_require__(102)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Animations, LoadingBeacon) {

	  var NO_BEACON_CLS = 'no-beacon';
	  var LOADING_BEACON_CLS = 'beacon-small beacon-loading';

	  function isLoadingBeacon (beacon) {
	    return beacon && beacon.equals(LoadingBeacon);
	  }

	  function removeBeacon (view) {
	    // There are some timing issues with removing beacons (i.e. the case of
	    // transitioning from loadingBeacon -> loadingBeacon)
	    if (!view.currentBeacon) {
	      return;
	    }
	    view.currentBeacon.remove();
	    view.currentBeacon = null;
	  }

	  function addBeacon (view, NextBeacon, selector, options) {
	    view.add(NextBeacon, {
	      selector: selector,
	      options: options
	    });
	    view.currentBeacon = view.first();
	  }

	  function typeOfTransition (currentBeacon, NextBeacon, options) {
	    if (!currentBeacon && !NextBeacon) {
	      return 'none';
	    }
	    // Show Loading beacon
	    if (!currentBeacon && options.loading) {
	      return 'load';
	    }
	    // Swap/Hide Loading beacon
	    if (currentBeacon && isLoadingBeacon(currentBeacon)) {
	      return NextBeacon ? 'swap' : 'unload';
	    }
	    if (currentBeacon && currentBeacon.equals(NextBeacon, options)) {
	      return 'same';
	    }
	    if (!currentBeacon && NextBeacon) {
	      return 'add';
	    }
	    if (currentBeacon && !NextBeacon) {
	      return 'remove';
	    }
	    if (currentBeacon instanceof NextBeacon) {
	      return 'fade';
	    }
	    // If none of the above
	    // then we are changing the type of beacon
	    // ex. from SecurityBeacon to FactorBeacon
	    return 'swap';
	  }

	  return Okta.View.extend({

	    currentBeacon: null,

	    template: '\
	      <div class="okta-sign-in-header auth-header">\
	        {{#if logo}}\
	        <img src="{{logo}}" class="auth-org-logo" alt="{{logoText}}"/>\
	        {{/if}}\
	        <div data-type="beacon-container" class="beacon-container"></div>\
	      </div>\
	      <div class="auth-content"><div class="auth-content-inner"></div></div>\
	    ',

	    // Attach a 'no-beacon' class if the security image feature
	    // is not passed in to prevent the beacon from jumping.
	    initialize: function (options) {
	      if (!options.settings.get('features.securityImage')) {
	        this.$el.addClass(NO_BEACON_CLS);
	        // To show/hide the spinner when there is no security image,
	        // listen to the appState's loading/removeLoading events.
	        this.listenTo(options.appState, 'loading', this.setLoadingBeacon);
	        this.listenTo(options.appState, 'removeLoading', this.removeLoadingBeacon);
	      }
	    },

	    /* jshint maxcomplexity:false */
	    setBeacon: function (NextBeacon, options) {
	      var selector = '[data-type="beacon-container"]',
	          container = this.$(selector),
	          transition = typeOfTransition(this.currentBeacon, NextBeacon, options),
	          self = this;

	      switch (transition) {
	        case 'none':
	          this.$el.addClass(NO_BEACON_CLS);
	          return;
	        case 'same':
	          return;
	        case 'add':
	          this.$el.removeClass(NO_BEACON_CLS);
	          addBeacon(this, NextBeacon, selector, options);
	          return Animations.explode(container);
	        case 'remove':
	          this.$el.addClass(NO_BEACON_CLS);
	          return Animations.implode(container)
	          .then(function () {
	            removeBeacon(self);
	          })
	          .done();
	        case 'fade':
	          // Other transitions are performed on the beacon container,
	          // but this transition is on the content inside the beacon.
	          // For a SecurityBeacon the username change will update the
	          // AppState and trigger an transition to a new Becon
	          // Since there is no url change this method is not called.
	          // For a FactorBeacon a page refresh has occurred
	          // so we execute the beacon's own transition method.
	          if (!this.currentBeacon.fadeOut) {
	            throw new Error('The current beacon is missing the "fadeOut" method');
	          }
	          options.animate = true;
	          return this.currentBeacon.fadeOut()
	          .then(function () {
	            removeBeacon(self);
	            addBeacon(self, NextBeacon, selector, options);
	          })
	          .done();
	        case 'swap':
	          return Animations.swapBeacons({
	            $el: container,
	            swap: function () {
	              var isLoading = isLoadingBeacon(self.currentBeacon);
	              // Order of these calls is important for -
	              // loader --> security/factor beacon swap.
	              removeBeacon(self);
	              if (isLoading) {
	                container.removeClass(LOADING_BEACON_CLS);
	                self.$el.removeClass(NO_BEACON_CLS);
	              }
	              addBeacon(self, NextBeacon, selector, options);
	            }
	          })
	          .done();
	        case 'load':
	          // Show the loading beacon. Add a couple of classes
	          // before triggering the add beacon code.
	          container.addClass(LOADING_BEACON_CLS);
	          addBeacon(self, NextBeacon, selector, options);
	          return Animations.explode(container);
	        case 'unload':
	          // Hide the loading beacon.
	          return this.removeLoadingBeacon();
	        default:
	          throw new Error('the "' + transition + '" is not recognized');
	      }
	    },

	    // Show the loading beacon when the security image feature is not enabled.
	    setLoadingBeacon: function (isLoading) {
	      if (!isLoading || isLoadingBeacon(this.currentBeacon)) {
	        return;
	      }
	      this.setBeacon(LoadingBeacon, { loading: true });
	    },

	    // Hide the beacon on primary auth failure. On primary auth success, setBeacon does this job.
	    removeLoadingBeacon: function () {
	      var self = this,
	          container = this.$('[data-type="beacon-container"]');

	      return Animations.implode(container)
	      .then(function () {
	        removeBeacon(self);
	        container.removeClass(LOADING_BEACON_CLS);
	      })
	      .done();
	    },

	    getTemplateData: function () {
	      return this.settings.toJSON({ verbose: true });
	    },

	    getContentEl: function () {
	      return this.$('.auth-content-inner');
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9), __webpack_require__(91)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Q, Enums) {

	  var SWAP_PAGE_TIME = 200;

	  var fn = {};

	  function zoom ($el, start, finish) {
	    var deferred = Q.defer();
	    $el.animate({
	      'text-indent': 1
	    }, {
	      duration: 200,
	      easing: 'swing',
	      step: function (now, fx) {
	        fx.start = start;
	        fx.end = finish;
	        $el.css('transform', 'scale(' + now + ', ' + now + ')');
	      },
	      always: function () {
	        deferred.resolve($el);
	      }
	    });
	    return deferred.promise;
	  }

	  function rotate ($el, start, finish) {
	    var deferred = Q.defer();
	    $el.animate({
	      'text-indent': 1
	    }, {
	      duration: 150,
	      easing: 'swing',
	      step: function (now, fx) {
	        fx.start = start;
	        fx.end = finish;
	        $el.css('transform', 'rotate(' + now + 'deg)');
	      },
	      always: function () {
	        deferred.resolve($el);
	      }
	    });
	    return deferred.promise;
	  }

	  // Note: It is necessary to pass in a success callback because we must
	  // remove the old dom node (and controller) in the same tick of the event
	  // loop. Waiting for "then" results in a glitchy animation.
	  fn.swapPages = function (options) {
	    var deferred = Q.defer();
	    var $parent = options.$parent;
	    var $oldRoot = options.$oldRoot;
	    var $newRoot = options.$newRoot;
	    var success = options.success;
	    var ctx = options.ctx;
	    var directionClassName = 'transition-from-right';

	    if (options.dir && options.dir === Enums.DIRECTION_BACK) {
	      directionClassName = 'transition-from-left';
	    }

	    $newRoot.addClass(directionClassName);
	    $parent.append($newRoot);

	    $parent.addClass('animation-container-overflow');
	    $newRoot.animate(
	      { left: '0px', top: '0px', opacity: 1 },
	      SWAP_PAGE_TIME,
	      function () {
	        $parent.removeClass('animation-container-overflow');
	        $newRoot.removeClass(directionClassName);
	        $newRoot.removeAttr('style');
	        success.call(ctx);
	        deferred.resolve();
	      }
	    );

	    $oldRoot.animate(
	      { height: $newRoot.height(), opacity: 0 },
	      SWAP_PAGE_TIME * 0.8
	    );

	    return deferred.promise;
	  };

	  fn.swapBeacons = function (options) {
	    var $el = options.$el,
	        swap = options.swap,
	        ctx = options.ctx;

	    return this.implode($el)
	    .then(function () {
	      swap.call(ctx);
	      return $el;
	    })
	    .then(this.explode);
	  };

	  fn.explode = function ($el) {
	    return zoom($el, 0, 1); //zoom in
	  };

	  fn.implode = function ($el) {
	    return zoom($el, 1, 0); //zoom out
	  };

	  fn.radialProgressBar = function (options) {
	    var radialProgressBar = options.$el,
	        swap = options.swap,
	        circles = radialProgressBar.children();

	    return rotate(circles, 0, 180)
	    .then(function () {
	      radialProgressBar.css({'clip': 'auto'});
	    })
	    .then(function () {
	      var leftHalf = circles.eq(0);
	      swap();
	      return rotate(leftHalf, 180, 360);
	    })
	    .then(function () {
	      //reset values to initial state
	      radialProgressBar.css({'clip': 'rect(0px, 96px, 96px, 48px)'});
	      circles.css({
	        'transform': 'rotate(0deg)',
	        'text-indent': '1px'
	      });
	    });
	  };

	  return fn;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  return Okta.View.extend({

	    template: '\
	      <div class="beacon-blank"/>\
	      <div class="bg-helper auth-beacon auth-beacon-security" data-se="loading-beacon">\
	      <div class="okta-sign-in-beacon-border auth-beacon-border js-auth-beacon-border"/>\
	      </div>\
	    ',

	    equals: function (Beacon) {
	      return Beacon && this instanceof Beacon;
	    }

	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(101)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Animations) {

	  var _ = Okta._,
	      $ = Okta.$;

	  function setBackgroundImage (el, appState) {
	    // NOTE: The imgSrc is returned by the server so that every
	    // user has a unique image. However new and undefined user states
	    // are hard coded into the css and the value returned by the server
	    // is ignored.
	    var imgSrc = appState.get('securityImage'),
	        imgDescription = appState.get('securityImageDescription'),
	        isUndefinedUser = appState.get('isUndefinedUser'),
	        isNewUser = appState.get('isNewUser'),
	        isSecurityImage = !isUndefinedUser && !isNewUser;

	    el.css('background-image', '');
	    el.removeClass('new-user undefined-user');
	    if (isNewUser) {
	      el.addClass('new-user');
	      return;
	    }
	    if (isUndefinedUser) {
	      el.addClass('undefined-user');
	      return;
	    }
	    if (isSecurityImage) {
	      // TODO: Newer versions of qtip will remove aria-describedby on their own when destroy() is called.
	      el.removeAttr('aria-describedby');
	      el.find('.accessibility-text').text(imgDescription);
	      el.css('background-image', 'url(' + _.escape(imgSrc) + ')');
	      return;
	    }
	  }

	  function antiPhishingMessage (image, host, shown) {
	    // Show the message that the user has not logged in from this device before.
	    image.qtip({
	      prerender: true,
	      content: {
	        text: Okta.loc('primaryauth.newUser.tooltip', 'login', [_.escape(host)]),
	        button: Okta.loc('primaryauth.newUser.tooltip.close', 'login')
	      },
	      style: {
	        classes: 'okta-security-image-tooltip security-image-qtip qtip-custom qtip-shadow qtip-rounded',
	        tip: {height: 12, width: 16}
	      },
	      position: {
	        my: 'top center',
	        at: 'bottom center',
	        adjust: {method: 'flip', y: -22},
	        viewport: $('body')
	      },
	      hide: {event: false, fixed: true},
	      show: {event: false, delay: 200}
	    });
	    image.qtip('toggle', shown);
	  }

	  function updateSecurityImage($el, appState, animate) {
	    var image = $el.find('.auth-beacon-security'),
	        border = $el.find('.js-auth-beacon-border'),
	        hasBorder = !appState.get('isUndefinedUser'),
	        hasAntiPhishing = appState.get('isNewUser'),
	        radialProgressBar = $el.find('.radial-progress-bar'),
	        host = appState.get('baseUrl').match(/https?:\/\/(.[^\/]+)/)[1],
	        duration = 200;
	    if (!animate) {
	      // Do not animate the security beacon
	      // This occurs when initializing the form
	      setBackgroundImage(image, appState);
	      border.toggleClass('auth-beacon-border', hasBorder);
	      return;
	    }
	    // Animate loading the security beacon
	    if (!hasBorder) {
	      // This occurrs when appState username is blank
	      // we do not yet know if the user is recognized
	      image.qtip('destroy');
	      image.fadeOut(duration, function () {
	        setBackgroundImage(image, appState);
	        border.removeClass('auth-beacon-border');
	        image.fadeIn(duration);
	      });
	    } else {
	      // Animate loading the security beacon with a loading bar for the border
	      // This occurrs when the username has been checked against Okta.
	      image.qtip('destroy');
	      border.removeClass('auth-beacon-border');
	      Animations.radialProgressBar({
	        $el: radialProgressBar,
	        swap: function () {
	          image.fadeOut(duration, function () {
	            setBackgroundImage(image, appState);
	            image.fadeIn(duration);
	          });
	        }
	      }).then(function () {
	        border.addClass('auth-beacon-border');
	      }).then(function () {
	        antiPhishingMessage(image, host, hasAntiPhishing);
	      });
	    }
	  }

	  return Okta.View.extend({

	    template: '\
	    <div class="beacon-blank">\
	      <div class="radial-progress-bar">\
	        <div class="circle left"></div>\
	        <div class="circle right"></div>\
	      </div>\
	    </div>\
	    <div aria-live="polite" role="image" class="bg-helper auth-beacon auth-beacon-security" data-se="security-beacon">\
	      <span class="accessibility-text"></span>\
	      <div class="okta-sign-in-beacon-border auth-beacon-border js-auth-beacon-border">\
	      </div>\
	    </div>\
	    ',
	    className: 'js-security-beacon',

	    initialize: function (options) {
	      this.update = _.partial(updateSecurityImage, this.$el, options.appState);
	      this.listenTo(options.appState, 'change:securityImage', this.update);
	      this.listenTo(options.appState, 'loading', function (isLoading) {
	        this.$el.toggleClass('beacon-loading', isLoading);
	        this.removeAntiPhishingMessage();
	      });
	      this.options.appState.set('beaconType', 'security');

	      this.listenTo(options.appState, 'navigate', this.removeAntiPhishingMessage);
	    },

	    postRender: function () {
	      this.update(false);
	    },

	    equals: function (Beacon) {
	      return Beacon && this instanceof Beacon;
	    },

	    removeAntiPhishingMessage: function () {
	      var image = this.$el.find('.auth-beacon-security');
	      image.qtip('destroy');
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint newcap:false, camelcase:false */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9),
	  __webpack_require__(105),
	  __webpack_require__(14),
	  __webpack_require__(92)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, Factor, BrowserFeatures, Errors) {

	  // Keep track of stateMachine with this special model. Some reasons to not
	  // keep it generic:
	  // 1. We know exactly what we're using appState for by requiring props
	  // 2. Can have some derived functions to help us translate the lastAuthRes

	  var _ = Okta._;
	  var $ = Okta.$;
	  var compile = Okta.Handlebars.compile;

	  var USER_NOT_SEEN_ON_DEVICE = '/img/security/unknown.png';
	  var UNDEFINED_USER = '/img/security/default.png';
	  var NEW_USER = '/img/security/unknown-device.png';
	  var NEW_USER_IMAGE_DESCRIPTION = '';
	  var UNDEFINED_USER_IMAGE_DESCRIPTION = '';
	  var UNKNOWN_IMAGE_DESCRIPTION = '';

	  var securityImageUrlTpl = compile('{{baseUrl}}/login/getimage?username={{username}}');

	  function getSecurityImage(baseUrl, username) {
	    var url = securityImageUrlTpl({ baseUrl: baseUrl, username: username });

	    // When the username is empty, we want to show the default image.
	    if (_.isEmpty(username) || _.isUndefined(username)) {
	      return Q({
	        'securityImage': UNDEFINED_USER,
	        'securityImageDescription': UNDEFINED_USER_IMAGE_DESCRIPTION
	      });
	    }

	    return Q($.get(url)).then(function (res) {
	      if (res.pwdImg === USER_NOT_SEEN_ON_DEVICE) {
	        // When we get an unknown.png security image from OKTA,
	        // we want to show the unknown-device security image.
	        // We are mapping the server's img url to a new one because
	        // we still need to support the original login page.
	        return {
	          'securityImage': NEW_USER,
	          'securityImageDescription': NEW_USER_IMAGE_DESCRIPTION
	        };
	      }
	      return {
	        'securityImage': res.pwdImg,
	        'securityImageDescription':
	            res.imageDescription || UNKNOWN_IMAGE_DESCRIPTION
	      };
	    });
	  }

	  function getMinutesString(factorLifetimeInMinutes) {
	    if (factorLifetimeInMinutes > 60 && factorLifetimeInMinutes <= 1440) {
	      var lifetimeInHours = (factorLifetimeInMinutes / 60);
	      return Okta.loc('hours', 'login', [lifetimeInHours]);
	    } else if (factorLifetimeInMinutes > 1440) {
	      var lifetimeInDays = (factorLifetimeInMinutes / 1440);
	      return Okta.loc('days', 'login', [lifetimeInDays]);
	    }
	    //Use minutes as the time unit by default
	    if (factorLifetimeInMinutes === 1) {
	      return Okta.loc('minutes.oneMinute', 'login');
	    }
	    return Okta.loc('minutes', 'login', [factorLifetimeInMinutes]);
	  }

	  return Okta.Model.extend({

	    initialize: function () {
	      // Handle this in initialize (as opposed to a derived property) because
	      // the operation is asynchronous
	      if (this.settings.get('features.securityImage')) {
	        var self = this;
	        this.listenTo(this, 'change:username', function (model, username) {
	          getSecurityImage(this.get('baseUrl'), username)
	          .then(function (image) {
	            model.set('securityImage', image.securityImage);
	            model.set(
	              'securityImageDescription', image.securityImageDescription);
	          })
	          .fail(function (jqXhr) {
	            // Only notify the consumer on a CORS error
	            if (BrowserFeatures.corsIsNotEnabled(jqXhr)) {
	              self.settings.callGlobalError(new Errors.UnsupportedBrowserError(
	                Okta.loc('error.enabled.cors')
	              ));
	            }
	            else {
	              throw jqXhr;
	            }
	          })
	          .done();
	        });
	      }
	    },

	    local: {
	      baseUrl: 'string',
	      lastAuthResponse: ['object', true, {}],
	      transaction: 'object',
	      transactionError: 'object',
	      username: 'string',
	      factors: 'object',
	      policy: 'object',
	      securityImage: ['string', true, UNDEFINED_USER],
	      securityImageDescription:
	          ['string', true, UNDEFINED_USER_IMAGE_DESCRIPTION],
	      userCountryCode: 'string',
	      userPhoneNumber: 'string',
	      factorActivationType: 'string',
	      flashError: 'object',
	      beaconType: 'string',

	      // Note: languageCode is special in that it is shared between Settings
	      // and AppState. Settings is the *configured* language, and is static.
	      // AppState is the dynamic language state - it can be changed via a
	      // language picker, etc.
	      languageCode: ['string', true]
	    },

	    setAuthResponse: function (res) {
	      // Because of MFA_CHALLENGE (i.e. DUO), we need to remember factors
	      // across auth responses. Not doing this, for example, results in being
	      // unable to switch away from the duo factor dropdown.
	      var self = this;
	      if (res._embedded && res._embedded.policy) {
	        this.set('policy', res._embedded.policy);
	      }
	      if (res._embedded && res._embedded.factors) {
	        var settings = this.settings;
	        var factors = _.map(res._embedded.factors, function (factor) {
	          factor.settings = settings;
	          factor.appState = self;
	          return factor;
	        });
	        this.set('factors', new Factor.Collection(factors, { parse: true }));
	      }
	      this.set('lastAuthResponse', res);
	    },

	    derived: {
	      'isSuccessResponse': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'SUCCESS';
	        }
	      },
	      'isMfaRequired': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'MFA_REQUIRED';
	        }
	      },
	      'isMfaEnroll': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'MFA_ENROLL';
	        }
	      },
	      'isMfaChallenge': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'MFA_CHALLENGE';
	        }
	      },
	      'isMfaRejectedByUser': {
	        // MFA failures are usually error responses
	        // except in the case of Okta Push, when a
	        // user clicks 'deny' on his phone.
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.factorResult === 'REJECTED';
	        }
	      },
	      'isMfaTimeout': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.factorResult === 'TIMEOUT';
	        }
	      },
	      'isMfaEnrollActivate': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'MFA_ENROLL_ACTIVATE';
	        }
	      },
	      'isWaitingForActivation': {
	        deps: ['isMfaEnrollActivate', 'lastAuthResponse'],
	        fn: function (isMfaEnrollActivate, res) {
	          return isMfaEnrollActivate && res.factorResult === 'WAITING';
	        }
	      },
	      'hasMfaRequiredOptions': {
	        deps: ['lastAuthResponse', 'factors'],
	        fn: function (res, factors) {
	          if (res.status !== 'MFA_REQUIRED' && res.status !== 'MFA_CHALLENGE') {
	            return false;
	          }
	          return factors && factors.length > 1;
	        }
	      },
	      'userId': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.user) {
	            return null;
	          }
	          return res._embedded.user.id;
	        }
	      },
	      'isPwdExpiringSoon': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.status === 'PASSWORD_WARN';
	        }
	      },
	      'passwordExpireDays': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.policy || !res._embedded.policy.expiration) {
	            return null;
	          }
	          return res._embedded.policy.expiration.passwordExpireDays;
	        }
	      },
	      'isPwdManagedByOkta': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._links || !res._links.next || !res._links.next.title) {
	            return true;
	          }
	          return false;
	        }
	      },
	      'passwordExpiredWebsiteName': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._links || !res._links.next || !res._links.next.title) {
	            return null;
	          }
	          return res._links.next.title;
	        }
	      },
	      'passwordExpiredLinkUrl': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._links || !res._links.next || !res._links.next.title || !res._links.next.href) {
	            return null;
	          }
	          return res._links.next.href;
	        }
	      },
	      'recoveryType': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.recoveryType;
	        }
	      },
	      'factorType': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          return res.factorType;
	        }
	      },
	      'factor': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.factor) {
	            return null;
	          }
	          return res._embedded.factor;
	        }
	      },
	      'activatedFactorId': {
	        deps: ['factor'],
	        fn: function (factor) {
	          return factor ? factor.id : null;
	        }
	      },
	      'activatedFactorType': {
	        deps: ['factor'],
	        fn: function (factor) {
	          return factor ? factor.factorType : null;
	        }
	      },
	      'activatedFactorProvider': {
	        deps: ['factor'],
	        fn: function (factor) {
	          return factor ? factor.provider : null;
	        }
	      },
	      'qrcode': {
	        deps: ['factor'],
	        fn: function (factor) {
	          try {
	            return factor._embedded.activation._links.qrcode.href;
	          } catch (err) {
	            return null;
	          }
	        }
	      },
	      'activationSendLinks': {
	        deps: ['factor'],
	        fn: function (factor) {
	          var sendLinks;
	          try {
	            sendLinks = factor._embedded.activation._links.send;
	          } catch (err) {
	            sendLinks = [];
	          }
	          return sendLinks;
	        }
	      },
	      'textActivationLinkUrl': {
	        deps: ['activationSendLinks'],
	        fn: function (activationSendLinks) {
	          var item = _.findWhere(activationSendLinks, {name: 'sms'});
	          return item ? item.href : null;
	        }
	      },
	      'emailActivationLinkUrl': {
	        deps: ['activationSendLinks'],
	        fn: function (activationSendLinks) {
	          var item = _.findWhere(activationSendLinks, {name: 'email'});
	          return item ? item.href : null;
	        }
	      },
	      'sharedSecret': {
	        deps: ['factor'],
	        fn: function (factor) {
	          try {
	            return factor._embedded.activation.sharedSecret;
	          } catch (err) {
	            return null;
	          }
	        }
	      },
	      'duoEnrollActivation': {
	        deps: ['factor'],
	        fn: function (factor) {
	          if (!factor || !factor._embedded || !factor._embedded.activation) {
	            return null;
	          }
	          return factor._embedded.activation;
	        }
	      },
	      'prevLink': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (res._links && res._links.prev) {
	            return res._links.prev.href;
	          }
	          return null;
	        }
	      },
	      'user': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.user) {
	            return null;
	          }
	          return res._embedded.user;
	        }
	      },
	      'recoveryQuestion': {
	        deps: ['user'],
	        fn: function (user) {
	          if (!user || !user.recovery_question) {
	            return null;
	          }
	          return user.recovery_question.question;
	        }
	      },
	      'userProfile': {
	        deps: ['user'],
	        fn: function (user) {
	          if (!user || !user.profile) {
	            return null;
	          }
	          return user.profile;
	        }
	      },
	      'userEmail': {
	        deps: ['userProfile'],
	        fn: function (userProfile) {
	          if (!userProfile || !userProfile.login) {
	            return null;
	          }
	          return userProfile.login;
	        }
	      },
	      'userFullName': {
	        deps: ['userProfile'],
	        fn: function (userProfile) {
	          if (!userProfile || (!userProfile.firstName && !userProfile.lastName)) {
	            return '';
	          }
	          return userProfile.firstName + ' ' + userProfile.lastName;
	        }
	      },
	      'hasExistingPhones': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.factors) {
	            return false;
	          }
	          var factors = res._embedded.factors;
	          var factor = _.findWhere(factors, {factorType: 'sms', provider: 'OKTA'});
	          if (!factor || !factor._embedded) {
	            return false;
	          }

	          return !!factor._embedded.phones.length;
	        }
	      },
	      'hasExistingPhonesForCall': {
	        deps: ['lastAuthResponse'],
	        fn: function (res) {
	          if (!res._embedded || !res._embedded.factors) {
	            return false;
	          }
	          var factors = res._embedded.factors;
	          var factor = _.findWhere(factors, {factorType: 'call', provider: 'OKTA'});
	          if (!factor || !factor._embedded) {
	            return false;
	          }

	          return !!factor._embedded.phones.length;
	        }
	      },
	      'isUndefinedUser': {
	        deps: ['securityImage'],
	        fn: function (securityImage) {
	          return (securityImage === UNDEFINED_USER);
	        }
	      },
	      'isNewUser': {
	        deps: ['securityImage'],
	        fn: function (securityImage) {
	          return (securityImage === NEW_USER);
	        }
	      },
	      'allowRememberDevice': {
	        deps: ['policy'],
	        fn: function (policy) {
	          return policy && policy.allowRememberDevice;
	        }
	      },
	      'rememberDeviceLabel': {
	        deps: ['policy'],
	        fn: function (policy) {
	          if (policy && policy.rememberDeviceLifetimeInMinutes > 0) {
	            var timeString = getMinutesString(policy.rememberDeviceLifetimeInMinutes);
	            return Okta.loc('rememberDevice.timebased', 'login', [timeString]);
	          } else if (policy && policy.rememberDeviceLifetimeInMinutes === 0) {
	            return Okta.loc('rememberDevice.devicebased', 'login');
	          }
	          return Okta.loc('rememberDevice', 'login');
	        }
	      },
	      'rememberDeviceByDefault': {
	        deps: ['policy'],
	        fn: function (policy) {
	          return policy && policy.rememberDeviceByDefault;
	        }
	      }
	    },

	    parse: function (options) {
	      this.settings = options.settings;
	      return _.extend(
	        _.omit(options, 'settings'),
	        { languageCode: this.settings.get('languageCode' )}
	      );
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* jshint maxstatements: 18 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9),
	  __webpack_require__(83),
	  __webpack_require__(87)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, factorUtil, BaseLoginModel) {
	  var _ = Okta._;

	  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
	  // in network connection lost errors in Safari and IE.
	  var PUSH_INTERVAL = 6000;

	  var Factor = BaseLoginModel.extend({
	    extraProperties: true,
	    flat: false,

	    props: {
	      id: 'string',
	      factorType: {
	        type: 'string',
	        values: [
	          'sms',
	          'call',
	          'token',
	          'token:software:totp',
	          'token:hardware',
	          'question',
	          'push',
	          'u2f'
	        ]
	      },
	      provider: {
	        type: 'string',
	        values: [
	          'OKTA',
	          'RSA',
	          'DEL_OATH',
	          'SYMANTEC',
	          'GOOGLE',
	          'YUBICO',
	          'FIDO'
	        ]
	      },
	      enrollment: {
	        type: 'string',
	        values: [
	          'OPTIONAL',
	          'REQUIRED'
	        ]
	      },
	      status: {
	        type: 'string',
	        values: [
	          'NOT_SETUP',
	          'ACTIVE'
	        ]
	      },
	      profile: ['object'],
	      vendorName: 'string'
	    },

	    local: {
	      'answer': 'string',
	      'backupFactor': 'object',
	      'showAnswer': 'boolean',
	      'rememberDevice': 'boolean',
	      'autoPush': ['boolean', true, false]
	    },

	    derived: {
	      isOktaFactor: {
	        deps: ['provider'],
	        fn: function (provider) {
	          return provider === 'OKTA';
	        }
	      },
	      factorName: {
	        deps: ['provider', 'factorType'],
	        fn: factorUtil.getFactorName
	      },
	      factorLabel: {
	        deps: ['provider', 'factorType', 'vendorName'],
	        fn: function (provider, factorType, vendorName) {
	          if (provider === 'DEL_OATH') {
	            return vendorName;
	          }
	          return factorUtil.getFactorLabel(provider, factorType);
	        }
	      },
	      factorDescription: {
	        deps: ['provider', 'factorType'],
	        fn: factorUtil.getFactorDescription
	      },
	      sortOrder: {
	        deps: ['provider', 'factorType'],
	        fn: factorUtil.getFactorSortOrder
	      },
	      iconClassName: {
	        deps: ['provider', 'factorType'],
	        fn: factorUtil.getFactorIconClassName
	      },
	      securityQuestion: {
	        deps: ['profile', 'factorType'],
	        fn: function (profile, factorType) {
	          if (factorType !== 'question') {
	            return null;
	          }
	          return profile && factorUtil.getSecurityQuestionLabel(profile);
	        }
	      },
	      phoneNumber: {
	        deps: ['profile', 'factorType'],
	        fn: function (profile, factorType) {
	          if (_.contains(['sms', 'call'], factorType)) {
	            return profile && profile.phoneNumber;
	          }
	          return null;
	        }
	      },
	      deviceName: {
	        deps: ['profile', 'factorType'],
	        fn: function (profile, factorType) {
	          if (factorType !== 'push') {
	            return null;
	          }
	          return profile && profile.name;
	        }
	      },
	      enrolled: {
	        deps: ['status'],
	        fn: function (status) {
	          return status === 'ACTIVE';
	        }
	      },
	      required: {
	        deps: ['enrollment'],
	        fn: function (enrollment) {
	          return enrollment === 'REQUIRED';
	        }
	      },
	      canUseResend: {
	        deps: ['provider', 'factorType'],
	        fn: function (provider, factorType) {
	          // Only push and sms have resend links.
	          // However, we currently have a problem with SMS
	          // (no way to know whether we want resend or verifyFactor),
	          // so we're turning it off for now.
	          return (provider === 'OKTA' && factorType === 'push');
	        }
	      },
	      isSMSorCall: {
	        deps: ['factorType'],
	        fn: function (factorType) {
	          return _.contains(['sms', 'call'], factorType);
	        }
	      }
	    },

	    parse: function (attributes) {
	      this.settings = attributes.settings;
	      this.appState = attributes.appState;
	      // set the initial value for remember device.
	      attributes.rememberDevice = factorUtil.getRememberDeviceValue(this.appState);
	      return _.omit(attributes, ['settings', 'appState']);
	    },

	    validate: function () {
	      if (this.get('isSMSorCall') && !this.get('answer')) {
	        return {'answer': Okta.loc('model.validation.field.blank')};
	      }
	    },

	    save: function () {
	      var rememberDevice = !!this.get('rememberDevice');
	      // Set/Remove the remember device cookie based on the remember device input.

	      return this.doTransaction(function (transaction) {
	        var data = {
	          rememberDevice: rememberDevice
	        };
	        if (this.get('factorType') === 'question') {
	          data.answer = this.get('answer');
	        } else {
	          data.passCode = this.get('answer');
	        }

	        var promise;
	        // MFA_REQUIRED
	        if (transaction.status === 'MFA_REQUIRED') {
	          var factor = _.findWhere(transaction.factors, {
	            id: this.get('id')
	          });
	          promise = factor.verify(data);
	        }

	        // MFA_CHALLENGE
	        else if (this.get('canUseResend') && transaction.resend) {
	          var firstLink = transaction.data._links.resend[0];
	          promise = transaction.resend(firstLink.name);
	        } else {
	          promise = transaction.verify(data);
	        }
	        //the 'save' event here is triggered and used in the BaseLoginController
	        //to disable the primary button on the factor form
	        this.trigger('save');

	        return promise
	        .then(function (trans) {
	          if (trans.status === 'MFA_CHALLENGE' && trans.poll) {
	            return Q.delay(PUSH_INTERVAL).then(function() {
	              return trans.poll(PUSH_INTERVAL);
	            });
	          }
	          return trans;
	        })
	        .fail(function (err) {
	          // Clean up the cookie on failure.
	          throw err;
	        });
	      });
	    }
	  });

	  var Factors = Okta.Collection.extend({

	    model: Factor,
	    comparator: 'sortOrder',

	    // One override necessary here - Okta Verify with Push is treated like
	    // one factor. In the beacon menu, there's only one option - only in the
	    // view can you choose to enable the other factor (which will be exposed
	    // by the backupFactor property)
	    parse: function (factors) {
	      // Keep a track of the last used factor, since
	      // we need it to determine the default factor.
	      this.lastUsedFactor = factors[0];

	      var oktaPushFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'push' });
	      if (!oktaPushFactor) {
	        return factors;
	      }
	      var totpFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'token:software:totp' });

	      var isTotpFirst = (totpFactor === factors[0]);

	      var parsedFactors = _.reduce(factors, function (memo, factor) {
	        var isOkta = factor.provider === 'OKTA';
	        var isOktaTotp = isOkta && factor.factorType === 'token:software:totp';
	        var isOktaPush = isOkta && factor.factorType === 'push';
	        var notEnrolled = factor.status !== 'ACTIVE';

	        var hideOktaTotp = isOktaTotp && (notEnrolled || oktaPushFactor.status === 'ACTIVE');
	        var hideOktaPush = isOktaPush && notEnrolled && totpFactor.status === 'ACTIVE';

	        if (hideOktaTotp || hideOktaPush) {
	          return memo;
	        }

	        if (isOktaPush) {
	          factor.backupFactor = new Factor(totpFactor, { parse: true });
	        }
	        memo.push(factor);
	        return memo;
	      }, []);

	      // Use push factor instead of TOTP, if TOTP is first in the list
	      // (since it is stored as backupFactor for push).
	      if (isTotpFirst) {
	        this.lastUsedFactor = oktaPushFactor;
	      }

	      return parsedFactors;
	    },

	    // Will need to update this to use HAL link to get last used factor:
	    // https://oktainc.atlassian.net/browse/OKTA-58380
	    // However, current code returns last used factor as first factor in list.
	    // Also, will need to add priority - i.e. if they do not have a last used
	    // factor, should try Okta Verify, then Okta SMS, etc.
	    getDefaultFactor: function () {
	      var factor = _.pick(this.lastUsedFactor, 'factorType', 'provider');
	      return this.findWhere(factor);
	    },

	    getFirstUnenrolledRequiredFactor: function () {
	      return this.findWhere({ required: true, enrolled: false });
	    }

	  });

	  return {
	    Model: Factor,
	    Collection: Factors
	  };

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint camelcase:false, newcap:false */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(107),
	  __webpack_require__(9),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(91),
	  __webpack_require__(85),
	  __webpack_require__(108)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Duo, Q, FactorUtil, FormController, Enums, FormType, FooterSignout) {

	  var $ = Okta.$,
	      _ = Okta._;

	  return FormController.extend({

	    className: 'mfa-verify-duo duo-form',

	    Model: {
	      props: {
	        host: 'string',
	        signature: 'string',
	        postAction: 'string',
	        factorId: 'string',
	        stateToken: 'string',
	        rememberDevice: 'boolean'
	      },

	      initialize: function () {
	        var rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);
	        // set the initial value for remember device (Cannot do this while defining the
	        // local property because this.settings would not be initialized there yet).
	        this.set('rememberDevice', rememberDevice);
	      },

	      getInitOptions: function () {
	        var rememberDevice = !!this.get('rememberDevice');
	        return this.doTransaction(function(transaction) {
	          var data = {
	            rememberDevice: rememberDevice
	          };
	          var factor = _.findWhere(transaction.factors, {
	            provider: 'DUO',
	            factorType: 'web'
	          });
	          return factor.verify(data)
	          .fail(function (err) {
	            // Clean up the cookie on failure.
	            throw err;
	          });
	        });
	      },

	      verify: function (signedResponse) {
	        // Note: We should be doing this in OktaAuth! Fix when it's updated.
	        var url = this.get('postAction'),
	            factorId = this.get('factorId'),
	            self = this,
	            data = {
	              id: factorId,
	              stateToken: this.get('stateToken'),
	              sig_response: signedResponse
	            };
	        // We don't actually use authClient.post() here (unlike all the other cases in the
	        // sign-in widget) since the endpoint is wired to accept serialized form post instead
	        // of a JSON post ($.post() is different from authClient.post() in that in $.post(),
	        // jquery decides the Content-Type instead of it being a JSON type). Enroll/Verify DUO
	        // are the only two places where we actually do this.
	        // NOTE - If we ever decide to change this, we should test this very carefully.
	        var rememberDevice = this.get('rememberDevice');
	        return Q($.post(url, data))
	        .then(function () {
	          return self.doTransaction(function(transaction) {
	            var data;
	            if (rememberDevice) {
	              data = {rememberDevice: rememberDevice};
	            }
	            return transaction.poll(data);
	          });
	        })
	        .fail(function (err) {
	          self.trigger('error', self, err.xhr);
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      noButtonBar: true,
	      title: _.partial(Okta.loc, 'factor.duo'),
	      attributes: { 'data-se': 'factor-duo' },

	      postRender: function () {
	        this.add('<iframe frameborder="0" title="' + this.title() + '"></iframe>');
	        if (this.options.appState.get('allowRememberDevice')) {
	          this.addInput({
	            label: false,
	            'label-top': true,
	            placeholder: this.options.appState.get('rememberDeviceLabel'),
	            className: 'margin-btm-0',
	            name: 'rememberDevice',
	            type: 'checkbox'
	          });
	        }
	        Duo.init({
	          'host': this.model.get('host'),
	          'sig_request': this.model.get('signature'),
	          'iframe': this.$('iframe').get(0),
	          'post_action': _.bind(this.model.verify, this.model)
	        });
	      }
	    },

	    Footer: FooterSignout,

	    fetchInitialData: function () {
	      var self = this;
	      return this.model.getInitOptions()
	      .then(function (trans) {
	        var res = trans.data;
	        if (!res._embedded || !res._embedded.factor || !res._embedded.factor._embedded ||
	            !res._embedded.factor._embedded.verification) {
	          throw new Error('Response does not have duo verification options');
	        }
	        var verification = res._embedded.factor._embedded.verification;
	        self.model.set({
	          host: verification.host,
	          signature: verification.signature,
	          postAction: verification._links.complete.href,
	          factorId: res._embedded.factor.id,
	          stateToken: res.stateToken
	        });
	      });
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaChallenge')) {
	        return true;
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Duo Web SDK v2
	 * Copyright 2015, Duo Security
	 */

	// OKTA: Added define to use with AMD
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {

	    var DUO_MESSAGE_FORMAT = /^(?:AUTH|ENROLL)+\|[A-Za-z0-9\+\/=]+\|[A-Za-z0-9\+\/=]+$/;
	    var DUO_ERROR_FORMAT = /^ERR\|[\w\s\.\(\)]+$/;

	    var iframeId = 'duo_iframe',
	        postAction = '',
	        postArgument = 'sig_response',
	        host,
	        sigRequest,
	        duoSig,
	        appSig,
	        iframe;

	    function throwError(message, url) {
	        throw new Error(
	            'Duo Web SDK error: ' + message +
	            (url ? ('\n' + 'See ' + url + ' for more information') : '')
	        );
	    }

	    function hyphenize(str) {
	        return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase();
	    }

	    // cross-browser data attributes
	    function getDataAttribute(element, name) {
	        if ('dataset' in element) {
	            return element.dataset[name];
	        } else {
	            return element.getAttribute('data-' + hyphenize(name));
	        }
	    }

	    // cross-browser event binding/unbinding
	    function on(context, event, fallbackEvent, callback) {
	        if ('addEventListener' in window) {
	            context.addEventListener(event, callback, false);
	        } else {
	            context.attachEvent(fallbackEvent, callback);
	        }
	    }

	    function off(context, event, fallbackEvent, callback) {
	        if ('removeEventListener' in window) {
	            context.removeEventListener(event, callback, false);
	        } else {
	            context.detachEvent(fallbackEvent, callback);
	        }
	    }

	    function onReady(callback) {
	        on(document, 'DOMContentLoaded', 'onreadystatechange', callback);
	    }

	    function offReady(callback) {
	        off(document, 'DOMContentLoaded', 'onreadystatechange', callback);
	    }

	    function onMessage(callback) {
	        on(window, 'message', 'onmessage', callback);
	    }

	    function offMessage(callback) {
	        off(window, 'message', 'onmessage', callback);
	    }

	    /**
	     * Parse the sig_request parameter, throwing errors if the token contains
	     * a server error or if the token is invalid.
	     *
	     * @param {String} sig Request token
	     */
	    function parseSigRequest(sig) {
	        if (!sig) {
	            // nothing to do
	            return;
	        }

	        // see if the token contains an error, throwing it if it does
	        if (sig.indexOf('ERR|') === 0) {
	            throwError(sig.split('|')[1]);
	        }

	        // validate the token
	        if (sig.indexOf(':') === -1 || sig.split(':').length !== 2) {
	            throwError(
	                'Duo was given a bad token.  This might indicate a configuration ' +
	                'problem with one of Duo\'s client libraries.',
	                'https://www.duosecurity.com/docs/duoweb#first-steps'
	            );
	        }

	        var sigParts = sig.split(':');

	        // hang on to the token, and the parsed duo and app sigs
	        sigRequest = sig;
	        duoSig = sigParts[0];
	        appSig = sigParts[1];

	        return {
	            sigRequest: sig,
	            duoSig: sigParts[0],
	            appSig: sigParts[1]
	        };
	    }

	    /**
	     * This function is set up to run when the DOM is ready, if the iframe was
	     * not available during `init`.
	     */
	    function onDOMReady() {
	        iframe = document.getElementById(iframeId);

	        if (!iframe) {
	            throw new Error(
	                'This page does not contain an iframe for Duo to use.' +
	                'Add an element like <iframe id="duo_iframe"></iframe> ' +
	                'to this page.  ' +
	                'See https://www.duosecurity.com/docs/duoweb#3.-show-the-iframe ' +
	                'for more information.'
	            );
	        }

	        // we've got an iframe, away we go!
	        ready();

	        // always clean up after yourself
	        offReady(onDOMReady);
	    }

	    /**
	     * Validate that a MessageEvent came from the Duo service, and that it
	     * is a properly formatted payload.
	     *
	     * The Google Chrome sign-in page injects some JS into pages that also
	     * make use of postMessage, so we need to do additional validation above
	     * and beyond the origin.
	     *
	     * @param {MessageEvent} event Message received via postMessage
	     */
	    function isDuoMessage(event) {
	        return Boolean(
	            event.origin === ('https://' + host) &&
	            typeof event.data === 'string' &&
	            (
	                event.data.match(DUO_MESSAGE_FORMAT) ||
	                event.data.match(DUO_ERROR_FORMAT)
	            )
	        );
	    }

	    /**
	     * Validate the request token and prepare for the iframe to become ready.
	     *
	     * All options below can be passed into an options hash to `Duo.init`, or
	     * specified on the iframe using `data-` attributes.
	     *
	     * Options specified using the options hash will take precedence over
	     * `data-` attributes.
	     *
	     * Example using options hash:
	     * ```javascript
	     * Duo.init({
	     *     iframe: "some_other_id",
	     *     host: "api-main.duo.test",
	     *     sig_request: "...",
	     *     post_action: "/auth",
	     *     post_argument: "resp"
	     * });
	     * ```
	     *
	     * Example using `data-` attributes:
	     * ```
	     * <iframe id="duo_iframe"
	     *         data-host="api-main.duo.test"
	     *         data-sig-request="..."
	     *         data-post-action="/auth"
	     *         data-post-argument="resp"
	     *         >
	     * </iframe>
	     * ```
	     *
	     * @param {Object} options
	     * @param {String} options.iframe                         The iframe, or id of an iframe to set up
	     * @param {String} options.host                           Hostname
	     * @param {String} options.sig_request                    Request token
	     * @param {String} [options.post_action='']               URL to POST back to after successful auth
	     * @param {String} [options.post_argument='sig_response'] Parameter name to use for response token
	     */
	    function init(options) {
	        if (options) {
	            if (options.host) {
	                host = options.host;
	            }

	            if (options.sig_request) {
	                parseSigRequest(options.sig_request);
	            }

	            if (options.post_action) {
	                postAction = options.post_action;
	            }

	            if (options.post_argument) {
	                postArgument = options.post_argument;
	            }

	            if (options.iframe) {
	                if ('tagName' in options.iframe) {
	                    iframe = options.iframe;
	                } else if (typeof options.iframe === 'string') {
	                    iframeId = options.iframe;
	                }
	            }
	        }

	        // if we were given an iframe, no need to wait for the rest of the DOM
	        if (iframe) {
	            ready();
	        } else {
	            // try to find the iframe in the DOM
	            iframe = document.getElementById(iframeId);

	            // iframe is in the DOM, away we go!
	            if (iframe) {
	                ready();
	            } else {
	                // wait until the DOM is ready, then try again
	                onReady(onDOMReady);
	            }
	        }

	        // always clean up after yourself!
	        offReady(init);
	    }

	    /**
	     * This function is called when a message was received from another domain
	     * using the `postMessage` API.  Check that the event came from the Duo
	     * service domain, and that the message is a properly formatted payload,
	     * then perform the post back to the primary service.
	     *
	     * @param event Event object (contains origin and data)
	     */
	    function onReceivedMessage(event) {
	        if (isDuoMessage(event)) {
	            // the event came from duo, do the post back
	            doPostBack(event.data);

	            // always clean up after yourself!
	            offMessage(onReceivedMessage);
	        }
	    }

	    /**
	     * Point the iframe at Duo, then wait for it to postMessage back to us.
	     */
	    function ready() {
	        if (!host) {
	            host = getDataAttribute(iframe, 'host');

	            if (!host) {
	                throwError(
	                    'No API hostname is given for Duo to use.  Be sure to pass ' +
	                    'a `host` parameter to Duo.init, or through the `data-host` ' +
	                    'attribute on the iframe element.',
	                    'https://www.duosecurity.com/docs/duoweb#3.-show-the-iframe'
	                );
	            }
	        }

	        if (!duoSig || !appSig) {
	            parseSigRequest(getDataAttribute(iframe, 'sigRequest'));

	            if (!duoSig || !appSig) {
	                throwError(
	                    'No valid signed request is given.  Be sure to give the ' +
	                    '`sig_request` parameter to Duo.init, or use the ' +
	                    '`data-sig-request` attribute on the iframe element.',
	                    'https://www.duosecurity.com/docs/duoweb#3.-show-the-iframe'
	                );
	            }
	        }

	        // if postAction/Argument are defaults, see if they are specified
	        // as data attributes on the iframe
	        if (postAction === '') {
	            postAction = getDataAttribute(iframe, 'postAction') || postAction;
	        }

	        if (postArgument === 'sig_response') {
	            postArgument = getDataAttribute(iframe, 'postArgument') || postArgument;
	        }

	        // point the iframe at Duo
	        iframe.src = [
	            'https://', host, '/frame/web/v1/auth?tx=', duoSig,
	            '&parent=', document.location.href
	        ].join('');

	        // listen for the 'message' event
	        onMessage(onReceivedMessage);
	    }

	    /**
	     * We received a postMessage from Duo.  POST back to the primary service
	     * with the response token, and any additional user-supplied parameters
	     * given in form#duo_form.
	     */
	    // function doPostBack(response) {
	    //     // create a hidden input to contain the response token
	    //     var input = document.createElement('input');
	    //     input.type = 'hidden';
	    //     input.name = postArgument;
	    //     input.value = response + ':' + appSig;
	    //
	    //     // user may supply their own form with additional inputs
	    //     var form = document.getElementById('duo_form');
	    //
	    //     // if the form doesn't exist, create one
	    //     if (!form) {
	    //         form = document.createElement('form');
	    //
	    //         // insert the new form after the iframe
	    //         iframe.parentElement.insertBefore(form, iframe.nextSibling);
	    //     }
	    //
	    //     // make sure we are actually posting to the right place
	    //     form.method = 'POST';
	    //     form.action = postAction;
	    //
	    //     // add the response token input to the form
	    //     form.appendChild(input);
	    //
	    //     // away we go!
	    //     form.submit();
	    // }

	    // OKTA: Overriding their doPostBack logic because we want to submit this
	    // through ajax, not a postBack
	    function doPostBack(response) {
	        postAction(response + ':' + appSig);
	    }

	    // when the DOM is ready, initialize
	    // note that this will get cleaned up if the user calls init directly!
	    onReady(init);

	    return {
	        init: init,
	        _parseSigRequest: parseSigRequest,
	        _isDuoMessage: isDuoMessage
	    };

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(91)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums) {

	  var _ = Okta._;

	  return Okta.View.extend({
	    template: '\
	      <a href="#" class="link {{linkClassName}}" data-se="signout-link">\
	        {{linkText}}\
	      </a>\
	    ',
	    className: 'auth-footer clearfix',
	    events: {
	      'click a' : function (e) {
	        e.preventDefault();
	        var self = this;
	        this.model.doTransaction(function(transaction) {
	          return transaction.cancel();
	        })
	        .then(function() {
	          self.state.set('navigateDir', Enums.DIRECTION_BACK);
	          self.options.appState.trigger('navigate', '');
	        });
	      }
	    },
	    getTemplateData: function () {
	      return {
	        linkClassName: _.isUndefined(this.options.linkClassName) ? 'goto' : this.options.linkClassName,
	        linkText: this.options.linkText || Okta.loc('signout', 'login')
	      };
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint maxcomplexity:13, maxparams:11 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(50),
	  __webpack_require__(86),
	  __webpack_require__(112),
	  __webpack_require__(115),
	  __webpack_require__(116),
	  __webpack_require__(110),
	  __webpack_require__(117),
	  __webpack_require__(118),
	  __webpack_require__(119),
	  __webpack_require__(108)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Checkbox, BaseLoginController, CookieUtil, TOTPForm, YubikeyForm, SecurityQuestionForm, CallAndSMSForm,
	          PushForm, InlineTOTPForm, FooterSignout) {

	  return BaseLoginController.extend({
	    className: 'mfa-verify',

	    initialize: function (options) {
	      var factors = options.appState.get('factors');
	      var factorType = options.factorType;
	      var provider = options.provider;

	      var View;
	      switch (factorType) {
	      case 'question':
	        View = SecurityQuestionForm;
	        break;
	      case 'sms':
	      case 'call':
	        View = CallAndSMSForm;
	        break;
	      case 'token':
	      case 'token:software:totp':
	        View = TOTPForm;
	        break;
	      case 'token:hardware':
	        View = YubikeyForm;
	        break;
	      case 'push':
	        View = PushForm;
	        break;
	      default:
	        throw new Error('Unrecognized factor type');
	      }

	      this.model = factors.findWhere({ provider: provider, factorType: factorType });
	      if (!this.model) {
	        // TODO: recover from this more gracefully - probably to redirect
	        // to default factor
	        throw new Error('Unrecognized factor/provider');
	      }

	      this.addListeners();
	      this.add(new View(this.toJSON()));

	      // Okta Push is different from the other factors - it has a backup
	      // totp factor that can be chosen with the InlineTOTPForm
	      if (factorType === 'push' && this.model.get('isOktaFactor')) {
	        this.add(InlineTOTPForm, {
	          options: { model: this.model.get('backupFactor') }
	        });

	        if (this.settings.get('features.autoPush')) {
	          this.add(Checkbox, {
	            options: {
	              model: this.model,
	              name: 'autoPush',
	              placeholder: Okta.loc('autoPush', 'login'),
	              label: false,
	              'label-top': false,
	              className: 'margin-btm-0'
	            }
	          });
	        }

	        // Remember Device checkbox resides outside of the Push and TOTP forms.
	        if (this.options.appState.get('allowRememberDevice')) {
	          this.add(Checkbox, {
	            options: {
	              model: this.model,
	              name: 'rememberDevice',
	              placeholder: this.options.appState.get('rememberDeviceLabel'),
	              label: false,
	              'label-top': true,
	              className: 'margin-btm-0'
	            }
	          });
	        }
	        // Set the rememberDevice on the TOTP factor since it is stored as backupFactor.
	        this.listenTo(this.model, 'change:rememberDevice', function (model, rememberDevice) {
	          model.get('backupFactor').set('rememberDevice', rememberDevice);
	        });
	      }

	      if (!this.settings.get('features.hideSignOutLinkInMFA')) {
	        this.add(new FooterSignout(this.toJSON()));
	      }
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaChallenge') ||
	          this.options.appState.get('isMfaRequired')) {
	        return true;
	      }
	      // update auto push cookie after user accepts Okta Verify MFA
	      if (this.options.factorType == 'push') {
	        if (this.settings.get('features.autoPush') && this.model.get('autoPush')) {
	          CookieUtil.setAutoPushCookie(this.options.appState.get('userId'));
	        } else {
	          CookieUtil.removeAutoPushCookie(this.options.appState.get('userId'));
	        }
	      }
	      return false;
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(111)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, PasswordBox) {

	  var _ = Okta._;

	  return Okta.Form.extend({
	    className: 'mfa-verify-question',
	    autoSave: true,
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	    scrollOnError: false,
	    layout: 'o-form-theme',
	    attributes: { 'data-se': 'factor-question' },

	    initialize: function () {
	      this.title = this.model.get('factorLabel');

	      this.addInput({
	        label: this.model.get('securityQuestion'),
	        'label-top': true,
	        placeholder: Okta.loc('mfa.challenge.answer.placeholder', 'login'),
	        className: 'auth-passcode',
	        name: 'answer',
	        type: 'password',
	        input: PasswordBox
	      });

	      if (this.options.appState.get('allowRememberDevice')) {
	        this.addInput({
	          label: false,
	          'label-top': true,
	          placeholder: this.options.appState.get('rememberDeviceLabel'),
	          className: 'margin-btm-0',
	          name: 'rememberDevice',
	          type: 'checkbox'
	        });
	      }
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(20),
	    __webpack_require__(95)
	  ], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox) {

	    return TextBox.extend({
	      template: Okta.tpl('\
	        <input type="password" placeholder="{{placeholder}}" name="{{name}}" id="{{inputId}}" value="{{value}}"/>\
	        <span class="password-toggle">\
	          <span class="button button-dark button-show">\
	            {{i18n code="mfa.challenge.answer.showAnswer" bundle="login"}}</span>\
	          <span class="button button-hide">{{i18n code="mfa.challenge.answer.hideAnswer" bundle="login"}}</span>\
	        </span>'),

	      initialize: function () {
	        this.events['click .password-toggle .button-show'] = '_showPassword';
	        this.events['click .password-toggle .button-hide'] = '_hidePassword';

	        this.delegateEvents();
	      },

	      changeType: function (type) {
	        TextBox.prototype.changeType.apply(this, arguments);
	        this.$('.password-toggle').toggleClass('password-toggle-on', type !== 'password');
	      },

	      _showPassword: function () {
	        this.changeType('text');
	      },

	      _hidePassword: function () {
	        this.changeType('password');
	      }

	    });

	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(113), __webpack_require__(114)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, CryptoUtil) {

	  var $ = Okta.$;
	  var LAST_USERNAME_COOKIE_NAME = 'ln';
	  var AUTO_PUSH_COOKIE_PREFIX  = 'auto_push_';
	  var DAYS_SAVE_REMEMBER = 365;

	  function removeCookie (name) {
	    $.removeCookie(name, { path: '/' });
	  }

	  function setCookie (name, value) {
	    $.cookie(name, value, {
	      expires: DAYS_SAVE_REMEMBER,
	      path: '/'
	    });
	  }

	  function getAutoPushKey(userId) {
	    return AUTO_PUSH_COOKIE_PREFIX + CryptoUtil.getStringHash(userId);
	  }

	  var fn = {};

	  fn.getCookieUsername = function () {
	    return $.cookie(LAST_USERNAME_COOKIE_NAME);
	  };

	  fn.setUsernameCookie = function (username) {
	    setCookie(LAST_USERNAME_COOKIE_NAME, username);
	  };

	  fn.removeUsernameCookie = function () {
	    removeCookie(LAST_USERNAME_COOKIE_NAME);
	  };

	  fn.isAutoPushEnabled = function (userId) {
	    if (userId === undefined) {
	      return false;
	    }
	    return $.cookie(getAutoPushKey(userId)) === 'true';
	  };

	  fn.setAutoPushCookie = function (userId) {
	    if (userId === undefined) {
	      return;
	    }
	    setCookie(getAutoPushKey(userId), true);
	  };

	  fn.removeAutoPushCookie = function (userId) {
	    if (userId === undefined) {
	      return;
	    }
	    removeCookie(getAutoPushKey(userId));
	  };

	  return fn;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	  var fn = {};
	  
	   // Light weight hashing algorithm that hashes string into an integer between 0 and 4294967295
	   // Not recommended for data set of size greater than 10000
	   // https://www.npmjs.com/package/string-hash
	  fn.getStringHash = function (str) {
	    var hash = 5381,
	        i = str.length;
	    while(i) {
	      hash = (hash * 33) ^ str.charCodeAt(--i);
	    }
	    return hash >>> 0;
	  };
	  
	  return fn;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 114 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_114__;

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(95)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox) {

	  var _ = Okta._;

	  return Okta.Form.extend({
	    className: 'mfa-verify-totp',
	    autoSave: true,
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	    scrollOnError: false,
	    layout: 'o-form-theme',
	    attributes: { 'data-se': 'factor-totp' },

	    initialize: function () {
	      var factorName = this.model.get('factorLabel');
	      var maskPasswordField = this.model.get('provider') === 'RSA' || this.model.get('provider') === 'DEL_OATH';

	      this.title = factorName;
	      this.subtitle = Okta.loc('mfa.challenge.title', 'login', [factorName]);

	      this.addInput({
	        label: false,
	        'label-top': true,
	        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	        className: 'o-form-fieldset o-form-label-top auth-passcode',
	        name: 'answer',
	        input: TextBox,
	        type: maskPasswordField ? 'password' : 'text'
	      });

	      if (this.options.appState.get('allowRememberDevice')) {
	        this.addInput({
	          label: false,
	          'label-top': true,
	          placeholder: this.options.appState.get('rememberDeviceLabel'),
	          className: 'margin-btm-0',
	          name: 'rememberDevice',
	          type: 'checkbox'
	        });
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(95)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox) {

	  var _ = Okta._;

	  return Okta.Form.extend({
	    className: 'mfa-verify-yubikey',
	    autoSave: true,
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	    scrollOnError: false,
	    layout: 'o-form-theme',
	    attributes: { 'data-se': 'factor-yubikey' },

	    initialize: function () {
	      var factorName = this.model.get('factorLabel');

	      this.title = factorName;
	      this.subtitle = Okta.loc('factor.totpHard.yubikey.description', 'login');

	      this.addInput({
	        label: false,
	        'label-top': true,
	        className: 'o-form-fieldset o-form-label-top auth-passcode',
	        name: 'answer',
	        input: TextBox,
	        type: 'password',
	        placeholder: Okta.loc('factor.totpHard.yubikey.placeholder','login')
	      });

	      if (this.options.appState.get('allowRememberDevice')) {
	        this.addInput({
	          label: false,
	          'label-top': true,
	          className: 'margin-btm-0',
	          placeholder: this.options.appState.get('rememberDeviceLabel'),
	          name: 'rememberDevice',
	          type: 'checkbox'
	        });
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(9), __webpack_require__(95)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, TextBox) {

	  var subtitleTpl = Okta.Handlebars.compile('({{phoneNumber}})');
	  var _ = Okta._;
	  var API_RATE_LIMIT = 30000; //milliseconds

	  function isCallFactor(factorType) {
	    return factorType === 'call';
	  }

	  return Okta.Form.extend({
	    className: 'mfa-verify-sms-call',
	    autoSave: true,
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	    scrollOnError: false,
	    layout: 'o-form-theme',

	    disableSubmitButton: function () {
	      return this.model.appState.get('isMfaChallenge');
	    },

	    initialize: function () {
	      /*jshint maxcomplexity:7*/
	      var self = this;
	      this.title = this.model.get('factorLabel');

	      var factorType = this.model.get('factorType');
	      var isCall = isCallFactor(factorType);
	      this.$el.attr('data-se', 'factor-' + factorType);
	      var buttonDataSe = isCall ? 'make-call' : 'sms-send-code';
	      var buttonClassName = isCall ? 'call-request-button' : 'sms-request-button';

	      var formSubmit = Okta.loc(isCall ? 'mfa.call' : 'mfa.sendCode', 'login');
	      var formRetry = Okta.loc(isCall ? 'mfa.redial' : 'mfa.resendCode', 'login');
	      var formSubmitted = Okta.loc(isCall ? 'mfa.calling' : 'mfa.sent', 'login');

	      this.subtitle = subtitleTpl({
	        phoneNumber: this.model.get('phoneNumber')
	      });
	      this.listenTo(this.model, 'error', function () {
	        this.clearErrors();
	      });
	      this.add(Okta.createButton({
	        attributes: { 'data-se': buttonDataSe },
	        className: 'button ' + buttonClassName,
	        title: formSubmit,
	        click: function () {
	          self.clearErrors();
	          // To send an OTP to the device, make the same request but use
	          // an empty passCode
	          this.model.set('answer', '');
	          this.model.save()
	          .then(_.bind(function () {
	            this.options.title = formSubmitted;
	            this.disable();
	            this.render();
	            // render and focus on the passcode input field.
	            self.getInputs().first().render().focus();
	            return Q.delay(API_RATE_LIMIT);
	          }, this))
	          .then(_.bind(function () {
	            this.options.title = formRetry;
	            this.enable();
	            this.render();
	          }, this));
	        }
	      }));
	      this.addInput({
	        label: false,
	        'label-top': true,
	        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	        className: 'o-form-fieldset o-form-label-top auth-passcode',
	        name: 'answer',
	        input: TextBox,
	        type: 'text'
	      });
	      if (this.options.appState.get('allowRememberDevice')) {
	        this.addInput({
	          label: false,
	          'label-top': true,
	          placeholder: this.options.appState.get('rememberDeviceLabel'),
	          className: 'margin-btm-0',
	          name: 'rememberDevice',
	          type: 'checkbox'
	        });
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(112)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, CookieUtil) {

	  var _ = Okta._;
	  // deviceName is escaped on BaseForm (see BaseForm's template)
	  var titleTpl = Okta.Handlebars.compile('{{factorName}} ({{{deviceName}}})');

	  return Okta.Form.extend({
	    className: 'mfa-verify-push',
	    autoSave: true,
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'oktaverify.send', 'login'),
	    scrollOnError: false,
	    layout: 'o-form-theme',
	    attributes: { 'data-se': 'factor-push' },
	    events: {
	      submit: 'submit'
	    },

	    initialize: function () {
	      this.enabled = true;
	      this.listenTo(this.options.appState, 'change:isMfaRejectedByUser',
	        function (state, isMfaRejectedByUser) {
	          this.setSubmitState(isMfaRejectedByUser);
	          if (isMfaRejectedByUser) {
	            this.showError(Okta.loc('oktaverify.rejected', 'login'));
	          }
	        }
	      );
	      this.listenTo(this.options.appState, 'change:isMfaTimeout',
	        function (state, isMfaTimeout) {
	          this.setSubmitState(isMfaTimeout);
	          if (isMfaTimeout) {
	            this.showError(Okta.loc('oktaverify.timeout', 'login'));
	          }
	        }
	      );
	      this.listenTo(this.options.appState, 'change:isMfaRequired',
	        function (state, isMfaRequired) {
	          if (isMfaRequired) {
	            this.clearErrors();
	          }
	        }
	      );
	      this.title = titleTpl({
	        factorName: this.model.get('factorLabel'),
	        deviceName: this.model.get('deviceName')
	      });
	    },
	    setSubmitState: function (ableToSubmit) {
	      var button = this.$el.find('.button');
	      this.enabled = ableToSubmit;
	      if (ableToSubmit) {
	        button.removeClass('link-button-disabled');
	        button.prop('value', Okta.loc('oktaverify.send', 'login'));
	      } else {
	        button.addClass('link-button-disabled');
	        button.prop('value', Okta.loc('oktaverify.sent', 'login'));
	      }
	    },
	    submit: function (e) {
	      if (e !== undefined) {
	        e.preventDefault();
	      }
	      if (this.enabled) {
	        this.setSubmitState(false);
	        this.doSave();
	      }
	    },
	    postRender: function() {
	      if (this.settings.get('features.autoPush') && CookieUtil.isAutoPushEnabled(this.options.appState.get('userId'))) {
	        this.model.set('autoPush', true);
	        // bind after $el has been rendered, and trigger push once DOM is fully loaded
	        _.defer(_.bind(this.submit, this));
	      }
	    },
	    doSave: function () {
	      this.clearErrors();
	      if (this.model.isValid()) {
	        this.listenToOnce(this.model, 'error', this.setSubmitState, true);
	        this.trigger('save', this.model);
	      }
	    },
	    showError: function (msg) {
	      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
	    }
	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(95)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox) {

	  function addInlineTotp(form) {
	    form.addDivider();
	    form.addInput({
	      label: false,
	      'label-top': true,
	      placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	      className: 'o-form-fieldset o-form-label-top inline-input auth-passcode',
	      name: 'answer',
	      input: TextBox,
	      type: 'text'
	    });
	    form.add(Okta.createButton({
	      attributes: { 'data-se': 'inline-totp-verify' },
	      className: 'button inline-totp-verify',
	      title: Okta.loc('mfa.challenge.verify', 'login'),
	      click: function () {
	        form.model.manageTransaction(function (transaction, setTransaction) {
	          // This is the case where we enter the TOTP code and verify while there is an
	          // active Push request (or polling) running. We need to invoke previous() on authClient
	          // and then call model.save(). If not, we would still be in MFA_CHALLENGE state and
	          // verify would result in a wrong request (push verify instead of a TOTP verify).
	          if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
	            return transaction.prev().then(function (trans) {
	              setTransaction(trans);
	              form.model.save();
	            });
	          } else {
	            // Push is not active and we enter the code to verify.
	            form.model.save();
	          }
	        });
	      }
	    }));
	    form.at(1).focus();
	  }

	  return Okta.Form.extend({
	    autoSave: true,
	    noButtonBar: true,
	    scrollOnError: false,
	    layout: 'o-form-theme',

	    className: 'mfa-verify-totp-inline',

	    attributes: { 'data-se': 'factor-inline-totp' },

	    initialize: function () {
	      var form = this;
	      this.listenTo(this.model, 'error', function () {
	        this.clearErrors();
	      });
	      this.add(Okta.createButton({
	        className: 'link',
	        attributes: { 'data-se': 'inline-totp-add' },
	        title: Okta.loc('mfa.challenge.orEnterCode', 'login'),
	        click: function () {
	          this.remove();
	          addInlineTotp(form);
	        }
	      }));
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(121),
	  __webpack_require__(122),
	  __webpack_require__(108),
	  __webpack_require__(123)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, webauthn, Spinner, FooterSignout, HtmlErrorMessageView) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'mfa-verify verify-windows-hello',
	    Model: {
	      local: {
	        __autoTriggered__: 'boolean'
	      },

	      save: function () {
	        if (!webauthn.isAvailable()) {
	          return;
	        }

	        this.trigger('request');
	        var model = this;

	        return this.doTransaction(function (transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'webauthn',
	            provider: 'FIDO'
	          });

	          return factor.verify()
	          .then(function (verifyData) {
	            var factorData = verifyData.factor;

	            return webauthn.getAssertion(
	              factorData.challenge.nonce,
	              [{ id: factorData.profile.credentialId }]
	            )
	            .then(function (assertion) {
	              return factor.verify({
	                authenticatorData: assertion.authenticatorData,
	                clientData: assertion.clientData,
	                signatureData: assertion.signature
	              });
	            })
	            .then(function (data) {
	              model.trigger('sync');
	              model.trigger('signIn');
	              return data;
	            })
	            .fail(function (error) {
	              switch (error.message) {
	              case 'AbortError':
	              case 'NotFoundError':
	              case 'NotSupportedError':
	                model.trigger('abort', error.message);
	                return transaction;
	              }

	              throw error;
	            });
	          });
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      hasSavingState: false,
	      title: _.partial(Okta.loc, 'factor.windowsHello', 'login'),
	      subtitle: function () {
	        return webauthn.isAvailable() ? Okta.loc('verify.windowsHello.subtitle', 'login') : '';
	      },
	      save: _.partial(Okta.loc, 'verify.windowsHello.save', 'login'),

	      customSavingState:{
	        stop: 'abort'
	      },

	      modelEvents: function () {
	        if (!webauthn.isAvailable()) {
	          return {};
	        }

	        return {
	          'request': '_startEnrollment',
	          'error': '_stopEnrollment',
	          'abort': '_stopEnrollment',
	          'signIn': '_successEnrollment'
	        };
	      },

	      noButtonBar: function () {
	        return !webauthn.isAvailable();
	      },

	      formChildren: function () {
	        var result = [];
	        if (!webauthn.isAvailable()) {
	          result.push(
	            FormType.View(
	              { View: new HtmlErrorMessageView(
	                { message: Okta.loc('enroll.windowsHello.error.notWindows', 'login') })},
	              { selector: '.o-form-error-container' }
	            )
	          );
	        }

	        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));

	        return result;
	      },

	      postRender: function () {
	        if (this.options.appState.get('factors').length === 1 && !this.model.get('__autoTriggered__')) {
	          this.model.set('__autoTriggered__', true);
	          this.model.save();
	        }
	      },

	      _startEnrollment: function () {
	        this.subtitle = Okta.loc('verify.windowsHello.subtitle.loading', 'login');

	        this.model.trigger('spinner:show');
	        this._resetErrorMessage();

	        this.render();
	        this.$('.o-form-button-bar').addClass('hide');
	      },


	      _stopEnrollment: function (errorMessage) {
	        this.subtitle = Okta.loc('verify.windowsHello.subtitle', 'login');

	        this.model.trigger('spinner:hide');
	        this.$('.o-form-button-bar').removeClass('hide');

	        var message;
	        switch (errorMessage) {
	        case 'NotFoundError':
	          message = this.options.appState.get('factors').length > 1 ?
	            Okta.loc('verify.windowsHello.error.notFound.selectAnother', 'login') :
	            Okta.loc('verify.windowsHello.error.notFound', 'login');
	          break;

	        case 'NotSupportedError':
	          message = Okta.loc('enroll.windowsHello.error.notConfiguredHtml', 'login');
	          break;
	        }

	        this._resetErrorMessage();

	        if (message) {
	          var messageView = new HtmlErrorMessageView({
	            message: message
	          });

	          this.$('.o-form-error-container').addClass('o-form-has-errors');
	          this.add(messageView, {selector: '.o-form-error-container'});
	          this._errorMessageView = this.last();
	        }

	        this.render();
	      },

	      _successEnrollment: function () {
	        this.subtitle = Okta.loc('verify.windowsHello.subtitle.signingIn', 'login');
	        this.render();
	        this.$('.o-form-button-bar').addClass('hide');
	      },

	      _resetErrorMessage: function () {
	        this._errorMessageView && this._errorMessageView.remove();
	        this._errorMessageView = undefined;
	        this.clearErrors();
	      }
	    },

	    Footer: FooterSignout
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* globals JSON */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(20),
	    __webpack_require__(9)
	  ], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q) {

	  function adaptToOkta(promise) {
	    return new Q(promise);
	  }

	  function makeCredential(accountInfo, cryptoParams, challenge) {
	    cryptoParams = cryptoParams.map(function (param) {
	      return {type: 'FIDO_2_0', algorithm: param.algorithm};
	    });

	    var promise = window.msCredentials.makeCredential(accountInfo, cryptoParams, challenge)
	    .then(function (cred) {
	      return Object.freeze({
	        credential: {id: cred.id},
	        publicKey: JSON.parse(cred.publicKey),
	        attestation: cred.attestation
	      });
	    });

	    return adaptToOkta(promise);
	  }

	  function getAssertion(challenge, allowList) {
	    var accept = allowList.map(function (item) {
	      return {type: 'FIDO_2_0', id: item.id};
	    });
	    var filters = {accept: accept};

	    var promise = window.msCredentials.getAssertion(challenge, filters)
	    .then(function (attestation) {
	      var signature = attestation.signature;
	      return Object.freeze({
	        credential: {id: attestation.id},
	        clientData: signature.clientData,
	        authenticatorData: signature.authnrData,
	        signature: signature.signature
	      });
	    });

	    return adaptToOkta(promise);
	  }

	  return {
	    makeCredential: makeCredential,
	    getAssertion: getAssertion,
	    isAvailable: function () {
	      return window.hasOwnProperty('msCredentials');
	    }
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  return Okta.View.extend({
	    className: 'okta-waiting-spinner',
	    attributes: {
	      'data-se': 'o-form-okta-waiting-spinner'
	    },
	    modelEvents: {
	      'spinner:show': 'show',
	      'spinner:hide': 'hide'
	    },

	    initialize: function (options) {
	      if(options && options.visible === false){
	        this.hide();
	      }
	    },

	    show: function () {
	      this.$el.removeClass('hide');
	    },

	    hide: function () {
	      this.$el.addClass('hide');
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(20),
	    __webpack_require__(27)
	  ], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, BaseView) {

	    // Have to be unescaped for the html in enroll.windowsHello.error.notConfiguredHtml
	    var template = '\
	      <span class="icon error-24"></span>\
	      <h4><strong>{{{message}}}</strong></h4>\
	    ';

	    return BaseView.extend({
	      template: template,
	      className: 'okta-infobox-error infobox infobox-error infobox-md margin-btm-25',
	      attributes: {
	        'data-se': 'o-form-error-html'
	      },

	      message: '',

	      initialize: function (options) {
	        if (options && options.message) {
	          this.message = options.message;
	        }
	      },

	      getTemplateData: function () {
	        return {
	          message: this.message
	        };
	      }
	    });
	  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* global u2f */
	/* jshint maxcomplexity:9 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(108),
	  __webpack_require__(9),
	  __webpack_require__(123),
	  __webpack_require__(14),
	  __webpack_require__(125)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, FooterSignout, Q, HtmlErrorMessageView, BrowserFeatures) {

	  var _ = Okta._;

	  function getErrorMessageKeyByCode(errorCode, isOneFactor) {
	    switch (errorCode){
	    case 1: // OTHER_ERROR
	      return isOneFactor ? 'u2f.error.other.oneFactor' : 'u2f.error.other';
	    case 2: // BAD_REQUEST
	    case 3: // CONFIGURATION_UNSUPPORTED
	      return isOneFactor ? 'u2f.error.badRequest.oneFactor' : 'u2f.error.badRequest';
	    case 4: // DEVICE_INELIGIBLE
	      return isOneFactor ? 'u2f.error.unsupported.oneFactor' : 'u2f.error.unsupported';
	    case 5: // TIMEOUT
	      return 'u2f.error.timeout';
	    }
	  }

	  return FormController.extend({
	    className: 'verify-u2f',
	    Model: {
	      save: function () {
	        this.trigger('request');

	        return this.doTransaction(function (transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'u2f',
	            provider: 'FIDO'
	          });
	          var self = this;
	          return factor.verify()
	          .then(function (transaction) {
	            var factorData = transaction.factor;
	            var appId = factorData.profile.appId;
	            var registeredKeys = [{version: factorData.profile.version, keyHandle: factorData.profile.credentialId }];
	            self.trigger('request');

	            var deferred = Q.defer();
	            u2f.sign(appId, factorData.challenge.nonce, registeredKeys, function (data) {
	              self.trigger('errors:clear');
	              if (data.errorCode && data.errorCode !== 0) {
	                var isOneFactor = self.options.appState.get('factors').length === 1;
	                deferred.reject({xhr: {responseJSON:
	                  {errorSummary: Okta.loc(getErrorMessageKeyByCode(data.errorCode, isOneFactor), 'login')}}});
	              } else {
	                return factor.verify({
	                  clientData: data.clientData,
	                  signatureData: data.signatureData
	                })
	                .then(deferred.resolve);
	              }
	            });
	            return deferred.promise;
	          });
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      hasSavingState: false,
	      title: _.partial(Okta.loc, 'factor.u2f', 'login'),
	      className: 'verify-u2f-form',
	      noCancelButton: true,
	      save: _.partial(Okta.loc, 'verify.u2f.retry', 'login'),
	      noButtonBar: function () {
	        return !window.hasOwnProperty('u2f');
	      },
	      modelEvents: {
	        'request': '_startEnrollment',
	        'error': '_stopEnrollment'
	      },

	      formChildren: function () {
	        var result = [];

	        if (!window.hasOwnProperty('u2f')) {
	          var errorMessageKey = 'u2f.error.notSupportedBrowser';

	          if (BrowserFeatures.isFirefox()) {
	            errorMessageKey = 'u2f.error.noFirefoxExtension';
	          }
	          else if (this.options.appState.get('factors').length === 1) {
	            errorMessageKey = 'u2f.error.notSupportedBrowser.oneFactor';
	          }

	          result.push(FormType.View(
	            {View: new HtmlErrorMessageView({message: Okta.loc(errorMessageKey, 'login')})},
	            {selector: '.o-form-error-container'}
	          ));
	        }
	        else {
	          result.push(FormType.View({
	            View: '\
	            <div class="u2f-verify-text">\
	              <p>{{i18n code="verify.u2f.instructions" bundle="login"}}</p>\
	              <p>{{i18n code="verify.u2f.instructionsBluetooth" bundle="login"}}</p>\
	              <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
	            </div>'
	          }));
	        }

	        return result;
	      },

	      postRender: function () {
	        _.defer(_.bind(function () {
	          if (window.hasOwnProperty('u2f')) {
	            this.model.save();
	          }
	          else {
	            this.$('[data-se="u2f-waiting"]').addClass('hide');
	          }
	        }, this));
	      },

	      _startEnrollment: function () {
	        this.$('.okta-waiting-spinner').removeClass('hide');
	        this.$('.o-form-button-bar').hide();
	      },

	      _stopEnrollment: function () {
	        this.$('.okta-waiting-spinner').addClass('hide');
	        this.$('.o-form-button-bar').show();
	      }
	    },

	    Footer: FooterSignout
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 125 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_125__;

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint maxcomplexity:9*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(91),
	  __webpack_require__(88),
	  __webpack_require__(78),
	  __webpack_require__(127),
	  __webpack_require__(128)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, Enums, RouterUtil, Toolbar, FactorList,
	          RequiredFactorList) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-choices',
	    state: {
	      pageType: null
	    },

	    Model: {},

	    Form: {
	      noCancelButton: true,

	      title: _.partial(Okta.loc, 'enroll.choices.title', 'login'),

	      noButtonBar: function () {
	        return this.state.get('pageType') === Enums.ALL_OPTIONAL_NONE_ENROLLED;
	      },

	      subtitle: function () {
	        switch (this.state.get('pageType')) {
	        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
	        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
	          return Okta.loc('enroll.choices.optional', 'login');
	        default:
	          return Okta.loc('enroll.choices.description', 'login');
	        }
	      },

	      save: function () {
	        switch (this.state.get('pageType')) {
	        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
	        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
	          return Okta.loc('enroll.choices.submit.finish', 'login');
	        case Enums.HAS_REQUIRED_NONE_ENROLLED:
	          return Okta.loc('enroll.choices.submit.configure', 'login');
	        case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
	          return Okta.loc('enroll.choices.submit.next', 'login');
	        default:
	          return '';
	        }
	      },

	      initialize: function (options) {
	        this.listenTo(this, 'save', function () {
	          var current;
	          switch (this.state.get('pageType')) {
	          case Enums.HAS_REQUIRED_NONE_ENROLLED:
	          case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
	            current = options.appState.get('factors').getFirstUnenrolledRequiredFactor();
	            options.appState.trigger('navigate', RouterUtil.createEnrollFactorUrl(
	              current.get('provider'),
	              current.get('factorType')
	            ));
	            break;
	          default:
	            return this.model.doTransaction(function(transaction) {
	              return transaction.skip();
	            });
	          }
	        });
	      },

	      preRender: function () {
	        var factors = this.options.appState.get('factors');
	        switch(this.state.get('pageType')) {
	        case Enums.HAS_REQUIRED_NONE_ENROLLED:
	        case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
	          this.add(new RequiredFactorList({
	            minimize: true,
	            collection: new Okta.Collection(factors.where({ required: true })),
	            appState: this.options.appState
	          }));
	          break;
	        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
	        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
	        case Enums.ALL_OPTIONAL_NONE_ENROLLED:
	          var enrolled = factors.where({ enrolled: true }),
	              notEnrolled = factors.where({ enrolled: false }),
	              notEnrolledListTitle;
	          if (enrolled.length > 0) {
	            notEnrolledListTitle = Okta.loc('enroll.choices.list.optional', 'login');
	            this.add(new FactorList({
	              listTitle: Okta.loc('enroll.choices.list.enrolled', 'login'),
	              minimize: true,
	              collection: new Okta.Collection(enrolled),
	              appState: this.options.appState
	            }));
	          }
	          this.add(new FactorList({
	            listTitle: notEnrolledListTitle,
	            collection: new Okta.Collection(notEnrolled),
	            appState: this.options.appState
	          }));
	          break;
	        }
	      }

	    },

	    initialize: function (options) {
	      var numRequiredEnrolled = 0,
	          numRequiredNotEnrolled = 0,
	          numOptionalEnrolled = 0,
	          numOptionalNotEnrolled = 0,
	          hasRequired,
	          pageType;

	      options.appState.get('factors').each(function (factor) {
	        var required = factor.get('required'),
	            enrolled = factor.get('enrolled');
	        if (required && enrolled) {
	          numRequiredEnrolled++;
	        }
	        else if (required && !enrolled) {
	          numRequiredNotEnrolled++;
	        }
	        else if (!required && enrolled) {
	          numOptionalEnrolled++;
	        }
	        else if (!required && !enrolled) {
	          numOptionalNotEnrolled++;
	        }
	      });

	      hasRequired = numRequiredEnrolled > 0 || numRequiredNotEnrolled > 0;

	      // There are 5 possible states this screen can be in:

	      // 1. Has required, but none have been enrolled. Wizard start page.
	      if (hasRequired && numRequiredEnrolled === 0) {
	        pageType = Enums.HAS_REQUIRED_NONE_ENROLLED;
	      }

	      // 2. Has required, and have enrolled at least one. The page layout
	      //    to configure the remaining required factors.
	      else if (hasRequired && numRequiredNotEnrolled > 0) {
	        pageType = Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED;
	      }

	      // 3. Has required, and finished enrolling all required factors. The
	      //    page layout you see to configure any optional factors or skip.
	      else if (hasRequired && numOptionalNotEnrolled > 0) {
	        pageType = Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED;
	      }

	      // 4. Factors are all optional, no factors enrolled.
	      else if (numOptionalEnrolled === 0 && numOptionalNotEnrolled > 0) {
	        pageType = Enums.ALL_OPTIONAL_NONE_ENROLLED;
	      }

	      // 5. Factors are all optional, some factors have already been
	      //    enrolled (can either enroll more or skip).
	      else if (numOptionalNotEnrolled > 0) {
	        pageType = Enums.ALL_OPTIONAL_SOME_ENROLLED;
	      }

	      // 6. Factors are all optional, all factors have already been
	      //    enrolled, among them there is OktaVerify with Push enrolled as totp
	      //    (API return OktaVerify push factor as unenrolled in this case and as we always merge
	      //    push and totp in UI so we redirect to skip link here).
	      else {
	        this.model.doTransaction(function(transaction) {
	          return transaction.skip();
	        });
	      }

	      this.state.set('pageType', pageType);
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(88)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, RouterUtil) {

	  var _ = Okta._;

	  var FactorRow = Okta.View.extend({
	    className: 'enroll-factor-row clearfix',

	    template: '\
	      <div class="enroll-factor-icon-container">\
	        <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
	        </div>\
	      </div>\
	      <div class="enroll-factor-description">\
	        <h3 class="enroll-factor-label">{{factorLabel}}</h3>\
	        {{#if factorDescription}}\
	          <p>{{factorDescription}}</p>\
	        {{/if}}\
	        <div class="enroll-factor-button"></div>\
	      </div>\
	    ',

	    attributes: function () {
	      return { 'data-se': this.model.get('factorName') };
	    },

	    children: function () {
	      if (this.model.get('enrolled')) {
	        return [['<span class="icon success-16-green"></span>', '.enroll-factor-label']];
	      }
	      else if (this.model.get('enrollment') === 'REQUIRED') {
	        return [['<span class="icon success-16-gray"></span>', '.enroll-factor-label']];
	      }

	      return [[Okta.createButton({
	        className: 'button',
	        title: Okta.loc('enroll.choices.setup', 'login'),
	        click: function () {
	          this.options.appState.trigger('navigate', RouterUtil.createEnrollFactorUrl(
	            this.model.get('provider'),
	            this.model.get('factorType')
	          ));
	        }
	      }), '.enroll-factor-button']];
	    },

	    minimize: function () {
	      this.$el.addClass('enroll-factor-row-min');
	    },

	    maximize: function () {
	      this.$el.removeClass('enroll-factor-row-min');
	    }
	  });

	  return Okta.ListView.extend({

	    className: 'enroll-factor-list',

	    item: FactorRow,

	    itemSelector: '.list-content',

	    template: '\
	      {{#if listSubtitle}}\
	        <div class="list-subtitle">{{listSubtitle}}</div>\
	      {{/if}}\
	      {{#if listTitle}}\
	        <div class="list-title">{{listTitle}}</div>\
	      {{/if}}\
	      <div class="list-content"></div>\
	    ',

	    getTemplateData: function () {
	      var json = Okta.ListView.prototype.getTemplateData.call(this);
	      _.extend(json, this);
	      return json;
	    },

	    postRender: function () {
	      if (this.options.minimize) {
	        this.invoke('minimize');
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(127)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorList) {

	  var _ = Okta._;

	  return FactorList.extend({

	    listTitle: _.partial(Okta.loc, 'enroll.choices.list.setup', 'login'),

	    className: function () {
	      return FactorList.prototype.className + ' enroll-required-factor-list';
	    },

	    initialize: function () {
	      var numRequired = this.collection.length,
	          numCompleted = this.collection.where({ enrolled: true }).length,
	          currentStep = numCompleted + 1;
	      this.listSubtitle = Okta.loc('enroll.choices.step', 'login', [currentStep, numRequired]);
	    },

	    postRender: function () {
	      var currentModel, currentRow;
	      FactorList.prototype.postRender.apply(this, arguments);
	      currentModel = this.options.appState.get('factors').getFirstUnenrolledRequiredFactor();
	      currentRow = this.find(function (view) {
	        return view.model === currentModel;
	      });
	      currentRow.maximize();
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint camelcase:false, newcap:false */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(107),
	  __webpack_require__(9),
	  __webpack_require__(84),
	  __webpack_require__(130)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Duo, Q, FormController, Footer) {

	  var $ = Okta.$,
	      _ = Okta._;

	  return FormController.extend({

	    className: 'enroll-duo duo-form',

	    Model: {
	      props: {
	        host: 'string',
	        signature: 'string',
	        postAction: 'string',
	        factorId: 'string',
	        stateToken: 'string'
	      },

	      getInitOptions: function () {
	        return this.doTransaction(function (transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'web',
	            provider: 'DUO'
	          });
	          return factor.enroll();
	        });
	      },

	      activate: function (signedResponse) {
	        // Note: We should be doing this in OktaAuth! Fix when it's updated.
	        var url = this.get('postAction'),
	            factorId = this.get('factorId'),
	            self = this,
	            data = {
	              id: factorId,
	              stateToken: this.get('stateToken'),
	              sig_response: signedResponse
	            };
	        // We don't actually use authClient.post() here (unlike all the other cases in the
	        // sign-in widget) since the endpoint is wired to accept serialized form post instead
	        // of a JSON post ($.post() is different from authClient.post() in that in $.post(),
	        // jquery decides the Content-Type instead of it being a JSON type). Enroll/Verify DUO
	        // are the only two places where we actually do this.
	        // NOTE - If we ever decide to change this, we should test this very carefully.
	        return Q($.post(url, data))
	        .then(function () {
	          return self.doTransaction(function (transaction) {
	            return transaction.poll();
	          });
	        })
	        .fail(function (err) {
	          self.trigger('error', self, err.xhr);
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      noButtonBar: true,
	      title: _.partial(Okta.loc, 'enroll.duo.title', 'login'),

	      postRender: function () {
	        this.add('<iframe frameborder="0" title="' + this.title() + '"></iframe>');
	        Duo.init({
	          'host': this.model.get('host'),
	          'sig_request': this.model.get('signature'),
	          'iframe': this.$('iframe').get(0),
	          'post_action': _.bind(this.model.activate, this.model)
	        });
	      }
	    },

	    Footer: Footer,

	    fetchInitialData: function () {
	      var self = this;
	      return this.model.getInitOptions(this.options.appState)
	      .then(function (trans) {
	        var res = trans.data;
	        if (!res ||
	            !res._embedded ||
	            !res._embedded.factor ||
	            !res._embedded.factor._embedded ||
	            !res._embedded.factor._embedded.activation) {
	          throw new Error('Response does not have duo activation options');
	        }

	        var factor = res._embedded.factor;
	        var activation = factor._embedded.activation;
	        self.model.set({
	          host: activation.host,
	          signature: activation.signature,
	          postAction: activation._links.complete.href,
	          factorId: factor.id,
	          stateToken: res.stateToken
	        });
	      });
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate')) {
	        return true;
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(91)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums) {

	  return Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="mfa.backToFactors" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      }
	    },

	    back: function () {
	      this.state.set('navigateDir', Enums.DIRECTION_BACK);
	      if (this.options.appState.get('prevLink')) {
	        // Once we are in the MFA_ENROLL_ACTIVATE, we need to reset to the
	        // correct state. Fortunately, this means that the router will
	        // handle navigation once the request is finished.
	        this.model.doTransaction(function (transaction) {
	          return transaction.prev();
	        });
	      }
	      else {
	        this.options.appState.trigger('navigate', 'signin/enroll');
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(83),
	  __webpack_require__(130),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FactorUtil, Footer, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-question',
	    Model: {
	      props: {
	        question: 'string',
	        answer: ['string', true]
	      },
	      local: {
	        securityQuestions: 'object'
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'question',
	            provider: 'OKTA'
	          });
	          return factor.enroll({
	            profile: {
	              question: this.get('question'),
	              answer: this.get('answer')
	            }
	          });
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      title: _.partial(Okta.loc, 'enroll.securityQuestion.setup', 'login'),
	      inputs: function () {
	        return [
	          {
	            label: false,
	            'label-top': true,
	            name: 'question',
	            type: 'select',
	            wide: true,
	            options: function () {
	              return this.model.get('securityQuestions');
	            },
	            params: {
	              searchThreshold: 25
	            }
	          },
	          {
	            label: false,
	            'label-top': true,
	            placeholder: Okta.loc('mfa.challenge.answer.placeholder', 'login'),
	            className: 'o-form-fieldset o-form-label-top auth-passcode',
	            name: 'answer',
	            input: TextBox,
	            type: 'text',
	            params: {
	              innerTooltip: Okta.loc('mfa.challenge.answer.tooltip', 'login')
	            }
	          }
	        ];
	      }
	    },

	    Footer: Footer,

	    fetchInitialData: function () {
	      var self = this;
	      return this.model.manageTransaction(function(transaction) {
	        var factor = _.findWhere(transaction.factors, {
	          factorType: 'question',
	          provider: 'OKTA'
	        });
	        return factor.questions();
	      })
	      .then(function(questionsRes) {
	        var questions = {};
	        _.each(questionsRes, function (question) {
	          questions[question.question] = FactorUtil.getSecurityQuestionLabel(question);
	        });
	        self.model.set('securityQuestions', questions);
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(121),
	  __webpack_require__(122),
	  __webpack_require__(130),
	  __webpack_require__(123)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, webauthn, Spinner, Footer, HtmlErrorMessageView) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-windows-hello',
	    Model: {
	      local: {
	        __isEnrolled__: 'boolean'
	      },

	      save: function () {
	        if (!webauthn.isAvailable()) {
	          return;
	        }

	        this.trigger('request');

	        if (this.get('__isEnrolled__')) {
	          return this.activate();
	        }

	        return this.doTransaction(function (transaction) {
	          return this._enroll(transaction);
	        });
	      },

	      _enroll: function (transaction) {
	        var factor = _.findWhere(transaction.factors, {
	          factorType: 'webauthn',
	          provider: 'FIDO'
	        });

	        return factor.enroll();
	      },

	      activate: function () {
	        this.set('__isEnrolled__', true);

	        return this.doTransaction(function (transaction) {
	          var activation = transaction.factor.activation;
	          var user = transaction.user;
	          var model = this;

	          var accountInfo = {
	            rpDisplayName: activation.rpDisplayName,
	            userDisplayName: user.profile.displayName,
	            accountName: user.profile.login,
	            userId: user.id
	          };
	          var cryptoParams = [{
	            algorithm: activation.algorithm
	          }];
	          var challenge = activation.nonce;

	          return webauthn.makeCredential(accountInfo, cryptoParams, challenge)
	          .then(function (creds) {
	            return transaction.activate({
	              credentialId: creds.credential.id,
	              publicKey: creds.publicKey,
	              attestation: null
	            });
	          })
	          .fail(function (error) {
	            switch (error.message) {
	            case 'AbortError':
	            case 'NotFoundError':
	            case 'NotSupportedError':
	              model.trigger('abort', error.message);
	              return transaction;
	            }

	            throw error;
	          });
	        });
	      }
	    },

	    Form: {
	      autoSave: true,
	      hasSavingState: false,
	      title: _.partial(Okta.loc, 'enroll.windowsHello.title', 'login'),
	      subtitle: function () {
	        return webauthn.isAvailable() ? Okta.loc('enroll.windowsHello.subtitle', 'login') : '';
	      },
	      save: _.partial(Okta.loc, 'enroll.windowsHello.save', 'login'),

	      customSavingState: {
	        stop: 'abort'
	      },

	      modelEvents: function () {
	        if (!webauthn.isAvailable()) {
	          return {};
	        }

	        return {
	          'request': '_startEnrollment',
	          'error': '_stopEnrollment',
	          'abort': '_stopEnrollment'
	        };
	      },

	      noButtonBar: function () {
	        return !webauthn.isAvailable();
	      },

	      formChildren: function () {
	        var result = [];

	        if (!webauthn.isAvailable()) {
	          result.push(
	            FormType.View(
	              { View: new HtmlErrorMessageView(
	                { message: Okta.loc('enroll.windowsHello.error.notWindows', 'login') }) },
	              { selector: '.o-form-error-container'}
	            )
	          );
	        }

	        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));

	        return result;
	      },

	      _startEnrollment: function () {
	        this.subtitle = Okta.loc('enroll.windowsHello.subtitle.loading', 'login');

	        this.model.trigger('spinner:show');
	        this._resetErrorMessage();

	        this.render();
	        this.$('.o-form-button-bar').addClass('hide');
	      },

	      _stopEnrollment: function (errorMessage) {
	        this.subtitle = Okta.loc('enroll.windowsHello.subtitle', 'login');

	        this.model.trigger('spinner:hide');
	        this.$('.o-form-button-bar').removeClass('hide');

	        var message;
	        switch (errorMessage){
	        case 'NotSupportedError':
	          message = Okta.loc('enroll.windowsHello.error.notConfiguredHtml', 'login');
	          break;
	        }

	        this._resetErrorMessage();

	        if (message){
	          var messageView = new HtmlErrorMessageView({
	            message: message
	          });

	          this.$('.o-form-error-container').addClass('o-form-has-errors');
	          this.add(messageView, { selector: '.o-form-error-container' });
	          this._errorMessageView = this.last();
	        }

	        this.render();
	      },


	      _resetErrorMessage: function () {
	        this._errorMessageView && this._errorMessageView.remove();
	        this._errorMessageView = undefined;
	        this.clearErrors();
	      }
	    },

	    Footer: Footer,

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate')) {
	        this.model.activate();
	        return true;
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(130),
	  __webpack_require__(134),
	  __webpack_require__(95),
	  __webpack_require__(135),
	  __webpack_require__(85),
	  __webpack_require__(43)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, Footer, PhoneTextBox, TextBox, CountryUtil, FormType, Keys) {

	  var _ = Okta._;
	  var API_RATE_LIMIT = 30000; //milliseconds

	  var factorIdIsDefined = {
	    factorId: function (val) {
	      return !_.isUndefined(val);
	    }
	  };

	  function isCallFactor(factorType) {
	    return factorType === 'call';
	  }

	  function getClassName(factorType) {
	    return isCallFactor(factorType) ? 'enroll-call' : 'enroll-sms';
	  }

	  function sendCode(e) {
	    if (Keys.isEnter(e)) {
	      e.stopPropagation();
	      e.preventDefault();
	      if (e.type === 'keyup' && e.data && e.data.model) {
	        e.data.model.sendCode();
	      }
	    }
	  }

	  return FormController.extend({
	    className: function () {
	      return getClassName(this.options.factorType);
	    },
	    Model: {
	      props: {
	        countryCode: ['string', true, 'US'],
	        phoneNumber: ['string', true],
	        phoneExtension: ['string', false],
	        lastEnrolledPhoneNumber: 'string',
	        passCode: ['string', true],
	        factorId: 'string'
	      },
	      local: {
	        hasExistingPhones: 'boolean',
	        trapEnrollment: 'boolean',
	        ableToResend: 'boolean',
	        factorType: 'string'
	      },
	      derived: {
	        countryCallingCode: {
	          deps: ['countryCode'],
	          fn: function (countryCode) {
	            return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
	          }
	        },
	        fullPhoneNumber: {
	          deps: ['countryCallingCode', 'phoneNumber'],
	          fn: function (countryCallingCode, phoneNumber) {
	            return phoneNumber ? (countryCallingCode + phoneNumber) : '';
	          }
	        },
	        enrolled: {
	          deps: ['lastEnrolledPhoneNumber', 'fullPhoneNumber'],
	          fn: function (lastEnrolled, current) {
	            return lastEnrolled === current;
	          }
	        }
	      },
	      limitResending: function () {
	        this.set({ableToResend: false});
	        _.delay(_.bind(this.set, this), API_RATE_LIMIT, {ableToResend: true});
	      },
	      sendCode: function () {
	        var self = this;
	        var phoneNumber = this.get('fullPhoneNumber');
	        var phoneExtension = this.get('phoneExtension');

	        self.trigger('errors:clear');

	        if(!phoneNumber.length) {
	          self.trigger('invalid', self, {'phoneNumber': 'model.validation.field.blank'});
	          return;
	        }

	        return this.doTransaction(function(transaction) {
	          var isMfaEnroll = transaction.status === 'MFA_ENROLL';
	          var profileData = {
	            phoneNumber: phoneNumber,
	            updatePhone: isMfaEnroll ? self.get('hasExistingPhones') : true
	          };
	          if (isCallFactor(self.get('factorType'))) {
	            profileData['phoneExtension'] = phoneExtension;
	          }

	          if (isMfaEnroll) {
	            var factor = _.findWhere(transaction.factors, {
	              factorType: self.get('factorType'),
	              provider: 'OKTA'
	            });
	            return factor.enroll({
	              profile: profileData
	            });

	          } else {
	            // We must transition to MfaEnroll before updating the phone number
	            self.set('trapEnrollment', true);
	            return transaction.prev()
	            .then(function (trans) {
	              var factor = _.findWhere(trans.factors, {
	                factorType: self.get('factorType'),
	                provider: 'OKTA'
	              });
	              return factor.enroll({
	                profile: profileData
	             });
	            })
	            .then(function (trans) {
	              self.set('trapEnrollment', false);
	              return trans;
	            });
	          }
	        // Rethrow errors so we can change state
	        // AFTER setting the new transaction
	        }, true)
	        .then(function () {
	          self.set('lastEnrolledPhoneNumber', phoneNumber);
	          self.limitResending();
	        })
	        .fail(function () {
	          self.set('ableToResend', true);
	          self.set('trapEnrollment', false);
	        });
	      },
	      resendCode: function () {
	        this.trigger('errors:clear');
	        this.limitResending();
	        return this.doTransaction(function(transaction) {
	          return transaction.resend(this.get('factorType'));
	        });
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          return transaction.activate({
	            passCode: this.get('passCode')
	          });
	        });
	      }
	    },

	    Form: function () {
	      /*jshint maxcomplexity:8*/
	      var factorType = this.options.factorType;
	      var isCall = isCallFactor(factorType);

	      var formTitle = Okta.loc(isCall ? 'enroll.call.setup' : 'enroll.sms.setup', 'login');
	      var formSubmit = Okta.loc(isCall ? 'mfa.call' : 'mfa.sendCode', 'login');
	      var formRetry = Okta.loc(isCall ? 'mfa.redial' : 'mfa.resendCode', 'login');
	      var formSubmitted = Okta.loc(isCall ? 'mfa.calling' : 'mfa.sent', 'login');

	      var numberFieldClassName = isCall ? 'enroll-call-phone' : 'enroll-sms-phone';
	      var buttonClassName = isCall ? 'call-request-button' : 'sms-request-button';

	      var formChildren = [
	        FormType.Input({
	          name: 'countryCode',
	          type: 'select',
	          wide: true,
	          options: CountryUtil.getCountries()
	        }),
	        FormType.Input({
	          placeholder: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
	          className: numberFieldClassName,
	          name: 'phoneNumber',
	          input: PhoneTextBox,
	          type: 'text',
	          render: function () {
	            this.$('input[name="phoneNumber"]')
	              .off('keydown keyup', sendCode)
	              .keydown(sendCode)
	              .keyup({model: this.model}, sendCode);
	          }
	        })
	      ];
	      if (isCall) {
	        formChildren.push(FormType.Input({
	          placeholder: Okta.loc('mfa.phoneNumber.ext.placeholder', 'login'),
	          className: 'enroll-call-extension',
	          name: 'phoneExtension',
	          input: TextBox,
	          type: 'text'
	        }));
	      }
	      formChildren.push(
	        FormType.Button({
	          title: formSubmit,
	          attributes: { 'data-se': buttonClassName },
	          className: 'button button-primary js-enroll-phone ' + buttonClassName,
	          click: function () {
	            this.model.sendCode();
	          }
	        }),
	        FormType.Button({
	          title: formRetry,
	          attributes: { 'data-se': buttonClassName },
	          className: 'button js-enroll-phone ' + buttonClassName,
	          click: function () {
	            this.model.resendCode();
	          },
	          initialize: function () {
	            this.$el.css({display: 'none'});
	            this.listenTo(this.model, 'change:ableToResend', function (model, ableToResend) {
	              if (ableToResend) {
	                this.options.title = formRetry;
	                this.enable();
	              } else {
	                this.options.title = formSubmitted;
	                this.disable();
	              }
	              this.render();
	            });
	          }
	        }),
	        FormType.Divider({
	          showWhen: factorIdIsDefined
	        }),
	        FormType.Input({
	          placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	          name: 'passCode',
	          input: TextBox,
	          type: 'number',
	          params: {
	            innerTooltip: Okta.loc('mfa.challenge.enterCode.tooltip', 'login')
	          },
	          showWhen: factorIdIsDefined
	        }),
	        FormType.Toolbar({
	          noCancelButton: true,
	          save: Okta.loc('mfa.challenge.verify', 'login'),
	          showWhen: factorIdIsDefined
	        })
	      );

	      return {
	        title: formTitle,
	        noButtonBar: true,
	        autoSave: true,
	        className: getClassName(factorType),
	        initialize: function () {
	          this.listenTo(this.model, 'error errors:clear', function () {
	            this.clearErrors();
	          });
	          this.listenTo(this.model, 'change:enrolled', function () {
	            this.$('.js-enroll-phone').toggle();
	          });
	        },
	        formChildren: formChildren
	      };
	    },

	    Footer: Footer,

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate')) {
	        this.model.set('factorId', this.options.appState.get('activatedFactorId'));
	        return true;
	      }
	      if (this.options.appState.get('isMfaEnroll') && this.model.get('trapEnrollment')) {
	        return true;
	      }
	    },

	    initialize: function () {
	      if (isCallFactor(this.options.factorType)) {
	        this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhonesForCall'));
	      } else {
	        this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhones'));
	      }
	      this.model.set('factorType', this.options.factorType);
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(41)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox) {

	  var _ = Okta._;

	  return TextBox.extend({

	    template: Okta.Handlebars.compile('\
	      <span class="okta-form-label-inline o-form-label-inline">{{countryCallingCode}}</span>\
	      <span class="okta-form-input-field input-fix o-form-control">\
	        <input type="{{type}}" placeholder="{{placeholder}}" name="{{name}}" \
	          id="{{inputId}}" value="{{value}}" autocomplete="off"/>\
	      </span>\
	    '),

	    initialize: function () {
	      this.listenTo(this.model, 'change:countryCallingCode', function () {
	        this.$('.o-form-label-inline').text(this.model.get('countryCallingCode'));
	      });
	    },

	    preRender: function () {
	      this.options.countryCallingCode = this.model.get('countryCallingCode');
	    },

	    postRender: function () {
	      // This is a hack - once inputGroups are done, get rid of it!!
	      this.$el.removeClass('input-fix o-form-control');
	      _.defer(_.bind(function () {
	        this.$el.parent().addClass('o-form-input-group');
	      }, this));
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(8),
	  __webpack_require__(136)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, bundles, countryCallingCodes) {

	  var fn = {};

	  // () => [{ countryCode: countryName }], sorted by countryName
	  fn.getCountries = function () {
	    // HM, BV, and TF do not have phone prefixes, so don't give the
	    // user the option to choose these countries. FYI it appears that these
	    // countries do not have calling codes because they are ~~uninhabited~~
	    var countries = _.omit(bundles.country, 'HM', 'BV', 'TF');

	    // Sort it; figure out if there is a better way to do this (best would
	    // be to sort it in the properties file!!)
	    var collection = _.map(countries, function (name, code) {
	      return { name: name, code: code };
	    });
	    collection = _.sortBy(collection, 'name');
	    var sorted = {};
	    _.each(collection, function (country) {
	      sorted[country.code] = country.name;
	    });

	    return sorted;
	  };

	  fn.getCallingCodeForCountry = function (countryCode) {
	    return countryCallingCodes[countryCode];
	  };

	  return fn;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(module.exports = {"US":"1","AG":"1","AI":"1","AS":"1","BB":"1","BM":"1","BS":"1","CA":"1","DM":"1","DO":"1","GD":"1","GU":"1","JM":"1","KN":"1","KY":"1","LC":"1","MP":"1","MS":"1","PR":"1","SX":"1","TC":"1","TT":"1","VC":"1","VG":"1","VI":"1","RU":"7","KZ":"7","EG":"20","ZA":"27","GR":"30","NL":"31","BE":"32","FR":"33","ES":"34","HU":"36","IT":"39","RO":"40","CH":"41","AT":"43","GB":"44","GG":"44","IM":"44","JE":"44","DK":"45","SE":"46","NO":"47","SJ":"47","PL":"48","DE":"49","PE":"51","MX":"52","CU":"53","AR":"54","BR":"55","CL":"56","CO":"57","VE":"58","MY":"60","AU":"61","CC":"61","CX":"61","ID":"62","PH":"63","NZ":"64","SG":"65","TH":"66","JP":"81","KR":"82","VN":"84","CN":"86","TR":"90","IN":"91","PK":"92","AF":"93","LK":"94","MM":"95","IR":"98","SS":"211","MA":"212","EH":"212","DZ":"213","TN":"216","LY":"218","GM":"220","SN":"221","MR":"222","ML":"223","GN":"224","CI":"225","BF":"226","NE":"227","TG":"228","BJ":"229","MU":"230","LR":"231","SL":"232","GH":"233","NG":"234","TD":"235","CF":"236","CM":"237","CV":"238","ST":"239","GQ":"240","GA":"241","CG":"242","CD":"243","AO":"244","GW":"245","IO":"246","AC":"247","SC":"248","SD":"249","RW":"250","ET":"251","SO":"252","DJ":"253","KE":"254","TZ":"255","UG":"256","BI":"257","MZ":"258","ZM":"260","MG":"261","RE":"262","YT":"262","ZW":"263","NA":"264","MW":"265","LS":"266","BW":"267","SZ":"268","KM":"269","SH":"290","TA":"290","ER":"291","AW":"297","FO":"298","GL":"299","GI":"350","PT":"351","LU":"352","IE":"353","IS":"354","AL":"355","MT":"356","CY":"357","FI":"358","AX":"358","BG":"359","LT":"370","LV":"371","EE":"372","MD":"373","AM":"374","BY":"375","AD":"376","MC":"377","SM":"378","VA":"379","UA":"380","RS":"381","ME":"382","HR":"385","SI":"386","BA":"387","MK":"389","CZ":"420","SK":"421","LI":"423","FK":"500","BZ":"501","GT":"502","SV":"503","HN":"504","NI":"505","CR":"506","PA":"507","PM":"508","HT":"509","GP":"590","BL":"590","MF":"590","BO":"591","GY":"592","EC":"593","GF":"594","PY":"595","MQ":"596","SR":"597","UY":"598","CW":"599","BQ":"599","TL":"670","NF":"672","BN":"673","NR":"674","PG":"675","TO":"676","SB":"677","VU":"678","FJ":"679","PW":"680","WF":"681","CK":"682","NU":"683","WS":"685","KI":"686","NC":"687","TV":"688","PF":"689","TK":"690","FM":"691","MH":"692","001":"979","KP":"850","HK":"852","MO":"853","KH":"855","LA":"856","BD":"880","TW":"886","MV":"960","LB":"961","JO":"962","SY":"963","IQ":"964","KW":"965","SA":"966","YE":"967","OM":"968","PS":"970","AE":"971","IL":"972","BH":"973","QA":"974","BT":"975","MN":"976","NP":"977","TJ":"992","TM":"993","AZ":"994","GE":"995","KG":"996","UZ":"998","GS":500,"PN":64,"AQ":672,"UM":1,"AN":599})

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(85),
	  __webpack_require__(84),
	  __webpack_require__(130),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormType, FormController, Footer, TextBox) {

	  var _ = Okta._;

	  function isRSA(provider) {
	    return provider === 'RSA';
	  }

	  function getClassName(provider) {
	    return isRSA(provider) ? 'enroll-rsa' : 'enroll-onprem';
	  }

	  return FormController.extend({
	    className: function () {
	      return getClassName(this.options.provider);
	    },
	    Model: function () {
	      var provider = this.options.provider;
	      return {
	        props: {
	          credentialId: ['string', true],
	          passCode: ['string', true],
	          factorId: 'string'
	        },
	        save: function () {
	          return this.doTransaction(function(transaction) {
	            var factor = _.findWhere(transaction.factors, {
	              factorType: 'token',
	              provider: provider
	            });
	            return factor.enroll({
	              passCode: this.get('passCode'),
	              profile: {credentialId: this.get('credentialId')}
	            });
	          });
	        }
	      };
	    },

	    Form: function () {
	      var provider = this.options.provider;
	      var factors = this.options.appState.get('factors');
	      var factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
	      var vendorName = factor.get('vendorName');
	      var title = isRSA(provider) ? Okta.loc('factor.totpHard.rsaSecurId', 'login') : vendorName;

	      return {
	        title: title,
	        noButtonBar: true,
	        autoSave: true,
	        className: getClassName(provider),
	        formChildren: [
	          FormType.Input({
	            name: 'credentialId',
	            input: TextBox,
	            type: 'text',
	            placeholder: Okta.loc('enroll.onprem.username.placeholder', 'login', [vendorName]),
	            params: {
	              innerTooltip: Okta.loc('enroll.onprem.username.tooltip', 'login', [vendorName])
	            }
	          }),
	          FormType.Input({
	            name: 'passCode',
	            input: TextBox,
	            type: 'password',
	            placeholder: Okta.loc('enroll.onprem.passcode.placeholder', 'login', [vendorName]),
	            params: {
	              innerTooltip: Okta.loc('enroll.onprem.passcode.tooltip', 'login', [vendorName])
	            }
	          }),
	          FormType.Toolbar({
	            noCancelButton: true,
	            save: Okta.loc('mfa.challenge.verify', 'login')
	          })
	        ]
	      };
	    },

	    Footer: Footer

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(85),
	  __webpack_require__(84),
	  __webpack_require__(130),
	  __webpack_require__(95)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormType, FormController, Footer, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-symantec',
	    Model: {
	      props: {
	        credentialId: ['string', true],
	        passCode: ['string', true],
	        nextPassCode: ['string', true],
	        factorId: 'string'
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {

	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'token',
	            provider: 'SYMANTEC'
	          });
	          return factor.enroll({
	            passCode: this.get('passCode'),
	            nextPassCode: this.get('nextPassCode'),
	            profile: {credentialId: this.get('credentialId')}
	          });
	        });
	      }
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'factor.totpHard.symantecVip', 'login'),
	      subtitle: _.partial(Okta.loc, 'enroll.symantecVip.subtitle', 'login'),
	      noButtonBar: true,
	      autoSave: true,
	      className: 'enroll-symantec',
	      formChildren: function () {
	        return [
	          FormType.Input({
	            name: 'credentialId',
	            input: TextBox,
	            type: 'text',
	            placeholder: Okta.loc('enroll.symantecVip.credentialId.placeholder', 'login'),
	            params: {
	              innerTooltip: Okta.loc('enroll.symantecVip.credentialId.tooltip', 'login')
	            }
	          }),
	          FormType.Input({
	            name: 'passCode',
	            input: TextBox,
	            type: 'text',
	            placeholder: Okta.loc('enroll.symantecVip.passcode1.placeholder', 'login'),
	            params: {
	              innerTooltip: Okta.loc('enroll.symantecVip.passcode1.tooltip', 'login')
	            }
	          }),
	          FormType.Input({
	            name: 'nextPassCode',
	            input: TextBox,
	            type: 'text',
	            placeholder: Okta.loc('enroll.symantecVip.passcode2.placeholder', 'login'),
	            params: {
	              innerTooltip: Okta.loc('enroll.symantecVip.passcode2.tooltip', 'login')
	            }
	          }),
	          FormType.Toolbar({
	            noCancelButton: true,
	            save: Okta.loc('mfa.challenge.verify', 'login')
	          })
	        ];
	      }
	    },

	    Footer: Footer

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(85),
	  __webpack_require__(84),
	  __webpack_require__(130),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormType, FormController, Footer, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'enroll-yubikey',
	    Model: {
	      props: {
	        passCode: ['string', true],
	        factorId: 'string'
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'token:hardware',
	            provider: 'YUBICO'
	          });
	          return factor.enroll({
	            passCode: this.get('passCode')
	          });
	        });
	      }
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'enroll.yubikey.title', 'login'),
	      subtitle: _.partial(Okta.loc, 'enroll.yubikey.subtitle', 'login'),
	      noCancelButton: true,
	      save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	      autoSave: true,
	      className: 'enroll-yubikey',
	      formChildren: [
	        FormType.View({
	          View: '<div class="yubikey-demo" data-type="yubikey-example"></div>'
	        }),
	        FormType.Input({
	          name: 'passCode',
	          input: TextBox,
	          type: 'password'
	        })
	      ]
	    },

	    Footer: Footer
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88),
	  __webpack_require__(141),
	  __webpack_require__(142),
	  __webpack_require__(130)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, FormController, FormType,
	  RouterUtil, StoreLinks, BarcodeView, Footer) {

	  var _ = Okta._;

	  var showWhenDeviceTypeSelected = {
	    '__deviceType__': function (val) {
	      return val !== undefined;
	    }
	  };

	  var AppDownloadInstructionsView = Okta.View.extend({
	    attributes: { 'data-se': 'app-download-instructions' },
	    className: 'app-download-instructions',
	    template: '\
	      <p class="instructions-title">{{title}}</p>\
	      <span class="app-logo {{appIcon}}"></span>\
	      <p class="instructions">{{{appStoreLinkText}}}</p>\
	    ',
	    initialize: function () {
	      this.listenTo(this.model, 'change:__deviceType__', this.render);
	    },
	    getTemplateData: function () {
	      var appStoreLink, appIcon, appStoreName;
	      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	      appStoreName = StoreLinks.STORE[this.model.get('__deviceType__')];
	      if (this.model.get('__provider__') === 'GOOGLE') {
	        appStoreLink = StoreLinks.GOOGLE[this.model.get('__deviceType__')];
	        appIcon = 'google-auth-38';
	      } else {
	        appStoreLink = StoreLinks.OKTA[this.model.get('__deviceType__')];
	        appIcon = 'okta-verify-38';
	      }
	      return {
	        title: Okta.loc('enroll.totp.installApp', 'login', [factorName]),
	        appStoreLinkText: Okta.loc('enroll.totp.downloadApp',
	          'login', [appStoreLink, factorName, appStoreName]),
	        appIcon: appIcon
	      };
	    }
	  });

	  var EnrollTotpController = FormController.extend({
	    className: 'enroll-totp',
	    Model: function () {
	      return {
	        local: {
	          '__deviceType__': 'string',
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        },
	        save: function () {
	          return this.doTransaction(function(transaction) {
	            var factor = _.findWhere(transaction.factors, {
	              factorType: this.get('__factorType__'),
	              provider: this.get('__provider__')
	            });
	            return factor.enroll();
	          });
	        }
	      };
	    },

	    Form: {
	      title: function () {
	        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	        return Okta.loc('enroll.totp.title', 'login', [factorName]);
	      },
	      subtitle: _.partial(Okta.loc, 'enroll.totp.selectDevice', 'login'),
	      autoSave: true,
	      noButtonBar: true,
	      attributes: { 'data-se': 'step-device-type' },

	      formChildren: function () {
	        var inputOptions = {
	          APPLE: '',
	          ANDROID: ''
	        };
	        if (this.settings.get('features.windowsVerify') && this.model.get('__provider__') === 'OKTA') {
	          inputOptions.WINDOWS = '';
	        } else if (this.model.get('__provider__') === 'GOOGLE') {
	          inputOptions.BLACKBERRY = '';
	        }

	        var children = [
	          FormType.Input({
	            name: '__deviceType__',
	            type: 'radio',
	            options: inputOptions,
	            className: 'device-type-input'
	          }),

	          FormType.Divider({showWhen: showWhenDeviceTypeSelected}),

	          FormType.View({
	            View: AppDownloadInstructionsView,
	            showWhen: showWhenDeviceTypeSelected
	          }),

	          FormType.Toolbar({
	            noCancelButton: true,
	            save: Okta.loc('oform.next', 'login'),
	            showWhen: showWhenDeviceTypeSelected
	          })
	        ];

	        return children;
	      }
	    },

	    Footer: Footer

	  });

	  return EnrollTotpController;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(module.exports = {
		OKTA: {
			APPLE: 'https://itunes.apple.com/us/app/okta-verify/id490179405',
			ANDROID: 'https://play.google.com/store/apps/details?id=com.okta.android.auth',
			WINDOWS: 'http://www.windowsphone.com/en-us/store/app/okta-verify/9df0e2c4-7301-411f-80e5-62fcf6679666'
		},
		GOOGLE: {
			APPLE: 'https://itunes.apple.com/us/app/google-authenticator/id388497605',
			ANDROID: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
			BLACKBERRY: 'https://support.google.com/accounts/answer/1066447'
		},
		STORE: {
			APPLE: 'App Store',
			ANDROID: 'Google Play Store',
			WINDOWS: 'Windows Store',
			BLACKBERRY: 'Blackberry World Store'
		}
	});


/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(88)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, RouterUtil) {

	  var _ = Okta._;

	  return Okta.View.extend({
	    className: 'scan-instructions clearfix',
	    template: '\
	      <div class="scan-instructions-details-wrapper">\
	          <div class="scan-instructions-details">\
	              <p>{{instructions}}</p>\
	          </div>\
	      </div>\
	      <div class="scan-instructions-qrcode-wrapper">\
	          <div class="qrcode-wrap">\
	              <img data-se="qrcode" class="qrcode-image" src="{{qrcode}}">\
	              <div data-se="qrcode-success" class="qrcode-success"></div>\
	              <div data-se="qrcode-error" class="qrcode-error"></div>\
	          </div>\
	          <a href="#" data-type="manual-setup" data-se="manual-setup" class="link manual-setup">\
	            {{i18n code="enroll.totp.cannotScan" bundle="login"}}\
	          </a>\
	          <a href="#" data-type="refresh-qrcode" data-se="refresh-qrcode" class="link refresh-qrcode">\
	            {{i18n code="enroll.totp.refreshBarcode" bundle="login"}}\
	          </a>\
	      </div>\
	    ',

	    events: {
	      'click [data-type="manual-setup"]': function (e) {
	        e.preventDefault();
	        var url = RouterUtil.createActivateFactorUrl(this.model.get('__provider__'),
	          this.model.get('__factorType__'), 'manual');
	        this.options.appState.trigger('navigate', url);
	      },
	      'click [data-type="refresh-qrcode"]': function (e) {
	        e.preventDefault();
	        this.model.trigger('errors:clear');

	        var self = this;
	        this.model.doTransaction(function (transaction) {
	          if (this.appState.get('isWaitingForActivation')) {
	            return transaction.poll();
	          } else {
	            return transaction.activate();
	          }
	        })
	        .then(function (trans) {
	          var res = trans.data;
	          if (res.status === 'MFA_ENROLL_ACTIVATE' && res.factorResult === 'WAITING') {
	            // defer the render here to have a lastResponse set in AppState
	            // so that we get new QRcode rendered
	            _.defer(_.bind(self.render, self));
	          }
	        });
	      }
	    },

	    initialize: function () {
	      this.listenTo(this.options.appState, 'change:lastAuthResponse', function () {
	        if (this.options.appState.get('isMfaEnrollActivate')) {
	          this.$el.toggleClass('qrcode-expired', !this.options.appState.get('isWaitingForActivation'));
	        } else if (this.options.appState.get('isSuccessResponse')) {
	          this.$el.addClass('qrcode-success');
	        }
	      });
	      this.listenTo(this.model, 'error', function () {
	        if (this.options.appState.get('isMfaEnrollActivate')) {
	          this.$el.toggleClass('qrcode-expired', true);
	        }
	      });
	    },

	    getTemplateData: function () {
	      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	      var instructions;
	      if (this.model.get('__provider__') === 'GOOGLE') {
	        instructions = Okta.loc('enroll.totp.setupGoogleAuthApp', 'login', [factorName]);
	      } else {
	        instructions = Okta.loc('enroll.totp.setupApp', 'login', [factorName]);
	      }
	      return {
	        instructions: instructions,
	        qrcode: this.options.appState.get('qrcode')
	      };
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* global u2f */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(85),
	  __webpack_require__(84),
	  __webpack_require__(130),
	  __webpack_require__(9),
	  __webpack_require__(123),
	  __webpack_require__(14),
	  __webpack_require__(125)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormType, FormController, Footer, Q, HtmlErrorMessageView, BrowserFeatures) {

	  var _ = Okta._;

	  function getErrorMessageKeyByCode(errorCode) {
	    switch (errorCode) {
	    default:
	    case 1:
	      return 'u2f.error.other';
	    case 2:
	    case 3:
	      return 'u2f.error.badRequest';
	    case 4:
	      return 'u2f.error.unsupported';
	    case 5:
	      return 'u2f.error.timeout';
	    }
	  }

	  return FormController.extend({
	    className: 'enroll-u2f',
	    Model: {
	      local: {
	        '__enrolled__': 'boolean'
	      },

	      save: function () {
	        this.trigger('request');

	        if (this.get('__enrolled__')) {
	          return this.activate();
	        }

	        return this.doTransaction(function (transaction) {
	          var factor = _.findWhere(transaction.factors, {
	            factorType: 'u2f',
	            provider: 'FIDO'
	          });
	          return factor.enroll();
	        });
	      },

	      activate: function () {
	        this.set('__enrolled__', true);
	        this.trigger('errors:clear');

	        return this.doTransaction(function (transaction) {
	          var activation = transaction.factor.activation;
	          var appId = activation.appId;
	          var registerRequests = [{
	            version: activation.version,
	            challenge: activation.nonce
	          }];
	          var self = this;
	          var deferred = Q.defer();
	          u2f.register(appId, registerRequests, [], function (data) {
	            self.trigger('errors:clear');
	            if (data.errorCode && data.errorCode !== 0) {
	              deferred.reject({
	                xhr: {responseJSON: {errorSummary: Okta.loc(getErrorMessageKeyByCode(data.errorCode), 'login')}}
	              });
	            } else {
	              deferred.resolve(transaction.activate({
	                registrationData: data.registrationData,
	                version: data.version,
	                challenge: data.challenge,
	                clientData: data.clientData
	              }));
	            }
	          });
	          return deferred.promise;
	        });
	      }
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'enroll.u2f.title', 'login'),
	      save: _.partial(Okta.loc, 'enroll.u2f.save', 'login'),
	      noCancelButton: true,
	      hasSavingState: false,
	      autoSave: true,
	      className: 'enroll-u2f-form',
	      noButtonBar: function () {
	        return !window.hasOwnProperty('u2f');
	      },
	      modelEvents: {
	        'request': '_startEnrollment',
	        'error': '_stopEnrollment'
	      },
	      formChildren: function () {
	        var result = [];

	        if (!window.hasOwnProperty('u2f')) {
	          var errorMessageKey = 'u2f.error.notSupportedBrowser';

	          if (BrowserFeatures.isFirefox()) {
	            errorMessageKey = 'u2f.error.noFirefoxExtension';
	          }

	          result.push(FormType.View(
	            {View: new HtmlErrorMessageView({message: Okta.loc(errorMessageKey, 'login')})},
	            {selector: '.o-form-error-container'}
	          ));
	        }
	        else {
	          //There is html in enroll.u2f.general2 in our properties file, reason why is unescaped
	          result.push(FormType.View({
	            View: '<div class="u2f-instructions"><ol>\
	          <li>{{i18n code="enroll.u2f.general1" bundle="login"}}</li>\
	          <li>{{{i18n code="enroll.u2f.general2" bundle="login"}}}</li>\
	          <li>{{i18n code="enroll.u2f.general3" bundle="login"}}</li>\
	          </ol></div>'
	          }));

	          result.push(FormType.View({
	            View: '\
	          <div class="u2f-enroll-text hide">\
	            <p>{{i18n code="enroll.u2f.instructions" bundle="login"}}</p>\
	            <p>{{i18n code="enroll.u2f.instructionsBluetooth" bundle="login"}}</p>\
	            <div data-se="u2f-devices" class="u2f-devices-images">\
	              <div class="u2f-usb"></div>\
	              <div class="u2f-bluetooth"></div>\
	            </div>\
	            <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
	          </div>'
	          }));
	        }

	        return result;
	      },

	      _startEnrollment: function () {
	        this.$('.u2f-instructions').addClass('hide');
	        this.$('.u2f-enroll-text').removeClass('hide');
	        this.$('.o-form-button-bar').hide();
	      },

	      _stopEnrollment: function () {
	        this.$('.u2f-instructions').removeClass('hide');
	        this.$('.u2f-enroll-text').addClass('hide');
	        this.$('.o-form-button-bar').show();
	      }
	    },

	    Footer: Footer,

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate')) {
	        this.model.activate();
	        return true;
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88),
	  __webpack_require__(142),
	  __webpack_require__(130)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, FormController, FormType, RouterUtil, BarcodeView, Footer) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'barcode-totp',
	    Model: function () {
	      return {
	        local: {
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        }
	      };
	    },

	    Form: {
	      title: function () {
	        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	        return Okta.loc('enroll.totp.title', 'login', [factorName]);
	      },
	      subtitle: _.partial(Okta.loc, 'mfa.scanBarcode', 'login'),
	      save: _.partial(Okta.loc, 'oform.next', 'login'),
	      noCancelButton: true,
	      attributes: { 'data-se': 'step-scan' },
	      className: 'barcode-scan',

	      formChildren: [
	        FormType.View({View: BarcodeView})
	      ]
	    },

	    Footer: Footer,

	    initialize: function () {
	      this.listenTo(this.form, 'save', function () {
	        var url = RouterUtil.createActivateFactorUrl(this.model.get('__provider__'),
	          this.model.get('__factorType__'), 'activate');
	        this.options.appState.trigger('navigate', url);
	      });
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88),
	  __webpack_require__(142),
	  __webpack_require__(130)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, FormController, FormType, RouterUtil, BarcodeView, Footer) {

	  var _ = Okta._;

	  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
	  // in network connection lost errors in Safari and IE.
	  var PUSH_INTERVAL = 6000;

	  return FormController.extend({
	    className: 'barcode-push',
	    Model: function () {
	      return {
	        local: {
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        }
	      };
	    },

	    Form: {
	      title: function () {
	        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	        return Okta.loc('enroll.totp.title', 'login', [factorName]);
	      },
	      subtitle: _.partial(Okta.loc, 'mfa.scanBarcode', 'login'),
	      noButtonBar: true,
	      attributes: { 'data-se': 'step-scan' },
	      className: 'barcode-scan',
	      initialize: function () {
	        this.listenTo(this.model, 'error errors:clear', function () {
	          this.clearErrors();
	        });
	      },

	      formChildren: [
	        FormType.View({View: BarcodeView})
	      ]
	    },

	    Footer: Footer,

	    initialize: function () {
	      this.pollForEnrollment();
	    },

	    pollForEnrollment: function () {
	      return this.model.doTransaction(function(transaction) {
	        return transaction.poll(PUSH_INTERVAL);
	      });
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate')) {
	        return true;
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(147),
	  __webpack_require__(130)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, EnterPasscodeForm, Footer) {

	  return FormController.extend({
	    className: 'activate-totp',
	    Model: function () {
	      return {
	        props: {
	          factorId: ['string', true, this.options.appState.get('activatedFactorId')],
	          passCode: ['string', true]
	        },
	        local: {
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        },
	        save: function () {
	          return this.doTransaction(function(transaction) {
	            return transaction.activate({
	              passCode: this.get('passCode')
	            });
	          });
	        }
	      };
	    },

	    Form: EnterPasscodeForm,

	    Footer: Footer

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(83),
	  __webpack_require__(85),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorUtil, FormType, TextBox) {

	  var _ = Okta._;

	  var form = {
	    title: function () {
	      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	      return Okta.loc('enroll.totp.title', 'login', [factorName]);
	    },
	    subtitle: _.partial(Okta.loc, 'enroll.totp.enterCode', 'login'),
	    autoSave: true,
	    noButtonBar: true,
	    attributes: { 'data-se': 'step-sendcode' },

	    formChildren: function () {
	      return [
	        FormType.Input({
	          name: 'passCode',
	          input: TextBox,
	          type: 'number',
	          placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	          params: {
	            innerTooltip: Okta.loc('mfa.challenge.enterCode.tooltip', 'login')
	          }
	        }),

	        FormType.Toolbar({
	          noCancelButton: true,
	          save: Okta.loc('oform.verify', 'login')
	        })
	      ];
	    }
	  };

	  return form;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(149),
	  __webpack_require__(151),
	  __webpack_require__(152),
	  __webpack_require__(89),
	  __webpack_require__(86)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, PrimaryAuthForm, SocialAuth, PrimaryAuthModel, Util, BaseLoginController) {

	  var compile = Okta.Handlebars.compile;
	  var _ = Okta._;
	  var $ = Okta.$;

	  var Footer = Okta.View.extend({
	    template: '\
	      <p><a href="#" class="link help js-qr-login">QR Login</a></p>\
	      <a href="#" data-se="needhelp" class="link help js-help">\
	      {{i18n code="needhelp" bundle="login"}}\
	      </a>\
	      <ul class="help-links js-help-links">\
	        <li>\
	        <a href="#" data-se="forgot-password" class="link js-forgot-password">\
	        {{i18n code="forgotpassword" bundle="login"}}\
	        </a>\
	        </li>\
	        {{#if features.selfServiceUnlock}}\
	          <li>\
	          <a href="#" data-se="unlock" class="link js-unlock">\
	          {{i18n code="unlockaccount" bundle="login"}}\
	          </a>\
	          </li>\
	        {{/if}}\
	        {{#each helpLinks.custom}}\
	          <li>\
	          <a href="{{href}}" class="link js-custom">{{text}}</a></li>\
	        {{/each}}\
	        <li>\
	        <a href="{{helpLinkUrl}}" data-se="help-link" class="link js-help-link" target="_blank">\
	        {{i18n code="help" bundle="login"}}\
	        </a>\
	        </li>\
	      </ul>\
	    ',
	    className: 'auth-footer',

	    initialize: function () {
	      this.listenTo(this.state, 'change:enabled', function(model, enable) {
	        this.$(':link').toggleClass('o-form-disabled', !enable);
	      });
	    },

	    getTemplateData: function () {
	      var helpLinkUrl;
	      var customHelpPage = this.settings.get('helpLinks.help');
	      if (customHelpPage) {
	        helpLinkUrl = customHelpPage;
	      } else {
	        helpLinkUrl = compile('{{baseUrl}}/help/login')({baseUrl: this.settings.get('baseUrl')});
	      }
	      return _.extend(this.settings.toJSON({verbose: true}), {helpLinkUrl: helpLinkUrl});
	    },
	    postRender: function () {
	      this.$('.js-help-links').hide();
	    },
	    toggleLinks: function (e) {
	      e.preventDefault();
	      this.$('.js-help-links').slideToggle(200);
	    },
	    events: {
	      'click .js-help': function (e) {
	        e.preventDefault();
	        if(!this.state.get('enabled')) {
	          return;
	        }

	        this.toggleLinks(e);
	      },
	      'click .js-qr-login': function (e) {
	        e.preventDefault();
	        this.options.appState.trigger('navigate', 'signin/qr-login');
	      },
	      'click .js-forgot-password' : function (e) {
	        e.preventDefault();
	        if(!this.state.get('enabled')) {
	          return;
	        }

	        var customResetPasswordPage = this.settings.get('helpLinks.forgotPassword');
	        if (customResetPasswordPage) {
	          Util.redirect(customResetPasswordPage);
	        }
	        else {
	          this.options.appState.trigger('navigate', 'signin/forgot-password');
	        }
	      },
	      'click .js-unlock' : function (e) {
	        e.preventDefault();
	        if(!this.state.get('enabled')) {
	          return;
	        }

	        var customUnlockPage = this.settings.get('helpLinks.unlock');
	        if (customUnlockPage) {
	          Util.redirect(customUnlockPage);
	        }
	        else {
	          this.options.appState.trigger('navigate', 'signin/unlock');
	        }
	      }
	    }
	  });

	  return BaseLoginController.extend({
	    className: 'primary-auth',

	    state: { enabled: true },

	    View: PrimaryAuthForm,

	    constructor: function (options) {
	      var username;
	      options.appState.unset('username');

	      this.model = new PrimaryAuthModel({
	        multiOptionalFactorEnroll: options.settings.get('features.multiOptionalFactorEnroll'),
	        settings: options.settings,
	        appState: options.appState
	      }, { parse: true });

	      BaseLoginController.apply(this, arguments);

	      this.addListeners();

	      // Add SocialAuth view only when the idps are configured. If configured, 'socialAuthPositionTop'
	      // will determine the order in which the social auth and primary auth are shown on the screen.
	      if (options.settings.get('socialAuthConfigured')) {
	        this.add(SocialAuth, {prepend: options.settings.get('socialAuthPositionTop')});
	      }
	      this.add(new Footer(this.toJSON({appState: options.appState})));

	      username = this.model.get('username');
	      if (username) {
	        this.options.appState.set('username', username);
	      }
	    },

	    events: {
	      'focusout input[name=username]': function () {
	        this.options.appState.set('username', this.model.get('username'));
	      },
	      'focusin input': function (e) {
	        $(e.target.parentElement).addClass('focused-input');
	      },
	      'focusout input': function (e) {
	        $(e.target.parentElement).removeClass('focused-input');
	      }
	    },

	    // This model and the AppState both have a username property.
	    // The controller updates the AppState's username when the user is
	    // done editing (on blur) or deletes the username (see below).
	    initialize: function () {
	      this.listenTo(this.model, 'change:username', function (model, value) {
	        if (!value) {
	          // reset AppState to an undefined user.
	          this.options.appState.set('username', '');
	        }
	      });
	      this.listenTo(this.model, 'save', function () {
	        this.state.set('enabled', false);
	      });
	      this.listenTo(this.model, 'error', function () {
	        this.state.set('enabled', true);
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(95),
	  __webpack_require__(150)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, TextBox, DeviceFingerprint) {

	  var _ = Okta._;

	  return Okta.Form.extend({
	    className: 'primary-auth-form',
	    noCancelButton: true,
	    save: _.partial(Okta.loc, 'primaryauth.submit', 'login'),
	    layout: 'o-form-theme',

	    // If socialAuth is configured, the title moves from the form to
	    // the top of the container (and is rendered in socialAuth).
	    title: function () {
	      var formTitle = Okta.loc('primaryauth.title', 'login');
	      if (this.settings.get('socialAuthConfigured') &&
	          this.settings.get('socialAuthPositionTop')) {
	        formTitle = '';
	      }
	      return formTitle;
	    },

	    initialize: function () {
	      this.listenTo(this, 'save', function () {
	        var self = this;
	        var creds = {
	          username: this.model.get('username'),
	          password: this.model.get('password')
	        };
	        this.settings.processCreds(creds)
	        .then(function() {
	          if (!self.settings.get('features.deviceFingerprinting')) {
	            return;
	          }
	          return DeviceFingerprint.generateDeviceFingerprint(self.settings.get('baseUrl'), self.$el)
	          .then(function (fingerprint) {
	            self.model.set('deviceFingerprint', fingerprint);
	          })
	          .fail(function () {
	            // Keep going even if device fingerprint fails
	          });
	        })
	        .then(_.bind(this.model.save, this.model));
	      });
	      this.listenTo(this.state, 'change:enabled', function (model, enable) {
	        if (enable) {
	          this.enable();
	        }
	        else {
	          this.disable();
	        }
	      });
	    },

	    inputs: function () {
	      var inputs = [
	        {
	          label: false,
	          'label-top': true,
	          placeholder: Okta.loc('primaryauth.username.placeholder', 'login'),
	          name: 'username',
	          input: TextBox,
	          type: 'text',
	          params: {
	            innerTooltip: {
	              title: Okta.loc('primaryauth.username.placeholder', 'login'),
	              text: Okta.loc('primaryauth.username.tooltip', 'login')
	            },
	            icon: 'person-16-gray'
	          }
	        },
	        {
	          label: false,
	          'label-top': true,
	          placeholder: Okta.loc('primaryauth.password.placeholder', 'login'),
	          name: 'password',
	          input: TextBox,
	          type: 'password',
	          params: {
	            innerTooltip: {
	              title: Okta.loc('primaryauth.password.placeholder', 'login'),
	              text: Okta.loc('primaryauth.password.tooltip', 'login')
	            },
	            icon: 'remote-lock-16'
	          }
	        }
	      ];
	      if (this.settings.get('features.rememberMe')) {
	        inputs.push({
	          label: false,
	          placeholder: Okta.loc('remember', 'login'),
	          name: 'remember',
	          type: 'checkbox',
	          'label-top': true,
	          className: 'margin-btm-0',
	          initialize: function () {
	            this.listenTo(this.model, 'change:remember', function (model, val) {
	              // OKTA-98946: We normally re-render on changes to model values,
	              // but in this case we will manually update the checkbox due to
	              // iOS Safari and how it handles autofill - it will autofill the
	              // form anytime the dom elements are re-rendered, which prevents
	              // the user from editing their username.
	              this.$(':checkbox').prop('checked', val).trigger('updateState');
	            });
	          }
	        });
	      }

	      return inputs;
	    },

	    focus: function () {
	      if (!this.model.get('username')) {
	        this.getInputs().first().focus();
	      } else {
	        this.getInputs().toArray()[1].focus();
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/*jshint latedef:false */
	/*global JSON */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Q, $) {

	  return {
	    generateDeviceFingerprint: function (oktaDomainUrl, element) {
	      var deferred = Q.defer();

	      // Create iframe
	      var $iframe = $('<iframe>', {
	        style: 'display: none;'
	      });
	      $iframe.appendTo(element);

	      function removeIframe() {
	        $iframe.off();
	        $iframe.remove();
	        window.removeEventListener('message', onMessageReceivedFromOkta, false);
	      }

	      function handleError(reason) {
	        removeIframe();
	        deferred.reject(reason);
	      }

	      function onMessageReceivedFromOkta(event) {
	        /*jshint maxcomplexity:7*/
	        if (!event || !event.data || event.origin != oktaDomainUrl) {
	          handleError('no data');
	          return;
	        }
	        try {
	          var message = JSON.parse(event.data);
	          if (message && message.type === 'FingerprintServiceReady') {
	            sendMessageToOkta({type: 'GetFingerprint'});
	          } else if (message && message.type === 'FingerprintAvailable') {
	            removeIframe();
	            deferred.resolve(message.fingerprint);
	          } else {
	            handleError('no data');
	          }
	        } catch (error) {
	          //Ignore any errors since we could get other messages too
	        }
	      }

	      function sendMessageToOkta(message) {
	        var win = $iframe[0].contentWindow;
	        if (win) {
	          win.postMessage(JSON.stringify(message), oktaDomainUrl);
	        }
	      }

	      // Attach listener
	      window.addEventListener('message', onMessageReceivedFromOkta, false);
	      // Load devicefingerprint page inside the iframe
	      $iframe.attr('src', oktaDomainUrl + '/auth/services/devicefingerprint');

	      return deferred.promise;
	    }
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(90)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, OAuth2Util) {

	  var _ = Okta._;

	  var dividerTpl = Okta.tpl(
	    '<div class="auth-divider">\
	      <span class="auth-divider-text">{{text}}</span>\
	    </div>');
	  var formTitleTpl = Okta.tpl(
	    '<h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>'
	  );

	  return Okta.View.extend({

	    className: 'social-auth',

	    children: function () {
	      var children = [],
	          idProviders = this.settings.get('configuredSocialIdps'),
	          divider = dividerTpl({text: Okta.loc('socialauth.divider.text', 'login')});

	      // Social Auth IDPs.
	      _.each(idProviders, function (provider) {
	        children.push(this._createButton(provider));
	      }, this);

	      // If the social auth buttons have to be above the Okta form, the title moves from
	      // primary auth form to the social auth (above the buttons) and the divider goes below
	      // the buttons (in between social auth and primary auth). If social auth needs to go below
	      // Okta form, just add the divider at the top of the social auth container. The title still
	      // lives in primary auth form.
	      if (this.settings.get('socialAuthPositionTop')) {
	        children.unshift(formTitleTpl({title: Okta.loc('primaryauth.title', 'login')}));
	        // Divider between Primary Auth and the Social Auth
	        children.push(divider);
	      } else {
	        children.unshift(divider);
	      }

	      return children;
	    },

	    _createButton: function (options) {
	      var type = options.type.toLowerCase(),
	          attr = 'social-auth-' + type + '-button';

	      return Okta.createButton({
	        attributes: {
	          'data-se': attr
	        },
	        className: 'social-auth-button ' + attr,
	        title: Okta.loc('socialauth.' + type + '.label'),
	        events: {
	          'click': function (e) {
	            e.preventDefault();
	            OAuth2Util.getTokens(this.settings, {idp: options.id});
	          }
	        }
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(87),
	  __webpack_require__(112),
	  __webpack_require__(91)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, BaseLoginModel, CookieUtil, Enums) {

	  var _ = Okta._;

	  return BaseLoginModel.extend({

	    props: function () {
	      var settingsUsername = this.settings && this.settings.get('username'),
	          cookieUsername = CookieUtil.getCookieUsername(),
	          remember = false,
	          username;
	      if (settingsUsername) {
	        username = settingsUsername;
	        remember = username === cookieUsername;
	      }
	      else if (cookieUsername) {
	        username = cookieUsername;
	        remember = true;
	      }

	      return {
	        username: ['string', true, username],
	        lastUsername: ['string', false, cookieUsername],
	        password: ['string', true],
	        context: ['object', false],
	        remember: ['boolean', true, remember],
	        multiOptionalFactorEnroll: ['boolean', true]
	      };
	    },

	    local: {
	      deviceFingerprint: ['string', false]
	    },

	    constructor: function (options) {
	      this.settings = options && options.settings;
	      this.appState = options && options.appState;
	      Okta.Model.apply(this, arguments);
	      this.listenTo(this, 'change:username', function (model, username) {
	        this.set({remember: username === this.get('lastUsername')});
	      });
	    },
	    parse: function (options) {
	      return _.omit(options, ['settings', 'appState']);
	    },

	    save: function () {
	      var username = this.settings.transformUsername(this.get('username'), Enums.PRIMARY_AUTH),
	          password = this.get('password'),
	          remember = this.get('remember'),
	          lastUsername = this.get('lastUsername'),
	          multiOptionalFactorEnroll = this.get('multiOptionalFactorEnroll'),
	          deviceFingerprintEnabled = this.settings.get('features.deviceFingerprinting');

	      // Only delete the cookie if its owner says so. This allows other
	      // users to log in on a one-off basis.
	      if (!remember && lastUsername === username) {
	        CookieUtil.removeUsernameCookie();
	      }
	      else if (remember) {
	        CookieUtil.setUsernameCookie(username);
	      }

	      //the 'save' event here is triggered and used in the BaseLoginController
	      //to disable the primary button on the primary auth form
	      this.trigger('save');

	      this.appState.trigger('loading', true);
	      return this.startTransaction(function (authClient) {

	        // Add the custom header for fingerprint if needed, and then remove it afterwards
	        // Since we only need to send it for primary auth
	        if (deviceFingerprintEnabled) {
	          authClient.options.headers['X-Device-Fingerprint'] = this.get('deviceFingerprint');
	        }
	        return authClient.signIn({
	          username: username,
	          password: password,
	          options: {
	            warnBeforePasswordExpired: true,
	            multiOptionalFactorEnroll: multiOptionalFactorEnroll
	          }
	        })
	        .fin(function () {
	          if (deviceFingerprintEnabled) {
	            delete authClient.options.headers['X-Device-Fingerprint'];
	          }
	        });
	      })
	      .fail(_.bind(function () {
	        this.trigger('error');
	        // Specific event handled by the Header for the case where the security image is not
	        // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
	        this.appState.trigger('removeLoading');
	        CookieUtil.removeUsernameCookie();
	      }, this))
	      .fin(_.bind(function () {
	        this.appState.trigger('loading', false);
	      }, this));
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(135),
	  __webpack_require__(83),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88),
	  __webpack_require__(154),
	  __webpack_require__(134),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, CountryUtil, FactorUtil, FormController, FormType, RouterUtil,
	          Footer, PhoneTextBox, TextBox) {

	  var _ = Okta._;

	  function goToFactorActivation(view, step) {
	    var url = RouterUtil.createActivateFactorUrl(view.options.appState.get('activatedFactorProvider'),
	      view.options.appState.get('activatedFactorType'), step);
	    view.options.appState.trigger('navigate', url);
	  }

	  function setStateValues(view) {
	    var userPhoneNumber, userCountryCode;
	    if (view.model.get('activationType') === 'SMS') {
	      userCountryCode = view.model.get('countryCode');
	      userPhoneNumber = view.model.get('phoneNumber');
	    }
	    view.options.appState.set({
	      factorActivationType: view.model.get('activationType'),
	      userCountryCode: userCountryCode,
	      userPhoneNumber: userPhoneNumber
	    });
	  }

	  function enrollFactor(view, factorType) {
	    return view.model.doTransaction(function(transaction) {
	      return transaction.prev()
	      .then(function (trans) {
	        var factor = _.findWhere(trans.factors, {
	          factorType: factorType,
	          provider: 'OKTA'
	        });
	        return factor.enroll();
	      })
	      .then(function (trans) {
	        var textActivationLinkUrl,
	            emailActivationLinkUrl,
	            sharedSecret,
	            res = trans.data;

	        if (res &&
	            res._embedded &&
	            res._embedded.factor &&
	            res._embedded.factor._embedded &&
	            res._embedded.factor._embedded.activation) {

	          var factor = res._embedded.factor;

	          // Shared secret
	          sharedSecret = factor._embedded.activation.sharedSecret;

	          if (factor._embedded.activation._links &&
	              factor._embedded.activation._links.send) {

	            var activationSendLinks = factor._embedded.activation._links.send;

	            // SMS activation url
	            var smsItem = _.findWhere(activationSendLinks, {name: 'sms'});
	            textActivationLinkUrl = smsItem ? smsItem.href : null;

	            // Email activation url
	            var emailItem = _.findWhere(activationSendLinks, {name: 'email'});
	            emailActivationLinkUrl = emailItem ? emailItem.href : null;
	          }
	        }

	        view.model.set({
	          'SMS': textActivationLinkUrl,
	          'EMAIL': emailActivationLinkUrl,
	          'sharedSecret': sharedSecret
	        });

	        return trans;
	      });
	    });
	  }

	  return FormController.extend({
	    className: 'enroll-manual-push',
	    Model: function () {
	      return {
	        local: {
	          activationType: ['string', true, this.options.appState.get('factorActivationType') || 'SMS'],
	          countryCode: ['string', false, 'US'],
	          phoneNumber: 'string',
	          'SMS': ['string', false, this.options.appState.get('textActivationLinkUrl')],
	          'EMAIL': ['string', false, this.options.appState.get('emailActivationLinkUrl')],
	          'sharedSecret': ['string', false, this.options.appState.get('sharedSecret')],
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        },
	        derived: {
	          countryCallingCode: {
	            deps: ['countryCode'],
	            fn: function (countryCode) {
	              return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
	            }
	          },
	          fullPhoneNumber: {
	            deps: ['countryCallingCode', 'phoneNumber'],
	            fn: function (countryCallingCode, phoneNumber) {
	              return countryCallingCode + phoneNumber;
	            }
	          }
	        }
	      };
	    },

	    Form: {
	      title: function () {
	        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
	        return Okta.loc('enroll.totp.title', 'login', [factorName]);
	      },
	      subtitle: _.partial(Okta.loc, 'enroll.totp.cannotScanBarcode', 'login'),
	      noButtonBar: true,
	      attributes: { 'data-se': 'step-manual-setup' },

	      formChildren: function () {
	        var children = [
	          FormType.Input({
	            name: 'activationType',
	            type: 'select',
	            wide: true,
	            options: {
	              SMS: Okta.loc('enroll.totp.sendSms', 'login'),
	              EMAIL: Okta.loc('enroll.totp.sendEmail', 'login'),
	              MANUAL: Okta.loc('enroll.totp.setupManually', 'login')
	            }
	          }),

	          FormType.Input({
	            name: 'countryCode',
	            type: 'select',
	            wide: true,
	            options: CountryUtil.getCountries(),
	            showWhen: {activationType: 'SMS'}
	          }),

	          FormType.Input({
	            placeholder: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
	            className: 'enroll-sms-phone',
	            name: 'phoneNumber',
	            input: PhoneTextBox,
	            type: 'text',
	            showWhen: {activationType: 'SMS'}
	          }),

	          FormType.View({
	            View: '\
	              <p class="okta-form-subtitle o-form-explain text-align-c">\
	                {{i18n code="enroll.totp.sharedSecretInstructions" bundle="login"}}\
	              </p>\
	            ',
	            showWhen: {activationType: 'MANUAL'}
	          }),

	          FormType.Input({
	            name: 'sharedSecret',
	            input: TextBox,
	            type: 'text',
	            disabled: true,
	            showWhen: {activationType: 'MANUAL'},
	            initialize: function () {
	              this.listenTo(this.model, 'change:sharedSecret', this.render);
	            }
	          }),

	          FormType.View({
	            View: '<div data-type="next-button-wrap"></div>',
	            showWhen: {activationType: 'MANUAL'}
	          }),

	          FormType.Button({
	            title: Okta.loc('oform.next', 'login'),
	            className: 'button button-primary button-wide button-next',
	            attributes: {'data-se': 'next-button'},
	            click: _.bind(function () {
	              setStateValues(this);
	              goToFactorActivation(this, 'passcode');
	            }, this)
	          }, '[data-type="next-button-wrap"]'),

	          FormType.Toolbar({
	            noCancelButton: true,
	            save: Okta.loc('oform.send', 'login'),
	            showWhen: {
	              activationType: function (val) {
	                return val === 'SMS' || val === 'EMAIL';
	              }
	            }
	          })
	        ];
	        return children;
	      }
	    },

	    Footer: Footer,

	    initialize: function () {
	      this.setInitialModel();
	      // Move this logic to a model when AuthClient supports sending email and sms
	      this.listenTo(this.form, 'save', function () {
	        var self = this;
	        this.model.doTransaction(function(transaction) {
	          var activationType = this.get('activationType').toLowerCase(),
	              opts = {};

	          if (activationType === 'sms') {
	            opts.profile = {phoneNumber: this.get('fullPhoneNumber')};
	          }

	          return transaction.factor.activation.send(activationType, opts)
	          .then(function(trans) {
	            setStateValues(self);
	            // Note: Need to defer because OktaAuth calls our router success
	            // handler on the next tick - if we immediately called, appState would
	            // still be populated with the last response
	            _.defer(function () {
	              goToFactorActivation(self, 'sent');
	            });
	            return trans;
	          });
	        });
	      });

	      this.listenTo(this.model, 'change:activationType', function (model, value) {
	        this.form.clearErrors();
	        if (value === 'MANUAL' && this.options.appState.get('activatedFactorType') !== 'token:software:totp') {
	          enrollFactor(this, 'token:software:totp');
	        } else if (this.options.appState.get('activatedFactorType') !== 'push') {
	          enrollFactor(this, 'push');
	        }
	      });
	    },

	    setInitialModel: function () {
	      if (this.options.appState.get('factorActivationType') === 'SMS') {
	        this.model.set({
	          countryCode: this.options.appState.get('userCountryCode') || 'US',
	          phoneNumber: this.options.appState.get('userPhoneNumber')
	        });
	      }
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isMfaEnrollActivate') ||
	        this.options.appState.get('isMfaEnroll')) {
	        return true;
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(88)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, RouterUtil) {

	  var _ = Okta._;

	  function goToFactorActivation(appState) {
	    var url = RouterUtil.createActivateFactorUrl(appState.get('activatedFactorProvider'),
	      appState.get('activatedFactorType'));
	    appState.trigger('navigate', url);
	  }

	  return Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="mfa.backToFactors" bundle="login"}}\
	      </a>\
	      <a href="#" class="link help goto js-goto" data-se="goto-link">\
	        {{i18n code="mfa.scanBarcode" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      },
	      'click .js-goto' : function (e) {
	        e.preventDefault();
	        var goToFactor = _.partial(goToFactorActivation, this.options.appState);
	        this.options.appState.unset('factorActivationType');
	        if (this.options.appState.get('activatedFactorType') !== 'push') {
	          this.model.doTransaction(function (transaction) {
	            return transaction.prev()
	            .then(function (trans) {
	              var factor = _.findWhere(trans.factors, {
	                factorType: 'push',
	                provider: 'OKTA'
	              });
	              return factor.enroll();
	            });
	          })
	          .then(goToFactor);
	        } else {
	          this.model.startTransaction(function (authClient) {
	            return authClient.tx.resume();
	          })
	          .then(function() {
	            // Sets to trigger on a tick after the appState has been set.
	            // This is due to calling the globalSuccessFn in a callback
	            setTimeout(goToFactor);
	          });
	        }
	      }
	    },
	    back: function () {
	      var self = this;
	      self.options.appState.unset('factorActivationType');
	      if (self.options.appState.get('prevLink')) {
	        this.model.doTransaction(function(transaction) {
	          return transaction.prev();
	        })
	        .then(function() {
	          // we trap 'MFA_ENROLL' response that's why we need to trigger navigation from here
	          self.options.appState.trigger('navigate', 'signin/enroll');
	        });
	      }
	      else {
	        self.options.appState.trigger('navigate', 'signin/enroll');
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(135),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(88)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, CountryUtil, FormController, FormType, RouterUtil) {

	  var _ = Okta._;

	  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
	  // in network connection lost errors in Safari and IE.
	  var PUSH_INTERVAL = 6000;

	  var Footer = Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="oform.back" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      }
	    },
	    back: function() {
	      var url = RouterUtil.createActivateFactorUrl(this.options.appState.get('activatedFactorProvider'),
	          this.options.appState.get('activatedFactorType'), 'manual');
	      this.options.appState.trigger('navigate', url);
	    }
	  });

	  var emailSentForm = {
	    title: _.partial(Okta.loc, 'enroll.totp.enrollViaEmail.title', 'login'),
	    noButtonBar: true,
	    attributes: { 'data-se': 'sent-email-activation-link' },
	    formChildren: [
	      FormType.View({
	        View: Okta.View.extend({
	          template: '\
	            <p>{{i18n code="enroll.totp.enrollViaEmail.msg" bundle="login"}}</p>\
	            <p class="email-address">{{email}}</p>\
	          ',
	          getTemplateData: function () {
	            return {email: this.options.appState.get('userEmail')};
	          }
	        })
	      })
	    ]
	  };

	  var smsSentForm = {
	    title: _.partial(Okta.loc, 'enroll.totp.enrollViaSms.title', 'login'),
	    noButtonBar: true,
	    attributes: { 'data-se': 'sent-sms-activation-link' },
	    formChildren: [
	      FormType.View({
	        View: Okta.View.extend({
	          template: '\
	            <p>{{i18n code="enroll.totp.enrollViaSms.msg" bundle="login"}}</p>\
	            <p class="phone-number">{{phoneNumber}}</p>\
	          ',
	          getTemplateData: function () {
	            return {phoneNumber: this.model.get('fullPhoneNumber')};
	          }
	        })
	      })
	    ]
	  };

	  return FormController.extend({
	    className: 'enroll-activation-link-sent',
	    Model: function () {
	      return {
	        local: {
	          countryCode: ['string', false, this.options.appState.get('userCountryCode')],
	          phoneNumber: ['string', false, this.options.appState.get('userPhoneNumber')],
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        },
	        derived: {
	          countryCallingCode: {
	            deps: ['countryCode'],
	            fn: function (countryCode) {
	              return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
	            }
	          },
	          fullPhoneNumber: {
	            deps: ['countryCallingCode', 'phoneNumber'],
	            fn: function (countryCallingCode, phoneNumber) {
	              return countryCallingCode + phoneNumber;
	            }
	          }
	        }
	      };
	    },

	    Form: function () {
	      var activationType = this.options.appState.get('factorActivationType');
	      switch (activationType) {
	      case 'SMS':
	        return smsSentForm;
	      case 'EMAIL':
	        return emailSentForm;
	      default:
	        throw new Error('Unknown activation option: ' + activationType);
	      }
	    },

	    Footer: Footer,

	    initialize: function () {
	      this.pollForEnrollment();
	    },

	    remove: function () {
	      return FormController.prototype.remove.apply(this, arguments);
	    },

	    pollForEnrollment: function () {
	      return this.model.doTransaction(function(transaction) {
	        return transaction.poll(PUSH_INTERVAL);
	      });
	    },

	    trapAuthResponse: function () {
	      if (this.options.appState.get('isWaitingForActivation')) {
	        this.pollForEnrollment();
	        return true;
	      }
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(88),
	  __webpack_require__(147)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, RouterUtil, EnterPasscodeForm) {

	  var Footer = Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="oform.back" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      }
	    },
	    back: function () {
	      var url = RouterUtil.createActivateFactorUrl(this.options.appState.get('activatedFactorProvider'),
	          'push', 'manual');
	      this.options.appState.trigger('navigate', url);
	    }
	  });

	  return FormController.extend({
	    className: 'activate-push',
	    Model: function () {
	      return {
	        props: {
	          factorId: ['string', true, this.options.appState.get('activatedFactorId')],
	          passCode: ['string', true]
	        },
	        local: {
	          '__factorType__': ['string', false, this.options.factorType],
	          '__provider__': ['string', false, this.options.provider]
	        },
	        save: function () {
	          return this.doTransaction(function(transaction) {
	            return transaction.activate({
	              passCode: this.get('passCode')
	            });
	          });
	        }
	      };
	    },

	    Form: EnterPasscodeForm,

	    Footer: Footer

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(91),
	  __webpack_require__(85),
	  __webpack_require__(158),
	  __webpack_require__(83),
	  __webpack_require__(159),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, Enums, FormType, ValidationUtil, FactorUtil, Footer, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'password-expired',
	    Model: {
	      props: {
	        oldPassword: ['string', true],
	        newPassword: ['string', true],
	        confirmPassword: ['string', true]
	      },
	      validate: function () {
	        return ValidationUtil.validatePasswordMatch(this);
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          return transaction.changePassword({
	            oldPassword: this.get('oldPassword'),
	            newPassword: this.get('newPassword')
	          });
	        });
	      }
	    },
	    Form: {
	      save: _.partial(Okta.loc, 'password.expired.submit', 'login'),
	      title: function () {
	        var expiringSoon = this.options.appState.get('isPwdExpiringSoon'),
	            numDays = this.options.appState.get('passwordExpireDays');
	        if (expiringSoon && numDays > 0) {
	          return Okta.loc('password.expiring.title', 'login', [numDays]);
	        }
	        else if (expiringSoon && numDays === 0) {
	          return Okta.loc('password.expiring.today', 'login');
	        }
	        else {
	          return Okta.loc('password.expired.title', 'login');
	        }
	      },
	      subtitle: function () {
	        if (this.options.appState.get('isPwdExpiringSoon')) {
	          return Okta.loc('password.expiring.subtitle', 'login');
	        }

	        var policy = this.options.appState.get('policy');
	        if (!policy || !policy.complexity) {
	          return;
	        }

	        return FactorUtil.getPasswordComplexityDescription(policy.complexity);
	      },
	      formChildren: function () {
	        return [
	          FormType.Input({
	            'label-top': true,
	            label: false,
	            placeholder: Okta.loc('password.oldPassword.placeholder', 'login'),
	            name: 'oldPassword',
	            input: TextBox,
	            type: 'password',
	            params: {
	              innerTooltip: Okta.loc('password.oldPassword.tooltip', 'login'),
	              icon: 'credentials-16'
	            }
	          }),
	          FormType.Divider(),
	          FormType.Input({
	            'label-top': true,
	            label: false,
	            placeholder: Okta.loc('password.newPassword.placeholder', 'login'),
	            name: 'newPassword',
	            input: TextBox,
	            type: 'password',
	            params: {
	              innerTooltip: Okta.loc('password.newPassword.tooltip', 'login'),
	              icon: 'credentials-16'
	            }
	          }),
	          FormType.Input({
	            'label-top': true,
	            label: false,
	            placeholder: Okta.loc('password.confirmPassword.placeholder', 'login'),
	            name: 'confirmPassword',
	            input: TextBox,
	            type: 'password',
	            params: {
	              innerTooltip: Okta.loc('password.confirmPassword.tooltip', 'login'),
	              icon: 'credentials-16'
	            }
	          })
	        ];
	      }
	    },
	    Footer: Footer,

	    initialize: function () {
	      this.listenTo(this.form, 'save', function () {
	        var creds = {
	          username: this.options.appState.get('userEmail'),
	          password: this.model.get('newPassword')
	        };
	        this.settings.processCreds(creds)
	        .then(_.bind(this.model.save, this.model));
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  var fn = {};

	  // Validate the 'username' field on the model.
	  fn.validateUsername = function (model) {
	    var username = model.get('username');
	    if (username && username.length > 256) {
	      return {
	        username: Okta.loc('model.validation.field.username', 'login')
	      };
	    }
	  };

	  // Validate that the 'newPassword' and 'confirmPassword' fields on the model are a match.
	  fn.validatePasswordMatch = function (model) {
	    if (model.get('newPassword') !== model.get('confirmPassword')) {
	      return {
	        confirmPassword: Okta.loc('password.error.match', 'login')
	      };
	    }
	  };

	  return fn;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(91)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums) {

	  return Okta.View.extend({
	    template: '\
	      {{#if passwordWarn}}\
	        <a href="#" class="link help js-skip" data-se="skip-link">\
	          {{i18n code="password.expiring.later" bundle="login"}}\
	        </a>\
	      {{/if}}\
	      <a href="#" class="link help goto js-signout" data-se="signout-link">{{i18n code="signout" bundle="login"}}</a>\
	    ',
	    className: 'auth-footer clearfix',
	    events: {
	      'click .js-signout' : function (e) {
	        e.preventDefault();
	        var self = this;
	        this.model.doTransaction(function (transaction) {
	              return transaction.cancel();
	            })
	            .then(function () {
	              self.state.set('navigateDir', Enums.DIRECTION_BACK);
	              self.options.appState.trigger('navigate', '');
	            });
	      },
	      'click .js-skip' : function (e) {
	        e.preventDefault();
	        this.model.doTransaction(function (transaction) {
	          return transaction.skip();
	        });
	      }
	    },
	    getTemplateData: function () {
	      return {passwordWarn: this.options.appState.get('isPwdExpiringSoon')};
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(159),
	  __webpack_require__(89)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, Footer, Util) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'custom-password-expired',
	    Model: {},
	    Form: {
	      noButtonBar: true,
	      title: function () {
	        var expiringSoon = this.options.appState.get('isPwdExpiringSoon'),
	            numDays = this.options.appState.get('passwordExpireDays');
	        if (expiringSoon && numDays > 0) {
	          return Okta.loc('password.expiring.title', 'login', [numDays]);
	        }
	        else if (expiringSoon && numDays === 0) {
	          return Okta.loc('password.expiring.today', 'login');
	        }
	        else {
	          return Okta.loc('password.expired.title', 'login');
	        }
	      },
	      subtitle: function () {
	        if (this.options.appState.get('isPwdExpiringSoon')) {
	          return Okta.loc('password.expiring.subtitle', 'login') + ' ' +
	                 Okta.loc('password.expired.custom.subtitle', 'login');
	        }

	        return Okta.loc('password.expired.custom.subtitle', 'login');
	      },
	      formChildren: function () {
	        return [
	          FormType.Button({
	            title: _.partial(Okta.loc, 'password.expired.custom.submit', 'login',
	                            [this.options.appState.get('passwordExpiredWebsiteName')]),
	            className: 'button button-primary button-wide',
	            attributes: {'data-se': 'custom-button'},
	            click: function () {
	              Util.redirect(this.options.appState.get('passwordExpiredLinkUrl'));
	            }
	          })
	        ];
	      }
	    },
	    Footer: Footer
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(91),
	  __webpack_require__(85),
	  __webpack_require__(158),
	  __webpack_require__(162),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, Enums, FormType, ValidationUtil, ContactSupport, TextBox) {

	  var _ = Okta._;

	  var Footer = Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="goback" bundle="login"}}\
	      </a>\
	      {{#if helpSupportNumber}}\
	      <a href="#" class="link goto js-contact-support">\
	        {{i18n code="mfa.noAccessToEmail" bundle="login"}}\
	      </a>\
	      {{/if}}\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      },
	      'click .js-contact-support': function (e) {
	        e.preventDefault();
	        this.state.trigger('contactSupport');
	        this.$('.js-contact-support').hide();
	      }
	    },
	    getTemplateData: function () {
	      return this.settings.pick('helpSupportNumber');
	    },
	    back: function () {
	      this.state.set('navigateDir', Enums.DIRECTION_BACK);
	      this.options.appState.trigger('navigate', '');
	    }
	  });

	  return FormController.extend({
	    className: 'forgot-password',
	    Model: {
	      props: {
	        username: ['string', true],
	        factorType: ['string', true, Enums.RECOVERY_FACTOR_TYPE_EMAIL]
	      },
	      validate: function () {
	        return ValidationUtil.validateUsername(this);
	      },
	      save: function () {
	        var self = this;
	        this.startTransaction(function(authClient) {
	          return authClient.forgotPassword({
	            username: self.settings.transformUsername(self.get('username'), Enums.FORGOT_PASSWORD),
	            factorType: self.get('factorType')
	          });
	        })
	        .fail(function () {
	          self.set('factorType', Enums.RECOVERY_FACTOR_TYPE_EMAIL);
	        });
	      }
	    },
	    Form: {
	      autoSave: true,
	      save: _.partial(Okta.loc, 'password.forgot.sendEmail', 'login'),
	      title: _.partial(Okta.loc, 'password.reset', 'login'),
	      formChildren: function () {
	        var formChildren = [
	          FormType.Input({
	            placeholder: Okta.loc('password.forgot.email.or.username.placeholder', 'login'),
	            name: 'username',
	            input: TextBox,
	            type: 'text',
	            params: {
	              innerTooltip: Okta.loc('password.forgot.email.or.username.tooltip', 'login'),
	              icon: 'person-16-gray'
	            }
	          })
	        ];
	        var smsEnabled = this.settings.get('features.smsRecovery');
	        var callEnabled = this.settings.get('features.callRecovery');
	        if (smsEnabled || callEnabled) {
	          formChildren.push(FormType.View({
	            View: Okta.View.extend({
	              template: '\
	                <p class="mobile-recovery-hint">\
	                  {{i18n code="recovery.mobile.hint" bundle="login" arguments="mobileFactors"}}\
	                </p>',
	              getTemplateData: function () {
	                var mobileFactors;
	                if (smsEnabled && callEnabled) {
	                  mobileFactors = Okta.loc('recovery.smsOrCall');
	                }
	                else if (callEnabled) {
	                  mobileFactors = Okta.loc('recovery.call');
	                }
	                else {
	                  mobileFactors = Okta.loc('recovery.sms');
	                }
	                return { mobileFactors : mobileFactors };
	              }
	            })
	          }));
	        }

	        return formChildren;
	      },
	      initialize: function () {
	        var form = this;

	        if (this.settings.get('features.callRecovery')) {
	          this.$el.addClass('forgot-password-call-enabled');
	          this.addRecoveryFactorButton('call-button', 'password.forgot.call',
	            Enums.RECOVERY_FACTOR_TYPE_CALL, form);
	        }
	        if (this.settings.get('features.smsRecovery')) {
	          this.$el.addClass('forgot-password-sms-enabled');
	          this.addRecoveryFactorButton('sms-button', 'password.forgot.sendText',
	            Enums.RECOVERY_FACTOR_TYPE_SMS, form);
	        }

	        this.listenTo(this.state, 'contactSupport', function () {
	          this.add(ContactSupport, '.o-form-error-container');
	        });

	        this.listenTo(this, 'save', function () {
	          this.options.appState.set('username', this.model.get('username'));
	        });
	      },
	      addRecoveryFactorButton: function (className, labelCode, factorType, form) {
	        this.addButton({
	          attributes: { 'data-se': className},
	          type: 'button',
	          className: 'button-primary ' + className,
	          text: Okta.loc(labelCode, 'login'),
	          action: function () {
	            form.clearErrors();
	            if (this.model.isValid()) {
	              this.model.set('factorType', factorType);
	              form.trigger('save', this.model);
	            }
	          }
	        }, { prepend: true });
	      }
	    },
	    Footer: Footer,

	    initialize: function () {
	      this.options.appState.unset('username');
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta) {

	  return Okta.View.extend({
	    template: '\
	      <div class="infobox">\
	        <span class="icon info-16"></span>\
	        <p>{{i18n code="contact.support" bundle="login" arguments="helpSupportNumber"}}</p>\
	      </div>',
	    className: 'contact-support',

	    getTemplateData: function () {
	      return this.settings.pick('helpSupportNumber');
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(91),
	  __webpack_require__(108),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, Enums, FooterSignout, TextBox) {

	  var _ = Okta._;
	  var API_RATE_LIMIT = 30000; //milliseconds

	  return FormController.extend({
	    className: 'recovery-challenge',
	    Model: {
	      props: {
	        passCode: ['string', true]
	      },
	      local: {
	        ableToResend: 'boolean'
	      },
	      resendCode: function () {
	        // Note: This does not require a trapAuthResponse because Backbone's
	        // router will not navigate if the url path is the same
	        this.limitResending();
	        return this.doTransaction(function(transaction) {
	          return transaction.resend();
	        });
	      },
	      limitResending: function () {
	        this.set({ableToResend: false});
	        _.delay(_.bind(this.set, this), API_RATE_LIMIT, {ableToResend: true});
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          return transaction.verify({
	            passCode: this.get('passCode')
	          });
	        });
	      }
	    },
	    Form: {
	      autoSave: true,
	      save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
	      title: function () {
	        if (this.options.appState.get('factorType') === Enums.RECOVERY_FACTOR_TYPE_CALL) {
	          return Okta.loc('recoveryChallenge.call.title', 'login');
	        } else {
	          return Okta.loc('recoveryChallenge.sms.title', 'login');
	        }
	      },
	      className: 'recovery-challenge',
	      initialize: function () {
	        this.listenTo(this.model, 'error', function () {
	          this.clearErrors();
	        });
	      },
	      formChildren: function () {
	        return [
	          FormType.Button({
	            title: Okta.loc('mfa.resendCode', 'login'),
	            attributes: { 'data-se': 'resend-button' },
	            className: 'button sms-request-button',
	            click: function () {
	              this.model.resendCode();
	            },
	            initialize: function () {
	              this.listenTo(this.model, 'change:ableToResend', function (model, ableToResend) {
	                if (ableToResend) {
	                  this.options.title = Okta.loc('mfa.resendCode', 'login');
	                  this.enable();
	                  this.render();
	                } else {
	                  this.options.title = Okta.loc('mfa.sent', 'login');
	                  this.disable();
	                  this.render();
	                }
	              });
	            }
	          }),
	          FormType.Input({
	            placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
	            className: 'enroll-sms-phone',
	            name: 'passCode',
	            input: TextBox,
	            type: 'text'
	          })
	        ];
	      }
	    },

	    events: {
	      'click .send-email-link': function (e) {
	        e.preventDefault();
	        var settings = this.model.settings,
	            username = this.options.appState.get('username'),
	            recoveryType = this.options.appState.get('recoveryType');

	        this.model.startTransaction(function (authClient) {
	          // The user could have landed here via the Forgot Password/Unlock Account flow
	          switch (recoveryType) {
	            case Enums.RECOVERY_TYPE_PASSWORD:
	              return authClient.forgotPassword({
	                username: settings.transformUsername(username, Enums.FORGOT_PASSWORD),
	                factorType: Enums.RECOVERY_FACTOR_TYPE_EMAIL
	              });
	            case Enums.RECOVERY_TYPE_UNLOCK:
	              return authClient.unlockAccount({
	                username: settings.transformUsername(username, Enums.UNLOCK_ACCOUNT),
	                factorType: Enums.RECOVERY_FACTOR_TYPE_EMAIL
	              });
	            default:
	              return;
	          }
	        });
	      }
	    },

	    initialize: function () {
	      var recoveryType = this.options.appState.get('recoveryType'),
	          sendEmailLink;

	      switch (recoveryType) {
	        case Enums.RECOVERY_TYPE_PASSWORD:
	          sendEmailLink = '\
	            <a href="#" class="link send-email-link" data-se="send-email-link">\
	              {{i18n code="password.forgot.code.notReceived" bundle="login"}}\
	            </a>';
	          break;
	        case Enums.RECOVERY_TYPE_UNLOCK:
	          sendEmailLink = '\
	            <a href="#" class="link send-email-link" data-se="send-email-link">\
	              {{i18n code="account.unlock.sms.notReceived" bundle="login"}}\
	            </a>';
	          break;
	        default:
	          break;
	      }

	      if (sendEmailLink) {
	        this.add(sendEmailLink);
	      }

	      this.add(new FooterSignout(_.extend(this.toJSON(), {linkText: Okta.loc('goback', 'login'), linkClassName: ''})));
	    },

	    postRender: function () {
	      this.model.limitResending();
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(91),
	  __webpack_require__(84),
	  __webpack_require__(85)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums, FormController, FormType) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'password-reset-email-sent',
	    Model: function () {
	      return {
	        local: {
	          userFullName: ['string', false, this.options.appState.get('userFullName')]
	        }
	      };
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'password.forgot.emailSent.title', 'login'),
	      subtitle: function () {
	        var username = this.options.appState.get('username');
	        return Okta.loc('password.forgot.emailSent.desc', 'login', [username]);
	      },
	      noButtonBar: true,
	      attributes: { 'data-se': 'pwd-reset-email-sent' },
	      formChildren: function () {
	        return [
	          FormType.View({
	            View: Okta.View.extend({
	              template: '\
	              <span class="accessibility-text" role="status">{{alert}}</span>\
	              ',
	              getTemplateData: function () {
	                return { 'alert': Okta.loc('password.forgot.emailSent.title', 'login') };
	              }
	            })
	          }),

	          FormType.Button({
	            title: Okta.loc('goback', 'login'),
	            className: 'button button-primary button-wide',
	            attributes: {'data-se': 'back-button'},
	            click: function () {
	              var self = this;
	              return this.model.doTransaction(function (transaction) {
	                return transaction.cancel();
	              })
	              .then(function() {
	                self.state.set('navigateDir', Enums.DIRECTION_BACK);
	                self.options.appState.trigger('navigate', '');
	              });
	            }
	          })
	        ];
	      }
	    },

	    initialize: function (options) {
	      this.settings.callGlobalSuccess(Enums.FORGOT_PASSWORD_EMAIL_SENT, {
	        username: options.appState.get('username')
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(108),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, FooterSignout, TextBox) {

	  return FormController.extend({
	    className: 'recovery-question',
	    Model: {
	      props: {
	        answer: ['string', true],
	        showAnswer: 'boolean'
	      },
	      save: function () {
	        return this.doTransaction(function(transaction) {
	          return transaction.answer({ answer: this.get('answer') });
	        });
	      }
	    },
	    Form: {
	      autoSave: true,
	      save: function () {
	        switch (this.options.appState.get('recoveryType')) {
	        case 'PASSWORD':
	          return Okta.loc('password.forgot.question.submit', 'login');
	        case 'UNLOCK':
	          return Okta.loc('account.unlock.question.submit', 'login');
	        default:
	          return Okta.loc('mfa.challenge.verify', 'login');
	        }
	      },
	      title: function () {
	        switch (this.options.appState.get('recoveryType')) {
	        case 'PASSWORD':
	          return Okta.loc('password.forgot.question.title', 'login');
	        case 'UNLOCK':
	          return Okta.loc('account.unlock.question.title', 'login');
	        default:
	          return '';
	        }
	      },
	      formChildren: function () {
	        return [
	          FormType.Input({
	            label: this.options.appState.get('recoveryQuestion'),
	            placeholder: Okta.loc('mfa.challenge.answer.placeholder', 'login'),
	            name: 'answer',
	            input: TextBox,
	            type: 'password',
	            initialize: function () {
	              this.listenTo(this.model, 'change:showAnswer', function () {
	                var type = this.model.get('showAnswer') ? 'text' : 'password';
	                this.getInputs()[0].changeType(type);
	              });
	            }
	          }),
	          FormType.Input({
	            label: false,
	            'label-top': true,
	            placeholder: Okta.loc('mfa.challenge.answer.showAnswer', 'login'),
	            className: 'recovery-question-show margin-btm-0',
	            name: 'showAnswer',
	            type: 'checkbox'
	          })
	        ];
	      }
	    },
	    Footer: FooterSignout

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(158),
	  __webpack_require__(83),
	  __webpack_require__(108),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, FormType, ValidationUtil, FactorUtil, FooterSignout, TextBox) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'password-reset',
	    Model: {
	      props: {
	        newPassword: ['string', true],
	        confirmPassword: ['string', true]
	      },
	      validate: function () {
	        return ValidationUtil.validatePasswordMatch(this);
	      },
	      save: function () {
	        var self = this;
	        return this.doTransaction(function(transaction) {
	          return transaction
	          .resetPassword({
	            newPassword: self.get('newPassword')
	          });
	        });
	      }
	    },
	    Form: {
	      save: _.partial(Okta.loc, 'password.reset', 'login'),
	      title: _.partial(Okta.loc, 'password.reset.title', 'login'),
	      subtitle: function () {
	        var policy = this.options.appState.get('policy');
	        if (!policy || !policy.complexity) {
	          return;
	        }

	        return FactorUtil.getPasswordComplexityDescription(policy.complexity);
	      },
	      formChildren: function () {
	        return [
	          FormType.Input({
	            placeholder: Okta.loc('password.newPassword.placeholder', 'login'),
	            name: 'newPassword',
	            input: TextBox,
	            type: 'password',
	            params: {
	              innerTooltip: Okta.loc('password.newPassword.tooltip', 'login'),
	              icon: 'credentials-16'
	            }
	          }),
	          FormType.Input({
	            placeholder: Okta.loc('password.confirmPassword.placeholder', 'login'),
	            name: 'confirmPassword',
	            input: TextBox,
	            type: 'password',
	            params: {
	              innerTooltip: Okta.loc('password.confirmPassword.tooltip', 'login'),
	              icon: 'credentials-16'
	            }
	          })
	        ];
	      }
	    },
	    Footer: FooterSignout,

	    initialize: function () {
	      this.listenTo(this.form, 'save', function () {
	        var creds = {
	          username: this.options.appState.get('userEmail'),
	          password: this.model.get('newPassword')
	        };
	        this.settings.processCreds(creds)
	        .then(_.bind(this.model.save, this.model));
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(84)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController) {

	  return FormController.extend({
	    className: 'recovery-loading',

	    Model: {},
	    Form: {
	      noButtonBar: true
	    },

	    initialize: function (options) {
	      var self = this;
	      return this.model.startTransaction(function (authClient) {
	        return authClient.verifyRecoveryToken({
	          recoveryToken: options.token
	        });
	      })
	      .fail(function () {
	        self.options.appState.trigger('loading', false);
	      });
	    },

	    preRender: function () {
	      this.options.appState.trigger('loading', true);
	    },

	    trapAuthResponse: function () {
	      this.options.appState.trigger('loading', false);
	      return false;
	    }

	  });
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(84),
	  __webpack_require__(91),
	  __webpack_require__(85),
	  __webpack_require__(158),
	  __webpack_require__(162),
	  __webpack_require__(95)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FormController, Enums, FormType, ValidationUtil, ContactSupport, TextBox) {

	  var _ = Okta._;

	  var Footer = Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="goback" bundle="login"}}\
	      </a>\
	      {{#if helpSupportNumber}}\
	      <a href="#" class="link goto js-contact-support">\
	        {{i18n code="mfa.noAccessToEmail" bundle="login"}}\
	      </a>\
	      {{/if}}\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      },
	      'click .js-contact-support': function (e) {
	        e.preventDefault();
	        this.state.trigger('contactSupport');
	        this.$('.js-contact-support').hide();
	      }
	    },
	    getTemplateData: function () {
	      return this.settings.pick('helpSupportNumber');
	    },
	    back: function () {
	      this.state.set('navigateDir', Enums.DIRECTION_BACK);
	      this.options.appState.trigger('navigate', '');
	    }
	  });

	  return FormController.extend({
	    className: 'account-unlock',
	    Model: {
	      props: {
	        username: ['string', true],
	        factorType: ['string', true, Enums.RECOVERY_FACTOR_TYPE_EMAIL]
	      },
	      validate: function () {
	        return ValidationUtil.validateUsername(this);
	      },
	      save: function () {
	        var self = this;
	        return this.startTransaction(function (authClient) {
	          return authClient.unlockAccount({
	            username: self.settings.transformUsername(self.get('username'), Enums.UNLOCK_ACCOUNT),
	            factorType: self.get('factorType')
	          });
	        })
	        .fail(function () {
	          self.set('factorType', Enums.RECOVERY_FACTOR_TYPE_EMAIL);
	        });
	      }
	    },
	    Form: {
	      autoSave: true,
	      save: _.partial(Okta.loc, 'account.unlock.sendEmail', 'login'),
	      title: _.partial(Okta.loc, 'account.unlock.title', 'login'),
	      formChildren: function () {
	        var formChildren = [
	          FormType.Input({
	            placeholder: Okta.loc('account.unlock.email.or.username.placeholder', 'login'),
	            name: 'username',
	            input: TextBox,
	            type: 'text',
	            params: {
	              innerTooltip: Okta.loc('account.unlock.email.or.username.tooltip', 'login'),
	              icon: 'person-16-gray'
	            }
	          })
	        ];
	        if (this.settings.get('features.smsRecovery')) {
	          formChildren.push(FormType.View({View: '\
	            <p class="sms-hint">\
	              {{i18n code="recovery.sms.hint" bundle="login"}}\
	            </p>\
	          '}));
	        }

	        return formChildren;
	      },
	      initialize: function () {
	        var form = this;

	        this.listenTo(this, 'save', function () {
	          this.options.appState.set('username', this.model.get('username'));
	        });

	        if (this.settings.get('features.smsRecovery')) {
	          this.$el.addClass('forgot-password-sms-enabled');
	          this.addButton({
	            attributes: { 'data-se': 'sms-button'},
	            type: 'button',
	            className: 'button-primary sms-button',
	            text: Okta.loc('account.unlock.sendText', 'login'),
	            action: function () {
	              form.clearErrors();
	              if (this.model.isValid()) {
	                this.model.set('factorType', Enums.RECOVERY_FACTOR_TYPE_SMS);
	                form.trigger('save', this.model);
	              }
	            }
	          }, { prepend: true });
	        }

	        this.listenTo(this.state, 'contactSupport', function () {
	          this.add(ContactSupport, '.o-form-error-container');
	        });
	      }
	    },
	    Footer: Footer
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(91),
	  __webpack_require__(84),
	  __webpack_require__(85)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums, FormController, FormType) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'account-unlocked',
	    Model: function () {
	      return {
	        local: {
	          userFullName: ['string', false, this.options.appState.get('userFullName')]
	        }
	      };
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'account.unlock.unlocked.title', 'login'),
	      subtitle: _.partial(Okta.loc, 'account.unlock.unlocked.desc', 'login'),
	      noButtonBar: true,
	      attributes: { 'data-se': 'account-unlocked' },
	      formChildren: function () {
	        return [
	          FormType.Button({
	            title: Okta.loc('goback', 'login'),
	            className: 'button button-primary button-wide',
	            attributes: {'data-se': 'back-button'},
	            click: function () {
	              this.state.set('navigateDir', Enums.DIRECTION_BACK);
	              this.options.appState.trigger('navigate', '');
	            }
	          })
	        ];
	      }
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(91),
	  __webpack_require__(84),
	  __webpack_require__(85)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Enums, FormController, FormType) {

	  var _ = Okta._;

	  return FormController.extend({
	    className: 'account-unlock-email-sent',
	    Model: function () {
	      return {
	        local: {
	          userFullName: ['string', false, this.options.appState.get('userFullName')]
	        }
	      };
	    },

	    Form: {
	      title: _.partial(Okta.loc, 'account.unlock.emailSent.title', 'login'),
	      subtitle: function () {
	        var username = this.options.appState.get('username');
	        return Okta.loc('account.unlock.emailSent.desc', 'login', [username]);
	      },
	      noButtonBar: true,
	      attributes: { 'data-se': 'unlock-email-sent' },
	      formChildren: function () {
	        return [
	          FormType.Button({
	            title: Okta.loc('goback', 'login'),
	            className: 'button button-primary button-wide',
	            attributes: {'data-se': 'back-button'},
	            click: function () {
	              this.state.set('navigateDir', Enums.DIRECTION_BACK);
	              this.options.appState.trigger('navigate', '');
	            }
	          })
	        ];
	      }
	    },

	    initialize: function (options) {
	      this.settings.callGlobalSuccess(Enums.UNLOCK_ACCOUNT_EMAIL_SENT, {
	        username: options.appState.get('username')
	      });
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9),
	  __webpack_require__(91),
	  __webpack_require__(84),
	  __webpack_require__(85),
	  __webpack_require__(89),
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, Enums, FormController, FormType, Util) {

	  var _ = Okta._;
	  var $ = Okta.$;

	  var Footer = Okta.View.extend({
	    template: '\
	      <a href="#" class="link help js-back" data-se="back-link">\
	        {{i18n code="goback" bundle="login"}}\
	      </a>\
	    ',
	    className: 'auth-footer',
	    events: {
	      'click .js-back' : function (e) {
	        e.preventDefault();
	        this.back();
	      }
	    },
	    back: function () {
	      this.state.set('navigateDir', Enums.DIRECTION_BACK);
	      this.options.appState.trigger('navigate', '');
	    }
	  });

	  var sessionCookieRedirectTpl = Okta.tpl(
	    '{{baseUrl}}/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
	    '&token={{{token}}}&redirectUrl={{{redirectUrl}}}'
	  );

	  var BarcodeView = Okta.View.extend({
	    className: 'clearfix',
	    template: '\
	      <div class="">\
	          <style> .qrcode-success .success-16-green::before {font-size: 180px; }</style>\
	          <div class="qrcode-wrap">\
	              <div style="height: 200px; padding-left: 70px; margin: -20px 0 20px;" data-se="qrcode-success" class="qrcode-success hide">\
	              <span class="icon icon-16 icon-only success-16-green"></span>\
	              </div>\
	              <img data-se="qrcode" class="qrcode-image" src="/api/v1/authn/qr/generate?t={{qrtoken}}" > \
	              <!-- img data-se="qrcode" class="qrcode-image" src="{{qrcode}}" --> \
	          </div>\
	      </div>\
	    ',

	    events: {
	      'click [data-type="refresh-qrcode"]': function (e) {
	        e.preventDefault();
	        // TODO
	      }
	    },

	    getTemplateData: function () {
	      var data = {qrtoken: this.model.get('id')};
	      var url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
	      data.qrcode = url;

	      return data;
	    }
	  });

	  return FormController.extend({
	    className: 'barcode-totp',
	    Model: function () {
	      return {
	        url: function () {
	          return '/api/v1/sso/qr/verify/' +  this.get('id');
	        },
	        props: {
	          id: 'string',
	          status: 'string',
	          stateToken: 'string',
	          expiresAt: 'string',
	          factorResult: 'string',
	          factorResultMessage: 'string',
	          relayState: 'string',
	          recoveryToken: 'string',
	          sessionToken: 'string',
	          idToken: 'string',
	          factorType: 'string',
	          recoveryType: 'string',
	        }
	      };
	    },

	    Form: {
	      title: 'Okta QR Login',
	      noCancelButton: true,
	      className: 'barcode-scan',

	      formChildren: [
	        FormType.View({View: BarcodeView})
	      ],

	      render: function () {
	        Okta.Form.prototype.render.apply(this, arguments);
	        this.$('.o-form-button-bar').remove();
	      }
	    },

	    Footer: Footer,

	    initialize: function () {
	      this.model.set('id', (new Date()).getTime());
	    },

	    postRender: function () {      
	      this.poll();
	    },

	    poll: function () {
	      var self = this;

	      Q.delay(2000)
	      .then(function () {
	        self.form.clearErrors();
	      })
	      .then(function () {
	        return self.model.fetch();
	      })
	      .then(function (res) {
	        /*
	        IF succeed THEN 
	        1. append successful callout to the page
	           slide away qr code and slide in successful icon
	        2. start to redirect to home page
	           delay 1 second
	           this.options.appState.trigger('navigate', '/');
	        ELSE recursively call this.poll
	        */

	        if (res.status === 'SUCCESS') {
	          //self.appState.set('transaction', {data: res});
	          self.$('.qrcode-image').hide("slow", function () {
	            self.$('.qrcode-success').show("slow");
	          });
	          Util.redirect(sessionCookieRedirectTpl({
	            baseUrl: self.settings.get('baseUrl'),
	            token: encodeURIComponent(res.sessionToken),
	            redirectUrl: encodeURIComponent(self.settings.get('redirectUrl') || 'http://haisheng.okta1.com:1802')
	          }));
	        } else {
	          self.poll();
	        }
	      })
	      .fail(function () {
	        // self.$('.qrcode-image').hide("slow", function () {
	        //   self.$('.qrcode-success').show("slow");
	        // });
	      })
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* jshint maxcomplexity: 8 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(9),
	  __webpack_require__(83),
	  __webpack_require__(173),
	  __webpack_require__(105)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, Q, FactorUtil, FactorsDropDown, Factor) {

	  var _ = Okta._;

	  return Okta.View.extend({

	    template: '\
	      <div class="beacon-blank auth-beacon">\
	        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>\
	      </div>\
	      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">\
	        <div class="okta-sign-in-beacon-border auth-beacon-border"></div>\
	      </div>\
	      <div data-type="factor-types-dropdown" class="factors-dropdown-wrap"></div>\
	    ',

	    events: {
	      'click .auth-beacon-factor': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	        this.$('.dropdown .options').toggle();
	      }
	    },

	    initialize: function () {
	      this.options.appState.set('beaconType', 'factor');
	    },

	    getTemplateData: function () {
	      var factors = this.options.appState.get('factors'),
	          factor, className;
	      if (factors) {
	        factor = factors.findWhere(_.pick(this.options, 'provider', 'factorType'));
	      } else  {
	        factor = new Factor.Model(this.options.appState.get('factor'), this.toJSON());
	      }
	      className = factor.get('iconClassName');
	      return { className: className || '' };
	    },

	    postRender: function () {
	      if (this.options.animate) {
	        this.$('.auth-beacon-factor').fadeIn(200);
	      }
	      var appState = this.options.appState;
	      if (appState.get('hasMfaRequiredOptions')) {
	        this.add(FactorsDropDown, '[data-type="factor-types-dropdown"]');
	      }
	    },

	    fadeOut: function () {
	      var deferred = Q.defer();
	      this.$('.auth-beacon-factor').fadeOut(200, function () {
	        deferred.resolve();
	      });
	      return deferred.promise;
	    },

	    equals: function (Beacon, options) {
	      return Beacon &&
	        this instanceof Beacon &&
	        options.provider === this.options.provider &&
	        (options.factorType === this.options.factorType ||
	          (FactorUtil.isOktaVerify(options.provider, options.factorType) &&
	          FactorUtil.isOktaVerify(this.options.provider, this.options.factorType)));
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(20),
	  __webpack_require__(174),
	  __webpack_require__(175)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, FactorsDropDownOptions, BaseDropDown) {
	  var _ = Okta._;
	  var $ = Okta.$;

	  $(document).click(function (e) {
	    var $target = $(e.target);
	    var isDropdown = $target.closest('.option-selected').length > 0 && $target.closest('.dropdown').length > 0;
	    if (!isDropdown) {
	      $('.dropdown .options').hide();
	    }
	  });

	  return BaseDropDown.extend({
	    className: 'bg-helper icon-button',
	    events: {
	      'click a.option-selected': function (e) {
	        e.preventDefault();
	        if (_.result(this, 'disabled')) {
	          e.stopPropagation();
	        } else {
	          this.$('.options').toggle();
	        }
	      },
	      'click .dropdown-disabled': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	      }
	    },
	    initialize: function () {
	      this.addOption(FactorsDropDownOptions.getDropdownOption('TITLE'));
	      this.options.appState.get('factors').each(function (factor) {
	        this.addOption(FactorsDropDownOptions.getDropdownOption(factor.get('factorName')), {model: factor});
	        this.listenTo(this.last(), 'options:toggle', function () {
	          this.$('.options').hide();
	        });
	      }, this);
	    }
	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
	 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
	 *
	 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *
	 * See the License for the specific language governing permissions and limitations under the License.
	 */

	/* jshint maxstatements: 16, maxcomplexity: 10 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(20), __webpack_require__(88)], __WEBPACK_AMD_DEFINE_RESULT__ = function (Okta, RouterUtil) {

	  var _ = Okta._;

	  var action = function (model) {
	    var url = RouterUtil.createVerifyUrl(model.get('provider'), model.get('factorType')),
	        self = this;

	    this.model.manageTransaction(function (transaction, setTransaction) {
	      if (transaction.status === 'MFA_CHALLENGE' && transaction.prev) {
	        return transaction.prev()
	        .then(function (trans) {
	          self.trigger('options:toggle');
	          setTransaction(trans);
	          self.options.appState.trigger('navigate', url);
	        });
	      } else {
	        self.trigger('options:toggle');
	        self.options.appState.trigger('navigate', url);
	      }
	    });
	  };

	  var dropdownOptions = {
	    'TITLE': {
	      title: _.partial(Okta.loc, 'mfa.factors.dropdown.title', 'login'),
	      className: 'dropdown-list-title'
	    },

	    'OKTA_VERIFY': {
	      icon: 'factor-icon mfa-okta-verify-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'OKTA_VERIFY_PUSH': {
	      icon: 'factor-icon mfa-okta-verify-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'GOOGLE_AUTH': {
	      icon: 'factor-icon mfa-google-auth-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'SYMANTEC_VIP': {
	      icon: 'factor-icon mfa-symantec-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'RSA_SECURID': {
	      icon: 'factor-icon mfa-rsa-30',
	      title: _.partial(Okta.loc, 'factor.totpHard.rsaSecurId', 'login'),
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'ON_PREM': {
	      icon: 'factor-icon mfa-onprem-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'DUO': {
	      icon: 'factor-icon mfa-duo-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'DUO_PUSH': {
	      icon: 'duo-push-16',
	      className: 'suboption',
	      // TODO: add phone number here
	      title: _.partial(Okta.loc, 'mfa.duoSecurity.push', 'login', ['XXX-XXX-7890'])
	    },

	    'DUO_SMS': {
	      icon: 'duo-sms-16',
	      className: 'suboption',
	      // TODO: add phone number here
	      title: _.partial(Okta.loc, 'mfa.duoSecurity.sms', 'login', ['XXX-XXX-7890'])
	    },

	    'DUO_CALL': {
	      icon: 'duo-call-16',
	      className: 'suboption',
	      // TODO: add phone number here
	      title: _.partial(Okta.loc, 'mfa.duoSecurity.call', 'login', ['XXX-XXX-7890'])
	    },

	    'YUBIKEY': {
	      icon: 'factor-icon mfa-yubikey-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'SMS': {
	      icon: 'factor-icon mfa-sms-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'CALL': {
	      icon: 'factor-icon mfa-call-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'QUESTION': {
	      icon: 'factor-icon mfa-question-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'WINDOWS_HELLO': {
	      icon: 'factor-icon mfa-windows-hello-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    },

	    'U2F': {
	      icon: 'factor-icon mfa-u2f-30',
	      title: function () {
	        return this.model.get('factorLabel');
	      },
	      action: function () {
	        action.call(this, this.model);
	      }
	    }
	  };

	  return {
	    getDropdownOption: function (factorName) {
	      return dropdownOptions[factorName];
	    }
	  };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	  __webpack_require__(2),
	  __webpack_require__(6),
	  __webpack_require__(28),
	  __webpack_require__(27)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (_, $, TemplateUtil, BaseView) {

	  var optionsTemplate = TemplateUtil.tpl('\
	    <a class="icon-16 {{className}}" data-se="{{seleniumId}}">\
	      {{#if icon}}\
	      <span class="icon {{icon}}"></span>\
	      {{/if}}\
	      {{#if title}}\
	      {{title}}\
	      {{/if}}\
	      {{#if subtitle}}\
	        <p class="option-subtitle">{{subtitle}}</p>\
	      {{/if}}\
	   </a>\
	   ');

	  var DropDownOption = BaseView.extend({
	    tagName: 'li',

	    events: {
	      click: function (e) {
	        e.preventDefault();
	        this.action && this.action.call(this);
	      }
	    },

	    constructor: function () {
	      BaseView.apply(this, arguments);
	      this.$el.addClass('okta-dropdown-option option');
	    },

	    render: function () {
	      this.$el.html(optionsTemplate({
	        icon: _.result(this, 'icon'),
	        className: _.result(this, 'className') || '',
	        title: _.result(this, 'title'),
	        subtitle: _.result(this, 'subtitle'),
	        seleniumId: _.result(this, 'seleniumId')
	      }));
	      return this;
	    }
	  });

	  return BaseView.extend({

	    events: {
	      'click a.option-selected': function (e) {
	        e.preventDefault();
	        if (_.result(this, 'disabled')) {
	          e.stopPropagation();
	        }
	      },
	      'click .dropdown-disabled': function (e) {
	        e.preventDefault();
	        e.stopPropagation();
	      }
	    },

	    items: [],

	    constructor: function () {

	      // In this very specific case we want to NOT append className to $el
	      // but to the <a> tag in the template
	      // so we want to disable backbone default functionality.
	      var className = this.className;
	      this.className = null;

	      BaseView.apply(this, arguments);

	      this.className = className;

	      this.$el.addClass('dropdown more-actions float-l');

	      _.each(_.result(this, 'items'), function (option) {
	        this.addOption(option, this.options);
	      }, this);

	    },

	    template: '\
	      <a href="#" class="link-button {{className}} link-button-icon option-selected center">\
	        {{#if icon}}\
	        <span class="icon {{icon}}"></span>\
	        {{/if}}\
	        <span class="option-selected-text">{{title}}</span>\
	        <span class="icon-dm"></span>\
	      </a>\
	      <div class="options clearfix" style="display: none;">\
	      <ul class="okta-dropdown-list options-wrap clearfix"></ul>\
	      </div>\
	    ',

	    getTemplateData: function () {
	      var className = [_.result(this, 'className') || '',
	        _.result(this, 'disabled') ? 'dropdown-disabled' : ''
	      ];
	      return {
	        icon: _.result(this, 'icon'),
	        className: $.trim(className.join(' ')),
	        title: _.result(this, 'title')
	      };
	    },

	    addOption: function (proto, options) {
	      this.add(DropDownOption.extend(proto), 'ul.options-wrap', {options: options || {}});
	    }

	  });

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ])
});
;