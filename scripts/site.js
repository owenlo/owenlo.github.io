$(document).ready(function() {	
	
        var x_range = [];

        dialog = $("#dialog-form").dialog({
            closeOnEscape: false,
			resizable: false,
            open: function(event, ui) {
                $(".ui-dialog-titlebar-close").hide();
            },
            autoOpen: true,
            height: 200,
            width: 230,
            modal: true,
            buttons: {
                "Submit": function() {
                    var token = GetToken();

                    $.ajax({
                        url: "https://www.strava.com/api/v3/athlete/activities?access_token=" + token + "&per_page=200",
                        dataType: 'jsonp',
                        success: function(json) {
							mapData(json);
                            createXAxis(json);
                            plotDistance(json);
                            plotSpeed(json);
                            plotElevation(json);
                            plotCalories(json);
                            $("#plots").show();
                        }
                    });

                    $(this).dialog("close");
                }
            },
            close: function() {
                form[0].reset();
                $(this).dialog("close");
            }
        });

        form = dialog.find("form").on("submit", function(event) {
            event.preventDefault();
        });


        function createXAxis(json) {
            for (var i = 0; i < json.length; i++) {
                x_range.push(json[i].start_date_local.slice(0, 10));
            }
            x_range.reverse();
        }

        function plotDistance(json) {

            var data = [];
            var cum = [];

            for (var i = 0; i < json.length; i++) {
                data.push(round((json[i].distance * 0.000621371), 2));
            }

            for (var i = 0; i < json.length; i++) {
                if (i == 0) {
                    cum.push(round((json[i].distance * 0.000621371), 2));
                } else {
                    cum.push(round((cum[i - 1] + json[i].distance * 0.000621371), 2));
                }
            }

            data.reverse();

            var options = {
                type: 'bar',
                data: {
                    labels: x_range,
                    datasets: [{
                        label: 'Distance Travelled',
                        data: data,
                        borderColor: "#FF3333",
                        yAxisID: "y-axis-0",
                        borderWidth: 1,
                        fill: false
                    }, {
						type:'line',
                        label: "Cumulative",
                        yAxisID: "y-axis-1",
                        "data": cum,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Distance'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Date'
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }],
                        yAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Miles'
                                },
                                position: "left",
                                id: "y-axis-0"
                            },
                            {
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Miles'
                                },
                                position: "right",
                                id: "y-axis-1"
                            }
                        ]
                    }
                }
            }

            var ctx = document.getElementById('plotDistance').getContext('2d');
            new Chart(ctx, options);
        }

        function plotSpeed(json) {

            var max_speed = [];
            var avg_speed = [];

            for (var i = 0; i < json.length; i++) {
                max_speed.push(round((json[i].max_speed * 2.23694), 2));
                avg_speed.push(round((json[i].average_speed * 2.23694), 2));
            }

            max_speed.reverse();
            avg_speed.reverse();

            var options = {
                type: 'bar',
                data: {
                    labels: x_range,
                    datasets: [{
                        fill: false,
                        label: 'Max Speed',
                        data: max_speed,
                        borderColor: "#FF3333",
                        borderWidth: 1
                    }, {
						type: 'line',
						showLine: false,
						pointStyle:'circle',
                        fill: false,
                        label: 'Avg Speed',
                        data: avg_speed,
                        borderColor: "#3e95cd",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Speed'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Date'
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'MPH'
                            }
                        }]
                    }
                }
            }

            var ctx = document.getElementById('plotSpeed').getContext('2d');
            new Chart(ctx, options);
        }

        function plotElevation(json) {

            var elevation = [];
            var min_elevation = [];
            var max_elevation = [];

            for (var i = 0; i < json.length; i++) {
                elevation.push(round((json[i].total_elevation_gain * 3.28084), 2));
                min_elevation.push(round((json[i].elev_low * 3.28084), 2));
                max_elevation.push(round((json[i].elev_high * 3.28084), 2));
            }

            elevation.reverse();
            min_elevation.reverse();
            max_elevation.reverse();

            var options = {
                type: 'bar',
                data: {
                    labels: x_range,
                    datasets: [{
                        fill: false,
                        label: 'Elevation Gain',
                        data: elevation,
                        borderColor: "#FF3333",
                        borderWidth: 1
                    }, {
						type:'line',
						showLine: false,
						pointStyle:'triangle',
                        fill: false,
                        label: 'Min Elevation',
                        data: min_elevation,
                        borderColor: "#3e95cd",
                        borderWidth: 1
                    }, {
						type:'line',
						showLine: false,
						pointStyle:'circle',
                        fill: false,
                        label: 'Max Elevation',
                        data: max_elevation,
                        borderColor: "#61FF33",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Elevation'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Date'
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Feet'
                            }
                        }]
                    }
                }
            }

            var ctx = document.getElementById('plotElevation').getContext('2d');
            new Chart(ctx, options);
        }

        function plotCalories(json) {

            var data = [];
            var cum = [];

            for (var i = 0; i < json.length; i++) {
                data.push(round((json[i].kilojoules), 2));
            }

            for (var i = 0; i < json.length; i++) {
                if (i == 0) {
                    cum.push(round((json[i].kilojoules), 2));
                } else {
                    cum.push(round((cum[i - 1] + json[i].kilojoules), 2));
                }
            }

            data.reverse();

            var options = {
                type: 'bar',
                data: {
                    labels: x_range,
                    datasets: [{
                        fill: false,
                        label: 'Calories Burnt',
                        data: data,
                        borderColor: "#FF3333",
                        yAxisID: "y-axis-0",
                        borderWidth: 1
                    }, {
						type: 'line',		
                        fill: false,
                        label: "Cumulative",
                        yAxisID: "y-axis-1",
                        "data": cum,
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Calories'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Date'
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }],
                        yAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Kilojoules'
                                },
                                position: "left",
                                id: "y-axis-0"
                            },
                            {
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Kilojoules'
                                },
                                position: "right",
                                id: "y-axis-1"
                            }
                        ]
                    }
                }
            }

            var ctx = document.getElementById('plotCalories').getContext('2d');
            new Chart(ctx, options);
        }

        //Source: http://www.jacklmoore.com/notes/rounding-in-javascript/
        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }

        function GetToken() {
            var key = aesjs.utils.utf8.toBytes($("#password").val());

            var encryptedBytes = aesjs.utils.hex.toBytes("d49e3291adcaebd0a3c4cb83a68c971bb15831248165916a5f7684d448fd0ee01962f4748fe36e70b1");
            var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(21));
            var decryptedBytes = aesCtr.decrypt(encryptedBytes);

            return aesjs.utils.utf8.fromBytes(decryptedBytes);
        }
		
		function mapData(json)
		{
		var polylinePoints = [];
		
		for(var i = 0; i<json.length;i++)
		{
			var t =json[i].map.summary_polyline
			var polyline = L.Polyline.fromEncoded(t);
			var lat = polyline.getLatLngs();
			polylinePoints.push(lat);
		}
		
		 var map = new L.Map('map');                       
                
      	 L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18
         }).addTo(map);
         map.attributionControl.setPrefix('');		 
		    
         var polylineOptions = {
               color: 'blue',
               weight: 1,
               opacity: 0.9
             };

         var polyline = new L.Polyline(polylinePoints, polylineOptions);

         map.addLayer(polyline);                        

         // zoom the map to the polyline
         map.fitBounds(polyline.getBounds());		 
		}
		
    });