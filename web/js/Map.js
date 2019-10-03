
var viewMap = {
	init: function(){
		this.mymap = L.map("map-canvas",{ zoomControl: false }).setView([53.505, 46.09], 5);
		new L.Control.Zoom({ position: 'bottomleft' }).addTo(viewMap.mymap);
		new L.control.scale({imperial: false}).addTo(viewMap.mymap);
		L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			maxZoom: 18,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
		}).addTo(viewMap.mymap);
		

        this.mymap.addLayer(modelMap.drawnItems);
		L.control.mousePosition().addTo(viewMap.mymap);
        

        this.mymap.on('draw:created', function (e) {
		    modelMap.drawnItems.clearLayers();
			clearEverythingFromMap();
            var type = e.layerType,
                layer = e.layer;
			if (modelMap.drawtool === 'Point') {
				var coords = layer.toGeoJSON().geometry.coordinates;
				modelMap.boxCoords = controlMap.boxFromPoint(coords)
			} else if (modelMap.drawtool === 'Box') {
				modelMap.boxCoords = layer.toGeoJSON().geometry.coordinates[0];
			} 
			$('#loader').modal('show');
			controlMap.createURLtoCOF(modelMap.boxCoords);
            modelMap.drawnItems.addLayer(layer);
        });	
		

	}
}


var modelMap = {
	drawnItems: new L.FeatureGroup(),
	boxCoords: null,
	MR: [],
	HR: [],
	Temp_Coords: [],
	polygon: null,
	HR_object: [],
	HR_object_id: [],
	MR_object: [],
	MR_object_id: [],
	HR_img_obj:[],
	HR_img_obj_id:[],
	MR_img_obj:[],
	MR_img_obj_id:[],
	drawtool:null
}

controlMap = {
	createURLtoCOF: function(coords){
		var date_from = $('#date-from').find('input').val(); 
		var date_to =  $('#date-to').find('input').val();
		date = "Date: " + date_from + "-" + date_to;
		var west = coords[2][0];
		var east = coords[2][1];
		var north = coords[0][0];
		var south = coords[0][1];
		var str = "CatalogService?DateFr=" 
         + date_from + "&DateTo=" + date_to 
         + "&West=" + west + "&East=" + east 
         + "&South=" + south + "&North=" + north;
		 
		 



		$.getJSON(str, function(result){
        try {
		    //var result = JSON.parse(result);	
			$('#loader').modal('hide');
			$('#total-results').children('strong').text(
            "Estimated total number of results - " + result.data.length + " \n" 
            + "from " + date_from + " to  " + date_to);
			for (let i=0; i<result.data.length; i++) {	 			
				let footprint = new /*global Data*/ Data(result.data[i]);
				if(footprint.sat == "KazEOSat-1"){
					modelMap.HR.push(footprint)
				}else{
					modelMap.MR.push(footprint);
				}
			}
			
			addResultsinTab();

			$('#stripsView').collapse("show");
        } catch (e) {
          showError(e);
        }
		});


	},
	drawScene: function(numericCoords,id,satellite){
		var coords = [];

		for (var j =0; j<numericCoords.length/2;j++){
			coords.push([numericCoords[2*j],numericCoords[2*j+1]]);	
		}
		polygon_options = {
			stroke: true,
			color: '#4185f4',
			weight: 3,
			opacity: 0.6,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0,
			clickable: true
			
		}
		modelMap.polygon = L.polygon(coords,polygon_options);
		if(satellite =='KazEOSat-1'){
			modelMap.HR_object_id.push(id); 
			modelMap.HR_object.push(modelMap.polygon);
		}else{
			modelMap.MR_object_id.push(id); 
			modelMap.MR_object.push(modelMap.polygon);
		}			
		modelMap.polygon.addTo(viewMap.mymap);
		viewMap.mymap.setView([Number(coords[0][0]),Number(coords[0][1])+7.5], 6);	
	},
	removeScene: function(id,satellite){

		if(satellite =='KazEOSat-1'){
			var id_index = modelMap.HR_object_id.indexOf(id);
			var polygon = modelMap.HR_object[id_index];
			modelMap.HR_object_id.splice(id_index,1);
			modelMap.HR_object.splice(id_index,1);
		}else{
			var id_index = modelMap.MR_object_id.indexOf(id);
			var polygon = modelMap.MR_object[id_index];
			modelMap.MR_object_id.splice(id_index,1);
			modelMap.MR_object.splice(id_index,1);
		}
		viewMap.mymap.removeLayer(polygon);
	},
	addQuicklookOnFootprint: function(src,id,coords,code){

		var coords = coords.split(",");
		if(code.includes("DS_DZHR1") == true){
			var topleft    = L.latLng(coords[2],coords[3]),
				topright   = L.latLng(coords[4],coords[5]),
				bottomleft = L.latLng(coords[0],coords[1]);

		}else{
			var topleft    = L.latLng(coords[2],coords[3]),
				topright   = L.latLng(coords[4],coords[5]),
				bottomleft = L.latLng(coords[0],coords[1]);
		}
		var overlay = L.imageOverlay.rotated(src, topleft, topright, bottomleft, {
			opacity: 1,
			interactive: false
		}).addTo(viewMap.mymap);
		
		if(code.includes("DS_DZHR1") == true){
			modelMap.HR_img_obj.push(overlay);
			modelMap.HR_img_obj_id.push(id);
		}else{
			modelMap.MR_img_obj.push(overlay);
			modelMap.MR_img_obj_id.push(id);
		}

	},
	removeQuicklookFromFootprint: function(id,code){

		if(code.includes("DS_DZHR1") == true){ 
			var id_index = modelMap.HR_img_obj_id.indexOf(id);
			var overlay = modelMap.HR_img_obj[id_index];

			modelMap.HR_img_obj_id.splice(id_index,1);
			modelMap.HR_img_obj.splice(id_index,1);
		    viewMap.mymap.removeLayer(overlay);
		 }else{
			var id_index = modelMap.MR_img_obj_id.indexOf(id);
			var overlay = modelMap.MR_img_obj[id_index];
			modelMap.MR_img_obj_id.splice(id_index,1);
			modelMap.MR_img_obj.splice(id_index,1);
			viewMap.mymap.removeLayer(overlay);
		} 

	},
	boxFromPoint(point){
		var coords = {
			x: point[0],
			y: point[1]
		} 
		var top_left = [coords.x + 0.091,coords.y - 0.091];
		var top_right = [coords.x + 0.091,coords.y + 0.091];
		
		var bottom_left = [coords.x - 0.091,coords.y - 0.091];
		var bottom_right = [coords.x - 0.091,coords.y + 0.091];
		return [bottom_left,top_left,top_right,bottom_right,bottom_left];
	}
}


function Data(data) {
  this.id = data.Code;
  this.qlk_src = data.Quicklook;
  this.meta = data.Metadata_Date;
  this.sat = data.Satellite;
  this.roll = data.Roll;
  this.pitch = data.Pitch;
  this.coord = data.Coordinates; 
  this.coord = data.Coordinates.split(" ");
  Data.prototype.get = function() {
    return this;
  };
  
  Data.prototype.print = function() {
    console.log(this.id);
  }

}

function addResultsinTab() {
  var tbodySat1 = $('#table-KazEOSat-1').children('tbody');
  var tableSat1 = tbodySat1.length ? tbodySat1 : $('#table-KazEOSat-1');
  
  var tbodySat2 = $('#table-KazEOSat-2').children('tbody');
  var tableSat2 = tbodySat2.length ? tbodySat2 : $('#table-KazEOSat-2');
  
  var counter=0;
  modelMap.HR.forEach(function(item, i, arr) {
    addRowsinTable(item, tableSat1, i+1, counter++)
  });
  
  modelMap.MR.forEach(function(item, i, arr) {
    addRowsinTable(item, tableSat2, i+1, counter++)
  });
  
}

function addRowsinTable(data, table, num, index) {
  var row = '<tr class="footprint-id" id="' + num + '" coordinates={{Coords}} satel={{Satellite}}  Pitch={{Pitch}} Roll={{Roll}}>' +
	'<td '+
	'<form>'+
	'<center>'+
	  '<input class="remember" name="remember" type="checkbox" qName={{Code}}  qDate={{Metadata_Date}} qSat={{Satellite}} qCoords={{Coords}} qIcon={{Quicklook}} qPitch={{Pitch}} qRoll={{Roll}}>'+
	'</center>'+
	'</form>'+
	'</td>'+	
	  '<td class="footprint-preview" id="footprint-preview" data-th="Preview" code ="{{Code}}" >'+
	    '<img class="img-strip-preview img-circle" src="{{Quicklook}}" alt="Product preview" width="50" height="50">'+
    '</td>' +
		'<td class="footprint" data-th="Product">' +
			'<div class="row">' +
				'<div class="col-sm-10">'+
					'<h5 class="sat-nomargin" sat="{{Code}}"> {{Code}} <br> <small class="shot-date" date="{{Metadata_Date}}" > - {{Metadata_Date}}</small> </h5>' +
				'</div>'+
			'</div>'+
		'</td>'+
		'<td class="info-tab">' + 
		'<center><i class="ion-ios-information-outline icon-style strip-info strip-icon"></i></center>'+
		'</td>'+
		'<td class="preview-image" data-th="Add">'+ 
			'<center><i class="ion-ios-eye-outline strip-preview-on-map icon-style strip-icon"></i></center>'+
		'</td>'+

		'<td class="toggle-tab">' + 
		'<center><i class="ion-android-locate icon-style strip-zoom strip-icon"></i></center>'+
		'</td>'+
	'</tr>';
	

  table.append(row.compose({
    'Code': data.id,
    'Quicklook': data.qlk_src,
    'Metadata_Date': data.meta,
    'Satellite': data.sat,
    'Coords': data.coord,
	'Pitch': data.pitch,
	'Roll': data.roll
  }));
}  
  

	

String.prototype.compose = (function (){
	var re = /\{{(.+?)\}}/g;
	return function (o){
	  return this.replace(re, function (_, k){
		return typeof o[k] != 'undefined' ? o[k] : '';
	  });
	}
}());

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][0] == deleteValue[0]) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

$('.table-strips').on("mouseenter", "tr.footprint-id .footprint", function(){
	
	$(this).closest('tr').children('.footprint').addClass("hover-icon");
}).on("mouseleave", "tr.footprint-id .footprint", function(){
	$(this).closest('tr').children('.footprint').removeClass("hover-icon");

}).on("click", "tr.footprint-id .footprint", function(){
	
	var $this = $(this);
	if ($this.hasClass('clicked')) { // if the row is currently highlighted
	  modelMap.Temp_Coords.clean($(this).closest('tr').attr('coordinates').split(","));
	  $this.closest('tr').removeClass('hover');
	  $this.removeClass('clicked');
	  $this.find('h5').removeClass("hover-icon");
	  controlMap.removeScene($(this).closest('tr').attr('id'),$(this).closest('tr').attr('satel'));
    }else {
      $this.addClass('clicked');
	  $this.addClass('hover');
	  $this.find('h5').addClass("hover-icon");
	  modelMap.Temp_Coords.push($(this).closest('tr').attr('coordinates').split(","));
	  controlMap.drawScene($(this).closest('tr').attr('coordinates').split(","), $(this).closest('tr').attr('id'),$(this).closest('tr').attr('satel'));
    }
});

$('.table-strips').on("click", ".strip-preview-on-map", function () {
	if($(this).hasClass('clicked')==true){	
	  $(this).removeClass('clicked');
	  try {
			controlMap.removeQuicklookFromFootprint( 
			  $(this).closest('tr').attr('id'),
			  $(this).closest('tr').children('.footprint-preview').attr('code')
			);
		}catch ( e ) {
			showError("Strips table selection error " + e )
		}
	  
	}else{
		$(this).addClass('clicked');
		try {
			controlMap.addQuicklookOnFootprint( 
			  $(this).closest('tr').children('.footprint-preview').children(".img-strip-preview").attr("src"),
			  $(this).closest('tr').attr('id'),
			  $(this).closest( ".footprint-id" ).attr('coordinates'),
			  $(this).closest('tr').children('.footprint-preview').attr('code')
			);
		}catch ( e ) {
			showError("Strips table selection error " + e )
		}
  }
}); 

$('.table-strips').on("click", ".footprint-preview", function () {

/*	if($(this).hasClass('clicked')==true){	
		$(this).removeClass('clicked');
		
		if ($(this).closest('tr').children('.footprint').hasClass('clicked')){
			console.log("remove footprint");
			$(this).closest('tr').children('.footprint').trigger("click");
		}
		if ($(this).closest('tr').children('.preview-image').find('i').hasClass('clicked')){
			console.log("remove quicklook");
			$(this).closest('tr').children('.preview-image').find('i').trigger("click");
			$(this).closest('tr').children('.preview-image').find('i').removeClass("hover-icon");
		}
		
	}else{
		$(this).addClass('clicked');	
		
		if ($(this).closest('tr').children('.footprint').hasClass('clicked')===false){
			console.log("add footprint");
			$(this).closest('tr').children('.footprint').trigger("click");
		}
		if ($(this).closest('tr').children('.preview-image').find('i').hasClass('clicked')===false){
			console.log("add quicklook");
			$(this).closest('tr').children('.preview-image').find('i').trigger("click");
			$(this).closest('tr').children('.preview-image').find('i').addClass("hover-icon");
		}
	}	  */
		
		if ($(this).closest('tr').children('.footprint').hasClass('clicked')){
			console.log("remove footprint");
			$(this).closest('tr').children('.footprint').trigger("click");
			$(this).closest('tr').children('.footprint').removeClass("hover-icon");
		}else{
			console.log("add footprint");
			$(this).closest('tr').children('.footprint').trigger("click");
			$(this).closest('tr').children('.footprint').addClass("hover-icon");
		}
		
		if ($(this).closest('tr').children('.preview-image').find('i').hasClass('clicked')){
			console.log("remove quicklook");
			$(this).closest('tr').children('.preview-image').find('i').trigger("click");
			$(this).closest('tr').children('.preview-image').find('i').removeClass("hover-icon");
		}else{
			console.log("add quicklook");
			$(this).closest('tr').children('.preview-image').find('i').trigger("click");
			$(this).closest('tr').children('.preview-image').find('i').addClass("hover-icon");
		}
	
});


$('.table-strips').on("mouseenter", ".strip-icon", function(){		
  $(this).addClass('hover-icon');	
}).on("mouseleave", ".strip-icon", function(){
	if($(this).hasClass('clicked')==false){
	  $(this).removeClass('hover-icon');
	}
})





var file;
var date;
var saveArr = []; // arrays for checked quicklook to download it
var doc;
var xml_folder;
var xmlString='';
var xml;
$('.table-strips').on('click', ".remember", function(){
	
	$("#qname").empty(); //refresh list that's need to be saved after each click
	$('#qsat_2').empty(); 
	
	var zip = new JSZip();
	//var img = zip.folder("images");
	
	class Quicklook{
		constructor(qname, date, sat, coordinates, icon, qpitch, qroll ){
			this.qname = qname;
			this.date = date;
			this.sat = sat;
			this.coordinates = coordinates;
			this.icon = icon;
			this.pitch = qpitch;
			this.roll = qroll;
		}
		 
	}
	if($(this).closest('tbody').children('tr').find('.remember')[0].getAttribute('qSat')=='KazEOSat-1'){
		$('#qImg').attr('src', 'img/sat1.jpg');
		//$('#qImg').attr('src', 'img/sat1.jpg');
	}else{
		$('#qImg').attr('src', 'img/sat2.jpg');
	}
	
	var arrays = [];
	saveArr = []; // arrays for checked quicklook to download it
	var length = $(this).closest('tbody').children('tr').find('.remember').length
	for ( i=0; i<length; i++){
	  var quicklook = $(this).closest('tbody').children('tr').find('.remember')[i];
		
	  arrays.push(quicklook.checked)
	  if(quicklook.checked==true && $.inArray($(this).closest('tr').children('.footprint-preview').attr('code'),saveArr)==-1){
		  
		  saveArr.push(new Quicklook(quicklook.getAttribute('qName'), quicklook.getAttribute('qDate'), quicklook.getAttribute('qSat'), quicklook.getAttribute('qCoords'), quicklook.getAttribute('qIcon'), quicklook.getAttribute('qPitch'), quicklook.getAttribute('qRoll')));
	  }
	}
	console.log(saveArr);
	if($.inArray(true, arrays)!=-1){
	  $("#saveKML").addClass("btn-primary");
		$('#saveKML').removeClass('disabled');
		//$('.icon-store').css('font-size', '30px');
		$('.icon-store').css('background-color', '#59b5fa');
		$('.icon-store').css('color', 'white');
	}else{
	  $("#saveKML").removeClass("btn-primary");
		$('#saveKML').addClass('disabled');
		//$('.icon-store').css('font-size', '25px');
		$(".icon-store").css({ 'background-color' : '', 'opacity' : '' });
		$('.icon-store').css('color', '#59b5fa');
	}
	
	doc = $.parseXML("<kml/>");
	xmlString=''
	
	xml = doc.getElementsByTagName("kml")[0];
	$(xml).attr('xmlns', 'http://www.opengis.net/kml/2.2');
	var key, elem;
	
	
	xml_folder = doc.createElement('Folder');
	var xml_name = doc.createElement('name');
	var linebreak = doc.createElement('br');
	
	$(xml_name).text("Quicklooks: " + date);
	
	xml.appendChild(xml_folder);

	xml_folder.appendChild(xml_name);
			
	for(i=0;i<saveArr.length;i++){

		$('#qname').append('<li><small>'+ saveArr[i].qname+'</small></li>');
	}	
	
})

$('#saveKML').on('click', function(){
	
		for(i=0;i<saveArr.length;i++){
		// creating elements inside Folder
		var folder = doc.createElement('Folder');
		var description = doc.createElement('description');
		var placemark = doc.createElement('Placemark');
		var groundOverlay = doc.createElement('GroundOverlay');
		var icon = doc.createElement('Icon');
		var href = doc.createElement('href');
		var gx = doc.createElement('gx:LatLonQuad');
		
		var name = doc.createElement('name');
		var polygon = doc.createElement('Polygon');
		var outerBoundaryIs = doc.createElement('outerBoundaryIs');
		var linearRing = doc.createElement('LinearRing');
		var placemark_coordinates = doc.createElement('coordinates');
		var coordinates = doc.createElement('coordinates');
		
		// attribute elements
		$(gx).attr('xmlns:gx', 'http://www.google.com/kml/ext/2.2');
		
		// appending child nodes
		xml_folder.appendChild(folder);
		folder.appendChild(name);
		folder.appendChild(description);
		folder.appendChild(placemark);
		folder.appendChild(groundOverlay);
		
		groundOverlay.appendChild(icon);
		groundOverlay.appendChild(gx);
		
		
		placemark.appendChild(polygon);
		polygon.appendChild(outerBoundaryIs);
		outerBoundaryIs.appendChild(linearRing);
		
		/** appending coordinates **/
	 	var str = saveArr[i].coordinates;
		var newstr1 = str.replace(/ /gi,',');

		newstr2 = newstr1.split(',');


		var newstr = [];
		for(let i = 0; i<=newstr2.length/2-1; i++){
			newstr[2*i]=newstr2[2*i+1];
			newstr[2*i+1]=newstr2[2*i];
		}
	
		newstr = newstr.join();
		var count=0;
		
		var strr='';
		var first_line='';
		for (j=0; j<=newstr.length; j++){
			
			if(j==newstr.length){
				strr = strr+',0 ' + first_line
			}else{
			
				if (newstr[j] == ','){
					count+=1;
				}
				if(count==2){
					if (first_line==''){
						first_line=strr+',0 ';
					}
					strr= strr+',0 ';
					count=0;
				}else{
					strr=strr+newstr[j];
				}
			}
			
		}

		var arr_coord = strr.split(' ');
		var gx_coordinates='';
		if(saveArr[i].sat=="KazEOSat-1"){
			gx_coordinates = arr_coord[0]+ ' '+ arr_coord[3]+ ' '+ arr_coord[2] + ' '+ arr_coord[1]+ ' '+ arr_coord[0];
		}else{
			gx_coordinates = arr_coord[0] + ' ' + arr_coord[3] + ' ' + arr_coord[2]+ ' ' +  arr_coord[1] + ' ' + arr_coord[0] ;
		}
		

		$(placemark_coordinates).text(strr);
		$(coordinates).text(gx_coordinates);

		linearRing.appendChild(placemark_coordinates);
		gx.appendChild(coordinates); 
		
		/** end **/
		
		/** appending name **/
		
		
		
		$(name).text(saveArr[i].qname);
		
		
		var isContains = $('#qsat_2').text().indexOf(saveArr[i].sat) > -1;
		if(isContains==false){
			$("#qsat_2").append(saveArr[i].sat);
		}
		var resolution;
		if (saveArr[i].sat === "KazEOSat-1"){
			resolution = "1.0";
		}else{
			resolution = "6.5";
		}
		/** end **/
		
		/** appending description **/
		
		$(description).text('Date: ' + saveArr[i].date + ', Satellite: ' + saveArr[i].sat + ', Resolution: '+ resolution + ', Pitch: '+ saveArr[i].pitch + ', Roll: '+ saveArr[i].roll );
		
		/** end **/
		
		/** appending icon **/
	
		
		$(href).text(saveArr[i].icon);
		icon.appendChild(href);
		
		
	
		
		/** end **/
		
		 
		
		
	}
	for(k=0; k<xml.outerHTML.length; k++){
			
			xmlString = xmlString + xml.outerHTML[k]
			if(xml.outerHTML[k]=='>'){
				xmlString = xmlString + '\n'
			}
			
	}
	
	file = new Blob(['<?xml version="1.0" encoding="utf-8"?>\n' + xmlString], {type: 'text/xml'});
	//download('<?xml version="1.0" encoding="utf-8"?>\n' + xmlString, 'Quicklooks - '+ date +'.kml', 'text/xml');
	
	
	
	
	$("#qname").empty(); //refresh list that's need to be saved after each click
	$('#qsat_2').empty();
	$('#qImg').empty();
	$(this).addClass('disabled');
	//var zip = new JSZip();
	//zip.file
	$('.remember').prop('checked', false);
	$('.icon-store').css('font-size', '18px');
	$(".icon-store").css({ 'background-color' : '', 'opacity' : '' });
	$('.icon-store').css('color', '#59b5fa');

	var zip = new JSZip();
    var a = document.getElementById("saveKML");
	var name = 'Quicklooks - '+ date +'.kml';
	zip.file(name, file);
	asynchronos_function();
	function asynchronos_function(){	
		zip.generateAsync({type:"blob"}).then(function(blob) {
			// see FileSaver.js
			saveAs(blob, name);
		}, function (err) {
			jQuery("#saveKML").text(err);
		})
	}
});

$('.draw').on("click",function (e) {
  modelMap.drawtool = $(this).attr('id');
  //if (drawtool != "upload");
  addInteraction();  
});




function addInteraction() {
	rectangle_options = {
		showArea: false,
		shapeOptions: {
			stroke: true,
			color: 'black',
			weight: 4,
			opacity: 0.1,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0,
			clickable: true
		}
	}
	if (modelMap.drawtool === 'Point') {
		var Drawer = new L.Draw.Marker(viewMap.mymap);
		
	} else if (modelMap.drawtool === 'Box') {
		var Drawer = new L.Draw.Rectangle(viewMap.mymap,rectangle_options);

	} 
	Drawer.enable();
}


$('.table-strips').on("click", ".strip-zoom", function(){
  var coords=$(this).closest('tr').attr('coordinates').split(",");
  zoomFootprint(coords);
})

function zoomFootprint(coords){
	viewMap.mymap.setView([Number(coords[0]),Number(coords[1])+7.5], 6);	
}

function clearEverythingFromMap(){
	var obj = modelMap.HR_object;
	for(var i = 0; i<obj.length;i++){
		viewMap.mymap.removeLayer(obj[i]);
	}
	modelMap.HR_object = [];
	modelMap.HR_object_id = [];
	
	obj = modelMap.MR_object;
	for(var i = 0; i<obj.length;i++){
		viewMap.mymap.removeLayer(obj[i]);
	}
	modelMap.MR_object = [];
	modelMap.MR_object_id = [];
	
	

	var obj = modelMap.HR_img_obj;
	for(var i = 0; i<obj.length;i++){
		viewMap.mymap.removeLayer(obj[i]);
	}
	modelMap.HR_img_obj = [];
	modelMap.HR_img_obj_id = [];
	
	
	var obj = modelMap.MR_img_obj;
	for(var i = 0; i<obj.length;i++){
		viewMap.mymap.removeLayer(obj[i]);
	}
	modelMap.MR_img_obj = [];
	modelMap.MR_img_obj_id = [];

	modelMap.HR = [];
	modelMap.MR = [];
	
	$("#table-KazEOSat-1 tbody").remove();
	$("#table-KazEOSat-2 tbody").remove();
}

var $this = $(this);  
$('.table-strips').on('mouseenter',"tr.footprint-id", function(){
  var el = $(this)
  el.find('th, td').addClass("hover");  
}).on("mouseleave", "tr", function() {
	if($(this).children('.footprint').hasClass('clicked') != true) 
	  $(this).find('th,td').removeClass("hover");
})

$('.table-strips').on("click", ".strip-info", function(){
	try {
    $( "#footprint-code" ).text( $(this).closest('tr').find( ".sat-nomargin" ).attr('sat') );
    $( ".shot-date" ).text( $(this).closest('tr').find( ".shot-date" ).attr('date') );
    $( ".sat" ).text( $(this).closest('tr').attr('satel') );
	$( ".pitch_class" ).text( $(this).closest('tr').attr('Pitch') );
	$( ".roll_class" ).text( $(this).closest('tr').attr('Roll') );
    $( "#footprint-src" ).attr( 'src', $(this).closest('tr').find( "img" ).attr('src') );
    $( "#footprint-link" ).attr( 'href', $(this).closest('tr').find( "img" ).attr('src') );
    
    $("#footprint-details").modal("show");
    
  }catch ( e ) {
    showError("Footptint details preview error " + e )
  }
	
});





$("#refresh").click( function() {
	clearEverythingFromMap();
	modelMap.drawnItems.clearLayers();
	$('#stripsView').collapse("hide");
})









$('.preview_all').on("mouseenter", function(){		
  $(this).addClass('hover-icon');	
}).on("mouseleave", function(){
	if($(this).hasClass('clicked')==false){
	  $(this).removeClass('hover-icon');
	}
}).on("click", function(){
	var $this = $(this);
	if ($this.hasClass('clicked')) {
	  $this.removeClass('clicked');
	  $(this).closest('thead').next('tbody').children('tr').children('.footprint').trigger('click')
	  $(this).closest('thead').next('tbody').children('tr').children().removeClass("hover");
    }else {
	  console.log('preview all');
      $this.addClass('clicked');
	  $(this).closest('thead').next('tbody').children('tr').children('.footprint').trigger('click')
	  $(this).closest('thead').next('tbody').children('tr').children().addClass("hover");
    }
})








viewMap.init();


