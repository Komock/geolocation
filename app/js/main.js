'use strict';
const view = require('./view'),
	model = require('./model');

let yaMap = {},
	pinsData = [],
	commentsData = [],
	id = 0,
	addr = '',
	longtitude = 0,
	latitude = 0,
	mapEl = document.querySelector('#map');


ymaps.ready(function () {
	// Init map
	yaMap = new ymaps.Map('map', {
		center: [55.751574, 37.573856],
		zoom: 9
		}, {
		searchControlProvider: 'yandex#search'
	});

	// No zoom on scroll
	yaMap.behaviors.disable('scrollZoom');

	// Click on map
	yaMap.events.add('click', function(e){
		if (!yaMap.balloon.isOpen()) {
			let coords = e.get('coords');
			longtitude = parseFloat(coords[0].toPrecision(6));
			latitude = parseFloat(coords[1].toPrecision(6));

			// Geocoding of address
			ymaps.geocode([longtitude, latitude], {
				json: true,
				results: 1
			}).then(function(res){
				addr = res.GeoObjectCollection.featureMember[0].GeoObject.name;
				view.balloonOpen(yaMap, longtitude, latitude, addr, id);
			});
		} else {
			yaMap.balloon.close();
		}
	});

	// Click on placemark
	yaMap.geoObjects.events.add('click', function(e){
		e.preventDefault();
		let pinId = e.get('target').properties.get('id'),
			placeData = pinsData[pinId];
		console.log('placemark with id ' + pinId + ' opened');
		view.balloonOpen(yaMap, placeData.lng, placeData.lat, placeData.addr, pinId);
	});

	// Check if data exist 
	if (sessionStorage.getItem('pins')) {
		pinsData = JSON.parse( sessionStorage.getItem('pins') );
		commentsData = JSON.parse( sessionStorage.getItem('comments') );
		id = sessionStorage.getItem('pinId');
		// Build pins on map
		view.buildPins( pinsData, yaMap );
	} else {
		sessionStorage.setItem('pinId', 0);
		sessionStorage.setItem('pins', '');
		sessionStorage.setItem('comments', '');
	}
});

// Submit comment
document.addEventListener('submit', function(e) {
	console.log('submit comment');
	e.preventDefault();
	if ( e.target.classList.contains('balloon__form') ){
		let balloon = document.querySelector('.balloon'),
			comments = balloon.querySelector('.balloon__comments'),
			balloonId = balloon.dataset.id,
			form = e.target,
			errorMSG = form.querySelector('.form__msg'),
			user = form.querySelector('.form__user'),
			place = form.querySelector('.form__place'),
			description = form.querySelector('.form__description');

		if (user.value && place.value && description.value) {
			if (!pinsData[balloonId]){
				model.addPinData(pinsData,longtitude, latitude, addr, sessionStorage.pinId);
				view.addPin(yaMap, longtitude, latitude, addr, id);
				id++;
				sessionStorage.setItem('pinId', id);
			}
			model.addCommentData(commentsData, user.value, place.value, description.value, balloonId);
			comments.innerHTML = view.getComments(balloonId);
			// Clean form
			user.value = '';
			place.value = '';
			description.value = '';
			// Increment ID
		} else {
			errorMSG.classList.add('show');
			setTimeout(function() {
				errorMSG.classList.remove('show');
			}, 1500)
		}
	}
	
});

// Close balloon
document.addEventListener('click', function(e) {
	if ( e.target.classList.contains('balloon__close') ){
		yaMap.balloon.close();
	};
});