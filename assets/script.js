var savedLocations = [];

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
