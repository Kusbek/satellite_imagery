var activeSession = false;
var storedName = localStorage['userName'] || 'Demo';
var storedTime = localStorage['timeOut'] || 'defaultValue'
var idleTime = 0;
var intervalId = null;
var myUrl = 'AuthentificationService';
var myUrl_1 = 'RegistrationService';

//console.log(storedName) 


if (activeSession==false){
	$("#logout").hide();
}

window.onload = function() {
	
	//$("#authorization").modal('hide'); 
	$.ajax({
		type: "GET", 
		url: myUrl, 
		data: {'action':"check"},
		dataType:"json",
		complete: function(res){
			//var storedName = localStorage.getItem("someVarName"); 
			var access = res.responseJSON.auth[0].access;
			
			if (access=="granted"){
				$("#author").click(false);
				if(storedName=='test05'){
				  console.log('hey')	
				  $('#author').text('Demo');
				}else{
				  $('#author').text(storedName);
				}
				
				$("#logout").show();
				$("#authorization").modal('hide');
				
				$("button#author").off("click");
				inActivity(); 	
			}
			if(access=="denied"){
				//$("#authorization").modal('show'); 
				$("#authorization").modal({
				  backdrop: 'static',
				  keyboard: false
				});
			}	
			}
	})
	
}

function inActivity(){
	$(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });
	intervalId = setInterval(function() {
		
		idleTime++;
		 
		
		if(idleTime>19){
			
			clearInterval(intervalId);
			$("#alertModal_3").modal({
				backdrop: 'static',
				keyboard: false
			});
			$("#sessionOut").click(function(){
				action_logout(); 
			});
			$(this).click(function (e) {
				action_logout(); 
			});
			
		}
			
	},10000); 
	
}




function action_logout() {
	$("#logout").hide();
	
	$.ajax({
		type: "POST", 
		url: myUrl, 
		data: {'action':"logout"},
		dataType:"json",
		complete: function(res){ 
			//console.log(res.responseJSON.auth[0].access.toString());  
			}
	})
	location.reload();  
}


var action_check = function() {
	$.ajax({
		type: "POST",
		url: myUrl, 
		data: {'action':"check"},
		dataType:"json",
		complete: function(res){ 
			//console.log(res.responseJSON.auth[0].access.toString());  
			}	
	})     

	//idleTime++;
	
	//console.log(idleTime);
    
};

/* if (idleTime > 5) { // 20 minutes
	clearInterval(intervalId);
	$("#alertModal_3").modal();
	action_logout();												      
} */	

/* $.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

$("#exit").enterKey(function () {
    alert('Enter!'); 
}) */



	  
	 
	


$(document).ready(function(){
	
	/* $("#authorization").modal({
	  backdrop: 'static',
	  keyboard: false
	}); */
	
	
	
	// if there is no action set action time = 0  
	$(this).mousemove(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });
	
	
	$("#exitting").click( function() {
		
		action_logout(); 
		
	})
	
	// clicking login button
	$("#login").click( function() {
		
		localStorage['userName'] = $("#InputUser").val();
		localStorage['timeOut'] = idleTime;

		if ($("#InputUser").val().length==0 && $("#InputPassword").val()==0){
			$('#login_text').text("Please enter username and password");  
		}else if ($("#InputUser").val().length==0){
			setTimeout(function(){
       			 $('#login_text').text("Please enter username and password");
;
   			}, 2000); 
			$('#login_text').text("Type the username ")
		}else if ($("#InputPassword").val().length==0){
			setTimeout(function(){
       			 $('#login_text').text("Please enter username and password ");
;
   			}, 2000);
			$('#login_text').text("Type the password")  
		}
		 
		
		 
		if($("#InputUser").val().length!=0 && $("#InputPassword").val()!=0){
		$.ajax({
			type: "POST",
			url: myUrl,       
			data: {'action':"login", 'user':$("#InputUser").val(), 'pass':$("#InputPassword").val()},
			dataType: "json",   	  		 
			complete: function (res, data) {
				localStorage.setItem($("#InputUser").val(), storedName); 
				var access = res.responseJSON.auth[0].access;
				 if (access=="denied") { 
				    $("#alertModal_2").modal(); 
				
					 					
					} else if (access=="granted") {
						$("#author").click(false);	 	
						$("#authorization").modal('hide');
						$(document).keypress(function(e){
							if(e.which==13){
								$("#alertModal").modal('hide');
							}
						});
						$("#alertModal").modal();
						activeSession = true;
						//console.log(access+ " " + activeSession);
						if($("#InputUser").val()=='test05'){
							$('a#author').text('Demo');
						}else{
							$('a#author').text($("#InputUser").val());
						}
						
						
						$("#logout").show();
						
						  
						
						
													
						intervalId = setInterval(function() {
							action_check();
							idleTime++;
							 
							
							if(idleTime>19){
								
								clearInterval(intervalId);
								$("#alertModal_3").modal({
									backdrop: 'static',
									keyboard: false
								});
								$("#sessionOut").click(function(){
									action_logout(); 
								});
								$(this).click(function (e) {
									action_logout();
								});
							}
								
						},60000);        
					}
				}   
		
		 });
		}
		
			
		  
	 });
	$("#demo").click( function(){
		localStorage['userName'] = $("#InputUser").val();
		$.ajax({
			type: "POST",
			url: myUrl,       
			data: {'action':"login", 'user':'test05', 'pass':'test05'},
			dataType: "json",   	  		 
			complete: function (res, data) {
				localStorage.setItem($("#InputUser").val(), storedName);
			  	$("#author").click(false);	 	
				$("#authorization").modal('hide');
				$(document).keypress(function(e){
					if(e.which==13){
						$("#alertModal").modal('hide');
					}
				});
				$("#alertModal").modal();
				activeSession = true;
				//console.log(access+ " " + activeSession); 
				$('a#author').text('Demo');
				
				$("#logout").show();
									
				intervalId = setInterval(function() {
					action_check();
					idleTime++;
					 
					
					if(idleTime>19){
						
						clearInterval(intervalId);
						$("#alertModal_3").modal({
							backdrop: 'static',
							keyboard: false
						});
						$("#sessionOut").click(function(){
							action_logout(); 
						});
						$(this).click(function (e) {
							action_logout();
						});
					}
						
				},60000); 
				
			}
		})
	  
	})
	
	
	$("#register").click( function() {
		
		if ($("#name").val().length==0 || $("#surname").val()==0 || $("#email").val().length==0 || $("#r_login").val()==0|| $("#company").val().length==0 || $("#explaination").val()==0){
			$('#registration_text').text("Please fill all blank fields");
			console.log("pnh");
		}
		
		
		
		if($("#name").val().length!==0 || $("#surname").val()!==0 || $("#email").val().length!==0 || $("#r_login").val()!==0|| $("#company").val().length!==0 || $("#explaination").val()!==0){
			$.ajax({
				type: "POST",
				url: myUrl_1,       
				data: {'action':"registration", 'name':$("#name").val(), 'surname':$("#surname").val(), 'email':$("#email").val(), 'login':$("#r_login").val(), 'company':$('#company').val(), 'explaination':$("#explaination").val()},
				dataType: "json",   	  		 
				complete: function (res, data) {
							
						console.log(data);
						if(data=="success"){
							$("#authenitcation").modal('hide');
							$("#confirm").modal();
						}
					}
					})   
			
		}

		
			
	  
	})
	 
	
}) 



	

	 
