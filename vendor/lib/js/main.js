//Common JS functions used by Athena
var smartChat = (function(tt,type,attuid){
    if (type == 'BMP'){ tt += '00'}
    var url = 'https://smartchat.web.att.com/SMARTChatHome/GSAAgentPortlet?ticketSource='+type+'&agentId='+attuid+'&ticketNumber='+tt;
    window.open(url, '', 'scrollbars=yes,menubar=no,resizable=yes,toolbar=no,status=no');
});

/* export2CSV 
### convert array of arrays into CSV format. #######
Input Data Format : [['Title 1', 'Title 2', 'Title 3'],['row1cell1', 'row1cell2', 'row1cell3'],['row2cell1', 'row2cell2', 'row2cell3']]
*/
var export2CSV = (function (data, fileName) {

    if (!fileName) {
      fileName = "export.csv";
    }

    function JSON2CSV(objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

      var str = '';
      var line = '';

      // add heading row
      var head = array[0];
      for (var i = 0; i < head.length; i++) {
        var value = head[i] + "";
        if (i > 0) {
          line += ',';
        }
        line += '"' + value.replace(/"/g, '""') + '"';
      }

      str += line + '\r\n';

      // add items
      for (var i = 1; i < array.length; i++) {
        var line = '';

        for (var index = 0; index < array[i].length; index++) {
          var value = array[i][index];

          if (index > 0) {
            line += ',';
          }
          if (typeof value === 'object') {
            if (value) {
              var resolveValue;
              if (value._d instanceof Date) {
                // dealing with encoding issue in IE browsers.
                resolveValue = (value._d.getMonth() + 1) + '/' + value._d.getDate()  + '/' + value._d.getFullYear();
              }
              else {
                resolveValue = value._d.toString();
              }

              line += '"' + resolveValue.replace(/"/g, '""') + '"';
            }
            else {
              line += '""';
            }
          }
          else {
            value = value + "";
            if (value && value != 'undefined') {
              line += '"' + value.replace(/"/g, '""') + '"';
            }
            else {
              line += '""';
            }
          }
        }

        str += line + '\r\n';
      }
      return str;
    }

    var csv = JSON2CSV(data);
   
    var csvData = new Blob([csv],{ type : 'text/csv'});
    var csvUrl = URL.createObjectURL(csvData); 
    return downloadAs(csvData,csvUrl, fileName, 'csv');
});

/* downloadAs
## Download files on different browsers ##
extension : type of file to download
*/
var downloadAs = (function(data,uri,fileName,extension){
    //HACK : Download CSV file on IE browser
    if(msieversion()){
        window.navigator.msSaveBlob(data, fileName + "." + extension);
    }else{
        var link = document.createElement("a");    
        link.href = uri;
        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + "." + extension;
        
        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    return true;
});


/* getDateTime :Convert Epoch time to human readable format */
var getDateTime = (function(timestamp, app){
    var date = '';
    var newDate = '';
    if(timestamp){
        date = new Date(timestamp);
    }else{
        date = new Date(); //get todays date
    }

    var fullYear = formatTime(date.getFullYear());
    var year = fullYear.toString().substr(2,2);
    var month = formatTime((date.getMonth() + 1));      // "+ 1" becouse the 1st month is 0
    var day = formatTime(date.getDate());
    var hour = formatTime(date.getHours());
    var minutes = formatTime(date.getMinutes());
    var seconds = formatTime(date.getSeconds());
    
    if(app === 'export-csv'){
        newDate = fullYear + month + day + '_' + hour + minutes + seconds;
        return newDate;
    }

    if(app === 'show-alerts'){
        var ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; 
        newDate = month + '/' + day + '/' + year + '  ' + hour + ':' + minutes + ' ' + ampm;
        return newDate;
    }
});

/*get current time based on user's time zone*/
var getTimeZone = (function(timestamp, offset){
    var date = new Date(timestamp);

    var utc = date.getTime() + (date.getTimezoneOffset() * 60000);

    var newDate = new Date(utc + (3600000 * offset));

    return newDate;
});

/*formatTime: append zero if hour/min/sec is single digit*/
var formatTime = function(value){
    if(value < 10){
        return ("0" + value.toString());
    }else{
        return value.toString();
    }
}

/* msieversion : return true if surfing on IE browser */
var msieversion = (function() {
    var ua = window.navigator.userAgent; 
    var msie = ua.indexOf("MSIE "); 
    if (msie != -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number 
    {
        return true;
    } else { // If another browser, 
        return false;
    }
        return false; 
});
