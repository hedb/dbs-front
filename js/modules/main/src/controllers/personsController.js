var PersonsController = function($scope, $state, $stateParams, ftrees, notification, $timeout, $modal, $window) {

	var self = this;

	this.individuals = [];
	this.search_params = {};
	this.query = '';
	
	this.search_modifiers = {
		first_name: 	'',
		last_name: 		'',
		birth_place: 	'',
		marriage_place: '',
		death_place: 	'',
		place:          ''
	};
	this.tree_number = parseInt($stateParams['tree_number']);

	this.$state = $state;
	this.$stateParams = $stateParams;
	this.$scope = $scope;
	this.$window = $window;
	this.ftrees = ftrees;
	this.notification = notification;
	this.persons_welcome_msg = $window.localStorage.getItem('persons-welcome-msg') != 'dismissed';

	Object.defineProperty($scope, '$stateParams', {
		get: function() {
			return $stateParams;
		}
	}); 

	//search
	var query = {},
	    parameters = [];
	for (var key in $stateParams) {
		if ($stateParams[key]) {
			// read state params & update bound objects to update view accordingly
			var val = $stateParams[key];
			if (key !== 'more') {
				parameters.push(val);
				query[key] = val;

				// handle search modifiers & fudge factors in query string
				if ( val.indexOf(';') !== -1 ) {
					var parts = val.split(';');
					self.search_params[key] = parts[0];
					self.search_modifiers[key] = parts[1];
				}
				else {
					if(key !== 'tree_number') {
						self.search_params[key] = $stateParams[key];
					}
					else
						self.search_params[key] = parseInt($stateParams[key]);
				}
			}
		}
	};
	if (parameters.length > 0) {
		this.query = parameters.join(' + ');
		self.search(query);
	}

	if (self.persons_welcome_msg && $state.lastState.name !== 'ftrees') {
		 $timeout(function(){
		    var body = angular.element(document.getElementsByTagName('body')[0]);
			body.addClass('backdrop');
		    $modal.open({
		     	templateUrl: 'templates/main/ftrees/persons-welcome-message.html',
		     	controller: 'PersonsWelcomeController',
		     	size: 'ftree'
		    }).result.finally(function(){
		    	body.removeClass('backdrop');
		    })
	    }, 1000)
	};
};

PersonsController.prototype = {
	search: function(search_params) {
		var self = this;

		this.notification.put(1);

		this.ftrees.search(search_params).
			then(function(individuals) {
				self.individuals = individuals;

				self.notification.clear();
				if (individuals.total == 0)
					self.notification.put(3);


			}, function() {
				self.notification.put(500);
			});
	},

	fetch_more: function() {
		var self = this;
		self.notification.put(15);
		var search_params = angular.copy(this.search_params);
		search_params.start = self.individuals.items.length;
		this.ftrees.search(search_params).
			then(function (r){
				self.individuals.items = self.individuals.items.concat(r.items);
				self.notification.clear();
			});
    },

    toggle_more: function() {
    	var params = this.$stateParams;
    	if (params.more == '0' || params.more == undefined) {
    		params.more = '1';
    		if(params.place) {
    			params.birth_place = params.place;
    			params.place = '';

    		}
    		this.$state.go('persons', params);
    	}
    	else {
     		params.more = '0';
     		if(params.birth_place) {
     			params.place = params.birth_place;
     			params.birth_place = '';
     		}
    		this.$state.go('persons', params);
    	}
    },

	update: function() {
		var search_params = angular.copy(this.search_params);

		for (var param in search_params) {
			if (search_params[param] === '') {
				delete search_params[param];
			}
		}

		// insert search modifiers & fudge_factors into query string
		for (var modifier in this.search_modifiers) {
			var modifier_string = this.search_modifiers[modifier]; 
			if (search_params[modifier] !== undefined && modifier_string !== '') {
				search_params[modifier] += ';' + modifier_string;
			}
		}
		search_params.more = this.$stateParams.more;

		this.$state.go('persons', search_params, {inherit: false});
		this.$window.sessionStorage.setItem('ftrees_search_params', JSON.stringify(search_params));
	},

 	clear_filters: function() {
 		for (var parameter in this.search_params) {
 			this.search_params[parameter] = '';
 		}
 	},

	get_href: function (individual) {
		// TODO: support languages
		return this.$state.href('person-view', {tree_number: individual.GTN,
							   			   node_id: individual.II});
	},

	read_about_center: function (collection_name) {
        this.$state.go('about_center', {collection: collection_name});
    },
};

angular.module('main').controller('PersonsController', ['$scope', '$state', '$stateParams', 'ftrees', 'notification', '$timeout', '$modal', '$window', PersonsController]);