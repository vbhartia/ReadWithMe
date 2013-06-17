// ensure Jquery is available

// the minimum version of jQuery we want
	var v = "1.3.2";

	// check prior inclusion and version
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false;
		var script = document.createElement("script");
		script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initMyBookmarklet();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		initMyBookmarklet();
	}


function initMyBookmarklet() {

    function addCSS(url){
      var headID = document.getElementsByTagName("head")[0];
      var cssNode = document.createElement('link');
      cssNode.type = 'text/css';
      cssNode.rel = 'stylesheet';
      cssNode.href = url;
      cssNode.media = 'screen';
      headID.appendChild(cssNode);
}

addCSS('http://127.0.0.1:8000/static/RWM_bookmarklet.css?x='+(Math.random()))    
    
    
// Define does not exist function
$.fn.doesExist = function(){
        return jQuery(this).length > 0;
 };

var doc_paras;
var final_article; 

//*************************************** Get Document Parameters ********************************************************************
// Get document parameters. Overview: First check facebook defined opengraph protocols. If those are undefined use document paramaters.

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
//Overview: Get all of the <p> tags. Do a wordcount in each <p> tag and compute an average for all <p> tags. If <p> tag is greater than average, include it as paragraph text


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

//alert(average_word_count)

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
//*************************************** AJAX submission of JSON to server ******************************************************************

json_response = JSON.stringify(final_article);

$.post('http://127.0.0.1:8000/serve_article/',
    json_response)
    
$.get('http://127.0.0.1:8000/serve_article/',
      {"unique_id": 1}
                )

//*************************************** Render on top of current screen ******************************************************************

/*
    final_article.headline = doc_headline;
    final_article.site_name = doc_site_name;
    final_article.author = doc_author;
    final_article.url = doc_url;
    final_article.description = doc_description;
    final_article.image_url = doc_image_url;
    final_article.paras = final_paras;
*/

/* Outside Container */
// transparent border around current page

    var RWM_container = "";
    
    RWM_container += "<div id='container_RWM_Viewer'>"
    RWM_container += "</div>"
    $('body').prepend(RWM_container)
            
/* Content Container */
// Contains actual page content

    var content_container_div = "";
    
    content_container_div += "<div id='content_RWM_Viewer'>"
    content_container_div += "<br/>"
    content_container_div += "</div>"
    $('#container_RWM_Viewer').append(content_container_div)
    
    /* Read with me header */

    var RWM_header = "";
    
    RWM_header += "<div id='header_RWM_Viewer'>"
        RWM_header += "<div class='links_RWM_Viewer' id='nav_RWM_Viewer'>" 
        
            RWM_header += "<div id='logo_RWM_Viewer'>"			
                RWM_header += "<a href ='/dashboard/'>"
                    RWM_header += "Read With Me"
                RWM_header +="</a>"
            RWM_header +="</div>"
        
            RWM_header +="<div id='nav_user_profile_RWM_Viewer'>"
                RWM_header +="<br/>"
                RWM_header +="placeholder"
            RWM_header +="</div>"
            
            RWM_header +="<br/>"
            RWM_header +="<br/>"
            RWM_header +="<br/>"
            RWM_header +="<br/>"
        
            RWM_header += "<div id='nav_menu_RWM_Viewer' class='page_text_RWM_Viewer'>"
                RWM_header += "<a href = '/MyArticles'> My Articles </a>"
            RWM_header += "</div>"   
               
        RWM_header += "</div>"
    RWM_header += "</div>"
    
    $('#content_RWM_Viewer').append(RWM_header)

    /* Read with me reading properties */

    var RWM_reading_properties = "";
    
    RWM_reading_properties += "<div id='article_reading_controls_RWM_Viwer_id' class='article_reading_controls_RWM_Viwer_class'>"
       
        RWM_reading_properties += "<span class='page_text_RWM_Viewer'>Change Article Presentation</span>"
        
        RWM_reading_properties += "<br />"
        RWM_reading_properties += "<br />"
        RWM_reading_properties += "<a id='background_text_setting_id'      class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Black Background, White Text "
        RWM_reading_properties += "</a>"

        RWM_reading_properties += "<a id='increase_text_size_id'           class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Increase Text Size "
        RWM_reading_properties += "</a>"
        
        RWM_reading_properties += "<a id='decrease_text_size_id'           class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Decrease Text Size "
        RWM_reading_properties += "</a>"

        RWM_reading_properties += "<a id='increase_line_spacing_id'        class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Increase Line Spacing "
        RWM_reading_properties += "</a>"
        
        RWM_reading_properties += "<a id='decrease_line_spacing_id'        class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Decrease Line Spacing "
        RWM_reading_properties += "</a>"
        
        RWM_reading_properties += "<a id='increase_word_spacing_id'        class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Increase Word Spacing "
        RWM_reading_properties += "</a>"
        
        RWM_reading_properties += "<a id='decrease_word_spacing_id'        class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Decrease Word Spacing "
        RWM_reading_properties += "</a>"

        RWM_reading_properties += "<a id='default_settings_id'             class='article_reading_controls_buttons_RWM_Viewer_class'>"
            RWM_reading_properties += "Default "
        RWM_reading_properties += "</a>"
        
        RWM_reading_properties += "<br />"
        
    RWM_reading_properties += "</div>"
    
    $('#content_RWM_Viewer').append(RWM_reading_properties)
    
// Setup table to handle article and comments
    
    var table_setup = "";
    
    table_setup += "<table>"
    table_setup += "<tr>"
    table_setup += "<td width='75%' id='article_content'>"
    table_setup += "</td>"
    table_setup += "<td id='comment_content' height='100'>"
    table_setup += "</td>"
    table_setup += "</tr>"
    table_setup += "</table>" 
 
    $('#content_RWM_Viewer').append(table_setup)
 
/********************************************* Article content container ***************/
    // Contains the actual article
    
    var article_container_div = "";
    
    article_container_div += "<div id='article_content_RWM_Viewer' class='article_content_RWM_Viewer_class'>"
    article_container_div += "<br/>"
    article_container_div += "</div>"
    $('#article_content').append(article_container_div)
        
    // Overall Comments container

    var overall_comment_div = "";
    
    overall_comment_div += "<div id='overall_comment_RWM_Viewer_id' class='overall_comment_RWM_Viewer_class'>"
        overall_comment_div += "Overall questions or comments on this article"
        overall_comment_div += "<br/>"
            overall_comment_div += "<div id='leave_comment_RWM_Viewer_id' class='leave_comment_RWM_Viewer_class'>"
                overall_comment_div += "<br/>"
                overall_comment_div += "click here to leave an overall comment about this article"
            overall_comment_div += "</div>"
        overall_comment_div += "<br/>"
        overall_comment_div += "<br/>"
    overall_comment_div += "</div>"
    $('#article_content_RWM_Viewer').append(overall_comment_div)
    
    /* insert headline */
    
    var headline_tag = "";
    
    headline_tag += "<br/>";
    headline_tag += "<div id='RWM_headline'>";
    headline_tag += doc_headline;
    headline_tag +="</div>"
    
    $('#article_content_RWM_Viewer').append(headline_tag)
    
    /* insert news source */
    
    var news_source_tag = "";
    
    news_source_tag += "<br/>";
    news_source_tag += "<div id='RWM_news_source'>";
    news_source_tag += doc_site_name;
    news_source_tag +="</div>"
    
    $('#article_content_RWM_Viewer').append(news_source_tag)
    
    /* insert image */    

    var news_image_url_tag = "";
    
    news_image_url_tag += "<br/>";
    news_image_url_tag += "<img src='";
    news_image_url_tag += doc_image_url;
    news_image_url_tag +="' height='50%' width='50%' />"
    
    $('#article_content_RWM_Viewer').append(news_image_url_tag)
    
    /* author */
    
    var author_tag = "";
    
    author_tag += "<br/>";
    author_tag += "<div id='RWM_author'>";
    author_tag += doc_author;
    author_tag +="</div>"
    
    $('#article_content_RWM_Viewer').append(author_tag)
    
    /* paragraphs */
     
    var wordcount = 0;
   
    var para_tag = "";
    var para_words = "";
    
    para_tag += "<br/>";
    para_tag += "<div id='RWM_para'>";
    
    // Go through each paragraph, creating a div for each paragraph
    
    for (var i in final_paras) 
    {
        para_tag += "<p>"
        
        //para_tag += final_paras[i]
        
        var individual_para = final_paras[i]
        
        para_words = individual_para.split(" ")
        
        //alert(para_words)
        //para_tag += para_words
        
        // Go through each word in the paragraph, creating a span and id for each word
        
        for (var j in para_words) 
        {
            para_tag += "<span id='p" + wordcount + "'>"
            para_tag += para_words[j] + " "
            para_tag += "</span>" 
            wordcount++;
        }
        

        para_tag += '</p>';    
    }
    para_tag += '</div>';
        
    $('#article_content_RWM_Viewer').append(para_tag)
    
    // Comment container
    
    var comment_tag = "";
    
    comment_tag += "<div id='article_comments_id'>"
    comment_tag +='<br />'
    comment_tag +='<br />'
    comment_tag +='</div>'

    var uri_to_iframe = $.param(final_article);
    
    alert(uri_to_iframe)
    
    var iframebase = 'http://127.0.0.1:8000/static/testhost.html?'
    
    var full_iframe_url = iframebase + uri_to_iframe
    alert(full_iframe_url)
    
    comment_tag +='<iframe src="' + full_iframe_url + '">'
    comment_tag +='</iframe>'        
        
    $('#comment_content').append(comment_tag)
        
/********************************************* Enable Commenting ***************/

    aComment_Array = []

    //******* Comment Object ********
    // Defines the comment object
    function Document_Comments(id_input, username_input, comment_input)
    { 
        // Span Id of where comment will be stored
        this.id = id_input;
        this.username = username_input;
        this.comment = comment_input;
        this.color = '#94ffb8';
    }   

/********************************************* Input Comments ***************/

    var ids = new Array();

    // get user selection
    var getAllBetween = function (firstEl,lastEl) 
    {
        var firstElement = $(firstEl); // First Element
        var lastElement = $(lastEl); // Last Element
        var collection = new Array(); // Collection of Elements
        collection.push(firstElement.attr('id')); // Add First Element to Collection
        $(firstEl).nextAll().each(function()
        { // Traverse all siblings
            var siblingID  = $(this).attr('id'); // Get Sibling ID
            if (siblingID != $(lastElement).attr('id')) 
            { // If Sib is not LastElement
                collection.push($(this).attr('id')); // Add Sibling to Collection
            } 
            else 
            { // Else, if Sib is LastElement
                collection.push(lastElement.attr('id')); // Add Last Element to Collection
                return false; // Break Loop
            }
        });         
        return collection; // Return Collection
    }
    
    $('span').mouseup(function(event)
    {       
        ids = new Array();
        if (window.getSelection) 
        { // non-IE
            userSelection = window.getSelection();
            rangeObject = userSelection.getRangeAt(0);
            if (rangeObject.startContainer == rangeObject.endContainer) 
            {   
                ids = rangeObject.startContainer.parentNode.id
            } 
            else 
            {   
                ids = getAllBetween(
                    rangeObject.startContainer.parentNode,
                    rangeObject.endContainer.parentNode)
            
            }
        } 
        else if (document.selection) 
        { // IE lesser
            userSelection = document.selection.createRange();
            
                
            if (userSelection.htmlText.toLowerCase().indexOf('span') >= 0) 
            {
                $(userSelection.htmlText).filter('span').each(function(index, span) 
                {
                    ids.push(span.id);
                });
            } else 
            {
                ids = userSelection.parentElement().id;
            }
        }
        
        CreateComment()
    });


    // get user selection

    function CreateComment()
    {
        var divCommentLoc  = $('#article_comments_id').offset();
        var lastTag = ids[ids.length - 1]
        lastid = '#' + lastTag
        
        var commentLoc = $(lastid).offset();
        var commentID = lastTag;
        
        var user_comment = "";
            user_comment += "<div class='rwm_comment_class' "
            user_comment += "style='top:"
            user_comment += (commentLoc.top - divCommentLoc.top)
            user_comment +="px'>"
            user_comment +='<strong>' + "varun" + ': </strong>'
            user_comment +='<input type="text" id="user_comment_RWM_Viewer"/>'
            user_comment +='</div>'
            

        $('#article_comments_id').prepend(user_comment)

        $('#article_comments_id').prepend(user_comment)
        
        for(x in ids)
        {
            $(('#' + ids[x])).css('background', 'yellow')
        }
        
        $('input') // retrieve all inputs
                .keydown(function(e) { // bind keydown on all inputs
                if (e.keyCode == 13)
                {   
                    // enter was pressed
                    $(this).closest('input').submit(); // submit the current form
                }
             });
            
        $('input').submit(
        function()
            {
            aComment_Array.push(
                new Document_Comments(
                        '#'+commentID, 
                        'varun',     
                        $('#user_comment_RWM_Viewer').val()
                                    )
                                );
            // send comment to server
            
            CommentPresentation()
                                        
            }
        )    
    }

    /************************* Presenting Comments ******************/
    function CommentPresentation()
    {
        //clear all previous comments
        $('#article_comments_id').html('');
                    
        var divCommentLoc = $('#article_comments_id').offset()
                    
        for (var i=0; i < aComment_Array.length; i++)
        {
            //Individual Comment Offset
            var commentLoc = $(aComment_Array[i].id).offset()
                        
            $(aComment_Array[i].id).css('background', 'yellow');
        
            var user_comment = "";
            user_comment += "<div class='rwm_comment_class' "
            user_comment += "style='top:"
            user_comment += (commentLoc.top - divCommentLoc.top)
            user_comment += "px'>"
            user_comment += '<strong>'
            user_comment += aComment_Array[i].username + ': <br/>'
            user_comment += '</strong>'
            user_comment += aComment_Array[i].comment
            user_comment +='</div>'

            $('#article_comments_id').prepend(user_comment)
        }
    }
    
    /********************************************* Reading Properties ***************/

    //default text properties
    var textsize = 16;
    var wordSpacing = 1;
    var lineheight = 2;

    ReadingProperties()
    
    $('#background_text_setting_id').mousedown(function() 
    {
      $('#article_content_RWM_Viewer_class').animate(
        {
            backgroundColor: "black",
            color: "white",
        },    
        1000 );
    })

    $('#increase_text_size_id').mousedown(function() 
    {
        textsize++;
        ReadingProperties()
    })
    
    $('#decrease_text_size_id').mousedown(function() 
    {
        textsize--;
        ReadingProperties()
    })

    $('#increase_word_spacing_id').mousedown(function() 
    {
        wordSpacing++;
        ReadingProperties()
    })
    
    $('#decrease_word_spacing_id').mousedown(function() 
    {
        wordSpacing--;
        ReadingProperties()
    })
    
    $('#increase_line_spacing_id').mousedown(function() 
    {
        lineheight = lineheight + .1;
        ReadingProperties()
    })
    
    $('#decrease_line_spacing_id').mousedown(function() 
    {
       lineheight = lineheight - .1;
       ReadingProperties()
    })
    
    $('#default_settings_id').mousedown(function() 
    {
        wordSpacing = 1;
        textsize = 16;
        lineheight = 2;
        
        $('#RWM_para').css('background', 'white');
        $('#RWM_para').css('color', 'black');
        
        ReadingProperties()
    })
    
    //******* Apply Reading Properties ********
    function ReadingProperties()
    {            
        //$("#article_content_RWM_Viewer").css("font-size",textsize);
        //$("#article_content_RWM_Viewer").css("word-spacing",wordSpacing);
        //$("#article_content_RWM_Viewer").css("line-height",lineheight);
        //RWM_para
    
        $("#RWM_para").css("font-size",textsize);
        $("#RWM_para").css("word-spacing",wordSpacing);
        $("#RWM_para").css("line-height",lineheight);
    //RWM_para
    
    }


    

}

