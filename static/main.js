let map;
let markers = [];
let spots = [];

fetch('/static/spots.json')
  .then(res => res.json())
  .then(data => {
    spots = data;
    initMap();
  });

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.7148, lng: 139.7967 },
    zoom: 16
  });

  spots.forEach(spot => {
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map: map,
      title: spot.name
    });
    markers.push(marker);
  });
}

function requestRoute() {
  fetch('/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spots })
  })
    .then(res => res.json())
    .then(route => {
      const path = route.map(p => ({ lat: p.lat, lng: p.lng }));
      new google.maps.Polyline({
        path: path,
        map: map,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    });
}
