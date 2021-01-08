function formalize(latitude, longitude) {

    return new google.maps.LatLng(latitude, longitude);

}


function initMap() {

    var options = {
        center: formalize(0, 0),
        zoom: 2
    }

    map = new google.maps.Map(
        document.querySelector("#map > *"),
        options
    );


    map.addListener("mousedown", () => {
        mapMouseDown = true;
    })
    map.addListener("mouseup", () => {
        mapMouseDown = false;
        lastMapPan = (new Date()).getTime() - (mapUpdateDelay - mapPanDelayAfterDrag);
    })

    loaded.map = true;

}

function updatePosition(latitude, longitude) {
    map.panTo(formalize(latitude, longitude));

    marker.setPosition(formalize(latitude, longitude));
}

