/**
 *
 */

var myDraw = 1;
var baseUrl= "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";

function modUrlBeforeSend(obj){
	var myUrl = URLToArray(obj.url);
	var pageNumber = (myUrl.start / myUrl.length) + 1;
	obj.url = baseUrl + "?page=" + pageNumber + "&size=" + myUrl.length;
}

function URLToArray (url) {
	var request = {};
	var pairs = url.substring(url.indexOf('?') + 1).split('&');
	for (var i = 0; i < pairs.length; i++) {
		if (!pairs[i])
		continue;
		var pair = pairs[i].split('=');
		request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return request;
}

$(document).ready(function () {
	var table = $('#address-table').DataTable({
		"serverSide": true,
		"processing": true,
		"searching": false,
		"ajax": {
			"url": baseUrl,
			"beforeSend": function () {
				modUrlBeforeSend(this);
			},
			"dataFilter": function(data) {
				var json = {};
				var originalJson = jQuery.parseJSON(data);
				json.recordsTotal = originalJson.totalElements;
                json.recordsFiltered = originalJson.totalElements;
                myDraw = myDraw + 1;
                json.draw = myDraw;
                json.data = originalJson.elements;
                return JSON.stringify(json); // return JSON string
            }
        },
        "columns": [
            {"data": "username"},
            {"data": "type"},
            {"data": "name"},
            {"data": "surname"},
            {"data": "gender"},
            {"data": "created"},
            {"data": "updated"},
            {"data": "userupdate"},
            {"data": "active"},
            {"data": "email"},
            {"data": "actions"}
            ],
            "columnDefs": [{
            "targets": -1,
            "defaultContent": "<button class=\"deleteUser\">Delete</button> <button class=\"updateUser\">Update</button>"
        }]
    });

    $('#address-table tbody').on('click', '.deleteUser', function() {
        var data = table.row($(this).parents('tr')).data();
        var getUser = baseUrl + data[0];
        $("#dialog").dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                "Confirm": function() {
                    $(this).dialog("close");
                    alert("You have confirmed!");
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });
    });


    // FORM TO JSON
    function getFormData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};

        $.map(unindexed_array, function(n, i) {
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    }
    // GET WINDOWS SIZE
    var screenWidth = screen.width;
    var screenHeigth = screen.height;

    //SUBMIT UPDATE DATA
    $('#address-table tbody').on('click', '.updateUser', function() {
        // console.log(JSON.stringify(table.row($(this).parents('tr').data())));
        var userID = table.row($(this).parents('tr')).data();
//        var address = "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";


        $("#dialog-form").dialog({
            autoOpen: true,
            modal: true,
            open: function(event){
                $('.ui-dialog-title').text("Update User with ID: " + userID.username);
                // $(this).attr("title", "Update User with ID: " + userID.username);
                $("input[type=text][name=name]").val(userID.name);
                $("input[type=text][name=surname]").val(userID.surname);
                $("input[type=text][name=email]").val(userID.email);
                $("input[type=radio][name=gender]").val(userID.gender);
                $("input[type=hidden][name=username]").val(userID.username);
                $("input[type=hidden][name=type]").val(userID.type);
            },
            width: screenWidth / 3,
            height: screenHeigth / 3,
            buttons: {
                "Update Data": function() {
                    var name = $("input[type=text][name=name]").val();
                    var surname = $("input[type=text][name=surname]").val();
                    var email = $("input[type=text][name=email]").val();
                    console.log(JSON.stringify($("input[type=radio][name=gender]:checked")));
                    var gender = $("input[type=radio][name=gender]:checked").val();
                    // $("input[type=hidden][name=username]").val((name+surname).toLowerCase());
                    var $form = $(".updateform");
                    var dataJSON = getFormData($form);
                    // console.log(dataJSON);

                    $.ajax({
                        url: baseUrl,
                        data: JSON.stringify(dataJSON),
                        method: "PUT",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
//                        headers: {
//                            'Content-Type': 'application/json',
//                            'X-Auth-Token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsbWFydGluaSIsImF1ZGllbmNlIjoid2ViIiwiY3JlYXRlZCI6MTQ5MDg4MDI2MTMwMCwiaXNzIjoiUkQiLCJzY29wZXMiOiJST0xFX1JEX1JFRkVSUklOR19QSFlTSUNJQU4sUk9MRV9SRF9TQ0hFRFVMRVIsUk9MRV9SRF9QRVJGT1JNSU5HX1RFQ0hOSUNJQU4sUk9MRV9SRF9SQURJT0xPR0lTVCxST0xFX1JEX1NVUEVSQURNSU4iLCJleHAiOjE0OTA4ODM4NjF9.71ZlD4qK2ZFPYNvgN7jJUIAs1VCYWO-u-r33qli5zeO2jH_8aL3W1SYtaEKgsVObi-vTw7WhW2wzYIl6WrqpEw'
//                        },
                        success: function() {
                            alert('Success! All Data are update!');
                            $(this).dialog("close");
                        }
                    });
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });
    });

    //ADD USER
    $('html').on('click', '.addUser', function() {
//        var address = "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";

        $("#dialog-form").dialog({
            autoOpen: true,
            modal: true,
            width: screenWidth / 3,
            height: screenHeigth / 3,
            open: function(event){
                $('.ui-dialog-title').text("Add new user");
                $("input[type=text][name=name]").val("");
                $("input[type=text][name=surname]").val("");
                $("input[type=text][name=email]").val("");
                $("input[type=radio][name=gender]").val("");
                $("input[type=hidden][name=username]").val("");
                $("input[type=hidden][name=type]").val("EXTERNAL");
            },
            buttons: {
                "Update Data": function() {
                    var name = $("input[type=text][name=name]").val();
                    var surname = $("input[type=text][name=surname]").val();
                    var email = $("input[type=text][name=email]").val();
                    var gender = $("input:radio[name=sex]:checked").val();
                    alert(gender);
                    $("input[type=hidden][name=username]").val((name + surname).toLowerCase());
                    var $form = $(".updateform");
                    var dataJSON = getFormData($form);
                    // console.log(JSON.stringify(dataJSON));

                    $.ajax({
                        url: baseUrl,
                        data: JSON.stringify(dataJSON),
                        method: "POST",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
//                        headers: {
//                            'Content-Type': 'application/json',
//                            'X-Auth-Token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsbWFydGluaSIsImF1ZGllbmNlIjoid2ViIiwiY3JlYXRlZCI6MTQ5MDg4MDI2MTMwMCwiaXNzIjoiUkQiLCJzY29wZXMiOiJST0xFX1JEX1JFRkVSUklOR19QSFlTSUNJQU4sUk9MRV9SRF9TQ0hFRFVMRVIsUk9MRV9SRF9QRVJGT1JNSU5HX1RFQ0hOSUNJQU4sUk9MRV9SRF9SQURJT0xPR0lTVCxST0xFX1JEX1NVUEVSQURNSU4iLCJleHAiOjE0OTA4ODM4NjF9.71ZlD4qK2ZFPYNvgN7jJUIAs1VCYWO-u-r33qli5zeO2jH_8aL3W1SYtaEKgsVObi-vTw7WhW2wzYIl6WrqpEw'
//                        },
                        success: function() {
                            alert('Success! User created!');
                            $(this).dialog("close");
                        }
                    });
                },
                "Cancel": function() {
                    $(this).dialog("close");
                }
            }
        });
    });
});
