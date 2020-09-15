function formalize(_coordinates){

    return new google.maps.LatLng(_coordinates[0], _coordinates[1]);

}


function initMap() {
    new Promise( (resolve)=>{
        var options = {
            center: formalize([0, 0]),
            zoom: 15
        }

        map = new google.maps.Map(
            document.getElementById("map"),
            options
        );

        marker = new google.maps.Marker({
            position: formalize([0, 0]),
            map: map
        });
        resolve();
    }
    ).then(()=>{isMapLoaded = true;});
}

function updatePosition(_coords){
    map.panTo(formalize(_coords));
    marker.setPosition(formalize(_coords));
}

