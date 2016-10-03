window.onLoad = getComments();

function getComments()
{
	var uri = "http://redsox.tcs.auckland.ac.nz/ups/UniProxService.svc/htmlcomments"
	var request = new XMLHttpRequest();
    request.open("GET", uri, true);
    request.onload = function ()
    {
		console.log("Response text:", request.responseText);
    	var response = JSON.parse(request.responseText);
        console.log(response.value);
    }
    request.send(null);
}

function showComments(dest)
{
	var tableContent = "<tr class='orderTitle'><td>Order ID</td><td>Destination/<td></tr>\n";
    for (var i in comments)
    {
    	var record = comments[i];
        
    }
}