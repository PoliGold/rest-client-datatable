/**
 *
 */

var myDraw = 1;
var baseUrl= "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";
var assembledURL;
// multisort variables
var multisortClicks, multiSortURL, temporaryUrl, oldOrderDir, oldColumn, multisorting, orderColumn, orderDir;


//URL BUILDER FUNCTIONS:
function modUrlBeforeSend(obj){
	var myUrl = URLToArray(obj.url);
	var pageNumber = (myUrl.start / myUrl.length) + 1;
	assembledURL = baseUrl + "?page=" + pageNumber + "&size=" + myUrl.length;
	if(orderDir != 0){
		assembledURL += "&sorts["+orderColumn+"]="+orderDir;
	}
	// console.log("modUrlBeforeSend:"+assembledURL);
	// console.log("multiSortURL: "+ assembledURL);
	return assembledURL;
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

////SORT FUNCTIONS:
//mappatura sorting da Default DataTable a parametri Custom
function mappingSorting(){
	orderColumn = document.getElementById(orderColumn).textContent.toLowerCase();
	if (orderDir == "a"){
		orderDir = 1;
	} else if (orderDir == "d"){
		orderDir = -1;
	} else {
		orderDir = 0;
	}
}

//estrazione stringa object DataTable, converto array in stringa e cerco un carattere specifico in essa
function extractorArray(obj){
	var myString = obj.url.toString();
	// console.log(myString);
	var idxCols = myString.search("&order%5B0%5D%5Bcolumn%5D=");
	var idxDir = myString.search("&order%5B0%5D%5Bdir%5D=");
	orderColumn = myString.charAt(idxCols + 26);
	orderDir = myString.charAt(idxDir + 23);
}

//MULTISORT FUNCTIONS
function multiExtractorArray(obj){
	var myString = obj.url.toString();
	// console.log(myString);
	for(i=1; i<multisortClicks; i++){
		myString = myString.substring(myString.search("&order%5B0%5D%5Bdir%5D=") + 23);
	}
	var idxCols = myString.search("&order%5B0%5D%5Bcolumn%5D=");
	var idxDir = myString.search("&order%5B0%5D%5Bdir%5D=");
	orderColumn = myString.charAt(idxCols + 26);
	orderDir = myString.charAt(idxDir + 23);
}


function multiSort(){
	//first page load Url
	if(multisorting == null){
		temporaryUrl = assembledURL;
		multiSortURL = assembledURL;
		multisorting = "&sorts["+orderColumn+"]="+orderDir;
		oldColumn = orderColumn;
		oldOrderDir = orderDir;
		return assembledURL + "&sorts["+orderColumn+"]="+orderDir;
	}
	///multisort when user is sorting moving from one column to another
	else {
		if(orderColumn != oldColumn){
			multisorting = "&sorts["+orderColumn+"]="+orderDir;
			temporaryUrl = multiSortURL;
			multiSortURL += multisorting;
			// console.log("orderColumn != oldColumn: "+ assembledURL);
			oldColumn = orderColumn;
			oldOrderDir = orderDir;
			return multiSortURL;
		}
		///multisort when user is sorting on the same column
		else if(orderColumn == oldColumn){
			multiSortURL = temporaryUrl + "&sorts["+orderColumn+"]="+orderDir;
			multisorting = "&sorts["+orderColumn+"]="+orderDir;
			console.log("oldColumn: "+ oldColumn + "orderColumn: " + orderColumn);
			console.log("oldOrderDir: "+ oldOrderDir + "orderDir: " + orderDir);
			oldOrderDir = orderDir;
			return multiSortURL;
		}
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
				extractorArray(this);
				mappingSorting();
				this.url = modUrlBeforeSend(this);
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

// MULTISORT ACTIVATION
	$(document).keydown(function (e) {
		if (e.keyCode == 16) {
			$('#address-table th').on('click', function() {
				// assembledURL = multiSort();
				// extractorArray(this);
				// mappingSorting();
				// multisortClicks ++;
				alert(e.which + " or Shift was pressed");
			});
		}
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
	$('#address-container').on('click', '.address-add', function() {
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
});
