$(document).ready(function() {
    var x_range = [];
    var distance = [];
    var cum_distance = [];
    var max_speed = [];
    var avg_speed = [];
    var elevation = [];
    var min_elevation = [];
    var max_elevation = [];
    var calories = [];
    var cum_calories = [];
    var cum_time = [];
    var cum_elevation = [];
    var cum_speed = [];
	var avg_watts = [];
	var cum_avg_watts = [];

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
						filterData(json);
                        parseStravaData(json);
                        mapData(json);
                        plotGraphType1('Distance Travelled', 'Cumulative', distance, cum_distance, 'Distance', 'Miles', 'Miles', 'plotDistance');
                        plotGraphType2('Elevation Gain', 'Min Elevation', 'Max Elevation', elevation, min_elevation, max_elevation, 'Elevation', 'Meters', 'plotElevation');
                        plotGraphType3('Max Speed', 'Avg Speed', max_speed, avg_speed, 'Speed', 'Miles Per Hour', 'plotSpeed');
                        plotGraphType1('Calories', 'Avg Watts', calories, avg_watts, 'Energy', 'Kilojoules', 'Watts', 'plotPower');
                        generateStatistics();
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
	
	//Filter JSON data so that only rides are included.
	function filterData(json) {
		for(var i = 0; i < json.length; i++)
		{
			if(json[i].type != "Ride")
			{
				json.splice(i, 1);
			}
		}
	}

    function parseStravaData(json) {
        for (var i = 0; i < json.length; i++) {
            x_range.push(json[i].start_date_local.slice(0, 10));
            distance.push(round((json[i].distance * 0.000621371), 2));
            max_speed.push(round((json[i].max_speed * 2.23694), 2));
            avg_speed.push(round((json[i].average_speed * 2.23694), 2));
            elevation.push(json[i].total_elevation_gain);
            min_elevation.push(json[i].elev_low);
            max_elevation.push(json[i].elev_high);
            calories.push(round((json[i].kilojoules), 2));
			avg_watts.push(json[i].average_watts);

            if (i == 0) {
                cum_distance.push(round((json[i].distance * 0.000621371), 2));
                cum_calories.push(round((json[i].kilojoules), 2));
                cum_time.push(json[i].elapsed_time / 60);
                cum_elevation.push(json[i].total_elevation_gain);
                cum_speed.push(round((json[i].average_speed * 2.23694), 2));
				cum_avg_watts.push(json[i].average_watts);
            } else {
                cum_distance.push(round((cum_distance[i - 1] + json[i].distance * 0.000621371), 2));
                cum_calories.push(round((cum_calories[i - 1] + json[i].kilojoules), 2));
                cum_time.push(round((cum_time[i - 1] + json[i].elapsed_time / 60), 2));
                cum_elevation.push(cum_elevation[i - 1] + json[i].total_elevation_gain);
                cum_speed.push(round((cum_speed[i - 1] + json[i].average_speed * 2.23694), 2));
				cum_avg_watts.push(cum_avg_watts[i - 1] + json[i].average_watts);
            }
        }

        x_range.reverse();
        distance.reverse();
        max_speed.reverse();
        avg_speed.reverse();
        elevation.reverse();
        min_elevation.reverse();
        max_elevation.reverse();
        calories.reverse();
		avg_watts.reverse();
    }

    function plotGraphType1(label1, label2, data1, data2, graphText, yAxisLabel1, yAxisLabel2, elementId) {

        var options = {
            type: 'bar',
            data: {
                labels: x_range,
                datasets: [{
                    label: label1,
                    data: data1,
                    borderColor: "#FF3333",
                    yAxisID: "y-axis-0",
                    borderWidth: 1,
                    fill: false
                }, {
                    type: 'line',
                    label: label2,
                    yAxisID: "y-axis-1",
                    "data": data2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: graphText
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
                                labelString: yAxisLabel1
                            },
                            position: "left",
                            id: "y-axis-0"
                        },
                        {
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: yAxisLabel2
                            },
                            position: "right",
                            id: "y-axis-1"
                        }
                    ]
                }
            }
        }

        var ctx = document.getElementById(elementId).getContext('2d');
        new Chart(ctx, options);
    }

    function plotGraphType2(label1, label2, label3, data1, data2, data3, graphText, yAxisLabel, elementId) {

        var options = {
            type: 'bar',
            data: {
                labels: x_range,
                datasets: [{
                    fill: false,
                    label: label1,
                    data: data1,
                    borderColor: "#FF3333",
                    borderWidth: 1
                }, {
                    type: 'line',
                    showLine: true,
                    pointStyle: 'triangle',
                    fill: false,
                    label: label2,
                    data: data2,
                    borderColor: "#3e95cd",
                    borderWidth: 1
                }, {
                    type: 'line',
                    showLine: true,
                    pointStyle: 'circle',
                    fill: false,
                    label: label3,
                    data: data3,
                    borderColor: "#61FF33",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: graphText
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
                            labelString: yAxisLabel
                        }
                    }]
                }
            }
        }

        var ctx = document.getElementById(elementId).getContext('2d');
        new Chart(ctx, options);
    }

    function plotGraphType3(label1, label2, data1, data2, graphText, yAxisLabel, elementId) {

        var options = {
            type: 'bar',
            data: {
                labels: x_range,
                datasets: [{
                    fill: false,
                    label: label1,
                    data: data1,
                    borderColor: "#FF3333",
                    borderWidth: 1
                }, {
                    type: 'line',
                    showLine: true,
                    pointStyle: 'circle',
                    fill: false,
                    label: label2,
                    data: data2,
                    borderColor: "#3e95cd",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: graphText
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
                            labelString: yAxisLabel
                        }
                    }]
                }
            }
        }

        var ctx = document.getElementById(elementId).getContext('2d');
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

    function mapData(json) {
        var polylinePoints = [];

        for (var i = 0; i < json.length; i++) {
            var t = json[i].map.summary_polyline
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
            opacity: 0.8
        };

        var polyline = new L.Polyline(polylinePoints, polylineOptions);

        map.addLayer(polyline);

        // zoom the map to the polyline
        map.fitBounds(polyline.getBounds());
    }
	
    function generateStatistics() {
        $("#count").html(x_range.length);
        $("#total_dist").html(round((cum_distance[cum_distance.length - 1]), 2));
        $("#avg_dist").html(round((cum_distance[cum_distance.length - 1] / cum_distance.length), 2));
        $("#total_elev").html(round(cum_elevation[cum_elevation.length - 1], 2));
        $("#avg_elevation").html(round((cum_elevation[cum_elevation.length - 1] / cum_elevation.length), 2));
        $("#total_time").html(round((cum_time[cum_time.length - 1] / 60), 2));
        $("#avg_time").html(round((cum_time[cum_time.length - 1] / cum_time.length), 2));
        $("#avg_speed").html(round((cum_speed[cum_speed.length - 1] / cum_speed.length), 2));
        $("#avg_calories").html(round((cum_calories[cum_calories.length - 2] / cum_calories.length), 2));
        $("#total_calories").html(round((cum_calories[cum_calories.length - 2]), 2));	
		$("#avg_watts").html(round(((cum_avg_watts[cum_avg_watts.length - 2]) / cum_avg_watts.length), 2));
    }
});
