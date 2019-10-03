var zipLayer;

function drawZipShp(checked){
	
	form = document.getElementById("addvector_form");
	
	var file = form.file.files[0];
	var average_x_coordinate;
	var average_y_coordinate;
	var someCoordinates = [];

	var currentProj = this.map.getView().getProjection();
	var fr = new FileReader();
	var sourceFormat = new ol.format.GeoJSON();
	var source = new ol.source.Vector();
    
	fr.onload = function (evt) {
		var vectorData = evt.target.result;
		var dataProjection = sourceFormat.readProjection(vectorData) || currentProj;
		shp(vectorData).then(function (geojson) {			
			source.addFeatures(sourceFormat.readFeatures(geojson, {				
				dataProjection: dataProjection,
				featureProjection: currentProj
			}));
		});
	};
	
	fr.readAsArrayBuffer(file);
	zipLayer = new ol.layer.Vector({
		source: source
	});
	
	zipLayer.getSource().on('change', function(event) {
		console.log("Source state once data is loaded: ", zipLayer.getSource().getState());
		
		//console.log(layer.getSource().getFeatures().length);
		//console.log(layer.getSource().getFeatures());
		/*
		for (var i = 0; i < layer.getSource().getFeatures().length; i++){
			console.log(i);
			console.log(layer.getSource().getFeatures()[i].getExtext());
		}
		*/
		//...................Working & finding coordinates!!!..........................
		
		coordinates_array = [];
		x_coordinates_array = [];
		y_coordinates_array = [];
		
		//console.log("Coordinates " + layer.getSource().getFeatures()[0].getGeometry().getCoordinates());
		//console.log(layer.getSource().getFeatures()[0].R.geometry.A);
		
		for (var i = 0; i < zipLayer.getSource().getFeatures().length; i++){
			for (var k = 0; k < zipLayer.getSource().getFeatures()[i].R.geometry.A.length; k++){
				if (k%2 == 0){
					x_coordinates_array.push(zipLayer.getSource().getFeatures()[i].R.geometry.A[k]);
				}
				else{
					y_coordinates_array.push(zipLayer.getSource().getFeatures()[i].R.geometry.A[k])
				}
			}
		}
		
		//console.log(x_coordinates_array);
		//console.log(y_coordinates_array);
		
		//console.log(layer.getSource().getFeatures()[i].getGeometry().getCoordinates());
		/*
		for (var i = 0; i < layer.getSource().getFeatures().length; i++){
			if (layer.getSource().getFeatures()[i].getGeometry().getCoordinates().length > 2){
				for (var k = 0; k < layer.getSource().getFeatures()[i].getGeometry().getCoordinates().length; k++){
					for (var j = 0; j < layer.getSource().getFeatures()[i].getGeometry().getCoordinates()[k].length; j++){
						coordinates_array.push(layer.getSource().getFeatures()[i].getGeometry().getCoordinates()[k][j])
					}
				}
			}
			else{
				for (var k = 0; k < layer.getSource().getFeatures()[i].getGeometry().getCoordinates().length; k++){
					coordinates_array.push(layer.getSource().getFeatures()[i].getGeometry().getCoordinates()[k]) 
				}
			}
		}
		
		console.log(coordinates_array);
		*/
		
		/*
		for (var i = 0; i <= coordinates_array.length; i++){
			if (i%2 == 0){
				x_coordinates_array.push(coordinates_array[i]);
			}
			else{
				y_coordinates_array.push(coordinates_array[i]);
			}
		}
		*/
		var min_x = x_coordinates_array[0];
		var max_x = x_coordinates_array[0];
		
		for (var i = 1; i <= x_coordinates_array.length; i++){
			if (x_coordinates_array[i] < min_x){
				min_x = x_coordinates_array[i];
			}
			if (x_coordinates_array[i] > max_x){
				max_x = x_coordinates_array[i];
			}
		}
		
		average_x_coordinate = (max_x + min_x)/2;

		var min_y = y_coordinates_array[0];
		var max_y = y_coordinates_array[0];
		
		for (var i = 1; i <= y_coordinates_array.length; i++){
			if (y_coordinates_array[i] < min_y){
				min_y = y_coordinates_array[i];
			}
			if (y_coordinates_array[i] > max_y){
				max_y = y_coordinates_array[i];
			}
		}
		
		average_y_coordinate = (max_y + min_y)/2;
		console.log("x_average_coord " + average_x_coordinate);
		console.log("y_average_coord " + average_y_coordinate);
		someCoordinates = ol.proj.transform([average_x_coordinate, average_y_coordinate], 'EPSG:3857', 'EPSG:4326');
		
		//.............................................................................
		if ( checked != 0 ){
		map.getView().setCenter([average_x_coordinate, average_y_coordinate]);
		map.getView().setZoom(9.5);
		}
	});
	
	//this.addBufferIcon(layer);
    //this.map.addLayer(layer);
    //this.messages.textContent = 'Vector layer added successfully.';
		
		//map.getView().setCenter(ol.proj.fromLonLat([someCoordinates[0], someCoordinates[1]));
		//console.log(ol.proj.transform([170, 250], 'EPSG:4326', 'EPSG:3857'));
		//map.getView().setZoom(5.5);

};

document.getElementById('show_on_map').addEventListener('click', function (evt) {
	if (zipLayer != null){
		map.addLayer(zipLayer);
	}
});

/* function init() {
	document.removeEventListener('DOMContentLoaded', init);
    document.getElementById('addvector_form').addEventListener('submit', function (evt) {
		evt.preventDefault();
		VectorLayer(this);
    }); 
}
document.addEventListener('DOMContentLoaded', init); */