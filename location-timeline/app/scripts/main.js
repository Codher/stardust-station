const DEFAULT_LAT = 55.6761; // Copenhagen
const DEFAULT_LON = 12.5683;
const DEFAULT_DATE = "2014-02-01";
const API_KEY = "VIwJlML4oRVW9QylKOgmCH4w6D4h6e9ewhG06sil";
// const API_KEY = "DEMO_KEY";

function getImages(lat, lon, date) {
  $(".figure-container").empty();
  $.get("https://api.nasa.gov/planetary/earth/assets?",
    {
      lat: lat,
      lon: lon,
      begin: date,
      api_key: API_KEY
    }).done(function(assets) {
        if(assets.count > 0) {
          assets.results.forEach(function(asset) {
            var figure = $("<figure/>").addClass("location-figure pull-left").attr("id", asset.id);
            $(".figure-container").append(figure);
          });
          renderImages(assets.results, lat, lon);
        } else {
          $(".figure-container").html("No images found :(")
        }
      }
  );
}

function renderImages(images, lat, lon) {
  for (var i = 0; i < 10; i++) {
    if(images[i]) {
      var date = images[i].date.split("T")[0];
      $.get("https://api.nasa.gov/planetary/earth/imagery",
        {
          lat: lat,
          lon: lon,
          id: images[i].id,
          cloud_score: "True",
          date: date,
          api_key: API_KEY
        }).done(function(imagery) {
            if(imagery.cloud_score < 0.1) {
              var figure = document.getElementById(imagery.id);
              var $figure = $(figure);
              var img = $("<img/>").attr("src", imagery.url);
              var caption = $("<figcaption/>").addClass("text-center").text(imagery.date);
              $figure.append(img);
              $figure.append(caption);
            }
          }
      );
    }
  }
}

function getRandomCoordinates() {
  var lat = Math.random() * 90;
  var lon = (Math.random() * 360) - 180;
  $(".input-lat").val(lat);
  $(".input-lon").val(lon);
}

$(document).ready(function() {
  $(".submit-coordinates").click(function(e) {
    e.preventDefault();
    var lat = $(".input-lat").val() || DEFAULT_LAT;
    var lon = $(".input-lon").val() || DEFAULT_LON;
    var date = $(".input-date").val() || DEFAULT_DATE;
    getImages(lat, lon, date);
  });

  $(".randomize-coordinates").click(function(e) {
    e.preventDefault();
    getRandomCoordinates();
  });
});
