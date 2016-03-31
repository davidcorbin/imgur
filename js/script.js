/*
 * script.js for imgur upload http://github.com/daconex/imgur
 * Author: David Corbin (daconex)
 */

/*
 * Function to upload image to imgur
 */
function upload(file) {

    // Check that file is an image
	if (!file || !file.type.match(/image.*/)) return;

    // Check that file size is less than 10 MB
    if (file.size/1024/1024 >= 10) {
        console.log("File is lager than 10 MB");
        return;
    }

	uploading();

	var fd = new FormData();
	fd.append("image", file);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-id f30578e81f80336");
	xhr.onload = function(){uploaded(JSON.parse(xhr.response))};
	xhr.send(fd);
}

/*
 * Function called when image starts uploading
 */
function uploading() {
    document.querySelector("#link").textContent = "Uploading...";
}

/*
 * Function called when image is done uploading 
 */
function uploaded(response) {
    var original = response.data.link;
    document.querySelector("#link").innerHTML = "<a href='"+original+"'>"+original+"</a>  <i class='fa fa-paperclip'></i>";
    //document.querySelector("#link a").addEventListener("click", function (e){e.stopPropagation();}, false);

    document.querySelector("#link a").addEventListener('click', function(event) {
        // Stop pseudo clicking upload layer when github-corner is clicked
        event.stopPropagation();
    }, false);

    // Copy link button
    document.querySelector("#link i").addEventListener('click', function(event) {
        copyTextToClipboard(document.querySelector("#link a").textContent);

        // Stop pseudo clicking upload layer when github-corner is clicked
        event.stopPropagation();
    }, false);

    // Display uploaded image below link
    document.querySelector(".desc img").src = original;
}

/*
 * Function to copy text to clipboard.
 * From http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
 */
function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);

    changeMessage("Copied!");
}


function changeMessage(content) {
    // Terrible hack for change pseudo element css
    var sheet = document.styleSheets[0];
    var rules = sheet.rules;
    sheet.insertRule('.desc h2 a:before { content: "'+content+'"; }', rules.length);

    document.querySelector(".desc h2 a").style.transform = "translateY(-100%)";

}

/*
 * Function called if there is an error with image upload
 */
function error(desc) {

}



(function(document, window) {
    // Stop pseudo clicking upload layer when links are clicked
    document.querySelector("a").addEventListener("click", function (e){e.stopPropagation();}, false);
    document.querySelector("span a").addEventListener("click", function (e){e.stopPropagation();}, false);

    // Check if browser supports drag and drop
    var supportsDrag = function() {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

    if (supportsDrag) {

        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
            document.querySelector(".upload").addEventListener(event, function(e) {

                // preventing the unwanted behaviours
                e.preventDefault();
                e.stopPropagation();
            });
        });
        ['dragover', 'dragenter'].forEach(function(event) {
            document.querySelector(".upload").addEventListener( event, function() {
                this.classList.add("dragover");
            });
        });
        ['dragleave', 'dragend', 'drop'].forEach(function(event) {
            document.querySelector(".upload").addEventListener( event, function() {
                this.classList.remove("dragover");
            });
        });
        document.querySelector(".upload").addEventListener('drop', function(e) {
            /*
             * @TODO Add support for album upload
             */
            upload(e.dataTransfer.files[0]);
        });

    }

})(document, window);
