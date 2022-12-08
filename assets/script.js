var savedLocations = [];


var ticketmasterEl = $("#ticketmaster");



$('#search-location').on('click', function(event){
    event.preventDefault();

    var searchLocation = $('#location-input').val().trim();
    var searchDateUnformatted = $('#date-input').val().trim();  //value received from user input
    var ticketmasterStartDate = dayjs(searchDateUnformatted).format('YYYY-MM-DD');  // user input reformatted to ticketmaster required format using dayjs
    var ticketmasterEndDate = (dayjs(ticketmasterStartDate).add(1, 'day')).format('YYYY-MM-DD'); // user input + 1 day using dayjs
    

    savedLocations.push(searchLocation);

    $("#location-input").val('');
    

    localStorage.setItem("saved", savedLocations);
    // console.log(savedLocations);
    
    function renderSaved(){
        $('#location-views').empty();
    
        for (var i=0; i< savedLocations.length; i++) {
            var locBtn = $('<button>');
            locBtn.addClass('saved-search-button');
            locBtn.attr('saved', savedLocations[i]);
            locBtn.text(savedLocations[i]);
            $('#search-history').append(locBtn);
        }
    };
    
    renderSaved();
    clearSearchResults();
    getTicketMaster(searchLocation, ticketmasterStartDate, ticketmasterEndDate);

});

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
        for (var i = 0; i < data._embedded.events.length; i++) {
          var eventName = data._embedded.events[i].name;
          var eventImage = data._embedded.events[i].images[0].url;
          var ticketsUrl = data._embedded.events[i].url;
          var eventDate = dayjs(data._embedded.events[i].dates.start.localDate).format('MMM DD YYYY');
          var eventTime = data._embedded.events[i].dates.start.localTime;
      
          ticketmasterEl.append(`
            
              <div class="col s6 m3 l2">
                <div class="card hoverable ticketmaster-card">
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
    })
}

function clearSearchResults() {
  ticketmasterEl.empty();
}

 
        
   

 
