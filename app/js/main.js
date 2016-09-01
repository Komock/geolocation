'use strict';
const view = require('./view'),
	model = require('./model');

let yaMap = {},
	collection = {},
	pinsData = [],
	id = 0,
	addr = '',
	longtitude = 0,
	latitude = 0;

// Get current date
function getDate() {
	let now = new Date(),
		y = now.getYear() + 1900,
		m = now.getMonth() + 1,
		d = now.getDate(),
		h = now.getHours(),
		mi = now.getMinutes(),
		s = now.getSeconds();
	return `${y}.${m}.${d} ${h}:${mi}:${s}`;
}

ymaps.ready(function () {
	// Init map
	yaMap = new ymaps.Map('map', {
		center: [55.751574, 37.573856],
		zoom: 9
		}, {
		searchControlProvider: 'yandex#search'
	});

	// Create collection of objects
	let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
		'<div class="cluster-balloon">' +
			'<h4 class="cluster-balloon__title">$[properties.comment.place]</h4>' +
			'<a href="#" class="show-balloon" data-lng="$[properties.lng]" data-lat="$[properties.lat]">$[properties.addr]</a>' +
			'<p class="cluster-balloon__desc">$[properties.comment.description]</p>' +
			'<p class="cluster-balloon__date">$[properties.comment.date]</p>' +
		'</div>',
		{
			build: function () {
				this.constructor.superclass.build.call(this);
				this.element = document.querySelector('.cluster-balloon');
			}
		}
	);

	collection = new ymaps.Clusterer({
		disableClickZoom: true,
		clusterHideIconOnBalloonOpen: false,
		clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customItemContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130
	});

	yaMap.geoObjects.add(collection);

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
				view.balloonOpen(yaMap, pinsData, longtitude, latitude, addr);
			});
		} else {
			yaMap.balloon.close();
		}
	});

	// Click on placemark
	yaMap.geoObjects.events.add('click', function(e){
		e.preventDefault();
		console.log(e);

		if (e.get('target').options._name !== 'cluster') {
			console.log('click placemark');
			let coords = e.get('coords'),
				pinId = e.get('target').properties.get('id'),
				placeData = pinsData[pinId];
			longtitude = parseFloat(coords[0].toPrecision(6));
			latitude = parseFloat(coords[1].toPrecision(6));
			// console.log('placemark with id ' + pinId + ' opened');
			// console.log('coords ' + longtitude + ', ' + latitude);
			// console.log(pinsData);
			view.balloonOpen(yaMap, pinsData, placeData.lng, placeData.lat, placeData.addr);
		} else {
			console.log('click cluster');
			console.log(e.get('target').properties.get('geoObjects'));
		}
	});

	// Check if data exist 
	if (sessionStorage.getItem('pins')) {
		pinsData = JSON.parse( sessionStorage.getItem('pins') );
		id = sessionStorage.getItem('pinId');
		// Build pins on map
		view.buildPins( pinsData, collection );
	} else {
		sessionStorage.setItem('pinId', 0);
		sessionStorage.setItem('pins', '');
	}
});

// Submit comment
document.addEventListener('submit', function(e) {
	console.log('submit comment');
	e.preventDefault();
	if ( e.target.classList.contains('balloon__form') ){
		let balloon = document.querySelector('.balloon'),
			comments = balloon.querySelector('.balloon__comments'),
			date = getDate(),
			form = e.target,
			errorMSG = form.querySelector('.form__msg'),
			user = form.querySelector('.form__user'),
			place = form.querySelector('.form__place'),
			description = form.querySelector('.form__description');

		if (user.value && place.value && description.value) {
			model.addPinData(pinsData, longtitude, latitude, addr, id, user.value, place.value, description.value, date);
			view.addPin(collection, longtitude, latitude, addr, id, user.value, place.value, description.value, date);
			comments.innerHTML = view.getComments(pinsData, addr);

			// Clear form
			user.value = '';
			place.value = '';
			description.value = '';
			// Increment ID
			id++;
			sessionStorage.setItem('pinId', id);
		} else {
			errorMSG.classList.add('show');
			setTimeout(function() {
				errorMSG.classList.remove('show');
			}, 1500);
		}
	}

});

// Close balloon
document.addEventListener('click', function(e) {
	if ( e.target.classList.contains('balloon__close') ){
		yaMap.balloon.close();
	};
});

// Show balloon
document.addEventListener('click', function(e) {
	if ( e.target.classList.contains('show-balloon') ){
		yaMap.balloon.close();
		let link = e.target;
		addr = link.innerText;
		longtitude = link.dataset.lng;
		latitude = link.dataset.lat;
		console.log('show-balloon');
		view.balloonOpen(yaMap, pinsData, longtitude, latitude, addr);
	};
});