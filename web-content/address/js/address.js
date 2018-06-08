/**
 *
 */

var myDraw = 1;
var baseUrl= "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";
var assembledURL;

// multisort variables
var multiSortURL, temporaryUrl, oldOrderDir, oldColumn, multiSorting, orderColumn, orderDir, nameColumn;

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

// GET, FORM TO JSON for ADD-USER
function getFormDataAdd(form) {
	var unindexed_array = form.serializeArray();
	var indexed_array = {};
	unindexed_array[4] = {"name":"username","value":null};
	$.map(unindexed_array, function(n, i) {
		indexed_array[n['name']] = n['value'];
	});
	return indexed_array;
}

// GET, FORM TO JSON for UPDATE-USER
function getFormDataUpdate(form) {
	var unindexed_array = form.serializeArray();
	var indexed_array = {};
	$.map(unindexed_array, function(n, i) {
		indexed_array[n['name']] = n['value'];
	});
	return indexed_array;
}

///////////// SORT and MULTISORT FUNCTIONS:

// sortSwitch function ispect the datatables ajax request and call the the function for
// the multisort or sort depending on the kind of content found in the ajax request.
function sortSwitch(obj){
	var myString = obj.url.toString();
	myString = myString.substring(myString.search("&order%5B") + 24);
	myString = myString.substring(myString.search("&order%5B") + 21);
	if(myString.includes("&order%5B")){
		multiSortRequestExtractor(obj);
		mappingSorting();
		return multiSort(obj);
	} else {
		sortRequestExtractor(obj);
		mappingSorting();
		return modUrlBeforeSend(obj);
	}
}

//estrazione stringa object DataTable, converto array in stringa e cerco un carattere specifico in essa
function sortRequestExtractor(obj){
	var myString = obj.url.toString();
	var idxCols = myString.search("&order%5B0%5D%5Bcolumn%5D=");
	var idxDir = myString.search("&order%5B0%5D%5Bdir%5D=");
	orderColumn = myString.charAt(idxCols + 26);
	orderDir = myString.charAt(idxDir + 23);
}

//MULTISORT FUNCTIONS
function multiSortRequestExtractor(obj){
	var myString = obj.url.toString();
	var n = (myString.match(/&order%5B/g).length-2)/2;
	for(i=0; i<n; i++){
		myString = myString.substring(myString.search("&order%5B") + 24);
		myString = myString.substring(myString.search("&order%5B") + 21);
	}
	var idxCols = myString.search("&order%5B");
	orderColumn = myString.charAt(idxCols + 26);
	myString = myString.substring(idxCols + 24);
	var idxDir = myString.search("&order%5B");
	orderDir = myString.charAt(idxDir + 23);
}

//mappatura sorting da Default DataTable a parametri Custom
function mappingSorting(){
	nameColumn = document.getElementById(orderColumn).textContent.toLowerCase();
	if (orderDir == "a"){
		orderDir = 1;
	} else if (orderDir == "d"){
		orderDir = -1;
	} else {
		orderDir = 0;
	}
}

//URL BUILDER in USE for SORT
function modUrlBeforeSend(obj){
	var myUrl = URLToArray(obj.url);
	var pageNumber = (myUrl.start / myUrl.length) + 1;
	assembledURL = baseUrl + "?page=" + pageNumber + "&size=" + myUrl.length;
	if(orderDir != 0){
		assembledURL += "&sorts["+nameColumn+"]="+orderDir;
		temporaryUrl = assembledURL;
		multiSortURL = assembledURL;
		oldColumn = orderColumn;
		oldOrderDir = orderDir;
	}
	return assembledURL;
}

//MULTISORT FUNCTION
function multiSort(obj){
	if(orderColumn != oldColumn){
		multiSorting = "&sorts["+nameColumn+"]="+orderDir;
		temporaryUrl = multiSortURL;
		multiSortURL += multiSorting;
		oldColumn = orderColumn;
		oldOrderDir = orderDir;
		return multiSortURL;
	}
		///multisort when user is sorting on the same column
	else if(orderColumn == oldColumn){
		multiSortURL = temporaryUrl + "&sorts["+nameColumn+"]="+orderDir;
		multiSorting = "&sorts["+nameColumn+"]="+orderDir;
		oldOrderDir = orderDir;
		return multiSortURL;
	}
}

//PAGE LOAD WITH SOCIUMENT READY FUNCTION
$(document).ready(function () {
	var table = $('#address-table').DataTable({
		"serverSide": true,
		"processing": true,
		"searching": true,
		"ordering": true,
		"ajax": {
			"url": baseUrl,
			"beforeSend": function () {
				// console.log(this);
				this.url = sortSwitch(this);
				// console.log(this.url);
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
            "columnDefs": [
        	{
        		"targets": -1,
        		"defaultContent": "<div id=\"actions\"><button class=\"deleteUser\" title=\"Delete User\"><span class=\"glyphicon glyphicon-remove bordeaux\" aria-hidden=\"true\"></span></button> <button class=\"updateUser\" title=\"Update User\"><span class=\"glyphicon glyphicon-pencil bordeaux\" aria-hidden=\"true\"></span></button></div>"
        	},
            {
        		"targets": [1,5,6,7,8], // questo array contiene la posizione della colonna che non voglia vedere in tabella
        		"visible": false
            }
        	]
    });

	// DELETE FORM
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

    // GET WINDOWS SIZE
    var screenWidth = screen.width;
    var screenHeigth = screen.height;

    //SUBMIT UPDATE DATA
	$('#address-form').load('address-form.html');
    $('#address-container').on('click', '.updateUser', function() {
		var user = table.row($(this).parents('tr')).data();

		$("#dialog-form").dialog({
            autoOpen: true,
            modal: true,
            open: function(event){
				// Visualize fields inside modal dialog
                $('.ui-dialog-title').text("Update User with ID: " + user.username);
				// (for following values display NOT WORKING at the moment)
                $("input[type=text][name=name]").val(user.name);
                $("input[type=text][name=surname]").val(user.surname);
                $("input[type=text][name=email]").val(user.email);
                $("input[name=gender][value='"+user.gender+"']").prop('checked', true);
                $("input[type=text][name=username]").val(user.username);
                $("input[type=hidden][name=type]").val(user.type);

				// (above values display NOT WORKING at the moment)
            },
            width: screenWidth / 1.20,
            height: screenHeigth / 1.50,
            buttons: {
                "Update Data": function() {

					// assign values to the var and compose the json
                    var name = $("input[type=text][name=name]").val();
                    var surname = $("input[type=text][name=surname]").val();
                    var email = $("input[type=text][name=email]").val();
                    console.log(JSON.stringify($("input[type=radio][name=gender]:checked")));
                    var gender = $("input[type=radio][name=gender]:checked").val();
					var username =  $("input[type=text][name=username]").val(user.username);
                    var form = $(".address-update");
                    var dataJSON = getFormDataUpdate(form);

                    $.ajax({
                        url: baseUrl,
                        data: JSON.stringify(dataJSON),
                        method: "PUT",
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
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

	//NEW ADD USER
	$('#address-form').load('address-form.html');
	$('#address-container').on('click', '.user-add', function() {
	   // var userID = table.row($(this).parents('tr')).data();

		$('#dialog-form').dialog({
			autoOpen: true,
			modal: true,
			open: function(event){

				// reset fields
                 $('.ui-dialog-title').text("Add new user");
                 $("input[type=text][name=name]").val("");
                 $("input[type=text][name=surname]").val("");
                 $("input[type=text][name=email]").val("");
                 $("input[type=radio][name=gender]").val("");
				 $("input[type=text][name=username]").val("");
                 $("input[type=text][name=type]").val("EXTERNAL");
			},
			width: screenWidth / 1.80,
			height: screenHeigth / 1.80,
			buttons: {
				"Add User": function() {

				   // assign values to the var and compose the json
					var name = $("input[type=text][name=name]").val();
					var surname = $("input[type=text][name=surname]").val();
					var email = $("input[type=text][name=email]").val();
					// console.log(JSON.stringify($("input[type=radio][name=gender]:checked")));
					var gender = $("input[type=radio][name=gender]:checked").val();
					console.log(gender);
					var username = $("input[type=text][name=username]").val(null);
					var form = $(".address-update");
					var dataJSON = getFormDataAdd(form);
					// console.log(JSON.stringify(dataJSON));

					$.ajax({
						url: baseUrl,
						data: JSON.stringify(dataJSON),
						method: "POST",
						dataType: "json",
						contentType: "application/json; charset=utf-8",
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


	// SEARCH FUNCTION

	$('#user-search-form').load('search-form.html');
	$('#address-container').on('click', '.user-search', function() {
	   // var userID = table.row($(this).parents('tr')).data();

		$('#search-form').dialog({
			autoOpen: true,
			modal: true,
			open: function(event){

				// reset fields
				 // $('.ui-dialog-title').text("Add new user");
				 // $("input[type=text][name=name]").val("");
				 // $("input[type=text][name=surname]").val("");
				 // $("input[type=text][name=email]").val("");
				 // $("input[type=radio][name=gender]").val("");
				 // $("input[type=text][name=username]").val("");
				 // $("input[type=text][name=type]").val("EXTERNAL");
			},
			width: screenWidth / 1.80,
			height: screenHeigth / 1.80,
			buttons: {
				"Add User": function() {

				   // assign values to the var and compose the json
					// var name = $("input[type=text][name=name]").val();
					// var surname = $("input[type=text][name=surname]").val();
					// var email = $("input[type=text][name=email]").val();
					// console.log(JSON.stringify($("input[type=radio][name=gender]:checked")));
					// var gender = $("input[type=radio][name=gender]:checked").val();
					// var username = $("input[type=text][name=username]").val(null);
					// var form = $(".address-update");
					// var dataJSON = getFormDataAdd(form);
					// console.log(JSON.stringify(dataJSON));

					$.ajax({
						url: baseUrl,
						data: JSON.stringify(dataJSON),
						method: "POST",
						dataType: "json",
						contentType: "application/json; charset=utf-8",
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
	$("#address-table_filter").children().each(function(){
		$(this).remove();
	});

	$("#address-table_filter").append("<button class=\"user-add\">Add new User</button>");
	$("#address-table_filter").append("<button class=\"user-search\">Search User</button>");

});
