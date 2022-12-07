var savedLocations = [];
const apiKey = "FtEqYpIoWBFSbSArl0CV46XT95pYEReh";
const ticketMasterUrl ="https://app.ticketmaster.com/discovery/v2/events?apikey=FtEqYpIoWBFSbSArl0CV46XT95pYEReh&locale=*&startDateTime=2023-04-08T11:10:00Z&endDateTime=2023-04-09T11:11:00Z&city=London";

var ticketmasterEl = $("#ticketmaster");

$('#search-location').on('click', function(event){
    event.preventDefault();

    var searchLocation = $('#location-input').val().trim();

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
});

getTicketMaster();

function getTicketMaster() {
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
      
          ticketmasterEl.append(`
            
              <div class="col s6 m3 l2">
                <div class="card hoverable">
                  <div class="card-image">
                    <img src=${eventImage}>
                  </div>
                  <div class="card-content">
                    <p>${eventName}</p>
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

 
        
   

 

