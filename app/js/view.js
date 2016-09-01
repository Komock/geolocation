'use strict';
const Handlebars = require('handlebars');
let commentTempl = commentsTemplate.innerHTML;

module.exports = {
	balloonLayout: function(){
		return ymaps.templateLayoutFactory.createClass(
			'<div class="balloon" data-id="$[id]">' +
				'$[[options.contentLayout observeSize minWidth=360 maxWidth=300]]' +
			'</div>', {
				build: function () {
					this.constructor.superclass.build.call(this);
					this.element = document.querySelector('.balloon');
				}
			}
		);
	},
	balloonContentLayout: function(){
		return ymaps.templateLayoutFactory.createClass(
			'<div class="balloon__close"></div>' +
			'<h3 class="balloon__title">$[balloonAddr]</h3>' +
			'<div class="balloon__content">' +
				'<div class="balloon__comments">$[balloonComments]</div>' +
				'<div class="form__wrap">' +
					'<h4 class="form__title">Ваш отзыв</h4>' +
					'<form class="form balloon__form">' +
						'<input class="form__user" type="text" placeholder="Ваше имя" tabindex="1">' +
						'<input class="form__place" type="text" placeholder="Укажите место" tabindex="2">' +
						'<textarea class="form__description" placeholder="Поделитесь впечатлениями" rows="5" tabindex="3"></textarea>' +
						'<div class="submit__wrap"><input type="submit" data-input="submit" value="Добавить" tabindex="4"></div>' +
						'<div class="form__msg">Заполнены не все поля!</div>' +
					'</form>' +
				'</div>' +
			'</div>'
		);
	},
	buildPins: function(data, collection) {
		let that = this;
		console.log('buildPins');
		console.log(data);
		data.forEach(function(pinData){
			collection.add(new ymaps.Placemark([pinData.lng, pinData.lat], {
					addr: pinData.addr,
					lng: pinData.lng,
					lat: pinData.lat,
					id: pinData.id,
					comment: {
						user: pinData.comment.user,
						place: pinData.comment.place,
						description: pinData.comment.description,
						date: pinData.comment.date
					}
				}, {
					preset: 'twirl#lightblueIcon'
				}
			));
		});
	},
	balloonOpen: function(yaMap, pinsData, lng, lat, addr) {
		console.log('open balloon');
		console.log(lng, lat, addr);
		console.log(pinsData);
		yaMap.balloon.open([lng, lat], {
			balloonAddr: addr,
			balloonComments: this.getComments(pinsData, addr)
		}, {
			layout: this.balloonLayout(),
			contentLayout: this.balloonContentLayout()
		});
	},
	getComments: function(pinsData, addr) {
		console.log('pinsData', pinsData);
		if ( pinsData !== [] ) {
			// console.log(pinsData[id]);
			let pinComments = [];
			pinsData.forEach(function(item){
				if (item.addr === addr) {
					pinComments.push(item.comment);
				}
			});
			// If comments exist, return comments layout
			if (pinComments.length > 0) {
				console.log('comments exist');
				let templ = Handlebars.compile(commentTempl);
				return templ(pinComments);
			}
			return 'Отзывов пока нет';
		}
		return 'Отзывов пока нет';
	},
	addPin: function(collection, lng, lat, addr, id, user, place, description, date){
		console.log('addPin');
		console.log(lng, lat, addr, id, user, place, description, date);
		collection.add(new ymaps.Placemark([lng, lat], {
				addr: addr,
				lng: lng,
				lat: lat,
				id: id,
				comment: {
					user: user,
					place: place,
					description: description,
					date: date
				}
			}, {
    			preset: 'twirl#lightblueIcon'
			}
		));
	}
};