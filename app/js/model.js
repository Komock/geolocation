'use strict';
module.exports = {
	addPinData: function(pinsData, lng, lat, addr, id){
		let pin = {
			id: id,
			lng: lng,
			lat: lat,
			addr: addr
		};
		pinsData.push(pin);
		sessionStorage.setItem('pins', JSON.stringify(pinsData));
	},
	addCommentData: function(commentsData, user, place, description, id){
		let comment = {
			user: user,
			place: place,
			description: description
		};
		if (commentsData[id]) {
			commentsData[id].push(comment);
		} else {
			commentsData[id] = [comment];
		}
		sessionStorage.setItem('comments', JSON.stringify( commentsData ));
	}
};