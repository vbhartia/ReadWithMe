// RWM Bookmarklet Viewer
// Scrapes the page for content
// Creates an iFrame to host the content and log the user in.



var js = document.createElement("script");

js.type = "text/javascript";
js.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";

document.head.appendChild(js);

var domain = "http://rwm-stage.herokuapp.com/"
//var domain = "http://127.0.0.1:8000"

var scraper_url = domain + "/static/screen_scraper.js?x=" + (Math.random())
var final_article

setTimeout(function()
{
  $.getScript(scraper_url, function()
  {
    final_article = Get_Article_Content()
    create_container()
  })
},
500);

//*************************************** Create a container ******************************************************************

function create_container()
{
  
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
  
  addCSS(domain + '/static/RWM_reader.css?x='+(Math.random()))  
  

  // Setup the outside container - darken the background
  var RWM_container = "";
  
  //RWM_container += "<style>"

  //RWM_container += "</style>"

  RWM_container += "<div id='container_RWM_reader_id'class='container_RWM_reader_class'>"

    RWM_container += "<div class='page_text_RWM_Viewer' style='text-align:left'>"
        RWM_container += "Return to article"
    RWM_container += "</div>"

  RWM_container += "</div>"
  $('body').prepend(RWM_container)

  // Close the article window

  $('#container_RWM_reader_id').click(function() 
    {
        // turn off scrolling on master windwow
        document.body.style.overflow = 'visible';
        
      $('#container_RWM_reader_id').hide('slow', function() 
      {
      });
      

      //$('#container_RWM_reader_id').hide('slide', {}, 1000);

    });

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
      1000 
  );

  create_iFrame()
}

//*************************************** Create an iFrame ******************************************************************

function create_iFrame()
{

  var URL_for_iFrame = "";
  URL_for_iFrame += domain + "/iframe/"
  //URL_for_iFrame += article_params

  var create_iFrame = "";
  create_iFrame += "<iframe width='100%' id='reader_iFrame' height='100%' src='"
  create_iFrame += URL_for_iFrame
  create_iFrame += "'>"
  create_iFrame += "</iframe>"
  $('#iFrame_container_RWM_reader_id').append(create_iFrame)

  // turn off scrolling on master windwow
  //document.body.style.overflow = 'hidden'

  $('body').css('overflow', 'hidden')

  // Post a message to the iFrame

  var timesRun = 0;

  var interval = setInterval(function()
  {
      timesRun += 1;
      if(timesRun == 60)
      {
          clearInterval(interval)
      }

      //*************************************** Post a message to the server ******************************************************************

      var win = document.getElementById("reader_iFrame").contentWindow

      win.postMessage(
          final_article,
          domain)    
  },
  500)

}




 