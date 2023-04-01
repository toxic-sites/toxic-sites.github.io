mapboxgl.accessToken =
  "pk.eyJ1IjoidGdhdWxraW4iLCJhIjoiY2xmc29ra25sMDBocTNscW05Z2RpOWRqYiJ9.dXhpkNB0-Arth9peISG0QQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/tgaulkin/clfsr1ekz002c01qveq6yiqvp",
  center: [-98, 31],
  minZoom: 5.5,
  zoom: 5.5,
  mobileview:
    '<div id="rotate-mobile"><em>For optimal viewing of this storytelling map on mobile, rotate your device to a horizontal orientation.</em><br><br><img src="https://cdn-icons-png.flaticon.com/512/41/41707.png">' // to add custom messaging in the header for mobile devices
});

//Optimize for mobile?
var mq = window.matchMedia( "(min-width: 768px)" );
if (mq.matches){
    map.setZoom(5.5); //set map zoom level for desktop size
} else {
    map.setZoom(5); //set map zoom level for mobile size
};

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//change the site to function better on mobile

// var siteWidth = 1280;
// var scale = screen.height / siteWidth;

map.on(
  "style.load",
  (initLayers = () => {
    
map.addLayer({
'id': 'toxic-sites',
'type': 'circle',
'source': 'toxic-sites',
 paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 5, 22, 20],
        "circle-color": "#3d4be6",
        "circle-opacity": 0.5,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 0.5
      },
      "source-layer": "toxic-sites",
      "minzoom": 0,
      "maxzoom": 22
});


  })
);
    //switch layers

    switchlayer = function (lname) {
      if (document.getElementById(lname).checked) {
        map.setLayoutProperty(lname, "visibility", "visible");
      } else {
        map.setLayoutProperty(lname, "visibility", "none");
      }
    };

//popup on hover

map.on("mouseenter", ["toxic-sites"], (event) => {
  map.getCanvas().style.cursor = "pointer";
  const features = map.queryRenderedFeatures(event.point, {
    layers: ["toxic-sites"]
  });
  if (!features.length) {
    return;
  }
  const feature = features[0];
  var risk = "n/a";
  if (feature.properties.Risk >= 9) { risk = "Extreme" };
  if (feature.properties.Risk >=7 && feature.properties.Risk < 9) {risk = "Severe"};
    if (feature.properties.Risk >=5 && feature.properties.Risk < 7) {risk = "Major"};
      if (feature.properties.Risk >=3 && feature.properties.Risk < 5) {risk = "Moderate"};
      if (feature.properties.Risk >=1 && feature.properties.Risk < 3) {risk = "Minor"};
  
  const popup = new mapboxgl.Popup({
    className: "site-popup",
    closeButton: false,
    closeOnClick: true,
    offset: [0, 0]
  })

    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      `<p class="average-risk"><strong>Average area flood risk:</strong> ${feature.properties.Risk} (${risk})</p>
      <p class="chemicals"><strong>Chemicals reported on site:</strong> ${feature.properties.Chemicals}</p>
      <p class="facility"><strong>Facility:</strong> ${feature.properties.FacilityName}<br />
      ${feature.properties.Street}<br />
      ${feature.properties.City}, ${feature.properties.State}</p>
      <p class="parent-company"><strong>Parent company:</strong> ${feature.properties.ParentName}</p>
      <p class="epa-id"><strong>EPA facility ID:</strong> ${feature.properties.FacilityID}</p>` 
    )
    .addTo(map);
  //close popup on mouse leave

  map.on("mouseleave", ["toxic-sites"], () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
});

//zoom to feature -- just the same as above, but with flyto
map.on("click", (event) => {
  const features = map.queryRenderedFeatures(event.point, {
    layers: ["toxic-sites"]
  });
  if (!features.length) {
    return;
  }
  const feature = features[0];
  map.flyTo({
    center: feature.geometry.coordinates,
    zoom: 12.5, //could change this to whatever looks best
    pitch: 0,
    bearing: 0
  });

  $("#site_name").text(feature.properties.Name);
  //this is just a subset of properties -- you'll have to figure out which you want to display. You could iterate over all of the properties using Object.keys(feature.properties) but it would be in alphabetical order which might not be what you want in terms of display.
  let property_list = [
    "Chemicals"
  ];
  //I'm going to keep track of what is displayed so we don't do it twice, because at the end of the above I'm going to iterate alphabetically, just as an example.
  let displayed = ["Name"];
  $("#properties").html(""); //clear any existing
  for (let i in property_list) {
    var key = property_list[i];
    if (typeof feature.properties[key] != "undefined") {
      //if property exists
      //easier than just embedding a lot of if statements..
      var val = feature.properties[key];
      var showProp = true;
      if (displayed.indexOf(key) > -1) showProp = false;
      console.log(key, showProp);
      //     if (val.trim() == "") showProp = false;
      if (val == "None") showProp = false; //just an example

      if (showProp) {
        //building these up as strings is a little crude, but easy
        var prop = "<div class='property'>";
        //just showing how one could adapt for specific situations
        switch (key) {
          case "Website":
            prop +=
              "<span class='prop_key'>Website:</span> <span class='prop_val'><a href=\"" +
              val +
              '" target="_blank">link</a></span>';
            break;
          case "Link to Publications":
            prop +=
              "<span class='prop_key'>Link to Publications:</span> <span class='prop_val'><a href=\"" +
              val +
              '" target="_blank">link</a></span>';
            break;
          default:
            prop += "<span class='prop_key'>" + key + ":</span> ";
            prop += "<span class='prop_val'>";
            prop += val;
            prop += "</span>";
            break;
        }

        prop += "</div>";
        $("#properties").append(prop);
        displayed.push(key);
      }
    }
  }
  //now just show everything else -- again, this will be kind of a mess unless you create a master property list with the order you want it in
  for (let i in Object.keys(feature.properties)) {
    var key = Object.keys(feature.properties)[i];
    var showProp = true;
    if (displayed.indexOf(key) > -1) showProp = false;
    //disabled -- if (feature.properties[key].trim() == "") showProp = false;
    if (feature.properties[key] == "None") showProp = false; //just an example

    if (showProp) {
      var prop = "<div class='property'>";
      prop += "<span class='prop_key'>" + key + ":</span> ";
      prop += "<span class='prop_val'>";
      prop += feature.properties[key];
      prop += "</span>";
      prop += "</div>";
      $("#properties").append(prop);
      displayed.push(key);
    }
  }

  console.log(feature.properties);
  $("#sidebar").css("display", "block");
  //this will never turn off as it is written, but you could decide to make it hide if you clicked away from it, or add a close button or whatever.
});

// add dropdown menu

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    //much easier if you do this kind of thing with JQuery, as shown below
    $(".dropdown-content").each(function (e) {
      $(this).removeClass("show");
    });
  }
};

//fly back to global view

document.getElementById("global").addEventListener("click", () => {
  // Fly to a random location
  map.flyTo({
    center: [-40, 33.5],
    zoom: 1.5,
    bearing: 0,
    pitch: 0
  });
});

//fly to selected country
//easier to manage the click stuff in JQuery
$(".dropdown-content a").on("click", function () {
  //I would do it this way -- set a flyto attribute in the <a> element for each place that is of the format lat,lon,zoom.
  //then we just grab the attribute, split() it into parts, and pass it to map.flyTo();
  if ($(this).attr("flyto")) {
    var flyto = $(this).attr("flyto").split(",");
    map.flyTo({
      center: [+flyto[1], +flyto[0]],
      zoom: +flyto[2],
      essential: true
    });
  }
});



if (window.Touch) {
  /* JavaScript for  touch interface */

}

//hide sidebar

function toggleSidebar(ref) {
  document.getElementById("sidebar").classList.toggle("active");
  var x = document.getElementById("site_name");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
  var x = document.getElementById("properties");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

//hide legend

function toggleLegend(ref) {
  document.getElementById("controller").classList.toggle("active");
  var x = document.getElementById("sub-control");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
