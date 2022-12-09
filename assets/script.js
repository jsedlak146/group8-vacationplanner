var savedLocations = getLocalStorage();
// [];
var savedDates = getLocalStorageDate();



var ticketmasterEl = $("#ticketmaster");
var breweryEl = $("#breweries");
var airbnbEl = $("#airbnb");

renderSaved()

function getLocalStorage() {
  return JSON.parse(localStorage.getItem('savedLocations')) || [];
};

function getLocalStorageDate() {
  return JSON.parse(localStorage.getItem('savedDates')) || [];
};

$('#search-location').on('click', function(event){
    event.preventDefault();

    var cityName = $('#location-input').val().trim();
    var searchDateUnformatted = $('#date-input').val().trim();  //value received from user input
    var inputDate = dayjs(searchDateUnformatted).format('YYYY-MM-DD');  // user input reformatted to ticketmaster required format using dayjs
    var inputEndDate = (dayjs(inputDate).add(1, 'day')).format('YYYY-MM-DD'); // user input + 1 day using dayjs
    
    savedLocations.push(cityName);
    savedDates.push(inputDate);
  

    $("#location-input").val('');
    $("#date-input").val('');
    
   localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
   localStorage.setItem('save-dates', JSON.stringify(savedDates));
    
  





    clearSearchResults();
    renderSaved();
    
    getTicketMaster(cityName, inputDate, inputEndDate);
    getBreweries(cityName);
    // getAirbnb(cityName, inputDate, inputEndDate);

});

function renderSaved () {
        $('#search-history').empty();

        for (var i=0; i< savedLocations.length; i++) {
              var locBtn = $('<button>');
              locBtn.addClass('saved-search-button');
              locBtn.attr('saved-location', savedLocations[i]);
              locBtn.attr('saved-date', savedDates[i]);
              locBtn.text(savedLocations[i]);

              
              
            $('#search-history').append(locBtn);
        
        }
      };


// function to render data from search history button

function displaySearchHistory () {
  

    var savedCityName = $(this).attr('saved-location');
    var tempDate = $(this).attr('saved-date');
    var savedDate = dayjs(tempDate).format('YYYY-MM-DD');
    var defaultEndDate = (dayjs(savedDate).add(1, 'day')).format('YYYY-MM-DD');

    console.log(savedCityName)
    console.log(savedDate)
    console.log(defaultEndDate)

    // clearSearchResults();
    // getTicketMaster(savedCityName, savedDate, defaultEndDate);
    // getBreweries(savedCityName);
    // getAirbnb(savedCityName, savedDate, defaultEndDate);

};
  

// function to render data received from Ticketmaster API onto cards

function getTicketMaster(location, startDate, endDate) {
  const apiKey = "FtEqYpIoWBFSbSArl0CV46XT95pYEReh";
  const ticketMasterUrl ="https://app.ticketmaster.com/discovery/v2/events?apikey=" + apiKey + "&locale=*&startDateTime=" + startDate + "T11:10:00Z&endDateTime=" + endDate + "T11:11:00Z&city=" + location;
  fetch(ticketMasterUrl)
    .then(function(response) {

      return response.json()

    })
    .then(function(data) {
        console.log((data));
        ticketmasterEl.append(`
           <h2>🎫Local Events🎟</h2>
        `);
        for (var i = 0; i < data._embedded.events.length; i++) {
          var eventName = data._embedded.events[i].name;
          var eventImage = data._embedded.events[i].images[0].url;
          var ticketsUrl = data._embedded.events[i].url;
          var eventDate = dayjs(data._embedded.events[i].dates.start.localDate).format('MMM DD YYYY');
          var eventTime = data._embedded.events[i].dates.start.localTime;
          var eventHour = parseInt(eventTime.slice(0 , 2));
          var eventMinutes = eventTime.slice(-5, -3);
          if (eventHour > 12) {
            eventTime = (eventHour - 12) + ":" + eventMinutes + " PM";
          } else {
            eventTime = eventHour + ":" + eventMinutes + " AM";
          }
          ticketmasterEl.append(`
            
              <div class="col s6 m3 l2">
              <div class="col s6 m3 l2 id="ticketmaster-div">
                <div class="card small hoverable ticketmaster-card">
                  <div class="card-image">
                    <img src=${eventImage}>
                  </div>
                  <div class="card-content">
                    <p>${eventName}</p>
                    <p>${eventDate}</p>
                    <p>${eventTime}</p>
                  </div>
                  <div class="card-action">
                    <a href="${ticketsUrl}">Get Tickets</a>
                  </div>
                </div>
              </div>
          
          `);
        };
        ticketmasterEl.append(`
        <span id="ticketmaster-span">show more...</span>
        `);
        $(function () {
          $('#ticketmaster-span').click(function () {
              $('#ticketmaster div:hidden').slice(0, 30).show();
              if ($('#ticketmaster div').length == $('#ticketmaster div:visible').length) {
                  $('#ticketmaster-span').hide();
              }
          });
      });
    })
}

function clearSearchResults() {
  airbnbEl.empty();
  ticketmasterEl.empty();
  breweryEl.empty();
}

 function getBreweries(location) {
    
    const breweryUrl = "https://api.openbrewerydb.org/breweries?by_city=" + location + "&per_page=10";
    fetch(breweryUrl)
    .then(function(response) {

      return response.json()
  
    })
    .then(function(data) {
        console.log((data));
        breweryEl.append(`
           <h2>🍺Local Breweries🍺</h2>
        `);
        for (var i = 0; i < data.length; i++) {
          var breweryName = data[i].name;
          var breweryLocation = data[i].street + " " + data[i].city + ", " + data[i].state;
          var breweryUrl = data[i].website_url;
          var breweryUrlAdj;
          var breweryPhone = data[i].phone;
          if (breweryUrl === null) {
            breweryUrlAdj = "No website available.";
          } else {
            var breweryUrlAdj = breweryUrl.slice(0, 4) + "s" + breweryUrl.slice(4);
          }
          breweryEl.append(`
              <ul>
                <li class="brewery-names">${breweryName + ", Address: " + breweryLocation + ", Phone: " + breweryPhone + ", url: " + "<a href=" + breweryUrlAdj + ">" + breweryUrlAdj + "</a>"}</li>
              </ul>
          `);
  };
    })

 }

 function getAirbnb(location, checkInDate, checkOutDate) {
  var settings = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'a2bc05b236msh7287f021f76321ap10f7f6jsn319c2f597455',
      'X-RapidAPI-Host': 'airbnb13.p.rapidapi.com'
    }
  };
  var airbnbUrl = "https://airbnb13.p.rapidapi.com/search-location?location=" + location + "&checkin=" + checkInDate + "&checkout=" + checkOutDate + "&adults=1&children=0&infants=0&page=1"
  fetch(airbnbUrl, settings) 
    .then(function(response){
      return response.json()
    })
    .then(function(data) {
      console.log(data);
      for (var i = 0; i < 6; i++) {
        var listingName = data.results[i].name;
        var listingAddress = data.results[i].address;
        var listingPrice = data.results[i].price.rate
        var listingRating = data.results[i].rating;
        var reviewCount = data.results[i].reviewsCount;
        var listingImg = data.results[i].images[0];
        var listingUrl = data.results[i].url;

        airbnbEl.append(`
        <div class="col s6 m3 l2">
          <h3>Airbnb Listings</h3>
        <div class="card small hoverable airbnb-card">
          <div class="card-image">
            <img src=${listingImg}>
          </div>
          <div class="listing-content">
            <p>${listingName}</p>
            <div>
              <p>Address: ${listingAddress}</p>
              <p>Rated: ${listingRating}</p>
              <p>Number of Reviews: ${reviewCount}</p>
              <p>Price per Night: ${listingPrice} for 1 adult</p>
            </div>
          </div>
          <div class="card-action">
            <a href="${listingUrl}" target="_blank">See Listing</a>
          </div>
        </div>
      </div>
        `)
      }
    })
    .catch(err => console.error(err));
    } 


    $(document).on('click', '.saved-search-button', displaySearchHistory);
   // const options = {
    //  method: 'GET',
     // headers: {
      //  'X-RapidAPI-Key': 'e73ae1a52emsh2147aac4621d516p126b65jsn4b4561360052',
      //  'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
    //  }
   // };
    
   // fetch('https://travel-advisor.p.rapidapi.com/locations/v2/auto-complete?query=Paris&lang=en_US&units=km', options)
    //  .then(response => response.json())
    //  .then(response => console.log(response))
    //  .catch(err => console.error(err));
  
