from django.HttpRequest
def on_receive(URL):
    try:
        a = "https://www.readability.com/api/content/v1/parser?url=" + str(URL) + "&token=a2e24e752483855b1c02638584935961c96c43";
        return HttpRequest.GET(a);