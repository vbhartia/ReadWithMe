import requests
import django
from django.utils import simplejson
from django.http import HttpResponse
def on_receive(URL):
    r=requests.get("https://www.readability.com/api/content/v1/parser?url=http://nbcpolitics.nbcnews.com/_news/2013/06/19/19025800-liberals-brace-for-supreme-court-decision-on-voting-rights?lite&token=a2e24e752483855b1c02638584935961c96c4368");
    return HttpResponse(simplejson.dumps(r))