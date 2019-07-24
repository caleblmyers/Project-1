//==================================================
// VARIABLES
//--------------------------------------------------

var searchData;
var searchDataNext;
var keyword;

var themeDark = false;

var siteURL = 'https://caleblmyers.github.io/Project-1/'
var openWeatherKey = '280deca1e7bba83d640479281597834f';

//==================================================
// FUNCTIONS
//--------------------------------------------------

function transitionTheme() {
	$(document.documentElement).addClass('transition');
	setTimeout(function () {
		$(document.documentElement).removeClass('transition');
	}, 1000);
}

function toggleTheme() {
	$('body').toggleClass('body--dark');
	$('.card').toggleClass('card--dark');
	$('.btn--light').toggleClass('btn--dark');
}

function initMap() {
	var currentUrl = new URL(window.location);
	var searchParams = new URLSearchParams(currentUrl.search);
	// The location of the venue
	var location = {
		lat: parseFloat(searchParams.get('lat')),
		lng: parseFloat(searchParams.get('lng'))
	};

	initWeather(location.lat, location.lng);

	// The map, centered at the venue
	var map = new google.maps.Map(document.getElementById('js-map'), {
		zoom: 15,
		center: location
	});
	// The marker, positioned at the venue
	var marker = new google.maps.Marker({
		position: location,
		map: map
	});
}

function initWeather(lat, lng) {
	if (lat) {
		var queryURL =
			'https://api.openweathermap.org/data/2.5/weather?lat=' + lat +
			'&lon=' + lng +
			'&APPID=' + openWeatherKey;

		$.ajax({
			url: queryURL,
			method: 'GET'
		}).then(function (res) {
			var temp = (res.main.temp * (9 / 5) - 459.67).toFixed(1);
			var desc = res.weather[0].description;
			console.log(res.main.temp);
			$('#js-details-temp').html(temp + '&deg');
			$('#js-details-weather').text(desc);
		});
	}
}

function searchDetails() {
	var searchKeyword = $('#js-input-details-search').val().trim();
	localStorage.setItem('searchKeyword', searchKeyword);
	window.open(siteURL + 'index.html?keyword=' + searchKeyword, '_blank');
}

function grabImg(imgArray) {
	var minWidth = 1000;
	var imgFound = false;
	var imgUrl;
	for (let j = 0; j < imgArray.length; j++) {
		if (
			imgArray[j].width >= minWidth &&
			imgArray[j].ratio === '16_9'
		) {
			imgUrl = imgArray[j].url;
			imgFound = true;
		}
	}
	if (!imgFound) {
		imgUrl = imgArray[0].url;
	}
	return imgUrl;
}

function mainSearch() {
	keyword = $('#js-input-search').val().trim();

	// Clears old search results
	$('#js-results').empty();
	$('#js-form-search')[0].reset();

	// Checks if user made an input
	if (keyword === '') {
		console.log('didnt search');
		$('#js-display-row').hide();
	} else {
		console.log('did search');

		var queryURL =
			'https://app.ticketmaster.com/discovery/v2/events?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&keyword=' +
			keyword +
			'&locale=*&includeSpellcheck=yes';

		$.ajax({
			url: queryURL,
			method: 'GET'
		}).then(function (res) {
			searchCall(res, keyword);
		});
	}
}

function searchCall(res, key) {
	searchData = res._embedded;
	console.log(res);
	console.log(searchData);

	if (searchData === null || searchData === undefined) {
		$('#js-display-header').text('No results found.');
		$('#js-display-row').show();
	} else {
		$('#js-display-header').html(
			'Showing results for <span class="result__key" id="js-display-input">' +
			key +
			'</span>'
		);
		console.log(key);
		$('#js-display-row').show();

		if (_.has(res._links.next, 'href')) {
			searchDataNext = res._links.next.href;
		} else {
			searchDataNext = undefined;
		}

		// Creates cards for each matching result
		for (let i = 0; i < searchData.events.length; i++) {
			var classDark = '';
			if (themeDark) {
				classDark = 'card--dark';
			}
			var imgUrl = grabImg(searchData.events[i].images);
			var eventLat = null;
			var eventLng = null;
			var cityName = 'N/A';
			var stateCode = 'N/A';
			var venueName = 'Venue Unavailable';

			if (_.has(searchData.events[i], 'place')) {
				eventLat = searchData.events[i].place.location.latitude;
				eventLng = searchData.events[i].place.location.longitude;
				cityName = searchData.events[i].place.city.name || 'N/A';
				if (searchData.events[i].place.countryCode === 'US') {
					stateCode =
						searchData.events[i].place.state.stateCode || 'N/A';
				} else {
					stateCode =
						searchData.events[i].place.country.countryCode || 'N/A';
				}
			} else if (_.has(searchData.events[i], '_embedded')) {
				if (
					_.has(searchData.events[i]._embedded.venues[0], 'location')
				) {
					eventLat =
						searchData.events[i]._embedded.venues[0].location
							.latitude;
					eventLng =
						searchData.events[i]._embedded.venues[0].location
							.longitude;
				}
				if (_.has(searchData.events[i]._embedded.venues[0], 'city')) {
					cityName =
						searchData.events[i]._embedded.venues[0].city.name ||
						'N/A';
					if (
						searchData.events[i]._embedded.venues[0].country
							.countryCode === 'US'
					) {
						stateCode =
							searchData.events[i]._embedded.venues[0].state
								.stateCode || 'N/A';
					} else {
						stateCode =
							searchData.events[i]._embedded.venues[0].country
								.countryCode || 'N/A';
					}
				}
			}

			if (_.has(searchData.events[i], '_embedded')) {
				if (_.has(searchData.events[i]._embedded.venues[0], 'name')) {
					venueName =
						searchData.events[i]._embedded.venues[0].name || 'N/A';
				}
			}

			console.log('card making running');
			var newCard = $(
				"<div class='col-12 col-md-6 col-lg-3'>"
			).append(
				$(
					"<a href='./details.html?id=" +
					searchData.events[i].id +
					'&lat=' +
					eventLat +
					'&lng=' +
					eventLng +
					"' target=_blank class='card-link'>"
				).append(
					$(
						`<div class='card result__card ${classDark} mb-md-3 mb-4'>`
					).append(
						$(
							"<img src='" +
							imgUrl +
							"' alt='" +
							searchData.events[i].name +
							"' class='card-img-top'>"
						),
						$("<div class='card-body'>").append(
							$("<h5 class='card-title mb-1'>").text(
								searchData.events[i].name
							),
							$("<p class='card-text'>").text(
								moment(
									searchData.events[i].dates.start.localDate,
									'YYYY-MM-DD'
								).format('MMMM Do YYYY')
							),
							$("<p class='card-text mb-0'>").text(venueName),
							$("<p class='card-text result__info'>").text(
								cityName + ', ' + stateCode
							)
						)
					)
				)
			);
			$('#js-results').append(newCard);
		}
	}
}

function checkForValue(object, keyName, textNode) {
	if (_.has(object, keyName)) {
		$(textNode).text(object[keyName]);
	} else {
		$(textNode).text('Information not found.');
	}
}

function checkWindow() {
	if (window.innerWidth < 992) {
		$('#navbar-search').removeClass('input--absolute');
	} else {
		$('#navbar-search').addClass('input--absolute');
	}
}

//==================================================
// APP INIT
//--------------------------------------------------

// Gets event details after the user selects an event and moves to details.html
$(document).ready(function () {
	checkWindow();
	window.addEventListener('resize', checkWindow);

	$('#js-btn-search').on('click', function (e) {
		e.preventDefault();
		mainSearch();
	});

	$('#js-toggle-theme').on('change', function () {
		themeDark = !themeDark;
		// $(".toggle__switch")
		transitionTheme();
		toggleTheme();
	});

	// Current brower href
	var pageRef = window.location.href;
	var currentUrl = new URL(window.location);
	var searchParams = new URLSearchParams(currentUrl.search);

	// Checks if details.html or index.html is active
	if (pageRef.search('details') === -1) {
		console.log('You are on the index page');
		if (
			searchParams.get('keyword') !== null &&
			searchParams.get('keyword') !== undefined
		) {
			$('#js-input-search').val(searchParams.get('keyword'));
			mainSearch();
		}
	} else {
		console.log('Details page!!!');
		$('#js-btn-details-search').on('click', function (e) {
			e.preventDefault();
			searchDetails();
		});

		var currentUrl = new URL(window.location);
		var searchParams = new URLSearchParams(currentUrl.search);
		console.log(searchParams);

		var detailsID = searchParams.get('id');
		var queryURL =
			'https://app.ticketmaster.com/discovery/v2/events/' +
			detailsID +
			'?apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5&locale=*&includeSpellcheck=yes';

		$.ajax({
			url: queryURL,
			method: 'GET'
		}).then(function (res) {
			console.log(res);
			var imgUrl = grabImg(res.images);
			$('#js-details-image').attr('src', imgUrl);

			var cityName = 'N/A';
			var stateCode = 'N/A';
			var address = 'N/A';
			var postalCode = 'N/A';
			var venueName = 'Venue Unavailable';

			if (_.has(res, 'place')) {
				cityName = res.place.city.name || 'N/A';
				if (res.place.countryCode === 'US') {
					stateCode = res.place.state.stateCode || 'N/A';
				} else {
					stateCode = res.place.country.countryCode || 'N/A';
				}
				address = res.place.address.line1 || 'N/A';
				postalCode = res.place.postalCode || 'N/A';
			} else if (_.has(res, '_embedded')) {
				if (_.has(res._embedded.venues[0], 'city')) {
					cityName = res._embedded.venues[0].city.name || 'N/A';
					if (res._embedded.venues[0].country.countryCode === 'US') {
						stateCode =
							res._embedded.venues[0].state.stateCode || 'N/A';
					} else {
						stateCode =
							res._embedded.venues[0].country.countryCode || 'N/A';
					}
					postalCode = res._embedded.venues[0].postalCode || 'N/A';
				}
				if (_.has(res._embedded.venues[0], 'address')) {
					address = res._embedded.venues[0].address.line1 || 'N/A';
				}
			}

			if (_.has(res, '_embedded')) {
				if (_.has(res._embedded.venues[0], 'name')) {
					venueName = res._embedded.venues[0].name || 'N/A';
				}
			}

			// Adds info to the brief section
			checkForValue(res, 'name', '#js-brief-event');
			checkForValue(res.dates.start, 'localDate', '#js-brief-date');

			if (_.has(res.dates.start, 'localDate')) {
				$('#js-brief-date').text(
					moment(res.dates.start.localDate, 'YYYY-MM-DD').format(
						'MMMM Do YYYY'
					)
				);
			} else {
				$('#js-brief-date').text('No date available.');
			}

			if (_.has(res.dates.start, 'localTime')) {
				$('#js-brief-time').text(
					moment(res.dates.start.localTime, 'HH:mm:SS').format(
						'hh:mm A'
					)
				);
			} else {
				$('#js-brief-time').text('No time available.');
			}

			$('#js-brief-location').text(venueName);
			$('#js-brief-address').text(address);
			$('#js-brief-city').text(cityName + ', ');
			$('#js-brief-state').text(stateCode + ' ');
			$('#js-brief-zip').text(postalCode);

			// Adds info to the details section
			checkForValue(res, 'name', '#js-details-event');
			checkForValue(res.dates.start, 'localDate', '#js-details-date');
			$('#js-details-location').text(venueName);
			$('#js-details-tickets').attr('href', res.url);
			checkForValue(res, 'pleaseNote', '#js-details-note');
			checkForValue(res, 'info', '#js-details-info');

			//adds link to google maps with venue address
			if (address === 'N/A') {
				$('#js-brief-link').attr('href', `#`);
			} else {
				$('#js-brief-link').attr(
					'href',
					`https://www.google.com/maps?q=${address}+${cityName}+${stateCode}+${postalCode}`
				);
			}
		});
	}
});

$(window).scroll(function () {
	if (
		$(window).scrollTop() + $(window).height() >
		$(document).height() - 1 &&
		searchDataNext !== undefined
	) {
		var queryURL =
			'https://app.ticketmaster.com' +
			searchDataNext +
			'&apikey=1CDZF2AkHAO8FPwY0r3kQm6bmxI7Vuk5';

		$.ajax({
			url: queryURL,
			method: 'GET'
		}).then(function (res) {
			searchCall(res, keyword);
		});
	}
});
