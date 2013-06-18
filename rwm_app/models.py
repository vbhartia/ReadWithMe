from django.db import models

from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    invitation_code = models.CharField(max_length=100)
    def __unicode__(self):
        return self.user.username
                    
class reader_article_store(models.Model):
    headline = models.TextField()
    author = models.TextField()
    description = models.TextField()
    image_url = models.URLField()
    article_JSON = models.TextField()
    comments_JSON = models.TextField()
    shared_by = models.ForeignKey(UserProfile)
    publication_date = models.DateField()
    shared_date = models.DateField()
    def __unicode__(self): 
        return self.headline
# Create your models here.
