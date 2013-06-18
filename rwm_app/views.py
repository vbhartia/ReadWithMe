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
from django.contrib.auth import logout

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
                                    'all_users':User.objects.all(), 
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
        
    return login_user(request)
                             
#**************************************************
#
#       Logging out 
#
#**************************************************
                            
def logout_user(request):
    logout(request)
    return render_to_response(
                            'home.html',{
                                   'show':'login', 
                                   'all_user_profile':UserProfile.objects.all(),  
                                   'state':'You are now logged out'
                                   }
                           )

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
    return render_to_response(
                            'home.html',
                                {                                
                                'show':'login', 
                                'state':state, 
                                }
                            )

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
                            'all_users':User.objects.all(), 
                            'state':"You are not logged in"
                            }
                        )
    current_user = User.objects.get(username = request.user.username)
    current_id = current_user.id
    
    current_UserProfile = UserProfile.objects.get(user = request.user.id)
 

    return render_to_response(
                        'home.html',
                            {
                             'user':request.user,
                             'nav_RWMuser':current_UserProfile,
                             'show':'profile', 
                             'all_user_profile':UserProfile.objects.all(), 
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

    return render_to_response(
                            'main_RWM_template.html',
                                {
                                'show':'my_articles',
                                'user':request.user
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
                                'show':'article_base',
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
    
    #print(request.raw_post_data)

    if request.method == 'POST':
        json_data = simplejson.loads(request.raw_post_data)
        current_UserProfile = UserProfile.objects.get(user = request.user.id)
        
        new_article = reader_article_store(
                    headline = json_data['headline'],
                    author = json_data['author'],
                    description = json_data['description'],
                    image_url = 'http://www.google.com',
                    article_JSON = request.raw_post_data,
                    comments_JSON = '',
                    shared_by = current_UserProfile,
                    publication_date = '2013-05-20',
                    shared_date = '2013-05-20',
                    )
    
        new_article.save()
        print new_article.id
        return HttpResponse('ok')

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
      current_article = reader_article_store.objects.get(id = 1)
      
      current_article.comments_JSON = request.raw_post_data
  
      current_article.save()
      print current_article.comments_JSON
      print json_data
      return HttpResponse('ok')

  if request.method == 'GET':

      current_article = reader_article_store.objects.get(id = 1)

      data = simplejson.dumps(current_article.comments_JSON)
      return HttpResponse(data, mimetype='application/json')


  return HttpResponse('ok')
  
def toserve(request):
    return;