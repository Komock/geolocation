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
						'<input class="form__user" type="text" placeholder="Ваше имя">' +
						'<input class="form__place" type="text" placeholder="Укажите место">' +
						'<textarea class="form__description" placeholder="Поделитесь впечатлениями" rows="5"></textarea>' +
						'<div class="submit__wrap"><input type="submit" data-input="submit" value="Добавить"></div>' +
						'<div class="form__msg">Заполнены не все поля!</div>' +
					'</form>' +
				'</div>' +
			'</div>'
		);
	},
	buildPins: function(data, yaMap) {
		let that = this;
		data.forEach(function(pinData){
			let pin = yaMap.geoObjects.add(new ymaps.Placemark([pinData.lng, pinData.lat], {
					balloonAddr: pinData.addr,
					id: pinData.id
				}, {
					balloonLayout: that.balloonLayout(),
					balloonContentLayout: that.balloonContentLayout()
				}
			));
		});
	},
	balloonOpen: function(yaMap, lng, lat, addr, id) {
		console.log('open ballon with id ' + id);
		yaMap.balloon.open([lng, lat], {
			balloonAddr: addr,
			balloonComments: this.getComments(id),
			id: id
		}, {
			layout: this.balloonLayout(),
			contentLayout: this.balloonContentLayout()
		});
	},
	getComments: function(id) {
		if (sessionStorage.getItem('comments') && id) {
			let comments = JSON.parse( sessionStorage.getItem('comments') );
			let templ = Handlebars.compile(commentTempl);
			return templ(comments[id]);
		} else {
			return 'Отзывов пока нет';
		}
	},
	addPin: function(yaMap, lng, lat, addr, id){
		console.log('addPin');
		yaMap.geoObjects.add(new ymaps.Placemark([lng, lat], {
			id: id
		}));
	}
};