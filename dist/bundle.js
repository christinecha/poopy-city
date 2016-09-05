/******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// Import Modules
	var mapConfig = __webpack_require__(2);

	var _require = __webpack_require__(3);

	var setCookie = _require.setCookie;
	var getCookie = _require.getCookie;

	__webpack_require__(4);

	// Grab DOM Elements
	var $warning = document.getElementById('warning');
	var $titleInput = document.getElementById('title-input');
	var $mapInput = document.getElementById('map-input');
	var $rating = document.getElementById('rating');
	var $ratingIcons = Array.from($rating.querySelectorAll('.rating-icon'));
	var $map = document.getElementById('map');
	var $submit = document.getElementById('submit');

	// Set Up Google Maps Objects
	var geocoder = new google.maps.Geocoder();
	var infowindow = new google.maps.InfoWindow();
	var autocomplete = new google.maps.places.Autocomplete($mapInput, {});

	// Set Defaults
	var defaultLatLng = { lat: 40.7128, lng: -74.0059 }; // New York City. Center of the Universe.

	// Set Variables
	var chosenPlace = void 0;
	var rating = 0;
	var myMarker = void 0;

	/** SHARED FUNCTIONS ------------------------------ **/
	var getBrowserLocation = function getBrowserLocation() {
	  return new Promise(function (resolve, reject) {
	    if (!navigator.geolocation) {
	      resolve(null);
	      return;
	    }

	    navigator.geolocation.getCurrentPosition(function (position) {
	      var _position$coords = position.coords;
	      var accuracy = _position$coords.accuracy;
	      var latitude = _position$coords.latitude;
	      var longitude = _position$coords.longitude;

	      var latlng = { lat: latitude, lng: longitude };
	      var circle = new google.maps.Circle({
	        center: latlng,
	        radius: accuracy
	      });

	      autocomplete.setBounds(circle.getBounds());
	      resolve(latlng);
	    }, function (err) {
	      resolve(null);
	    });
	  });
	};

	/* This function watches the value of /nodes and will
	* fire the callback every time the value changes.
	*/
	var now = new Date().getTime();
	var tenMinutesAgo = now - 1000 * 60 * 10;

	var cleanMarkers = function cleanMarkers() {
	  firebase.database().ref('/poop-markers').orderByChild('createdAt').endAt(tenMinutesAgo).once('value', function (snapshot) {
	    var markers = snapshot.val();
	    for (var i in markers) {
	      firebase.database().ref('/poop-markers/' + i).remove();
	    }
	  });
	};

	var watchMarkers = function watchMarkers(callback) {
	  firebase.database().ref('/poop-markers').orderByChild('createdAt').startAt(tenMinutesAgo).on('value', function (snapshot) {
	    var markers = snapshot.val();
	    callback(markers);
	  });
	};

	var warn = function warn(msg) {
	  $warning.style.display = 'inline-block';
	  $warning.innerText = msg;

	  setTimeout(function () {
	    $warning.style.display = 'none';
	  }, 3000);
	};

	$titleInput.addEventListener('keyup', function (e) {
	  if (myMarker) myMarker.render();
	});

	$rating.addEventListener('click', function (e) {
	  if (!e.target.classList.contains('rating-icon')) return;

	  $ratingIcons.forEach(function (icon) {
	    return icon.classList.remove('is-selected');
	  });
	  e.target.classList.add('is-selected');
	  rating = e.target.getAttribute('data-rating');
	  if (myMarker) myMarker.render();
	});

	$submit.addEventListener('click', function (e) {
	  e.preventDefault();

	  if (!chosenPlace) {
	    warn('Choose a location, silly!');
	    return;
	  }

	  if (getCookie('isPooping') === 'true') {
	    warn('Hey, you said you\'re already pooping!');
	    return;
	  }

	  var poopy = {
	    createdAt: new Date().getTime(),
	    formatted_address: chosenPlace.formatted_address,
	    geometry: {
	      location: {
	        lat: chosenPlace.geometry.location.lat(),
	        lng: chosenPlace.geometry.location.lng()
	      }
	    },
	    rating: parseInt(rating),
	    title: $titleInput.value || ''
	  };
	  firebase.database().ref('/poop-markers').push(poopy);

	  setCookie('isPooping', 'true', 10);

	  $titleInput.value = '';
	  $mapInput.value = '';
	  rating = 0;
	  myMarker.hide();
	});

	var Marker = function () {
	  function Marker(place, map) {
	    _classCallCheck(this, Marker);

	    this.map = map;
	    this.place = place;
	    this.formatted_address = place.formatted_address;
	    this.position = place.geometry.location;

	    this.marker = new google.maps.Marker({
	      icon: './assets/poop-icon.png',
	      position: this.position,
	      map: this.map
	    });
	  }

	  _createClass(Marker, [{
	    key: 'hide',
	    value: function hide() {
	      infowindow.close();
	    }
	  }, {
	    key: 'updatePlace',
	    value: function updatePlace(place) {
	      this.position = place.geometry.location;
	      this.formatted_address = place.formatted_address;
	      this.marker.setPosition(this.position);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      this.map.panTo(this.position);
	      this.map.setCenter(this.position);

	      this.title = this.place.title || $titleInput.value;
	      this.rating = this.place.rating || rating;

	      infowindow.setContent('<p>' + this.title + '</p>' + '<p class="xsmall">' + this.formatted_address + '</p>' + '<div class="rating-icon in-info-window" data-rating="' + this.rating + '"></div>');
	      infowindow.open(this.map, this.marker);
	    }
	  }]);

	  return Marker;
	}();

	/** RUN, FUNCTIONS, RUN ------------------------------ **/

	getBrowserLocation().then(function (latlng) {
	  var poopMap = new google.maps.Map($map, {
	    center: latlng || defaultLatLng,
	    zoom: 14,
	    styles: mapConfig.styles,
	    streetViewControl: false
	  });

	  poopMap.addListener('click', function (e) {
	    var latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

	    geocoder.geocode({ location: latlng }, function (results, status) {
	      if (status !== 'OK' || !results[0]) return;

	      chosenPlace = results[0];
	      if (myMarker) myMarker.updatePlace(chosenPlace);else myMarker = new Marker(chosenPlace, poopMap);
	      myMarker.render();
	      $mapInput.value = myMarker.formatted_address;
	    });
	  });

	  autocomplete.addListener('place_changed', function (e) {
	    var place = autocomplete.getPlace();

	    if (!place.geometry) return;

	    chosenPlace = place;
	    if (myMarker) myMarker.updatePlace(chosenPlace);else myMarker = new Marker(chosenPlace, poopMap);
	    myMarker.render();
	  });

	  autocomplete.bindTo('bounds', poopMap);

	  // cleanMarkers()
	  watchMarkers(function (markers) {
	    if (!markers) return;

	    var _loop = function _loop(i) {
	      var m = new Marker(markers[i], poopMap);
	      m.marker.addListener('click', function (e) {
	        m.render();
	      });
	    };

	    for (var i in markers) {
	      _loop(i);
	    }
	  });
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var styles = [{
	  featureType: 'all',
	  stylers: [{ saturation: -80 }]
	}, {
	  featureType: 'all',
	  elementType: 'labels.icon',
	  stylers: [{ visibility: 'off' }]
	}, {
	  featureType: 'road.arterial',
	  elementType: 'geometry',
	  stylers: [{ hue: '#00ffee' }, { saturation: 50 }]
	}, {
	  featureType: 'poi',
	  elementType: 'labels',
	  stylers: [{ visibility: 'off' }]
	}];

	module.exports = { styles: styles };

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	var setCookie = function setCookie(cname, cvalue, minutes) {
	  var d = new Date();
	  d.setTime(d.getTime() + minutes * 60 * 1000);
	  var expires = "expires=" + d.toUTCString();
	  document.cookie = cname + "=" + cvalue + "; " + expires;
	};

	var getCookie = function getCookie(cname) {
	  var name = cname + "=";
	  var ca = document.cookie.split(';');
	  for (var i = 0; i < ca.length; i++) {
	    var c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	};

	module.exports = { setCookie: setCookie, getCookie: getCookie };

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var messages = ['baking brownies...', 'letting loose...', 'making gravy...', 'cleaning the tuba...', 'feeding the fish...'];

	var $loadingMessage = document.getElementById('loading-message');

	var index = 0;
	$loadingMessage.innerText = messages[index];

	var handleTransitionEnd = function handleTransitionEnd() {
	  $loadingMessage.innerText = messages[index];
	  $loadingMessage.style.opacity = 1;
	  $loadingMessage.removeEventListener('transitionend', handleTransitionEnd);
	};

	setInterval(function () {
	  $loadingMessage.style.opacity = 0;
	  index++;
	  if (!messages[index]) index = 0;

	  $loadingMessage.addEventListener('transitionend', handleTransitionEnd);
	}, 4000);

/***/ }
/******/ ]);