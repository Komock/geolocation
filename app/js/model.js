'use strict';
module.exports = {
	addPinData: function(pinsData, lng, lat, addr, id, user, place, description, date){
		console.log(user, place, description, date);
		let pin = {
			id: id,
			lng: lng,
			lat: lat,
			addr: addr,
			comment: {
				user: user,
				place: place,
				description: description,
				date: date
			}
		};
		pinsData.push(pin);
		sessionStorage.setItem('pins', JSON.stringify(pinsData));
	}
};