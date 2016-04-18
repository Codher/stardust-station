const DEFAULT_LAT = 55.6761;
const DEFAULT_LON = 12.5683;
const API_KEY = "VIwJlML4oRVW9QylKOgmCH4w6D4h6e9ewhG06sil";

function getImages(lat, lon) {
  $(".figure-container").empty();
  $.get("https://api.nasa.gov/planetary/earth/assets?",
    {
      lat: lat,
      lon: lon,
      begin: "2014-02-01",
      api_key: API_KEY
    }).done(function(assets) {
        if(assets.count > 0) {
          renderImages(assets.results, lat, lon);
        } else {
          $(".figure-container").html("No images found :(")
        }
      }
  );
}

function renderImages(images, lat, lon) {
  for (var i = 0; i < 5; i++) {
    var date = images[i].date.split("T")[0];
    $.get("https://api.nasa.gov/planetary/earth/imagery",
      {
        lat: lat,
        lon: lon,
        id: images[i].id,
        cloud_score: true,
        date: date,
        api_key: API_KEY
      }).done(function(imagery) {
          if(imagery.cloud_score < 0.2) {
            var figure = $("<figure/>").addClass("location-figure pull-left");
            $(".figure-container").append(figure);
            var img = $("<img/>").attr("src", imagery.url);
            var caption = $("<figcaption/>").addClass("text-center").text(imagery.date);
            figure.append(img);
            figure.append(caption);
          }
        }
    );
  }
}

function randomizeImages() {
  $(".location-figure").each(function(i, figure) {
    var index = parseInt(String(Math.random())[3]);
    $(figure).css('z-index', index);
  });
}

function getRandomCoordinates() {
  var lat = Math.random() * 90;
  var lon = (Math.random() * 360) - 180;
  $(".input-lat").val(lat);
  $(".input-lon").val(lon);
}

$(document).ready(function(){
  $(".submit-coordinates").click(function(e) {
    e.preventDefault();
    var lat = $(".input-lat").val() || DEFAULT_LAT;
    var lon = $(".input-lon").val() || DEFAULT_LON;
    console.log("Default:", DEFAULT_LAT, DEFAULT_LON);
    console.log(lat, lon);
    getImages(lat, lon);
  });

  $(".randomize-coordinates").click(function(e) {
    e.preventDefault();
    getRandomCoordinates();
  });

  setInterval(randomizeImages, 1000);
});
