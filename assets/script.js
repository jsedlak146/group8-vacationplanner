/* variables for Local Storage - the savedLocations and savedDates will be used to enable user to easily go back
to previously saved locations/dates */
var savedLocations = getLocalStorage();
var savedDates = getLocalStorageDate();

/* variables to identify elements so that they can be updated dynamically as search results are pulled from the 
3 API's used (TicketMaster, Open Brewery, and AirBnB) */
var ticketmasterEl = $("#ticketmaster");
var breweryEl = $("#breweries");
var airbnbEl = $("#airbnb");

// function call to render buttons for previously saved locations/dates.

var sideNav = document.querySelector(".sidenav");
  M.Sidenav.init(sideNav, {});
  
renderSaved();
clearSearchHistory();

// function to pull saved locations from Local Storage.
function getLocalStorage() {
  return JSON.parse(localStorage.getItem("savedLocations")) || [];
};

// function to pull saved dates from Local Storage.
function getLocalStorageDate() {
  return JSON.parse(localStorage.getItem('savedDates')) || [];
};

// 'click' event listener added to the search button 
$('#search-location').on('click', function(event){
    event.preventDefault();
    // grabs user entered values for location and dates and formats and saves to variables
    var searchLocation = $('#location-input').val().trim();
    var searchDateUnformatted = $('#date-input').val().trim();  //value received from user input
    var ticketmasterStartDate = dayjs(searchDateUnformatted).format('YYYY-MM-DD');  // user input reformatted to ticketmaster required format using dayjs
    var ticketmasterEndDate = (dayjs(ticketmasterStartDate).add(1, 'day')).format('YYYY-MM-DD'); // user input + 1 day using dayjs
    // adds saved locations and dates to arrays so that they can be saved to local storage
    savedLocations.push(searchLocation);
    savedDates.push(ticketmasterStartDate);
    $("#location-input").val('');
    $("#date-input").val('');
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    localStorage.setItem("savedDates", JSON.stringify(savedDates));
    //renders buttons for previously saved locations/dates, clears previous search results from screen and renders new search results from the 3 API's.

    renderSaved();
    clearSearchResults();
    getTicketMaster(searchLocation, ticketmasterStartDate, ticketmasterEndDate);
    getBreweries(searchLocation);
    getAirbnb(searchLocation, ticketmasterStartDate, ticketmasterEndDate);
});

//function for rendering buttons for previously searched locations/dates.
function renderSaved(){
  $('#search-history').empty();

  for (var i=0; i< savedLocations.length; i++) {
      var locBtn = $('<button>');
      locBtn.addClass('saved-search-button');
      locBtn.attr({
        'saved': savedLocations[i],
        'saved-date': savedDates[i],
        });
      locBtn.text(savedLocations[i]);
      $('#search-history').append(locBtn);
  }
};

// function that will pull search results when search history buttons are clicked.
function displaySearchHistory () {

  var savedCityName = $(this).attr('saved');
  var tempDate = $(this).attr('saved-date');
  var savedDate = dayjs(tempDate).format('YYYY-MM-DD');
  var defaultEndDate = (dayjs(savedDate).add(1, 'day')).format('YYYY-MM-DD');

  console.log(savedCityName)
  console.log(savedDate)
  console.log(defaultEndDate)

  clearSearchResults();
  getTicketMaster(savedCityName, savedDate, defaultEndDate);
  getBreweries(savedCityName);
  getAirbnb(savedCityName, savedDate, defaultEndDate);

};

// clear search history button

function clearSearchHistory() {
  var clearBtn = $('<button>');
  clearBtn.addClass('clear-search-button');
  clearBtn.text('Clear Searches');

  $(clearBtn).on('click', function(event) {
    event.preventDefault();
    window.localStorage.clear();
    $('#search-history').empty();
    
    savedLocations = [];

  });

  $('#clear-search').append(clearBtn)
}
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
           <br>
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

// function for clearing previous results from the 3 API's.
function clearSearchResults() {
  airbnbEl.empty();
  ticketmasterEl.empty();
  breweryEl.empty();
}

// function for pulling from Open Breweries API.  Will show a list of local breweries for the city entered by the user.
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
           <br>
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

 // function for pulling Airbnb listings from the Airbnb API for the city entered by the user.
 function getAirbnb(location, checkInDate, checkOutDate) {
  var settings = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '921757d737mshb674ed19264e09cp1e780fjsnb5446d67db98',
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
      airbnbEl.append(`
        <h2> Airbnb Listings </h2>
        <br>
      `)

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
        <div class="card medium hoverable airbnb-card">
          <div class="card-image">
            <img src=${listingImg}>
          </div>
          <div class="card-content">
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

  // 'click' event listener added to buttons which will call the function for rendering data from previous searches
   $(document).on('click', '.saved-search-button', displaySearchHistory);

   // Materialize 'datepicker' - allows datepicker calendar to pop-up when user clicks on date box
   
   $(document).ready(function(){
    $('.datepicker').datepicker();
  });
          
