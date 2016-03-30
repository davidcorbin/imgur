function upload(file) {
	if (!file || !file.type.match(/image.*/)) return;
	uploading();
	var fd = new FormData();
	fd.append("image", file);
	fd.append("key", "6528448c258cff474ca9701c5bab6927");
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.imgur.com/2/upload.json");
	xhr.onload = function(){uploaded(JSON.parse(xhr.response))};
	xhr.send(fd);
}

/*
 * Function called when image starts uploading
 */
function uploading() {
    document.querySelector("#link").textContent = "Uploading...";
}

function uploaded(response) {
    var original = response.upload.links.original;
    document.querySelector("#link").innerHTML = "<a href='"+original+"'>"+original+"</a>";
    document.querySelector("#link a").addEventListener("click", function (e){e.stopPropagation();}, false);
}

window.onload = function () {
    // Stop pseudo clicking upload layer when github-corner is clicked
    document.getElementsByTagName("a")[0].addEventListener("click", function (e){e.stopPropagation();}, false);

};
