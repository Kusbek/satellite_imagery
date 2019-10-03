var modelKML = {
	coordinates: null
}
var controlKML = {
	upload: function(evt){
		$('#upload').modal('hide');
		var files = evt.target.files; // FileList object
		if (typeof window.DOMParser != "undefined") {
			parseXml = function(xmlStr) {
				return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
			};
		} else if (typeof window.ActiveXObject != "undefined" &&
			   new window.ActiveXObject("Microsoft.XMLDOM")) {
			parseXml = function(xmlStr) {
				var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			};
		} else {
			throw new Error("No XML parser found");
		}
		for (var i = 0, f; f = files[i]; i++) {
			var extension = controlKML.checkExtension(f);
			if (extension == "kml"){
				controlKML.parseKML(f);
			} else {
				controlKML.parseKMZ(f);
			}
		}	
	},
	checkExtension: function(file){
		var extension;
		if ( file.name.endsWith(".kmz")){
			extension = "zip";

		}
		else{
			extension = "kml";
		}
		return extension;
	},
	parseKML: function(f){
		try {
			var fileReq = f.name; 
			var reader = new FileReader();			
			reader.onload = (function(theFile) {
				return function(e) {
					try {
						var xml = parseXml(e.target.result);
						var coordinates = xml.getElementsByTagName("coordinates");
						//filename_kml = xml.getElementsByTagName("name")[0].textContent;
						for (var i =0; i<coordinates.length;i++){
							var textCoords = controlKML.getRidOfZeros(coordinates[i].textContent);	
							modelKML.coordinates = controlKML.segmentCoords(textCoords);
							viewKML.showOnMap(modelKML.coordinates);
						}
/* 							var topleft    = L.latLng(polygon_to_draw[7],polygon_to_draw[6]),
							topright   = L.latLng(polygon_to_draw[5],polygon_to_draw[4]),
							bottomleft = L.latLng(polygon_to_draw[1],polygon_to_draw[0]);
							
						var overlay = L.imageOverlay.rotated("http://cof1.gharysh.kz/cat_quicklooks/DS_DZHR1_201804290705439_KZ1_E071N51_005402_QL.jpeg?key=da841468e271292abe02d063d82f828f", topleft, topright, bottomleft, {
							opacity: 1,
							interactive: false,
							attribution: "&copy; <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>"
						}).addTo(mymap); */
						/* image_input(polygon[]) */	
					} catch (e) {
						//document.getElementById("errMsg").innerHTML = e.message;
					}
				};
			})(f);
			reader.readAsText(f);
			// document.getElementById('preview').innerHTML = reader.result;	
		} catch (e) {
			console.log(e.message);
		}
	},
	parseKMZ: function(f){
		//var file_type;
		JSZip.loadAsync(f).then(function (zip) {
			var re = /(.kml)$/;
			//console.log(re);
			var promises = Object.keys(zip.files).filter(function (fileName) {
			// don't consider non image files
			return re.test(fileName.toLowerCase());
			}).map(function (fileName) {
				var file = zip.files[fileName];
				return file.async("blob").then(function (fileData) {
					try {	
						var fileReq = fileData.name;  
						var reader = new FileReader();
						
						reader.onload = (function(theFile) {
							return function(e) {
								
								try { 
									var xml = parseXml(e.target.result);
									var coordinates = xml.getElementsByTagName("coordinates");
									//filename_kml = xml.getElementsByTagName("name")[0].textContent;
									for (var i =0; i<coordinates.length;i++){
										var textCoords = controlKML.getRidOfZeros(coordinates[i].textContent);	
										modelKML.coordinates = controlKML.segmentCoords(textCoords);
										viewKML.showOnMap(modelKML.coordinates);
									}
								} catch (e) {
									//document.getElementById("errMsg").innerHTML = e.message;
								}
							};
						})(fileData);
						reader.readAsText(fileData);
						// document.getElementById('preview').innerHTML = reader.result;	
					} catch (e) {
						console.log(e.message);
					}
					
				  console.log(fileData)
				  return [
					fileName  // keep the link between the file name and the content
					//URL.createObjectURL(string) // create an url. img.src = URL.createObjectURL(...) will work
				  ];
				});
			});
			// `promises` is an array of promises, `Promise.all` transforms it
			// into a promise of arrays
			return Promise.all(promises);
		}).then(function (result) {
				// we have here an array of [fileName, url]
				// if you want the same result as imageSrc:
				console.log(result.reduce(function (acc, val) {
				acc[val[0]] = val[1];
				return acc;

				}, {}));
			}).catch(function (e) {
				console.error(e);
			});
	},
	segmentCoords: function(textCoords){
		
		var polygon = [];
		for (var j =0; j<textCoords.length/2;j++){
			polygon.push([textCoords[2*j+1],textCoords[2*j]]);	
		}
		return polygon;
	},
	getRidOfZeros: function(kml_input_with_zeros){
		console.log(kml_input_with_zeros);
		var coords_string = kml_input_with_zeros.replace(/\t|\n/g,",");
		console.log(coords_string);
		var coords_final= coords_string.split(/\,0 |\,| /g);
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

var viewKML = {
	showOnMap: function(numericCoords){
		L.polygon(numericCoords).addTo(viewMap.mymap);
		viewMap.mymap.setView(numericCoords[0], 6)
	}
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('kml-file').addEventListener('change', controlKML.upload, false);
} else {
	alert('The File APIs are not fully supported in this browser.');
}





