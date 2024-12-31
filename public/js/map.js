
  // new map create
  const map = new maplibregl.Map({
    container: 'map', // container id
    style:
        'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [77.216721, 28.644800], // starting position
    zoom: 4 // starting zoom
});
map.addControl(new maplibregl.NavigationControl());