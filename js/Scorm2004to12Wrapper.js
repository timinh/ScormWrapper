var Scorm2004to12Wrapper = {
  codeName: 'ScormProxy',
  debug: true,
  apiHandle	 :	null,
  findAPITries :  0,
  noAPIFound	 : false,
  maxTries: 500,
  timeStart: null
};

Scorm2004to12Wrapper.Initialize = function() {
  this.log('Initialize');
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    var dateStart = new Date();
    this.timeStart = dateStart.getTime();
    return api.LMSInitialize("");
  }
  return false;
};

Scorm2004to12Wrapper.Terminate = function() {
  this.log('Terminate');
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    var dateEnd = new Date();
    var timeEnd = dateEnd.getTime();
    var tps_passe = (Math.floor(timeEnd - this.timeStart)) / 1000;
    this.log(this.formatTime(tps_passe));
    api.LMSSetValue('cmi.core.session_time', this.formatTime(tps_passe));
    return api.LMSFinish("");
  }
  return false;
};

Scorm2004to12Wrapper.GetValue = function(key) {
  this.log('GetValue : ' + key);
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    switch(key) {
      case 'cmi.location':
        var status = api.LMSGetValue('cmi.core.lesson_status');
        if(status != 'incomplete') {
          return '';
        }
        return api.LMSGetValue('cmi.core.lesson_location');
        break;
      case 'cmi.completion_status'://TODO
        var status = api.LMSGetValue('cmi.core.lesson_status');
        if (status == 'passed'|| status == 'failed') {
          return 'completed';
        } else {
          return 'incomplete';
        }
        break;
      case 'cmi.success_status':
        var status = api.LMSGetValue('cmi.core.lesson_status');
        if (status == 'completed') {
          return 'passed';
        } else {
          return 'not attempted';
        }
        break;
      case 'cmi.progress_measure':
        return ''; //TODO
        break;
      case 'cmi.learner_id':
        return api.LMSGetValue('cmi.core.student_id');
        break;
      case 'cmi.learner_name':
        return api.LMSGetValue('cmi.core.student_name');
        break;
      case 'cmi.score.raw':
        return api.LMSGetValue('cmi.core.score.raw');
        break;
      case 'cmi.score.min':
        return api.LMSGetValue('cmi.core.score.min');
        break;
      case 'cmi.score.max':
        return api.LMSGetValue('cmi.core.score.max');
        break;
      default :
        return api.LMSGetValue(key);
        break;
    }
  }
  return '';
};

Scorm2004to12Wrapper.SetValue = function(key, val) {
  this.log('SetValue : ' + key + ' / ' + val);
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    switch(key) {
      case 'cmi.score.min':
        return api.LMSSetValue('cmi.core.score.min', val);
        break;
      case 'cmi.score.max':
        return api.LMSSetValue('cmi.core.score.max', val);
        break;
      case 'cmi.score.raw':
        return api.LMSSetValue('cmi.core.score.raw', val);
        break;
      case 'cmi.score.scaled':
        return '';
        break;
      case 'cmi.exit':
        status = api.LMSGetValue('cmi.core.lesson_status');
        if(status == 'completed' || status == 'passed' ) {
          return api.LMSSetValue('cmi.core.exit', '');
        }
        return api.LMSSetValue('cmi.core.exit', val);
        break;
      case 'cmi.suspend_data':
        status = api.LMSGetValue('cmi.core.lesson_status');
        if(status == 'completed' || status == 'passed' ) {
          return api.LMSSetValue('cmi.suspend_data', '');
        }
        break;
      case 'cmi.location':
        return api.LMSSetValue('cmi.core.lesson_location', val);
        break;
      case 'cmi.progress_measure':
        return '';
        break;
      case 'cmi.session_time':
        break;
      case 'cmi.completion_status':
      case 'cmi.success_status':
        if(val == 'passed' || val ==' completed') {
          api.LMSSetValue('cmi.suspend_data', "");
          api.LMSSetValue('cmi.core.lesson_location', '-');
          api.LMSSetValue('cmi.core.exit', "");
        }
        return api.LMSSetValue('cmi.core.lesson_status', val);
        break;
      default: 
        return api.LMSSetValue(key, val);
        break;
    }
  }
  return '';
};

Scorm2004to12Wrapper.Commit = function() {
  this.log('Commit');
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    return api.LMSCommit("");
  }
  return false;
};

Scorm2004to12Wrapper.GetLastError = function() {
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    this.log('GetLastError :' + api.LMSGetLastError());
    return api.LMSGetLastError();
  }
  return '301';
};

Scorm2004to12Wrapper.GetErrorString = function(errorCode) {
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    this.log('GetErrorString : ' + api.LMSGetErrorString(errorCode));
    return api.LMSGetErrorString(errorCode);
  }
  return 'Not initialized';
};

Scorm2004to12Wrapper.GetDiagnostic = function(errorCode) {
  var api = this.getAPIHandle();
  if(!this.noAPIFound){
    this.log('GetDiagnostic : ' + api.LMSGetDiagnostic(errorCode));
    return api.LMSGetDiagnostic(errorCode);
  }
  return 'Not initialized';
};

Scorm2004to12Wrapper.setDebug = function(value) {
  this.debug = value;
};

Scorm2004to12Wrapper.log = function(value) {
  if(this.debug) {
    console.log(value);
  }
};

// Gestion du temps
Scorm2004to12Wrapper.formatTime=function(ts){
  var sec = (ts % 60);
  ts -= sec;
  var tmp = (ts % 3600);  //# of seconds in the total # of minutes
  ts -= tmp;              //# of seconds in the total # of hours

  // convert seconds to conform to CMITimespan type (e.g. SS.00)
  sec = Math.round(sec*100)/100;
  
  var strSec = new String(sec);
  var strWholeSec = strSec;
  var strFractionSec = "";
  if (strSec.indexOf(".") != -1)
  {
    strWholeSec =  strSec.substring(0, strSec.indexOf("."));
    strFractionSec = strSec.substring(strSec.indexOf(".")+1, strSec.length);
  }
  
  if (strWholeSec.length < 2)
  {
    strWholeSec = "0" + strWholeSec;
  }
  strSec = strWholeSec;
  
  if (strFractionSec.length)
  {
    strSec = strSec+ "." + strFractionSec;
  }

  if ((ts % 3600) != 0 )
    var hour = 0;
  else var hour = (ts / 3600);
  if ( (tmp % 60) != 0 )
    var min = 0;
  else var min = (tmp / 60);

  if ((new String(hour)).length < 2)
    hour = "0"+hour;
  if ((new String(min)).length < 2)
    min = "0"+min;

  var rtnVal = hour+":"+min+":"+strSec;

  return rtnVal;
};
// récup de l'API
Scorm2004to12Wrapper.findAPI=function( win ){
  var theAPI=null;
  while ((win.API == null) &&(win.parent != null) &&(win.parent != win) ){
    this.findAPITries++;
    if ( this.findAPITries > 500 ){
      alert( "Error finding API -- too deeply nested." );
      return null;
    }
    win = win.parent;
  }
  if(win.API != null){
    theAPI=win.API;
  }
  return theAPI;
};

Scorm2004to12Wrapper.getAPI=function()
{
  var theAPI = this.findAPI(window);
  if ( (theAPI == null) &&(window.opener != null) &&(typeof(window.opener) != "undefined") )
  {
    theAPI = this.findAPI( window.opener );
  }
  if (theAPI == null){
    alert( "Unable to locate the LMS's API Implementation.\n" + "Communication with the LMS will not occur." );
    this.noAPIFound = true;
  }
  return theAPI;
};
Scorm2004to12Wrapper.getAPIHandle=function()
{
  if (this.apiHandle == null){
    if (this.noAPIFound == false){
      this.apiHandle = this.getAPI();
    }
  }
  return this.apiHandle;
};