from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


# ... the rest of your URLconf goes here ...

urlpatterns = patterns('',

    #****************************************************
    #
    #               Homepage
    #
    #****************************************************
    
    # - Render the homepage
    (r'^$', 'rwm_app.views.homepage'),

    # Handling user actions
    
    #****************************************************
    #
    #               User Management
    #
    #****************************************************
    
    # User actions: Post requests
    (r'^profie/new/$', 'rwm_app.views.new_user'),
    (r'^profie/login/$', 'rwm_app.views.login_user'),
    (r'^profie/logout/$', 'rwm_app.views.logout_user'), 
    (r'^rwm_proj/response.py', 'rwm_app.views.toserve'),
    
    # User management: Render user profile page
    (r'^profie/([^/]+)', 'rwm_app.views.profile'),

    #****************************************************
    #
    #               My Articles 
    #
    #****************************************************

    # Render the my articles view   
    (r'^my_articles/', 'rwm_app.views.my_articles'),
    
    #****************************************************
    #
    #               Render the iFrame
    #
    #****************************************************

    # Shown when the bookmarklet is activated   
    (r'^iframe/$', 'rwm_app.views.iframe_bookmarklet'),
    
    #****************************************************
    #
    #               Render Articles
    #
    #****************************************************

    # Renders the article shared by the user
    # Format: article/{article_id}/{user name}/{loc_url}
    (r'^article/([^/]+)/([^/]+)/([^/]+)', 'rwm_app.views.render_article'),
    
    #****************************************************
    #
    #               Article Handler
    #
    #****************************************************
    
    # - Ingest articles from the bookmarklet
    (r'^article_handler/$', 'rwm_app.views.article_handler'),
    
    #****************************************************
    #
    #               Comment Handler
    #
    #****************************************************
    
    # - Ingest and serve comments
    (r'^comment_handler/$', 'rwm_app.views.comment_handler'),
    
    #****************************************************
    #
    #               Admin
    #
    #****************************************************
    
    # - Render the admin view
  url(r'^admin/', include(admin.site.urls)),

)

urlpatterns += staticfiles_urlpatterns()

