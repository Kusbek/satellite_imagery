#!/usr/bin/nodejs
var express 	= require('express');
var bodyParser 	= require('body-parser');
var http 		= require('http');
var path 		= require('path');
var app 		= express();
var fs 			= require('fs');
var request 	= require('request');
var crypto 		= require('crypto');
var session = require('express-session');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(express.static(__dirname + '/web')); //Serves resources from public folder
// viewed at http://localhost:8080

app.get('/', function(req, res){
  res.sendfile(__dirname + '/web/index.html');
});

app.get('/CatalogService', function(req, res){

	var data = fs.readFileSync('code.txt','utf8');
	data = data.split('\n');
/////////////////////////////////////////////////////////////////////////////////
	var sDateFr = req.query.DateFr;
	var textDateFr;
	var regex = RegExp(sDateFr+' *');

	for (var i = 0; i<data.length;i++){
		if (regex.test(data[i])==true){
			textDateFr = data[i];
		}
	}
	textDateFr = textDateFr.split(';');
	sDateFr = textDateFr[1];

//////////////////////////////////////////////////////////////////////////////////	
	var sDateTo = req.query.DateTo;
	var textDateTo;
	var regex = RegExp(sDateTo+' *');
	for (var i = 0; i<data.length;i++){
		if (regex.test(data[i])==true){
			textDateTo = data[i];
		}
	}
	textDateTo = textDateTo.split(';');
	sDateTo = textDateTo[2];
////////////////////////////////////////////////////////////////////////////////////	
	var sWest = req.query.West;
	var sNorth = req.query.North;
	var sEast = req.query.East;
	var sSouth = req.query.South;
	var sCatalogServiceReq ="7|0|14|http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/|F5D7A83DB22C52A50C21C05DB8965B9A|net.eads.astrium.faceo.middleware.gwt.client.ICatalogueGWTService|queryCatalogueSetRecords|net.eads.astrium.faceo.core.apis.catalogue.CatalogueSetRecordQuery/112575587|net.eads.astrium.faceo.core.apis.common.request.Criteria/4096422861|net.eads.astrium.faceo.core.apis.catalogue.CatalogueRecordQuery/3099495460|java.util.ArrayList/4159755760|net.eads.astrium.faceo.common.data.geographical.Box/1707532656|net.eads.astrium.faceo.common.data.geographical.GeoPosition/3149863295|EPSG:4326|net.eads.astrium.faceo.common.data.temporal.Period/2004917229|java.util.Date/3385151746|java.lang.Integer/3438268394|1|2|3|4|2|5|6|5|7|8|1|9|10|0|"+sSouth+"|"+sNorth+"|10|0|"+sEast+"|"+sWest+"|0|11|1|8|0|10000|8|1|12|13|"+sDateTo+"|13|"+sDateFr+"|8|1|14|0|0|0|6|0|0|0|";
	request({
		url: 'http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/catalogueService.rpc',
		method: "POST",
		headers:{
			'Content-Type': 'text/x-gwt-rpc; charset=UTF-8'
		},
		body: sCatalogServiceReq
	}, function (error,response,body){
		var response_body = body.replace(/\\n/gi,"").replace(/\\t/gi, "").replace(/\\/gi, "").replace(/\"/gi,"\"");
		response_body = response_body.replace("//","").replace(/\> \</gi,"><").replace(/\'/gi,"");
		response_body = response_body.split("UTF-8");
		var sBegin="<gmd:MD_BrowseGraphic><gmd:fileName><gco:CharacterString>";
        var sEnd="</gco:CharacterString></gmd:fileName><gmd:fileDescription>";
		var json_begin = "{\"";
		var json_end = "}";
		var coords = [];
		var json_conf = [];
		var response_json ="";
		for( var i = 1; i<response_body.length; i++){
			var sBeginIndex = response_body[i].lastIndexOf(sBegin);
			var sEndIndex = response_body[i].lastIndexOf(sEnd);
			var json_begin_index = response_body[i].indexOf(json_begin);
			var json_end_index = response_body[i].lastIndexOf(json_end);
			var coords = response_body[i].slice(sBeginIndex+sBegin.length,sEndIndex);
			json_conf[i-1] = response_body[i].slice(json_begin_index,json_end_index+1);
			var json_obj = JSON.parse(json_conf[i-1]);
			var json_code = json_obj.Dataset["Dataset Id"];
			
			if (json_code.includes("DS_DZHR1") == true){
				var json_sattelite = "KazEOSat-1";
				var json_pitch = json_obj["Technical Information (Optic)"].Pitch;
				var json_roll = json_obj["Technical Information (Optic)"].Roll;
				var HR = 1;
			}else{
				var json_sattelite = "KazEOSat-2";
				var HR = 0;
				var json_pitch = "not defined";
				var json_roll = "not defined";
			}

			var coords1 = extract_extreme_points(coords, HR);
			var json_date = json_obj.Dataset["Metadata Date"];
			var json_bb_east = json_obj["Reference/Location"]["Bounding box"].East;
			var json_bb_west = json_obj["Reference/Location"]["Bounding box"].West;
			var json_bb_north = json_obj["Reference/Location"]["Bounding box"].North;
			var json_bb_south = json_obj["Reference/Location"]["Bounding box"].South;

			var url = "http://cof1.gharysh.kz/cat_quicklooks/"+json_code+"_QL.jpegp0sUe";
			//var json_jpeg_url = "http://cof1.gharysh.kz/cat_quicklooks/"+json_code+"_QL.jpeg?key="+crypto.createHash('md5').update(url).digest("hex");
			var json_jpeg_url = "http://cof1.gharysh.kz/cat_quicklooks/"+json_code+"_QL.jpeg?key="+crypto.createHash('md5').update('Secret').digest("hex");
			if (i == response_body.length-1){
				if (json_code.includes("ORTHO")==true){
					response_json = response_json + "";
				}else{
					response_json = response_json + "\n{\n"
					+"\"Metadata_Date\":\""+json_date+"\",\n"
					+"\"Satellite\":\""+json_sattelite+"\",\n"
					+"\"Quicklook\":\""+json_jpeg_url+"\",\n"
					+"\"East\":\""+json_bb_east+"\",\n"
					+"\"West\":\""+json_bb_west+"\",\n"
					+"\"North\":\""+json_bb_north+"\",\n"
					+"\"South\":\""+json_bb_south+"\",\n"
					+"\"Code\":\""+json_code+"\",\n"
					+"\"Pitch\":\""+json_pitch+"\",\n"
					+"\"Roll\":\""+json_roll+"\",\n"
					+"\"Coordinates\":\""+coords1+"\"\n}";
				}
			}else{
				if (json_code.includes("ORTHO")==true){
					response_json = response_json + "";
				}else{
					response_json = response_json + "\n{\n"
					+"\"Metadata_Date\":\""+json_date+"\",\n"
					+"\"Satellite\":\""+json_sattelite+"\",\n"
					+"\"Quicklook\":\""+json_jpeg_url+"\",\n"
					+"\"East\":\""+json_bb_east+"\",\n"
					+"\"West\":\""+json_bb_west+"\",\n"
					+"\"North\":\""+json_bb_north+"\",\n"
					+"\"South\":\""+json_bb_south+"\",\n"
					+"\"Code\":\""+json_code+"\",\n"
					+"\"Pitch\":\""+json_pitch+"\",\n"
					+"\"Roll\":\""+json_roll+"\",\n"
					+"\"Coordinates\":\""+coords1+"\"\n},";
				} 
			}
		}
		
		var json_obj = "{ \"data\": ["+ response_json+ "\n] }";
		var data_object = JSON.parse(json_obj);
		data_object.data.sort(function(a, b) {
			var dateA = new Date(a.Metadata_Date), dateB = new Date(b.Metadata_Date);
			return dateB - dateA;
		});
		res.json(data_object);
		
		function extract_extreme_points(coords, HR){

			var coords1 = coords.split(" ");
			var maxLat = [];
			var maxLon = [];
			var minLat = [];
			var minLon = [];
			
			maxLat[1] = coords1[0];
			maxLat[0] = coords1[1];
			
			maxLon[1] = coords1[2];
			maxLon[0] = coords1[3];
			
			minLat[1] = coords1[(((coords1.length-1)/2-1)/2+1)*2-2];
			minLat[0] = coords1[(((coords1.length-1)/2-1)/2+1)*2-1];
			
			minLon[1] = coords1[(((coords1.length-1)/2-1)/2+2)*2-2];
			minLon[0] = coords1[(((coords1.length-1)/2-1)/2+2)*2-1];

			//var coords_final = minLat[0] + " " + minLat[1] + " " + minLon[0] + " "+ minLon[1]+ " " + maxLat[0] + " "+ maxLat[1]+ " " + maxLon[0] + " "+ maxLon[1];
			//var coords_final = maxLon[0] + " "+ maxLon[1]+ " " + minLat[0] + " " + minLat[1] + " " + minLon[0] + " "+ minLon[1]+ " " + maxLat[0] + " "+ maxLat[1];
			//var coords_final = maxLat[0] + " "+ maxLat[1] + " " + maxLon[0] + " "+ maxLon[1]+ " " + minLat[0] + " " + minLat[1] + " " + minLon[0] + " "+ minLon[1];
			if (HR = 1){
				var coords_final = minLon[0] + " "+ minLon[1] + " " + maxLat[0] + " "+ maxLat[1]+ " "+ maxLon[0] + " "+ maxLon[1]+ " " + minLat[0] + " " + minLat[1];
			}else{
				coords1.pop();
				var coords_final = coords1;
				//var coords_final = minLat[0] + " " + minLat[1] + " " + minLon[0] + " "+ minLon[1]+ " " + maxLat[0] + " "+ maxLat[1]+ " " + maxLon[0] + " "+ maxLon[1];
			}
			return coords_final;

		}
		
	});
});


const CHECK_VALUE  = "check";
const LOGOUT_VALUE = "logout";
const LOGIN_VALUE = "login";
const AUTH_RESPONSE_EXPIRED = "{ \"auth\": [{\"access\":\"denied\"}] }";
const AUTH_RESPONSE_GRANTED = "{ \"auth\": [{\"access\":\"granted\"}] }";
var sessions = new Object();
app.post('/AuthentificationService', function(req, res){
	var UserName=req.body.user;
	var UserPass=req.body.pass;
	var UserAction = req.body.action;
	var session = req.session.id;
	var url = "http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/authentificationService.rpc";
	var body = "7|0|7|http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/|F2BF060ADE587765C93D42965BE8D763|net.eads.astrium.faceo.middleware.gwt.client.IAuthentificationGWTService|logon|java.lang.String/2004016611|"+ UserName +"|"+ UserPass +"|1|2|3|4|2|5|5|6|7|";
	if (UserAction != null && UserAction.includes(CHECK_VALUE)){
		if (sessions[session] == "authorized"){
			var obj = JSON.parse(AUTH_RESPONSE_GRANTED);
			res.json(obj);
		} else 
		if(sessions[session] == "unauthorized" || sessions[session] ==null ){
			var obj = JSON.parse(AUTH_RESPONSE_EXPIRED);
			res.json(obj);
		}
	}else 
	if (UserAction != null && UserAction.includes(LOGIN_VALUE)&& UserName != null && UserName.length > 0&&UserPass != null && UserPass.length > 0){
		PostToAuthentificateServiceCOF(url,body);

	}else 
	if (UserAction != null && UserAction.includes(LOGOUT_VALUE)){
		delete sessions[session];
	}
	function PostToAuthentificateServiceCOF(sAuthServiceUrl,sAuthServiceReq){
		request({
			url: sAuthServiceUrl,
			method: "POST",
			headers:{
				'Host': 'cof1.gharysh.kz',
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0',
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate',
				'Content-Type': 'text/x-gwt-rpc; charset=UTF-8',
				'X-GWT-Permutation': '5EAA6095440F92E001B7B8DA7CF38B9A',
				'X-GWT-Module-Base':'http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/',
				'Referer': '"http://cof1.gharysh.kz/customer-office/net.eads.astrium.faceo.HomePage/HomePageLogin.jsp?locale=en',
				'Connection':'keep-alive'
			},
			body: sAuthServiceReq
		}, function (error,response,body){
			if (response.statusCode != 200){
				var obj = JSON.parse(AUTH_RESPONSE_EXPIRED);
				sessions[session] = "unauthorized";
				res.json(obj);
			}else{
				sessions[session] = "authorized";
				var obj = JSON.parse(AUTH_RESPONSE_GRANTED);
				res.json(obj);
			}
		});
	}
});

app.get('/AuthentificationService', function(req, res){
	var session = req.session.id;
	if (sessions[session] == 'authorized'){
		var obj = JSON.parse(AUTH_RESPONSE_GRANTED);
		res.json(obj);
	}else{
		var obj = JSON.parse(AUTH_RESPONSE_EXPIRED);
		res.json(obj);
	}
	
});



app.post('/RegistrationService', function(req, res){
	
	res.json("confirmation");
});


//app.listen(3000, function(){
app.listen(3000, function(){

    console.log("listening on *:80");
});
