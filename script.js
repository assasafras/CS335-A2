
function service (url, method, makeRequest)
{
	this.url = url;
	this.method = method;
	this.makeRequest = makeRequest;
	
	this.getQualifiedURL = function (option)
	{
		if (option === undefined) option = '';
		return redsoxService.baseURL + this.url + option;
	}
}

colours = 
{
	hover: '#2042AA',
	down: '#052184',
	none: '#104284'
}

redsoxService = 
{
	baseURL 	 : 'http://redsox.tcs.auckland.ac.nz/ups/UniProxService.svc/',
	comment 	 : new service('comment?name=', 'POST'),
	courses 	 : new service('courses', 'GET', makeRequestCourses),
	htmlcomments : new service('htmlcomments', 'GET', makeRequestGuestBook),
	id 			 : new service('id', 'GET' ),
	news 		 : new service('news', 'GET', makeRequestNews),
	newsfeed 	 : new service('newsfeed', 'GET' ),
	notices 	 : new service('notices', 'GET', makeRequestNotices),
	noticesfeed  : new service('noticesfeed', 'GET' ),
	people 		 : new service('people', 'GET', makeRequestPeople),
	person 		 : new service('person', 'GET' ),
	user 		 : new service('user', 'GET' ),
	vcard 		 : new service('vcard', 'GET' ),
	version 	 : new service('version', 'GET' )
}

function handleTextBoxClicked(elementID, defaultText)
{
	var target = document.getElementById(elementID);
	if (target.value.toLowerCase() === defaultText.toLowerCase())
	{
		target.value = "";
	}
}

function makeRequestCourses()
{
	var uri = redsoxService.courses.getQualifiedURL();
	console.log(uri);
	var xhr = new XMLHttpRequest();
	xhr.open(this.method, uri, true);
	xhr.onload = function() {
		processCourses(xhr.responseText);
	};
	xhr.send(null);
}

function processCourses(responseText)
{
	var responseObject = JSON.parse(responseText);
	var innerHTML = '';
	var coursePaperSection = responseObject.courses.coursePaperSection;
	for (course of coursePaperSection)
	{
		var prereq = course.prerequisite;
		var title = course.subject.courseA;
		title += (course.title === '') ? '' : ' - ' + course.title;
		
		innerHTML += 	'<div class="sub-heading-container">' + title + '</div>';
		innerHTML += 	'<div class="profile-container">'
		innerHTML += 		'<p class="item-paragraph">' + course.description + '</p>';
		innerHTML += 		'<p class="item-paragraph">' + course.subject.points + '</p>';
		if(course.prerequisite !== undefined)
			innerHTML += 	'<p class="item-paragraph">' + course.prerequisite + '</p>';
		innerHTML += 	'</div>';
		innerHTML += '</div>';
		innerHTML += '<div class="spacer"></div>';
	}
	var dynamicContent = getDynamicContentOfSection(section.courses)
	dynamicContent.innerHTML = innerHTML;
}

function makeRequestPeople()
{
	var uri = redsoxService.people.getQualifiedURL();
	console.log(uri);
	var xhr = new XMLHttpRequest();
	xhr.open(this.method, uri, true);
	xhr.onload = function() {
		processPeople(xhr.responseText);
	};
	xhr.send(null);
}

function processPeople(responseText)
{
	var people = JSON.parse(responseText).list;
	console.log(people);
	 var innerHTML = '';
	// var coursePaperSection = responseObject.courses.coursePaperSection;
	for (person of people)
	{
		var fullname = person.firstname + ' ' + person.lastname;
		var fullTitle = (person.title == undefined) ? fullname : person.title + " " + fullname;
		var email = person.emailAddresses[0];
		var imageID = person.imageId;
		var profileURL = person.profileUrl[0];
		if (imageID != undefined)
			imageURL = 'https://www.cs.auckland.ac.nz/people/imageraw/' + profileURL + '/' + imageID + '/smallest';
		else
			imageURL = 'https://www.cs.auckland.ac.nz/people/imageraw/no-person/0/small';
		
		innerHTML += '<div class="person-container">';
		innerHTML += 	'<div class="sub-heading-container">' + fullTitle + '</div>';
		innerHTML += 	'<div class="profile-container">';
		innerHTML += 		'<div class="profile-image"><img width="100px" height="100px" src=' + imageURL + '>'+ '</div>';
		innerHTML += 		'<div class="profile-details">';
		if (person.extn != undefined)
			innerHTML +=		'<p><span style="font-size: larger">&#9742;</span>' + person.extn + '</p>';
		else 
			innerHTML += 		'<p></p>';
		innerHTML += 			'<p><span style="font-size:larger">&#9993;</span> <a href="mailto:' + email + '">' + email + '</a></p>';
		innerHTML += 			'<p><span style="font-size:larger">&#128450;</span> <a href="http://redsox.tcs.auckland.ac.nz/ups/UniProxService.svc/vcard?u=' + profileURL + '">Save to contacts</a></p>';
		innerHTML += 		'</div>'
		innerHTML += 	'</div>'
		innerHTML += '</div>'
		innerHTML += '<div class="spacer"></div>'
		// innerHTML += '<p>' + course.subject.points + '</p>\n';
		// if(course.prerequisite !== undefined)
			// innerHTML += '<p>' + course.prerequisite + '</p>\n';
	}
	var dynamicContent = getDynamicContentOfSection(section.people)
	dynamicContent.innerHTML = innerHTML;
}

function postComment()
{
	console.log("posting comment!");
	var postContentElement = document.getElementById('post-content');
	var post = '"' + postContentElement.value + '"';
	// Clear the text box;
	postContentElement.value = "";
	// Don't post if the user hasn't input anything.
	if (post == '""') return;
	var username = document.getElementById('post-name').value;
	username = username.replace(" ", "+");
	if (username === "") username = "anonymous"
	var xhr = new XMLHttpRequest();
	xhr.open("POST", redsoxService.comment.getQualifiedURL(username), true);
	xhr.onload = function() {
		
		// Refresh the guest book page.
		populateGuestBook();
	};
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.send(post);
}

function makeRequestNews()
{
	var uri = redsoxService.news.getQualifiedURL();
	console.log(uri);
	xhr = new XMLHttpRequest();
	xhr.open(this.method, uri, true);
	xhr.onload = function() {
		processNews(xhr.responseXML);
	};
	xhr.send(null);
}

function processNews(responseXML)
{
	var innerHTML = '';
	var RSSItems = responseXML.documentElement.childNodes;
	for (RSSItem of RSSItems)
	{
		var newsItem = {};
		for(field of RSSItem.children)
		{
			newsItem[field.nodeName] = field.innerHTML;
		}
		console.log('newsItem:', newsItem);
		innerHTML += '<div class="person-container">';
		innerHTML += 	'<div class="sub-heading-container"><a class="heading-link" href="' + newsItem.linkField + '">' + newsItem.titleField + '</a></div>\n';
		innerHTML += 	'<div class="profile-container"><p class="item-paragraph">' + newsItem.descriptionField + '</p></div>';
		innerHTML += '</div>';
		innerHTML += '<div class="spacer"></div>';
	}
	
	var dynamicContent = getDynamicContentOfSection(section.news)
	dynamicContent.innerHTML = innerHTML;
}

function makeRequestGuestBook()
{
	var uri = redsoxService.htmlcomments.getQualifiedURL();
	console.log(uri);
	xhr = new XMLHttpRequest();
	xhr.open(this.method, uri, true);
	xhr.onload = function() {
		console.log(xhr);
		processGuestBook(xhr.responseText);
	};
	xhr.send(null);
}

function processGuestBook (responseText)
{
	console.log('processGuestBook called!');
	var dynamicContent = getDynamicContentOfSection(section.guestbook)
	dynamicContent.innerHTML = responseText;
}

function makeRequestNotices()
{
	var uri = redsoxService.notices.getQualifiedURL();
	console.log(uri);
	xhr = new XMLHttpRequest();
	xhr.open(this.method, uri, true);
	xhr.onload = function() {
		processNotices(xhr.responseXML);
	};
	xhr.send(null);
}

function processNotices(responseXML)
{
	var innerHTML = '';
	var RSSItems = responseXML.documentElement.childNodes;
	for (RSSItem of RSSItems)
	{
		var newsItem = {};
		for(field of RSSItem.children)
		{
			newsItem[field.nodeName] = field.innerHTML;
		}
		console.log('newsItem:', newsItem);
		innerHTML += '<div class="person-container">';
		innerHTML += 	'<div class="sub-heading-container"><a class="heading-link" href="' + newsItem.linkField + '">' + newsItem.titleField + '</a></div>\n';
		innerHTML += 	'<div class="profile-container"><p class="item-paragraph">' + newsItem.descriptionField + '</p></div>';
		innerHTML += '</div>';
		innerHTML += '<div class="spacer"></div>';
	}
	
	var dynamicContent = getDynamicContentOfSection(section.notices)
	dynamicContent.innerHTML = innerHTML;
}

function onWindowLoaded()
{
	// get all the nav links.
	var navLinks = document.getElementsByClassName("nav-link");
	// Add click listener to each of the nav links.
	for(link of navLinks)
	{
		link.onmouseup    = link_handleClick;
		link.onmouseenter = function () { this.style.backgroundColor = colours.hover; };
		link.onmouseleave = function () { this.style.backgroundColor = colours.none; };
		link.onmousedown  = function () { this.style.backgroundColor = colours.down; };
	}
	
	document.getElementById('slimMenu').onmouseup = toggleSlimMenuItemsVisibility;
	
	if(window.innerWidth < 808)
		slimModeOn();
	else slimModeOff();
	
	window.onresize = window_handleResize;
}

function toggleSlimMenuItemsVisibility()
{
	var displayType = document.getElementById('slimMenuItemContainer').style.display;
	if(displayType === 'none')
		displayType = 'block';
	else
		displayType = 'none';
	
	document.getElementById('slimMenuItemContainer').style.display = displayType;
}

function window_handleResize()
{
	if(window.innerWidth < 808)
	{
		if(!isSlimMode) 
		{
			slimModeOn();
		}
	}
	else
	{
		if(isSlimMode) 
		{
			slimModeOff();
		}
	}
}

function slimModeOn()
{
	isSlimMode = true;
	document.querySelector('nav').style.display = 'none';
	document.getElementById('slimMenuContainer').style.display = 'block';
	document.getElementById('slimMenuItemContainer').style.display = 'none';
}

function slimModeOff()
{
	isSlimMode = false;
	document.querySelector('nav').style.display = 'block';
	document.getElementById('slimMenuContainer').style.display = 'none';
}

function link_handleClick()
{
	this.style.backgroundColor = colours.hover;
	// get all sections.
	var sections = document.querySelectorAll('section');
	// Hide them.
	for(s of sections)
		s.style.display = 'none';
	
	// Show the specific element.
	var name = this.innerHTML;
	// Deal with the 'Guest Book' --> id(GuestBook) case.
	name = name.replace(' ', '');
	var ele = document.getElementById('section' + name);
	ele.style.display = 'block';
	
	// Clear the contents of al sections.
	clearAllDynamicContent();
	
	// Populate the current section.
	populateSection(name);
	
	// Hide the slim menu if it's visible.
	if (isSlimMode) toggleSlimMenuItemsVisibility();
}

function clearAllDynamicContent()
{
	var contents = document.getElementsByClassName('dynamicContent');
	
	for(c of contents)
		c.innerHTML = '';
}

function populateSection(sectionName)
{
	console.log('populateSection(' + sectionName + ')')
	switch(sectionName.toLowerCase())
	{
		case section.home.toLowerCase():
			populateHome();
			break;
		case section.courses.toLowerCase():
			populateCourses();
			break;
		case section.people.toLowerCase():
			populatePeople();
			break;
		case section.news.toLowerCase():
			populateNews();
			break;
		case section.notices.toLowerCase():
			populateNotices();
			break;
		case section.guestbook.toLowerCase():
			populateGuestBook();
			break;
	}
}

section = {
	home: 'Home',
	courses: 'Courses',
	people: 'People',
	news: 'News',
	notices: 'Notices',
	guestbook: 'GuestBook'
}

function getDynamicContentOfSection(sectionName)
{
	var ele = document.getElementById('section' + sectionName);
	var dynamicContent = ele.getElementsByClassName('dynamicContent')[0];
	return dynamicContent;
}

function populateHome()
{
}

function populateCourses()
{
	dynamicContent = getDynamicContentOfSection(section.courses);
	
	redsoxService.courses.makeRequest();
	
	dynamicContent.innerHTML = '<p>Loading content about courses...</p>';
}

function populatePeople()
{
	dynamicContent = getDynamicContentOfSection(section.people);
	
	redsoxService.people.makeRequest();
	
	dynamicContent.innerHTML = '<p>Loading content about people...</p>';
	
}

function populateNews()
{
	dynamicContent = getDynamicContentOfSection(section.news);
	
	redsoxService.news.makeRequest();
	
	dynamicContent.innerHTML = '<p>Some content about news!</p><p>'+Math.random()*10000+'</p>';
}

function populateNotices()
{
	dynamicContent = getDynamicContentOfSection(section.notices);
	
	redsoxService.notices.makeRequest();
	
	dynamicContent.innerHTML = '<p>Some content about home!</p><p>'+Math.random()*10000+'</p>';
}

function populateGuestBook()
{
	dynamicContent = getDynamicContentOfSection(section.guestbook);
	
	redsoxService.htmlcomments.makeRequest();
	
	dynamicContent.innerHTML = '<p>Loading comments...</p>';
}