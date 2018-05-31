/**
 *
 */

var myDraw = 1;
var baseUrl= "http://localhost:8080/rmdw-1.0.0-beta/extrarest/v1.0.0/rmdw/assets/UserEntity";
var sorts;

function modUrlBeforeSend(obj){
	var myUrl = URLToArray(obj.url);
	var pageNumber = (myUrl.start / myUrl.length) + 1;
	var assembledURL = baseUrl + "?page=" + pageNumber + "&size=" + myUrl.length;
	if(sorts != null){
		assembledURL += "&"+sorts;
	}
	
	obj.url = assembledURL;
	console.log(obj.url);
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


//GET ELEMENTS INDEXES
//function getIndex(element){ 
//	var index = element.filter(
//	function(index){
//			for(var i=0; i<element.length; i++){
//				console.log(index);
//			}
//		}
//	)
//}


// MODFIFY ORDER PARAMETER
function modOrderParam(table){
	if(table.ajax.params().order[0].dir == "asc"){
		table.ajax.params().order = ["sorts[username]=1"];
	} else {
		table.ajax.params().order = ["sorts[username]=-1"];
	}
	sorts = table.ajax.params().order;
	console.log(table.ajax.params().order);	
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
            "columnDefs": [
        	{
        		"targets": -1,
        		"defaultContent": "<div id=\"actions\"><button class=\"deleteUser\" title=\"Delete User\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></button> <button class=\"updateUser\" title=\"Update User\"><span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span></button></div>"
        	},
            {
        		"targets": [1,5,6,7,8], // questo array contiene la posizione della colonna che non voglia vedere in tabella
        		"visible": false
            }
        	]
    });

	
	$('#address-container').on('click','.DataTables_sort_icon', function() {
		modOrderParam(table);
	});
	
	
//	table.on('xhr', function(){
//		console.log(table.ajax.params().order[0].dir);
//		
//		
//	})

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
    $('#address-container').on('click', '.updateUser', function() {
		var userID = table.row($(this).parents('tr')).data();

        $('#address-form').load('address-form.html').dialog({
            autoOpen: true,
            modal: true,
            open: function(event){

				// Visualize fields inside modal dialog
                $('.ui-dialog-title').text("Update User with ID: " + userID.username);

				// (for following values display NOT WORKING at the moment)
                $("input[type=text][name=name]").val(userID.name);
                $("input[type=text][name=surname]").val(userID.surname);
                $("input[type=text][name=email]").val(userID.email);
                $("input[type=radio][name=gender]").val(userID.gender);
                $("input[type=hidden][name=username]").val(userID.username);
                $("input[type=hidden][name=type]").val(userID.type);
				// (above values display NOT WORKING at the moment)
            },
            width: screenWidth / 1.20,
            height: screenHeigth / 1.20,
            buttons: {
                "Update Data": function() {

					// assign values to the var and compose the json
                    var name = $("input[type=text][name=name]").val();
                    var surname = $("input[type=text][name=surname]").val();
                    var email = $("input[type=text][name=email]").val();
                    console.log(JSON.stringify($("input[type=radio][name=gender]:checked")));
                    var gender = $("input[type=radio][name=gender]:checked").val();
					var username =  $("input[type=hidden][name=username]").val(userID.username);
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
	$('#address-container').on('click', '.address-add', function() {
	   // var userID = table.row($(this).parents('tr')).data();

		$('#address-form').load('address-form.html').dialog({
			autoOpen: true,
			modal: true,
			open: function(event){

				// reset fields
                 $('.ui-dialog-title').text("Add new user");
                 $("input[type=text][name=name]").val("");
                 $("input[type=text][name=surname]").val("");
                 $("input[type=text][name=email]").val("");
                 $("input[type=radio][name=gender]").val("");
				 $("input[type=hidden][name=username]").val("");
                 $("input[type=hidden][name=type]").val("EXTERNAL");
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
					var username = $("input[type=hidden][name=username]").val(null);
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
});
