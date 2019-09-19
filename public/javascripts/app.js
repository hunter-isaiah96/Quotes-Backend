var app = angular.module('Quotes', ['ui.router', 'naif.base64', 'oitozero.ngSweetAlert']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider){
	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: '/partials/home.html',
		controller: 'HomeController'
	}).state('home.new', {
		url:'new',
		templateUrl: '/partials/newquote.html',
		controller: 'NewController'
	}).state('home.edit', {
		url:'edit/:id',
		templateUrl: '/partials/editquote.html',
		controller: 'EditController'
	})
	$locationProvider.html5Mode(true).hashPrefix('*');
})

app.factory('Service', function($q, $http){
	return {
		getQuote: function(id){
			return $http.get('http://localhost:3000/api/get/' + id)
			.then(function(result){
				return result.data;
			})
		},
		getQuotes: function(){
			return $http.get('http://localhost:3000/api/get')
			.then(function(result){
				return result.data;
			})
		},
		deleteQuote: function(id){
			return $http.delete('http://localhost:3000/api/delete/' + id)
			.then(function(result){
				return result.data;
			})
		},
		newQuote: function(quoteObj){
			return $http.post('http://localhost:3000/api/new', quoteObj)
			.then(function(result){
				return result.data;
			})
		},
		editQuote: function(quoteObj){
			return $http.put('http://localhost:3000/api/edit', quoteObj)
			.then(function(result){
				return result.data;
			})
		}
	}
})

app.controller('MainController', function($rootScope, $scope, $state){

	$scope.state = $state;
	$scope.navigation = [
		{name: 'Quotes', icon: 'fa fa-quote-right', state: 'home'},
		{name: 'Create Quote', icon: 'fa fa-pencil', state: 'new quote'},
	];
})

app.controller('NewController', function($rootScope, $scope, Service, $state){
	$scope.newQuote = {quote: '', quoter: '', image: {base64: null, filetype: null}};
	$scope.state = $state;
	$scope.addNewQuote = function(){
		$scope.newQuote.image.base64 = $scope.newQuote.image.base64.replace(/(\r\n|\n|\r)/gm,"")
		Service.newQuote($scope.newQuote)
		.then(function(res){
			if(res.success){
				$state.go('home', {}, {reload: true})
			}else{
				alert('failure')
			}
		})
	};
})

app.controller('EditController', function($rootScope, $scope, Service, $state, $stateParams){

	$scope.editQuote = {};
	$scope.state = $state;

	Service.getQuote($stateParams.id)
	.then(function(res){
		if(res.success){
			$scope.editQuote = res.quote;
		}else{
			alert('There was an error')
		}
	})

	$scope.submitEditQuote = function(){
		Service.editQuote($scope.editQuote)
		.then(function(res){
			if(res.success){
				$state.go('home', {}, {reload: true})
			}else{
				alert('failure')
			}
		})
	};
})

app.controller('HomeController', function($rootScope, $scope, Service, $state){

	$scope.state = $state;

	$scope.quotes = [];

	$scope.editModalOpen = false;

	$scope.toggleEditModal = function(index){
		$scope.editModalOpen = !$scope.editModalOpen;
		if($scope.editModalOpen == true){
			Service.getQuote($scope.quotes[index]._id)
			.then(function(res){
				if(res.success){

				}
			})
		}
	};
	
	$scope.array = function(number){
		return new Array(number);
	};

	$scope.getQuotes = function(){
		Service.getQuotes()
		.then(function(res){
			if(res.success){
				$scope.quotes = res.quotes;
			}else{
				alert('failure')
			}
		})
	};

	$scope.deleteQuote = function(index){
		var confirm_dialog = confirm('Are you sure you want to delete this quote?');
		if(confirm_dialog){
			Service.deleteQuote($scope.quotes[index]._id)
			.then(function(res){
				if(res.success){
					$scope.getQuotes();
				}else{
					alert('There was a problem removing the quote')
				}
			})
		}else{

		}
	};
	
	$scope.getQuotes();
	
})
