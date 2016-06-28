'use strict';

(function (angular, buildfire, window) {
  angular.module('couponPluginWidget', ['ui.bootstrap', 'ngAnimate','infinite-scroll','ngtimeago'])
    .config(['$compileProvider', function ($compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


    }])
    .directive("viewSwitcher", ["ViewStack", "$rootScope", '$compile',
      function (ViewStack, $rootScope, $compile) {
        return {
          restrict: 'AE',
          link: function (scope, elem, attrs) {
            var views = 0,
              currentView = null;
            manageDisplay();
            $rootScope.$on('VIEW_CHANGED', function (e, type, view, noAnimation) {
              if (type === 'PUSH') {
                console.log("VIEW_CHANGED>>>>>>>>", type, view);
                currentView = ViewStack.getPreviousView();

                var newScope = $rootScope.$new();
                var _newView = '<div  id="' + view.template + '" ><div class="slide content" ng-include="\'templates/' + view.template + '.html\'"></div></div>';
                var parTpl = $compile(_newView)(newScope);

                $(elem).append(parTpl);
                views++;

              } else if (type === 'POP') {

                var _elToRemove = $(elem).find('#' + view.template),
                  _child = _elToRemove.children("div").eq(0);

                _child.addClass("ng-leave ng-leave-active");
                _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                  _elToRemove.remove();
                  views--;
                });

                currentView = ViewStack.getCurrentView();
              }
              else if (type === 'POPALL') {
                console.log(view);
                angular.forEach(view, function (value, key) {
                  var _elToRemove = $(elem).find('#' + value.template),
                    _child = _elToRemove.children("div").eq(0);

                  if (!noAnimation) {
                    _child.addClass("ng-leave ng-leave-active");
                    _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                      _elToRemove.remove();
                      views--;
                    });
                  } else {
                    _elToRemove.remove();
                    views--;
                  }
                });
              }
              manageDisplay();
            });

            function manageDisplay() {
              if (views) {
                $(elem).removeClass("ng-hide");
              } else {
                $(elem).addClass("ng-hide");
              }
            }

          }
        };
      }])
    .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel2", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel2:LOADED");
        }
      };
    }])
    .directive("loadImage", [function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

          var elem = $("<img>");
          elem[0].onload = function () {
            element.attr("src", attrs.finalSrc);
            elem.remove();
          };
          elem.attr("src", attrs.finalSrc);
        }
      };
    }])
    .directive("googleMap", function () {
      return {
        template: "<div></div>",
        replace: true,
        scope: {
          locationData: '=locationData',
          refreshData: '=refreshData',
          markerCallback: '=markerCallback'
        },
        link: function (scope, elem, attrs) {
          var newClustererMap = '';
          elem.css('min-height', '596px').css('width', '100%');
          scope.$watch('refreshData', function (newValue, oldValue) {
            if (newValue) {
              var mapCenterLng = (scope.locationData && scope.locationData.currentCoordinates && scope.locationData.currentCoordinates.length && scope.locationData.currentCoordinates[0]) ? scope.locationData.currentCoordinates[0] : -87.7679;
              var mapCenterLat = (scope.locationData && scope.locationData.currentCoordinates && scope.locationData.currentCoordinates.length && scope.locationData.currentCoordinates[1]) ? scope.locationData.currentCoordinates[1] : 41.8718;

              // Create the map.
              var map = new google.maps.Map(elem[0], {
                streetViewControl: false,
                mapTypeControl: false,
                zoom: 8,
                center: {lat: mapCenterLat, lng: mapCenterLng},
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControlOptions: {
                  position: google.maps.ControlPosition.RIGHT_TOP
                }
              });

              var styleOptions = {
                name: "Report Error Hide Style"
              };
              var MAP_STYLE = [
                {
                  stylers: [
                    {visibility: "on"}
                  ]
                }];
              var mapType = new google.maps.StyledMapType(MAP_STYLE, styleOptions);
              map.mapTypes.set("Report Error Hide Style", mapType);
              map.setMapTypeId("Report Error Hide Style");

              function getCustomMarkerIcon(_imageUrl) {
                return {
                  url: _imageUrl,
                  // This marker is 20 pixels wide by 32 pixels high.
                  scaledSize: new google.maps.Size(20, 20),
                  // The origin for this image is (0, 0).
                  origin: new google.maps.Point(0, 0),
                  // The anchor for this image is the base of the flagpole at (0, 32).
                  anchor: new google.maps.Point(0, 32)
                }
              }

              var selectedLocation = null;

              //var currentLocationIconImageUrl = 'assets/.images/google_marker_blue_icon.png';
              //var currentLocationIconImageUrl = 'http://buildfire.imgix.net/b55ee984-a8e8-11e5-88d3-124798dea82d/e107a1f0-0164-11e6-87cb-a50957dff58d.png?fit=crop&w=300&h=300';
              var currentLocationIconImageUrl ='http://beta.app.buildfire.com/app/media/google_marker_blue_icon.png';
              //var currentLocationIconImageUrl = 'assets/.images/blue.png';
              //var placeLocationIconImageUrl = 'assets/.images/google_marker_red_icon.png';
              //var placeLocationIconImageUrl = 'http://buildfire.imgix.net/b55ee984-a8e8-11e5-88d3-124798dea82d/dd222a60-0164-11e6-b415-d3bac8217c59.png?fit=crop&w=300&h=300';
              var placeLocationIconImageUrl = 'http://beta.app.buildfire.com/app/media/google_marker_red_icon.png';
              //var selectedLocationIconImageUrl = 'assets/.images/google_marker_green_icon.png';
              //var selectedLocationIconImageUrl = 'http://buildfire.imgix.net/b55ee984-a8e8-11e5-88d3-124798dea82d/dcf96cb0-0164-11e6-b415-d3bac8217c59.png?fit=crop&w=300&h=300';
              var selectedLocationIconImageUrl = 'http://beta.app.buildfire.com/app/media/google_marker_green_icon.png';

              var currentLocationIcon = getCustomMarkerIcon(currentLocationIconImageUrl);
              var placeLocationIcon = getCustomMarkerIcon(placeLocationIconImageUrl);
              var selectedLocationIcon = getCustomMarkerIcon(selectedLocationIconImageUrl);

              // Shapes define the clickable region of the icon. The type defines an HTML
              // <area> element 'poly' which traces out a polygon as a series of X,Y points.
              // The final coordinate closes the poly by connecting to the first coordinate.
              var shape = {
                coords: [1, 1, 1, 20, 18, 20, 18, 1],
                type: 'poly'
              };

              if (scope.locationData && scope.locationData.currentCoordinates && scope.locationData.currentCoordinates.length) {
                var currentLocationMarker = new google.maps.Marker({
                  position: {
                    lat: scope.locationData.currentCoordinates[1],
                    lng: scope.locationData.currentCoordinates[0]
                  },
                  map: map,
                  icon: currentLocationIcon,
                  shape: shape,
                  optimized: false
                });
              }

              var placeLocationMarkers = [];
              if (scope.locationData && scope.locationData.items && scope.locationData.items.length) {
                for (var _index = 0; _index < scope.locationData.items.length; _index++) {

                  var _place = scope.locationData.items[_index]
                    , marker = '';

                  if (_index == 0) { // this is to center the map on the first item
                    map.setCenter(new google.maps.LatLng(_place.data.location.coordinates.lat, _place.data.location.coordinates.lng));
                  }

                  if (_place.data && _place.data.location && _place.data.location.coordinates && _place.data.location.coordinates.lng && _place.data.location.coordinates.lat) {
                    marker = new google.maps.Marker({
                      position: {lat: _place.data.location.coordinates.lat, lng: _place.data.location.coordinates.lng},
                      map: map,
                      icon: placeLocationIcon,
                      shape: shape,
                      title: _place.data.title,
                      zIndex: _index,
                      optimized: false,
                      dist: _place.data.distanceText
                    });
                    marker.addListener('click', function () {
                      var _this = this;
                      if (selectedLocation) {
                        selectedLocation.setIcon(placeLocationIcon);
                      }

                      _this.setIcon(selectedLocationIcon);
                      selectedLocation = _this;
                      scope.markerCallback(_this.zIndex);
                    });
                    placeLocationMarkers.push(marker);
                  }
                }
              }

              var clusterStyles = [
                {
                  textColor: 'white',
                  url: 'http://app.buildfire.com/app/media/google_marker_blue_icon2.png',
                  height: 53,
                  width: 53
                }
              ];
              var mcOptions = {
                gridSize: 53,
                styles: clusterStyles,
                maxZoom: 15
              };
             var markerCluster = new MarkerClusterer(map, placeLocationMarkers,mcOptions);


              map.addListener('click', function () {
                if (selectedLocation) {
                  scope.markerCallback(null);
                  selectedLocation.setIcon(placeLocationIcon);
                }
              });
            }
          }, true);
        }
      }
    })
    .filter('getImageUrl', function () {
      return function (url, width, height, type) {
        if (type == 'resize')
          return buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    })
    .run(['ViewStack', '$rootScope', function (ViewStack, $rootScope) {
      buildfire.navigation.onBackButtonClick = function () {
        if (ViewStack.hasViews()) {
          ViewStack.pop();
        } else {
          buildfire.navigation._goBackOne();
        }
      };

      buildfire.messaging.onReceivedMessage = function (msg) {
        switch (msg.type) {
          case 'AddNewItem':
            ViewStack.popAllViews(true);
            ViewStack.push({
              template: 'Item',
              params: {
                itemId: msg.id,
                stopSwitch: true
              }
            });
            $rootScope.$apply();
            break;
          case 'OpenItem':
            var currentView = ViewStack.getCurrentView();
            if (currentView && currentView.template !== "Item") {
              ViewStack.push({
                template: 'Item',
                params: {
                  itemId: msg.id
                }
              });
              $rootScope.$apply();
            }
            break;
          default:
            ViewStack.popAllViews(true);
        }
      };


    }])
})(window.angular, window.buildfire, window);
