/**
 *
 */

var dataSet = [];
$(document).ready(function() {
	var restAPI = "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity?criteria=userupdate:SYSTEM&page=1&size=15&sort=DESC&field=username";

	$.getJSON(restAPI).done(function(data) {
		$.each(data.elements, function(i, element) {
			var userDetails = [];
			userDetails.push(element.username);
			userDetails.push(element.type);
			userDetails.push(element.name);
			userDetails.push(element.surname);
			userDetails.push(element.email);
			userDetails.push(element.gender);
			dataSet.push(userDetails);
		});

		var table = $('#tabledata').DataTable({
			"bPaginate": false,
			"data": dataSet,
			"columnDefs": [{
				"targets": -1,
				"data": null,
				"defaultContent": "<button class=\"deleteUser\">Delete</button> <button class=\"updateUser\">Update</button>"
			}]
		});

		$('#tabledata tbody').on('click', '.deleteUser', function () {
			var data = table.row($(this).parents('tr')).data();
			var getUser = "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity" + data[0];
			$("#dialog").dialog({
				autoOpen: true,
				modal: true,
				buttons : {
					"Confirm" : function() {
						$(this).dialog("close");
						alert("You have confirmed!");
					},
					"Cancel" : function() {
						$(this).dialog("close");
					}
				}
			});
		});


		// FORM TO JSON
			function getFormData($form){
		    var unindexed_array = $form.serializeArray();
		    var indexed_array = {};

		    $.map(unindexed_array, function(n, i){
		        indexed_array[n['name']] = n['value'];
		    });

    return indexed_array;
}
		// GET WINDOWS SIZE
		var screenWidth = screen.width;
		var screenHeigth = screen.height;

		//SUBMIT UPDATE DATA
		$('#tabledata tbody').on('click', '.updateUser', function () {
			var userID = table.row($(this).parents('tr')).data();
			var address = "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";
			$('#dialog-form').each(function() {
    			$(this).attr("title", $(this).attr("title") + userID[0]);
			});

			$("#dialog-form").dialog({
			    autoOpen: true,
			    modal: true,
			    width:  screenWidth/3,
			    height: screenHeigth/3,
			    buttons : {
					"Update Data" : function() {
						var name=$("input[type=text][name=name]").val();
						var surname=$("input[type=text][name=surname]").val();
						var email=$("input[type=text][name=email]").val();
						var gender=$("input[type=radio][name=gender]:checked").val();
						var created = $("input[type=text][name=created]").val(1495016019419);
						var updated = $("input[type=text][name=updated]").val(1495016019000);
						var active = $("input[type=text][name=active]").val(true);
						//$("input[type=hidden][name=username]").val((name+surname).toLowerCase());
						var $form = $(".updateform");
					    var dataJSON = getFormData($form);
					    console.log(dataJSON);

						$.ajax({
	         				url: "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity",
	        				data: JSON.stringify(dataJSON),
	         				method: "PUT",
	         				dataType: "json",
	         				contentType: "application/json; charset=utf-8",
	         				headers: {
        						'Content-Type': 'application/json',
        						'X-Auth-Token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsbWFydGluaSIsImF1ZGllbmNlIjoid2ViIiwiY3JlYXRlZCI6MTQ5MDg4MDI2MTMwMCwiaXNzIjoiUkQiLCJzY29wZXMiOiJST0xFX1JEX1JFRkVSUklOR19QSFlTSUNJQU4sUk9MRV9SRF9TQ0hFRFVMRVIsUk9MRV9SRF9QRVJGT1JNSU5HX1RFQ0hOSUNJQU4sUk9MRV9SRF9SQURJT0xPR0lTVCxST0xFX1JEX1NVUEVSQURNSU4iLCJleHAiOjE0OTA4ODM4NjF9.71ZlD4qK2ZFPYNvgN7jJUIAs1VCYWO-u-r33qli5zeO2jH_8aL3W1SYtaEKgsVObi-vTw7WhW2wzYIl6WrqpEw'
    						},
	         				success: function() {
	         					alert('Success! All Data are update!');
	         					$(this).dialog("close");
	         				}
	      				});
					},
					"Cancel" : function() {
						$(this).dialog("close");
					}
				}
			  });
		});



		//ADD USER
			$('html').on('click', '.addUser', function () {
			var address = "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";
			$('#dialog-form').each(function() {
    			$(this).attr("title", $(this).attr("title"));
			});

			$("#dialog-form").dialog({
			    autoOpen: true,
			    modal: true,
			    width:  screenWidth/3,
			    height: screenHeigth/3,
			    buttons : {
					"Update Data" : function() {
						var name=$("input[type=text][name=name]").val();
						var surname=$("input[type=text][name=surname]").val();
						var email=$("input[type=text][name=email]").val();
						var gender=$("input[type=radio][name=gender]:checked").val();
						$("input[type=hidden][name=username]").val((name+surname).toLowerCase());
						var $form = $(".updateform");
					    var dataJSON = getFormData($form);
					    console.log(dataJSON);

						$.ajax({
	         				url: "http://10.3.56.46:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity",
	        				data: JSON.stringify(dataJSON),
	         				method: "POST",
	         				dataType: "json",
	         				contentType: "application/json; charset=utf-8",
	         				headers: {
        						'Content-Type': 'application/json',
        						'X-Auth-Token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsbWFydGluaSIsImF1ZGllbmNlIjoid2ViIiwiY3JlYXRlZCI6MTQ5MDg4MDI2MTMwMCwiaXNzIjoiUkQiLCJzY29wZXMiOiJST0xFX1JEX1JFRkVSUklOR19QSFlTSUNJQU4sUk9MRV9SRF9TQ0hFRFVMRVIsUk9MRV9SRF9QRVJGT1JNSU5HX1RFQ0hOSUNJQU4sUk9MRV9SRF9SQURJT0xPR0lTVCxST0xFX1JEX1NVUEVSQURNSU4iLCJleHAiOjE0OTA4ODM4NjF9.71ZlD4qK2ZFPYNvgN7jJUIAs1VCYWO-u-r33qli5zeO2jH_8aL3W1SYtaEKgsVObi-vTw7WhW2wzYIl6WrqpEw'
    						},
	         				success: function() {
	         					alert('Success! User created!');
	         					$(this).dialog("close");
	         				}
	      				});
					},
					"Cancel" : function() {
						$(this).dialog("close");
					}
				}
			  });
		});

	});
});
