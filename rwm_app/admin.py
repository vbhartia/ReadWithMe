from django.contrib import admin
from rwm_app.models import UserProfile
from rwm_app.models import reader_article_store

admin.site.register(UserProfile)
admin.site.register(reader_article_store)