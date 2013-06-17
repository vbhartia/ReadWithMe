// RWM Bookmarklet Viewer
// Scrapes the page for content
// Creates an iFrame to host the content and log the user in.


//*************************************** Scrape the Web page ********************************************************************
// Get document parameters. 
// Overview: First check facebook defined opengraph protocols. If those are undefined use document paramaters.

// Define does not exist function
$.fn.doesExist = function(){
        return jQuery(this).length > 0;
 };

var doc_paras;
var final_article;

var doc_headline;
var doc_site_name;
var doc_author;
var doc_url;
var doc_description;
var doc_image_url;

// Get the headline
//  1. Open Graph - og:title
//  2. <h1> tag
//  3. <title> tag

if ($("meta[property='og:title']").doesExist())
{
    doc_headline = $("meta[property='og:title']").attr("content");
}
else if ($('h1').doesExist())
{
    doc_headline = $('h1').attr("content");
}
else if ($('h1').doesExist())
{
    doc_headline = $('title').attr("content");
}

// Get Author
//  1. Meta name="author"
//  2. "By" line text search

if ($("meta[name='author']").doesExist())
{
    doc_author = $("meta[name='author']").attr("content");
}
else
{
    doc_author = 'placeholder-author';
}

// Get the site name
//  1. Open Graph - og:site_name
//  2. URL Domain

if ($("meta[property='og:site_name']").doesExist())
{
    doc_site_name = $("meta[property='og:site_name']").attr("content");
}
else
{
    doc_site_name = document.location.hostname
}

    
// Get the original URL
//  1. Open Graph - og:url
//  2. URL Domain

if ($("meta[property='og:url']").doesExist())
{
    doc_url = $("meta[property='og:url']").attr("content");
}
else
{
    doc_url = document.location.hostname
}

// Get the description
//  1. Open Graph - og:description
//  2. Get the first line of text

if ($("meta[property='og:description']").doesExist())
{
    doc_description = $("meta[property='og:description']").attr("content");
}
else
{
    doc_description = 'placeholder';
}

// Get the image
//  1. Open Graph - og:image
//  2. URL Domain

if ($("meta[property='og:image']").doesExist())
{
    doc_image_url = $("meta[property='og:image']").attr("content");
}
else
{
    doc_image_url = 'placeholder';
}
    

//*************************************** Get Paragraph Array ********************************************************************
//Overview: 
//  1. Get all of the <p> tags. 
//  2. Do a wordcount in each <p> tag and compute an average for all <p> tags. 
//  3. If <p> tag is greater than average, include it as paragraph text


// Get all of the paragraphs
var para_array = []         //contains contents of all p section in a the document
var para_array_count = []
var para_count = 0;         //count of number of <p> sections
var final_paras = []        //final output of all paragraphs

$('p').each(
   function(index) {
       var text = $(this).text();
       para_array[index] = text;
       //alert(text);
       para_count = index;
   }  
);    

$.each(para_array, function(index) {
    
    para_array_count[index] = this.replace( /[^\w ]/g, "" ).split(' ').length
    
    }
)

var sum_of_word_count = 0;

$.each(para_array_count, function(index) {
    sum_of_word_count = sum_of_word_count + this
    }
)

average_word_count = (sum_of_word_count / para_array.length)

//compute the average 

$.each(para_array, function(index) {
    if (para_array_count[index] > average_word_count)
    {
        final_paras.push(this)
    }
    }
)

doc_paras = final_paras;

//*************************************** Assemble JSON Object to send to server ******************************************************************

final_article = new Object();
    final_article.headline = doc_headline;
    final_article.site_name = doc_site_name;
    final_article.author = doc_author;
    final_article.url = doc_url;
    final_article.description = doc_description;
    final_article.image_url = doc_image_url;
    final_article.paras = final_paras;

//*************************************** Create an iFrame and send content to the iFrame ******************************************************************



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

// URI encode the JSON paramater and send it to iFrame
var article_params = $.param(final_article);

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


 