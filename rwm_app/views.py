from django.contrib.auth import authenticate
from django.contrib.auth.models import User# Create your views here.

#sfrom django.views.decorators.csrf import csrf_protect 

import os
import re
import json
from django.utils import simplejson
import time

from django.db import models
from django.shortcuts import render
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib.auth import logout, login

#Models
from rwm_app.models import UserProfile, reader_article_store


#**************************************************
#
#           View the homepage
#
#**************************************************                            

def homepage(request):   
    return render_to_response(
                            'main_RWM_template.html',
                                { 
                                  'show':'homepage',
                                  'user':request.user, 
                                }
                             )

#**************************************************
#       
#            Creating a new user
#            
#**************************************************
                            
def new_user(request):
    state = "NEW USER!"
    invite_code = username = password = email = first = last = ''
    if request.POST:
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        first = request.POST.get('first')
        last = request.POST.get('last')
        invite_code = request.POST.get('invite_code')

        if invite_code != 'SecJ2014':
            state = "Not Valid. Sorry!"
            return render_to_response(
                                'main_RWM_template.html',
                                    { 
                                    'show':'login', 
                                    'state':state, 
                                    }
                                )
            
        user = User.objects.create_user(username, email, password)
        user.first_name = first
        user.last_name = last
        
        user.save()
        
        new_UserProfile = UserProfile(invitation_code = invite_code, user = user);
        
        new_UserProfile.save()
        
        logged_in_user = authenticate(username = username, password = password)

        logout(request)

        login(request, logged_in_user)
        
    return login_user(request)
                             
#**************************************************
#
#       Logging out 
#
#**************************************************
                            
def logout_user(request):
    logout(request)
    return homepage(request)

#**************************************************
#
#       Logging in users
#
#**************************************************
                           
def login_user(request):
    state = "You need to login to access anything! Please log in below..."
    user = all_user_groups =username = password = ''
        
    #If logged in, direct to dashboard page.
    if request.user.is_authenticated():
        return my_articles(
                        request
                        )

    #If not logged in, direct to login page.
    if request.POST: 
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                return login_user(request)
            else:
                state = "Your account is not active, please contact the site admin."
        else:
            state = "Your username and/or password were incorrect."
    
    # User is not logged in. Render login page    
    return homepage(request)

#**************************************************
#
#       Show user profile
#
#**************************************************
           
def profile(request):
    # Check if user is logged in. If not, direct to login page
    if not request.user.is_authenticated():
        return render_to_response(
                        'home.html',
                            { 
                            'show':'login', 
                            'state':"You are not logged in"
                            }
                        )
    current_user = User.objects.get(username = request.user.username)
    current_id = current_user.id
    
    current_UserProfile = UserProfile.objects.get(user = request.user.id)
 

    return render_to_response(
                        'main_RWM_template.html',
                            {
                             'user':request.user,
                             'nav_RWMuser':current_UserProfile,
                             'show':'profile', 
                             }
                        )

#**************************************************
#
#       Update user profile
#
#**************************************************
           
def profile_update(request):
    # Check if user is logged in. If not, direct to login page
    if not request.user.is_authenticated():
        return render_to_response(
                        'home.html',
                            { 
                            'show':'login', 
                            'all_users':User.objects.all(), 
                            'state':"You are not logged in"
                            }
                        )
    current_user = User.objects.get(username = request.user.username)
    current_id = current_user.id

    current_user.username = request.POST.get('username')
    current_user.email = request.POST.get('email')
    current_user.first_name = first = request.POST.get('first')
    current_user.last_name = last = request.POST.get('last')
    
    if request.POST.get('password') != '':
      current_user.set_password(request.POST.get('password'))
      print 'changed password'
      print request.POST.get('password')

    current_user.save()
 

    return render_to_response(
                        'main_RWM_template.html',
                            {
                             'user':request.user,
                             'show':'profile', 
                             }
                        )


#**************************************************
#
#       Render user homepage view
#
#**************************************************
                            
def my_articles(request):
# Check if user is logged in. If not, direct to login page
    if not request.user.is_authenticated():
        return render_to_response(
                        'main_RWM_template.html',
                            { 
                                'show':'homepage', 
                            }
                        )

    current_user = User.objects.get(username = request.user.username)
    current_UserProfile = UserProfile.objects.get(user = request.user.id)

    all_user_articles = current_UserProfile.reader_article_store_set.all()

    return render_to_response(
                            'main_RWM_template.html',
                                {
                                'show':'my_articles',
                                'user':request.user,
                                'user_articles':all_user_articles,
                                }
                            )

#**************************************************
#
#       Render Articles
#
#**************************************************        

# Renders the view when the article is viewed by others

# Format: article/{article_id}/{user name}/{loc_url}
# Test URL: http://127.0.0.1:8000/article/1/vbhartia/I_like_rice          
def render_article(request, article_id, user_name, loc_url):
    return render_to_response(
                            'main_RWM_template.html',
                                {
                                'show':'article_base',
                                'user':request.user,
                                }
                            )


#**************************************************
#
#       Render the iframe
#
#**************************************************

# - Render the iFrame

def iframe_bookmarklet(request):
    return render_to_response(
                            'iFrame_view.html',
                                {
                                'user':request.user
                                }
                            )         
                             
#**************************************************
#
#       End Point to handle articles
#
#**************************************************

# - Ingest articles
# @csrf_protect
def article_handler(request):

    if request.method == 'POST':
        json_data = simplejson.loads(request.raw_post_data)
        current_UserProfile = UserProfile.objects.get(user = request.user.id)
        
        # Create a loc URL
        loc_url_from_headline = json_data['headline']
        loc_url_from_headline = loc_url_from_headline.replace(" ", "_")
        loc_url_from_headline = loc_url_from_headline.replace(",", "_")
        loc_url_from_headline = loc_url_from_headline.replace("\"", "_")
        loc_url_from_headline = loc_url_from_headline.replace(".", "_")
        loc_url_from_headline = loc_url_from_headline.replace("/", "_")
        loc_url_from_headline = loc_url_from_headline.replace("\\", "_")
        loc_url_from_headline = loc_url_from_headline.replace("#", "_")
        loc_url_from_headline = loc_url_from_headline.replace(":", "_")
        loc_url_from_headline = loc_url_from_headline.replace("'", "_")
        loc_url_from_headline = loc_url_from_headline.replace("?", "_")
        print loc_url_from_headline


        new_article = reader_article_store(
                    headline = json_data['headline'],
                    author = json_data['author'],
                    loc_url = loc_url_from_headline,
                    description = json_data['description'],
                    image_url = json_data['image_url'],
                    article_JSON = request.raw_post_data,
                    comments_JSON = '',
                    shared_by = current_UserProfile,
                    publication_date = '2013-05-20',
                    shared_date = '2013-05-20',
                    )


    
        new_article.save()
        print new_article.id
        print current_UserProfile.user.username

        article_info_response = {
         'article_id': new_article.id,
         'username': current_UserProfile.user.username,
        }

        data = simplejson.dumps(article_info_response)

        return HttpResponse(data, mimetype='application/json')

    if request.method == 'GET':
      print 'here'
      userName = request.GET.get('userName', '')
      article_id = request.GET.get('articleId', '')

      print userName
      print article_id

      currArticle = reader_article_store.objects.get(id = article_id)

      print currArticle

      currArticle_json = {
         'headline': currArticle.headline,
         'author': currArticle.author,
         'description': currArticle.description,
         'image_url': currArticle.image_url,
         'article_JSON': currArticle.article_JSON,
         'shared_by': currArticle.shared_by.user.username,
         #'publication_date': currArticle.publication_date,
         #'shared_date': currArticle.shared_date,
      }

      data = simplejson.dumps(currArticle_json)

      return HttpResponse(data, mimetype='application/json')
                             
#**************************************************
#
#       End Point to handle comments
#
#**************************************************

# - Post and serve articles
def comment_handler(request):

  if request.method == 'POST':
      json_data = simplejson.loads(request.raw_post_data)
      current_article = reader_article_store.objects.get(id = json_data['articleid'])
      
      current_article.comments_JSON = request.raw_post_data
  
      current_article.save()

      print current_article.comments_JSON
      print json_data['articleid']
      return HttpResponse('ok')



  if request.method == 'GET':
      article_id = request.GET.get('article_id', '')
      print article_id
      current_article = reader_article_store.objects.get(id = article_id)

      data = simplejson.dumps(current_article.comments_JSON)
      return HttpResponse(data, mimetype='application/json')


  return HttpResponse('ok')