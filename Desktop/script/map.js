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
            document.querySelector("#map > *"),
            options
        );

        marker = new google.maps.Marker({
            position: formalize([0, 0]),
            map: map
        });
        map.addListener("mousedown", () => {
            mapMouseDown = true;
        })
        map.addListener("mouseup", () => {
            mapMouseDown = false;
            lastMapPan =  (new Date()).getTime() - (mapUpdateDelay - mapPanDelayAfterDrag);
        })
        resolve();
    }
    ).then(()=>{
        loaded.map = true;
        isMapLoaded = true;
    });
}

function updatePosition(_coords){
    map.panTo(formalize(_coords));  
    
    marker.setPosition(formalize(_coords));
}

