$(document).ready(function() {
	//event.preventDefault();
	var kazImgLink = "img/lang_flags/Kazakhstan.gif";
	var rusImgLink = "img/lang_flags/Russia.gif";
	var engImgLink = "img/lang_flags/GreatBritain.gif";


	var imgBtnSel = $('#imgBtnSel');
	var imgBtnKaz = $('#imgBtnKaz');
	var imgBtnRus = $('#imgBtnRus');
	var imgBtnEng = $('#imgBtnEng');

	var imgNavSel = $('#imgNavSel');
	var imgNavKaz = $('#imgNavKaz');
	var imgNavRus = $('#imgNavRus');
	var imgNavEng = $('#imgNavEng');

	var spanNavSel = $('#lanNavSel');
	var spanBtnSel = $('#lanBtnSel');

	imgBtnSel.attr("src",engImgLink);
	imgBtnKaz.attr("src",kazImgLink);
	imgBtnRus.attr("src",rusImgLink);
	imgBtnEng.attr("src",engImgLink);

	imgNavSel.attr("src",engImgLink);
	imgNavKaz.attr("src",kazImgLink);
	imgNavRus.attr("src",rusImgLink);
	imgNavEng.attr("src",engImgLink);


	// var currentId = $("#imgNavSel").attr('id');

	// if(currentId == "navKaz") {
	// 	imgNavSel.attr("src",kazImgLink);
	// 	spanNavSel.text("KAZ");
	// } else if (currentId == "navEng") {
	// 	imgNavSel.attr("src",engImgLink);
	// 	spanNavSel.text("ENG");
	// } else if (currentId == "navRus") {
	// 	imgNavSel.attr("src",rusImgLink);
	// 	spanNavSel.text("RUS");
	// }


	$( ".language" ).on( "click", function( event ) {
		// event.preventDefault();

		var currentId = $(this).attr('id');

		if(currentId == "navKaz") {
			imgNavSel.attr("src",kazImgLink);
			spanNavSel.text("KAZ");
		} else if (currentId == "navEng") {
			imgNavSel.attr("src",engImgLink);
			spanNavSel.text("ENG");
		} else if (currentId == "navRus") {
			imgNavSel.attr("src",rusImgLink);
			spanNavSel.text("RUS");
		}

		if(currentId == "btnKaz") {
			imgBtnSel.attr("src",kazImgLink);
			spanBtnSel.text("KAZ");
		} else if (currentId == "btnEng") {
			imgBtnSel.attr("src",engImgLink);
			spanBtnSel.text("ENG");
		} else if (currentId == "btnRus") {
			imgBtnSel.attr("src",rusImgLink);
			spanBtnSel.text("RUS");
		}

	});
	
});

