angular.module('main').
	factory('item', ['$resource', '$q', '$rootScope', 'apiClient', 'cache', 'itemTypeMap',
	function($resource, $q, $rootScope, apiClient, cache, itemTypeMap) {
		
		var in_progress = false;

		var itemResource = $resource(apiClient.urls.item +'/:items');

		var item_service = {

			get_string: function(collection_name, item_id) {
				return [collection_name, item_id].join('.');
			},
			get_data_string: function(item_data) {
				return this.get_string(itemTypeMap.get_collection_name(item_data),item_data._id)
			},

			get: function(collection_name, item_id) {
				if ( !in_progress ) {
					var self 				= this,
						deferred			= $q.defer(),
						item_string 		= self.get_string(collection_name, item_id),
						cached				= cache.get(item_id, collection_name); 

					if (cached.isNotEmpty()) {
						deferred.resolve(cached);
						$rootScope.$broadcast('item-load', cached);
					} 
					else {
						try {
							itemResource.query({items: item_string}).$promise.
								then(function(item_data) {
									var collection_name = itemTypeMap.get_collection_name(item_data[0]);
									cache.put(item_data[0], collection_name);
									deferred.resolve(item_data[0]);
									$rootScope.$broadcast('item-load', item_data[0]);
								},
								function() {
									deferred.reject();
								}).
								finally(function() {
									in_progress = false;
								});
						}
						catch(e) {
							deferred.reject();
						}
					}

					return deferred.promise;
				}
			},

			get_items: function(items_arr) {
				if ( !in_progress ) {
					var self 				= this,
						deferred			= $q.defer(),
						cached_items		= [],
						not_cached_items	= [];

					items_arr.forEach(function(item_string) {
						if(!item_string) return;
						var item_string_split	= item_string.split('.'),
							collection_name 	= item_string_split[0],
							item_id				= item_string_split[1],
							cached 				= cache.get(item_id, collection_name);

						if (cached.isNotEmpty()) {
							cached_items.push(cached);
						}
						else {
							not_cached_items.push(item_string);
						}
					});

					if (not_cached_items.isEmpty()) {
						deferred.resolve(cached_items);
						$rootScope.$broadcast('items-load');
					} 
					else {
						try {
							var not_cached_item_strings = parse_items_arr(not_cached_items);
							itemResource.query({items: not_cached_item_strings}).$promise.
								then(function(item_data_arr) {
									item_data_arr.forEach(function(item_data) {
										var collection_name = itemTypeMap.get_collection_name(item_data);
										cache.put(item_data, collection_name);
									});
									deferred.resolve( item_data_arr.concat(cached_items) );
									$rootScope.$broadcast('items-load');
								},
								function() {
									deferred.resolve( cached_items );
									$rootScope.$broadcast('items-load');
								}).
								finally(function() {
									in_progress = false;
								});
						}
						catch(e) {
							deferred.reject();
						}
					}

					return deferred.promise;
				}
			}
		};

		function parse_items_arr(items_arr) {
			var items_string = '';

			items_arr.forEach(function(item_string) {
				items_string += ',' + item_string;
			});

			return items_string.slice(1);
		}

		return item_service;
	}]);
