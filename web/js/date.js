$(document).ready(function(){

  var currDate = new Date();
  var fromDate = new Date();
  fromDate.setMonth( fromDate.getMonth() - 1 );
  
  $('#date-to, #date-from').datepicker({
    format: 'yyyy-mm-dd',
    todayHighlight: true,
    autoclose: true,
  })
  
  $('#date-to').datepicker('setDate', currDate);
  $('#date-from').datepicker('setDate', fromDate);

});
