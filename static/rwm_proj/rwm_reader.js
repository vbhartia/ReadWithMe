// RWM Bookmarklet Viewer
// Scrapes the page for content
// Creates an iFrame to host the content and log the user in.


//var js = document.createElement("script");

//js.type = "text/javascript";
//js.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";

//document.head.appendChild(js);
var final_article;

var js = document.createElement("script");

js.type = "text/javascript";
//js.src = "http://127.0.0.1:8000/static/screen_scraper.js?x="+(Math.random());

function parse(){

    var a=$.get({
        type: "get",
        url: "/static/rwm_proj/response/on_receive",
        dataType: "json",
        async:true,
    });
    final_article={a.title,a.domain,a.author,a.url,a.excerpt,a.lead_image_url,a.content};
    
/*
    function httpGet("/static/rwm_proj/response.py")
    {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/static/rwm_proj/response.py", false );
    xmlHttp.send( document.URL );
    return xmlHttp.responseText;
    }
    */
}

document.head.appendChild(js);

var final_article = Get_Article_Content()


//*************************************** Create an iFrame ******************************************************************


// Get CSS for the reader
function addCSS(url){
  var headID = document.getElementsByTagName("head")[0];
  var cssNode = document.createElement('link');
  cssNode.type = 'text/css';
  cssNode.rel = 'stylesheet';
  cssNode.href = url;
  cssNode.media = 'screen';
  headID.appendChild(cssNode);
}

addCSS('http://127.0.0.1:8000/static/RWM_reader.css?x='+(Math.random()))  

// Setup the outside container - darken the background
var RWM_container = "";
RWM_container += "<div id='container_RWM_reader_id'class='container_RWM_reader_class'>"
RWM_container += "</div>"
$('body').prepend(RWM_container)

// Setup the iFrame container - 95% height and width
var iFrame_container = "";
iFrame_container += "<div id='iFrame_container_RWM_reader_id' class='iFrame_container_RWM_reader_class'>"
iFrame_container += "</div>"
$('#container_RWM_reader_id').append(iFrame_container)

// Animate the entrance for the RWM Viewer
$('#container_RWM_reader_id').css("top", "-100%")

$('#container_RWM_reader_id').animate(
    {
        top: '0%'
    }, 
    2000 
);

// Create an iFrame

// URI encode the JSON paramater and send it to the server
//var article_params = $.param(final_article);

var URL_for_iFrame = "";
URL_for_iFrame += "http://127.0.0.1:8000/iframe/"
//URL_for_iFrame += article_params

//alert(URL_for_iFrame)

var create_iFrame = "";
create_iFrame += "<iframe width='100%' id='reader_iFrame' height='100%' src='"
create_iFrame += URL_for_iFrame
create_iFrame += "'>"
create_iFrame += "</iframe>"
$('#iFrame_container_RWM_reader_id').append(create_iFrame)

// Post a message to the iFrame

var timesRun = 0;

var interval = setInterval(function()
{
    timesRun += 1;
    if(timesRun == 60)
    {
        clearInterval(interval)
    }

    var win = document.getElementById("reader_iFrame").contentWindow

    win.postMessage(
        final_article,
        "http://127.0.0.1:8000/")    
        //alert('message sent')
},
500)

//*************************************** Post a message to the server ******************************************************************

 