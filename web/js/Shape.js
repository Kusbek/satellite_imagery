var modelShape = {
	coordinates: null,
	content: null
}
var fr;
var controlShape = {
	upload: function(evt){
		$('#upload').modal('hide');
		let shp_files = document.getElementById("shp-files");
		let name = shp_files.value;
		if ((shp_files.files.length == 1) && (name.includes(".zip") == true)){
			var shape_file_in_zip = shp_files.files[0];
			controlShape.parseZipShp(shape_file_in_zip);	
		}
		else {
			controlShape.parseShp(shp_files);
		}
	},
	parseShp: function(shp_files){
		var dbfContent;
		var shpContent;
		var content = modelShape.content;
		for (var i = 0; i<shp_files.files.length; i++){
			if (shp_files.files[i].name.includes(".dbf") == true){
				controlShape.loadLocalFile(shp_files.files[i], function(content) {
					dbfContent = content;
					if (shpContent && dbfContent) {
						controlShape.loadShapefile(shpContent, dbfContent);
					}
				});
			}
			else if (shp_files.files[i].name.includes(".shp") == true){
				controlShape.loadLocalFile(shp_files.files[i], function(content) {
					shpContent = content;
					if (shpContent && dbfContent) {
						controlShape.loadShapefile(shpContent, dbfContent);
					}
				});
			}
		}
	},
	parseZipShp: function (zip_shp_file){
		fr = new FileReader();
		fr.readAsArrayBuffer(zip_shp_file);
		fr.onload = controlShape.zipReceiveBinary;

	},
	zipReceiveBinary: function() {
        result = fr.result;
        var shpfile = new L.Shapefile(result);
		console.log(shpfile);
		viewShape.showOnMap(shpfile);
    },
	loadLocalFile: function(file, callback){
		var content = modelShape.content;
		if (typeof FileReader === 'function') {
			var reader = new FileReader();
			reader.onload = function(e) {
				content = e.target.result;
				callback.call(this, content);
			};
			reader.readAsArrayBuffer(file);
		} else {
			var reader = new ActiveXObject("Scripting.FileSystemObject");
			var f = reader.OpenTextFile(file, 1, false, true);
			var content = [];
			while (f.AtEndOfStream !== true) {
				var c = f.read(1).charCodeAt(0);
				content.push(c & 0xff);
				content.push((c >> 8) & 0xff);
			}
			f.Close();
			callback.call(this, content);
		}
	},
	loadShapefile: function(shp, dbf){
		geojson = shapefile2geojson(shp, dbf);
		for (var i = 0; i < geojson.features.length; i++){
			let geotext = JSON.stringify(geojson.features[i]);
			controlShape.extractShpData(geotext);
		}
		//document.getElementById("out").innerHTML = geotext;
	},
	extractShpData: function(inpStr){
		if (inpStr.search("coordinates") > 0){
			var string = inpStr.match(/\[(.*?)\]/g);
			var temp_string;
			for(var i=0;i<string.length;i++){
				string[i] = string[i].replace(/\[|\]/g,"");
				temp_string = temp_string +"," + string[i];
			}
			string = temp_string;
			delete temp_string;
			var inpArr = controlShape.getRidOfZeros(string);
			modelShape.coordinates = controlKML.segmentCoords(inpArr);
			viewKML.showOnMap(modelShape.coordinates);
		}
		else{
			console.log("No coordinates found!");
		}
	},
	getRidOfZeros: function(kml_input_with_zeros){
		console.log(kml_input_with_zeros);
		var coords_string = kml_input_with_zeros.replace(/\t|\n/g,"");
		//console.log(coords_string);
		var coords_final= coords_string.split(/\,0 |\,/g);
		console.log(coords_final);
		var temporary_coords = [];
		for(let i of coords_final.map(Number)){
			i && temporary_coords.push(i);
		}
		coords_final = temporary_coords;
		console.log(coords_final);
		//coords_final.pop();
		return coords_final;
	}
}

var viewShape = {
	showOnMap: function(shpFile){
		shpFile.addTo(viewMap.mymap);
		//shpFile.getBounds();
		//viewMap.mymap.setView(shpFile[0], 6)
	},
	setCenter: function (data){
		console.log(data[0][0]);
		viewMap.mymap.setView([data[0][0][1],data[0][0][0]], 6)
	}
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('shp-files').addEventListener('change', controlShape.upload, false);
} else {
	alert('The File APIs are not fully supported in this browser.');
}