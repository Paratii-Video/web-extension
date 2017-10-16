window.paratiiExtensionFunction = function() {
	alert('Yay it works!');
};

$(function() {
	if($('#paratiiDetectorElement').length) {
		window.paratiiExtensionFunction();
	}
});