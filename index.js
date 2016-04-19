/*jshint loopfunc: true */
(function(glob) {
    'use strict';

    /*
     * Cross browser animation functions
     * Runs at 60 FPS
     */
	var startAnimation = (function(){
            return  glob.requestAnimationFrame       ||
                    glob.webkitRequestAnimationFrame ||
                    glob.mozRequestAnimationFrame    ||
                    glob.oRequestAnimationFrame      ||
                    glob.msRequestAnimationFrame     ||
                    function(/* function */ callback, /* DOMElement */ element) {
                        return glob.setTimeout(callback, 1000 / 60);
                    };
        })(),

        stopAnimation = (function(){
            return  glob.cancelAnimationFrame       ||
                    glob.webkitcancelAnimationFrame ||
                    glob.mozcancelAnimationFrame    ||
                    glob.ocancelAnimationFrame      ||
                    glob.mscancelAnimationFrame     ||
                    function(/* animationFrameID */ id) {
                        clearTimeout(id);
                        // return glob.setTimeout(callback, 1000 / 60);
                    };
        })(),

        /*
         * Helper function to iterate over array and call a callback on every item in it
         * Params
         *  array to iterate over
         *  cb(element, index) - function with two arguments, element and it's index in array
         */
        _each = function(array, cb) {
            for(var i = 0; i < array.length; i++) {
                cb(array[i], i);
            }
        },

        /*
         * Returns random number between (min and max)
         * Defaults
         *  min - 0
         *  max - 10
         */
        _rand = function(min, max) {
            min = min || 0;
            max = max || 10;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /*
         * Params
         *  x, y - point to test
         *  cx, cy, r - circle center and radius
         *
         * Returns true || false
         */
        _pointInCircle = function(x, y, cx, cy, r) {
            var distanceSquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
            return distanceSquared <= r * r;
        },

        /*
         * Check whether cords are in circle
         *
         * x,y is the point to test
         * cx, cy is circle center, and radius is circle radius
         */
		pointInCircle = function(x, y, cx, cy, radius) {
			var distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
			return distancesquared <= radius * radius;
		},

        createCanvas = function(id) {
            var canvas = document.createElement('canvas');
            canvas.id = id;
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
            document.body.appendChild(canvas);

            return canvas;
        };

    var canvas = createCanvas('galaxy'),
        ctx = canvas.getContext('2d'),
        canvasCenterX = canvas.width / 2,
        canvasCenterY = canvas.height / 2,
        animationRunning = false,
        asteroids = [], // list of asteroids, data retrieved from public NASA API

        // Object images
        earth = new Image(),
        background = new Image(),
        asteroid = new Image(),

        // Meta data
        earthDiameter = 12756, // in km
        objectsSize = 200, // kilometers per pixel
        mPosX, mPosY, // Mouse position on screen

		// Configuration
		objectsSizeMultiplier = 5000 // times the size of objects, as they are fairly small sometimes
    ;

    // Create images
    earth.src = "/img/earth.png";
    background.src = "/img/bg.jpg";
    asteroid.src = "/img/asteroid.png";

    // Init mouse movement and save cords
    canvas.addEventListener('mousemove', function(evt) {
        mPosX = evt.clientX;
        mPosY = evt.clientY;
    }, false);

    // Init jquery sliders for configuration
	$(function() {
        $("#kilometers-per-pixel").slider({
			//orientation: "vertical",
			range: "min",
			min: 50,
			max: 1000,
            value: 200,
            slide: function( event, ui ) {
                objectsSize = ui.value;
                $("#kilometers-per-pixel-amount").val( ui.value );
            }
        });

        $("#kilometers-per-pixel-amount").val( $( "#kilometers-per-pixel" ).slider( "value" ) );
	});

	$(function() {
        $("#galaxy-object-multiplier").slider({
			//orientation: "vertical",
			range: "min",
			min: 1,
			max: 10000,
            value: 5000,
            slide: function( event, ui ) {
                objectsSizeMultiplier = ui.value;
                $("#object-multiplier-amount").val( ui.value );
            }
        });

        $("#object-multiplier-amount").val( $( "#galaxy-object-multiplier" ).slider( "value" ) );
	});

    function animate() {
        if(animationRunning) {
            animationRunning = startAnimation( animate );
            drawCanvas();
        }
    }

    function start() {
        if(!animationRunning) {
            animationRunning = true;
            animate();
        }
    }

    function stop() {
        stopAnimation(animationRunning);
        animationRunning = false;
    }

    function drawCanvas() {
        clearCanvas();
        drawBackground();

        // draw earth
        drawCircleImage(canvas.width / 2, canvas.height / 2, earthDiameter/objectsSize, earth);

        // draw all the asteroids
        for(var i = 0; i < asteroids.length; i++) {
            var asteroidSize = asteroids[i].size * objectsSizeMultiplier / objectsSize;
            drawCircleImage(
                asteroids[i].posX, // posX
                asteroids[i].posY, // posY
                asteroidSize, // size
                asteroid); // image to use

            // check whether the mouse is on the asteroid
            if(pointInCircle(mPosX, mPosY, asteroids[i].posX, asteroids[i].posY, asteroidSize)) {
                drawAsteroidInfo(asteroids[i]);
            }
        }
    }

    function drawBackground() {
        var mPosXPercent = mPosX / window.innerWidth,
            mPosYPercent = mPosY / window.innerHeight,
            bgRelativeMove = 50,
            bgPosX = mPosX >= 0.5 ? (-1 * bgRelativeMove * mPosXPercent) : bgRelativeMove * mPosXPercent,
            bgPosY = mPosY >= 0.5 ? (-1 * bgRelativeMove * mPosYPercent) : bgRelativeMove * mPosYPercent;

        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.drawImage(background, bgPosX, bgPosY, canvas.width + bgRelativeMove, canvas.height  + bgRelativeMove);
        ctx.restore();
    }

    function drawCircle(posX, posY, size, color) {
        ctx.beginPath();
        ctx.arc(posX, posY, size, 0, 2 * Math.PI, false);
        ctx.fillStyle = color || 'red';
        ctx.fill();
        ctx.closePath();
    }

    function drawAsteroidInfo(asteroid) {
        ctx.beginPath();
        ctx.fillStyle = "#424242";
        ctx.fillRect(canvas.width / 2 - 200, 10, 400, 130);
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "16px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText('Name of the object: '+asteroid.name, canvas.width / 2, 50);
        ctx.fillText('Estimated size: ~'+asteroid.size+'km', canvas.width / 2, 80);
        ctx.fillText('Is potentially hazardous asteroid? '+ (asteroid.hazardous ? 'yes' : 'no'), canvas.width / 2, 110);

        ctx.closePath();
    }

    function drawCircleImage(posX, posY, size, img) {
        if($("#mark-objects").is(":checked")) {
            ctx.strokeStyle = '#ff0000';
            ctx.stroke();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(posX, posY, size, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, posX - size, posY - size, size * 2, size * 2);

        ctx.beginPath();
        ctx.arc(posX, posY, size, 0, 2 * Math.PI * 2, true);
        ctx.clip();
        ctx.closePath();
        ctx.restore();


        if($("#mark-objects").is(":checked")) {
            ctx.stroke();
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function fetchAsteroids(startDate, endDate) {
        startDate = startDate || '2016-04-01';
        endDate = endDate || '2016-04-01';

		$.get({
            url: 'https://api.nasa.gov/neo/rest/v1/feed',
            data: {
                start_date: startDate,
                end_date: endDate,
                api_key: 'Svb1WzUbkhtNrQ5gMOlf3IJGCP6g7W9DTycsm00A'
            },
            success: function(data) {
                console.log(data);
                for(var date in data.near_earth_objects) {
                    _each(data.near_earth_objects[date], function(asteroid, i) {
                        asteroids.push({
                            name: asteroid.name,
                            size: asteroid.estimated_diameter.kilometers.estimated_diameter_max,
                            hazardous: asteroid.is_potentially_hazardous_asteroid,
                            posX: _rand(0, canvas.width),
                            posY: _rand(0, canvas.height)
                        });
                    });
                }

            }
        });
    }

    start();
	fetchAsteroids();

})(window);
