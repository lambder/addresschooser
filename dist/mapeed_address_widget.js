
/**
 *  == proxy ==
 *  The proxy section
**/

// Namespace
if (typeof Mapeed == 'undefined') {
  Mapeed = {};
}
Mapeed.Proxy = {};

/** section: proxy
 *  class Mapeed.Proxy.GoogleMap
 *
 * Proxy class to handle Google Map API
 *  
 **/

 /** section: proxy
  *  new Mapeed.Proxy.GoogleMap(element, callback, context)
  *  - element (Element): element used to create GMap2 object
  *  - callback (Function): callback called when map is ready
  *  - context (Object): calling context
  *  
  *  Creates a new Mapeed.Proxy.GoogleMap object used by Mapeed.AddressChooser.Plugin. 
  *  Calls calling on context when map is initiliazed and ready to use
  *  By default map displays the world but it can be changed when callback is called
  **/
  
Mapeed.Proxy.GoogleMap = function(element, callback, context) {
  var self = this;
  
  function createMap() {
    self.map = new GMap2(element);
    self.map.setCenter(new GLatLng(47, 1), 1);
    
    self.geocoder = new GClientGeocoder;
    callback.call(context, self.map);
  }
 
  // Google map is not loaded
  if (typeof GMap2 == 'undefined') {
    if (typeof google == 'undefined') {
      throw 'Not google map object found, check if you have include google map javascript'
    }
    else {
      google.load('maps', 2);
      google.setOnLoadCallback(createMap);
    }
  }
  else {
    createMap();
  }
};

Mapeed.Proxy.GoogleMap.prototype = (function() {
  /** 
   *  Mapeed.Proxy.GoogleMap#addEventListener(source, event, object, method) -> GEventListener
   *  - source (Object): source object
   *  - event (String): event name
   *  - object (Object): object used for calling method
   *  - method (Function): function called when event is fire
   *  
   *  Registers an invocation of the method on the given object as the event handler 
   *  for a custom event on the source object. 
   *  Returns a handle that can be used to eventually deregister the handler
   **/
  function addEventListener(source, event, object, method) {
    return GEvent.bindDom(source, event, object, method);
  }
  
  /** 
   *  Mapeed.Proxy.GoogleMap#removeEventListener(handle) -> null
   *  - handle (Object): handle returns by addEventListener
   *  
   *  Removes a handler that was installed using addEventListener
   **/
  function removeEventListener(handle) {
    GEvent.removeListener(handle);
  }
 
  /** 
   *  Mapeed.Proxy.GoogleMap#getPlacemarks(address, callback, context) -> null
   *  - address (String): address to search
   *  - callback (Function): callback called when search is done. Callback will received a placemarks array as first argument
   *  - context (Object): calling context
   *  
   *  Looks for placemarks for a specific address, results are retreived through a callback: function(placemarks)
   **/
  function getPlacemarks(address, callback, context) {
    this.geocoder.getLocations(address.join(', '), 
                               function(response){ _onGeocodingCompleted(response, callback, context)});
  }
   
  /** 
   *  Mapeed.Proxy.GoogleMap#getMap() -> GMap2
   *  
   *  Returns google map object
   **/
  function getMap() {
    return this.map;
  } 
  
  /** 
   *  Mapeed.Proxy.GoogleMap#getMap(placemark) -> String
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns full address of a placemark
   **/
  function getAddress(placemark) {
    return placemark.address;
  }
   
  /** 
   *  Mapeed.Proxy.GoogleMap#getCity(placemark) -> String
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns city name of a placemark. Returns an empty string if not found
   **/
  function getCity(placemark) {
    return _getPlacemarkAttribute(placemark, 'LocalityName');
  }

  /** 
   *  Mapeed.Proxy.GoogleMap#getCountry(placemark) -> String
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns country name of a placemark. Returns an empty string if not found
   **/
  function getCountry(placemark) {
    return _getPlacemarkAttribute(placemark, 'CountryName');
  }
    
  /** 
   *  Mapeed.Proxy.GoogleMap#getZIP(placemark) -> String
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns ZIP (postal code) name of a placemark. Returns an empty string if not found
   **/
  function getZIP(placemark) {
    return _getPlacemarkAttribute(placemark, 'PostalCodeName');
  }
  
  /** 
   *  Mapeed.Proxy.GoogleMap#getStreet(placemark) -> String
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns street (address without zip, city, country)  of a placemark. Returns an empty string if not found
   **/
  function getStreet(placemark) {
    return _getPlacemarkAttribute(placemark, 'ThoroughfareName');
  }
 
  /** 
   *  Mapeed.Proxy.GoogleMap#getZIP(placemark) -> Number
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns latitude a placemark.
   **/
  function getLat(placemark) {
    return placemark.Point.coordinates[1];
  }
   
  /** 
   *  Mapeed.Proxy.GoogleMap#getZIP(placemark) -> Number
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  
   *  Returns longitude a placemark.
   **/
  function getLng(placemark) {
    return placemark.Point.coordinates[0];
  }
   
  /** 
   *  Mapeed.Proxy.GoogleMap#showPlacemark(tagName[, showAddress = null, draggableCallback = null, draggableContext = null ]) -> undefined
   *  - placemark (Object): object representing google map placemark (get by calling getPlacemarks)
   *  - showAddress (Boolean): display address on the map (inside an info window)
   *  - draggableCallback (Function): callback called when marker has benn drgged. Callback will received lat and lng as arguments
   *  - draggableContext (Object): calling context for draggableCallback
   *  
   *  Displays placemark on the map.
   **/
  function showPlacemark(placemark, showAddress, draggableCallback, draggableContext) {
    var accuracy = placemark.AddressDetails.Accuracy,
        address  = showAddress ? placemark.address.split(',').join('<br/>') : false,
        zoom = 1;
    if      (accuracy >= 9)  zoom = 17;
    else if (accuracy >= 6 ) zoom = 14;
    else if (accuracy >= 4)  zoom = 12;
    else if (accuracy >  1)  zoom = 6;
    else                     zoom = 3;

    this.showMarker(placemark.Point.coordinates[1], placemark.Point.coordinates[0], zoom, address, draggableCallback, draggableContext)
  }
  
  /** 
   *  Mapeed.Proxy.GoogleMap#showPlacemark(lat, lng, zoom[, address = null, draggableCallback = null, draggableContext = null]) -> undefined
   *  - lat (Float): marker's latitude
   *  - lng (Float): marker's longitude
   *  - zoom (Integer): map zoom
   *  - address (String): address to display inside info window
   *  - draggableCallback (Function): callback called when marker has benn drgged. Callback will received lat and lng as arguments
   *  - draggableContext (Object): calling context for draggableCallback
   *  
   *  Displays placemark on the map, center map on marker location.
   *  If an address is specified, marker will show this address in an info window
   **/
  function showMarker(lat, lng, zoom, address, draggableCallback, draggableContext) {
    var latLng = new GLatLng(lat, lng);
    this.map.setCenter(latLng, zoom);
    
    if (this.marker) {
      this.marker.setLatLng(latLng);
      this.marker.show();
    }
    else {
      this.marker = new GMarker(latLng, {draggable: true});
      GEvent.bind(this.marker, 'dragstart', this, _startMarkerDrag);
      GEvent.bind(this.marker, 'dragend', this, _endMarkerDrag);
      this.map.addOverlay(this.marker);
    }

    this.draggableCallback = draggableCallback;
    this.draggableContext  = draggableContext;
    if (draggableCallback) {
      this.marker.enableDragging();
    }
    else {
      this.marker.disableDragging();
    }
    if (address)
      this.marker.openInfoWindowHtml(address);
  }
  
  /** 
   *  Mapeed.Proxy.GoogleMap#hidePlacemark() -> undefined
   *  
   *  Hides placemark fro the map, close info window if need be
   **/
  function hidePlacemark() {
    if (this.marker) {
      this.marker.closeInfoWindow();
      this.marker.hide();
    }
  }
  
  /** 
   *  Mapeed.Proxy.GoogleMap#centerOnClientLocation([zoom]) -> undefined
   *  - zoom (Integer): map zoom, default 8
   *  
   *  Center map on user location (based on its IP) if available
   **/
  function centerOnClientLocation(zoom) {
    var clientLocation = google && google.loader ? google.loader.ClientLocation : null;
    if (clientLocation) {
      this.map.setCenter(new GLatLng(clientLocation.latitude, clientLocation.longitude), zoom || 8);
    }
  }
  
  // Intern callback when geocoding has been done (should have placemarks)
  function _onGeocodingCompleted(response, callback, context) {
    // Placemark(s) found
    if (response.Status.code == 200) {
      callback.call(context, response.Placemark);
    }
    // Placemark not found
    else {
      callback.call(context, false);
    }
  }
  
  // Intern callback when marker dragging starts (close info window)
  function _startMarkerDrag() {
    this.marker.closeInfoWindow();
  }
  
  // Intern callback when marker dragging ends, 
  function _endMarkerDrag(latLng) {
    this.draggableCallback.call(this.draggableContext,latLng.lat(), latLng.lng());
  }

  // Parses placemark object as Google do not provide any API for that.
  // Information is inside placemark subfield but depends on accuracy, so we need to parse all tree 
  // to get information
  // Returns null if not found
  function _getPlacemarkAttribute(placemark, field) {
    for (f in placemark) {
      if (f == field) {
        return placemark[f];
      }
      else {
        if (typeof placemark[f] == 'object') {
          return _getPlacemarkAttribute(placemark[f], field);
        }
      }
    }
    return '';
  }  
  
  // Publish public API
  return {                
    addEventListener:       addEventListener,
    removeEventListener:    removeEventListener,
    getMap:                 getMap,
    
    centerOnClientLocation: centerOnClientLocation,
    
    getPlacemarks:          getPlacemarks,
    showPlacemark:          showPlacemark,
    showMarker:             showMarker,
    hidePlacemark:          hidePlacemark,
                            
    getLat:                 getLat,
    getLng:                 getLng,
                            
    getAddress:             getAddress,
    getCity:                getCity,
    getCountry:             getCountry,
    getZIP:                 getZIP,
    getStreet:              getStreet
  }
})();
/**
 *  == base ==
 *  The main section
**/

/** section: base
 * Base
 **/

// Namespace
if (typeof Mapeed == 'undefined') {
  Mapeed = {};
}
Mapeed.AddressChooser = {};

// Utility function to get DOM element 
Mapeed.AddressChooser.$element = function $element(element) {
  return document.getElementById(element);
}

// Utility function to copy property from source to destination object
Mapeed.AddressChooser.$extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

// Default options for AddressChooser Widget
Mapeed.AddressChooser.DefaultOptions = { map:             'map',
                                         street:          'street',
                                         zip:             'zip',
                                         city:            'city',
                                         state:           'state',
                                         country:         'country',
                                         lat:             'lat',
                                         lng:             'lng',
                                         auto:             true,
                                         delay:            300,
                                         showAddressOnMap: true,
                                         markerDraggable:  true,
                                         mapProxy:         Mapeed.Proxy.GoogleMap };



Mapeed.AddressChooser.AddressKeys  = ['street', 'city', 'state', 'country', 'zip'],
Mapeed.AddressChooser.AllKeys      = Mapeed.AddressChooser.AddressKeys.concat('lat', 'lng');
                                      
/** section: base
 * class Mapeed.AddressChooser.Widget
 *
 * Class to handle AddressChooser behavior
 **/
 
/** section: base
*  new FX.Mapeed.AddressChooser.Widget([options])
**/
Mapeed.AddressChooser.Widget = function(options) {
  // Internal: Gets event to listen for an element. INPUT and SELECT are allowed
  function eventForElement(element) {
    return element.tagName == 'INPUT' ? 'keyup' : 'change';
  }
  
  // Internal: init callback when map is ready
  function init() {
    var options  = this.options,
        allKeys  = Mapeed.AddressChooser.AllKeys;
    
    // Get html elements for read/write values
    for (var i = allKeys.length-1; i>=0; --i){
      var k = allKeys[i];
      this[k] =  $element(options[k]);
    }
    
    // Check lat/lng required fields
    if (!this.lat || !this.lng) {
      throw 'lat and lng are required fields'
    }
    
    // Connect event listener for auto mode
    if (options.auto) {
      var callback    = function(event) {this.updateMap(event, this.options.delay)},
          addressKeys = Mapeed.AddressChooser.AddressKeys;
      for (var i = addressKeys.length-1; i>=0; --i) {
        var k = addressKeys[i];
        if (this[k]) this.mapProxy.addEventListener(this[k], eventForElement(this[k]), this, callback);
      }
    }
    this.callbacks.onInitialized(this);
  }
  

  var $element = Mapeed.AddressChooser.$element,
      $extend  = Mapeed.AddressChooser.$extend;
   
  // Apply default options
  this.options = $extend({}, Mapeed.AddressChooser.DefaultOptions);
  $extend(this.options, options);

  // Set empty callbacks
  this.callbacks = {
    onSuggestsSearch: function(){},
    onSuggestsFound:  function(){},
    onInitialized:    function(){}
  };
  this.placemarks = [];
    
  // Initialize proxy with init callback
  this.mapProxy = new this.options.mapProxy($element(this.options.map), init, this);
};


// Instance methods
Mapeed.AddressChooser.Widget.prototype = (function() {  
  // Internal: Gets value of an element. INPUT and SELECT are allowed
  function valueForElement(element) {
    if (element.tagName == 'INPUT') {
      return element.value;
    } 
    else {
      return element.options[element.selectedIndex].value;
    }
  }
  
  /** 
   *  Mapeed.AddressChooser.Widget#updateMap([event = null, delay = 300]) -> undefined
   *  - event (Event): Key event if called by keyup event
   *  - delay (Integer): Delay in ms to update map (default 300)
   *  
   *  Removes a handler that was installed using addEventListener
   **/
  function updateMap(event, delay) {    
    // Called by keyup event
    if (event) {
      // Do not handle keys like arrows, escape... just accept delete/backspace
      var key = event.keyCode;
      if (event.charCode || (key >0 && key < 47 && key != 8 && key != 46)) return;
    }
    // Needs to wait before updating the map
    if (delay) {
      var self = this;
      // Clear existing timer
      if (this.timeout) clearTimeout(this.timeout);
      
      // Starts a new timer
      this.timeout = setTimeout(function() {self.updateMap()}, delay || 300);
    }
    else {
      // Call onSuggestsSearch callback
      this.callbacks.onSuggestsSearch(this);
      // Ask map proxy for getting placemarks
      this.mapProxy.getPlacemarks(this.getCurrentAddress(), _placemarksReceived, this);
    }
  }
  
  /** 
   *  Mapeed.AddressChooser.Widget#initMap([showAddress = false, zoom = 5]) -> undefined
   *  - showAddress (Boolean): 
   *  - zoom (Integer): map zoom (default 5)
   *  
   *  TODO
   **/
  function initMap(showAddress, zoom) {
    if (this.lat.value && this.lng.value) {
      this.mapProxy.showMarker(this.lat.value, this.lng.value, zoom || 5, 
                               showAddress ? this.getCurrentAddress().join('<br/>') : false , _markerDragEnd, this)
    }
    else {
      var address = this.getCurrentAddress();
      if (address.length == 0) {
        this.centerOnClientLocation();
      } else {
        this.updateMap();
      }
    }
  }
  
  /** 
   *  Mapeed.AddressChooser.Widget#showPlacemark(index) -> undefined
   *  - index (Integer): 
   *  
   *  TODO
   **/
  function showPlacemark(index) {
    if (this.placemarks && index< this.placemarks.length) {
      var placemark = this.placemarks[index];
      if (this.options.markerDraggable) {
        this.mapProxy.showPlacemark(placemark, this.options.showAddressOnMap, _markerDragEnd, this);
      }
      else {
        this.mapProxy.showPlacemark(placemark, this.options.showAddressOnMap);
      }
      this.lat.value = this.mapProxy.getLat(placemark);
      this.lng.value = this.mapProxy.getLng(placemark);
    }
  }
      
  /** 
   *  Mapeed.AddressChooser.Widget#getCurrentAddress() -> String
   *  - index (Integer): 
   *  
   *  Returns current address by getting input fields values
   **/
  function getCurrentAddress() {
    var address     = [], 
        addressKeys = Mapeed.AddressChooser.AddressKeys;

    for (var i = addressKeys.length-1; i>=0; --i) {
      var k = addressKeys[i];
      if (this[k]) {
        var value = valueForElement(this[k]);
        // Strip string
        value = value.replace(/^\s+/, '').replace(/\s+$/, '');
        if (value.length > 0) address.unshift(value);
      }
    }
    return address;
  }

  /** 
   *  Mapeed.AddressChooser.Widget#getMapProxy() -> Mapeed.Proxy
   *  
   *  Returns current map proxy
   **/
  function getMapProxy() {
    return this.mapProxy;
  }
  
  function onSuggestsFound(callback) {
    this.callbacks.onSuggestsFound = callback;
    return this;
  }
  
  function onSuggestsSearch(callback) {
    this.callbacks.onSuggestsSearch = callback;
    return this;
  }
  
  function onInitialized(callback) {
    this.callbacks.onInitialized = callback;
    return this;
  }
  
  // Internal: Callback when placemarks are found
  function _placemarksReceived(placemarks) {
    this.placemarks = placemarks;
    if (placemarks) {
      this.showPlacemark(0);      
    }
    else {
      this.lat.value = '';
      this.lng.value = '';
      
      this.mapProxy.hidePlacemark();
    }
    this.callbacks.onSuggestsFound(this, placemarks);
  }
  
  // Internal: Delegates method to map proxy
  function _delegateToMapProxy(method) {
    return function() {
      var args = arguments;
      return this.mapProxy[method].apply(this.mapProxy, arguments)
    }
  }
  
  // Internal: markerDragEnd callback. Called by map proxy when marker has been moved, update hidden lat/lng fields
  function _markerDragEnd(lat, lng) {
    this.lat.value = lat;
    this.lng.value = lng;
  }
  
  // Publish public API
  return {
    initMap:                initMap,
    updateMap:              updateMap,
    showPlacemark:          showPlacemark,
                           
    onInitialized:          onInitialized,
    onSuggestsSearch:       onSuggestsSearch,
    onSuggestsFound:        onSuggestsFound,
                           
    getMapProxy:            getMapProxy,
    getCurrentAddress:      getCurrentAddress,
    getMap:                 _delegateToMapProxy('getMap'),
    getCity:                _delegateToMapProxy('getCity'),
    getCountry:             _delegateToMapProxy('getCountry'),
    getZIP:                 _delegateToMapProxy('getZIP'),
    getStreet:              _delegateToMapProxy('getStreet'),
    getAddress:             _delegateToMapProxy('getAddress'),
    
    centerOnClientLocation: _delegateToMapProxy('centerOnClientLocation')
  }
})();