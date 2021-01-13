
var menuContainer = document.getElementById("hmenu");
var menuItems = menuContainer.getElementsByTagName("li");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < menuItems.length; i++) {

    menuItems[i].querySelector("a").addEventListener("click", function() {
	var current = document.getElementsByClassName("menu active");
	if (current[0] != null) {
	    current[0].className = current[0].className.replace(" active", "");
	}
	this.className += " active";
    });
}


