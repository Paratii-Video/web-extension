browser.browserAction.onClicked.addListener(function() {
	browser.tabs.create({
		"url": "/uploader.html"
	});
});