/*
 * script.js for imgur upload http://github.com/daconex/imgur
 * Author: David Corbin (daconex)
 */

"use strict";

/*
 * Function to determine whether to create album or just an individual image
 */
function upload(files, callback) {
    // Create album if more than one image
    if (files.length > 1) {
        album(files);
    }
    else {
        verifyimage(files[0], callback);
    }
}

/*
 * Function to verify a file as much as possible before uploading it
 */
function verifyimage(file, callback) {
    // Check that file is an image
    if (!file || !file.type.match(/image.*/)) {
        console.log("File not image");
        /*
         * @TODO SHOW ERROR FOR FILE THATS NOT IMAGE
         */
        return;
    }

    // Check that file size is less than 10 MB
    if (file.size/1024/1024 >= 10) {
        console.log("File too large to upload");
        document.querySelector("#link").innerHTML = "The image is too large to upload to imgur (10MB max). <a target='_blank' href='https://compressor.io/'>Compress</a> and retry.";
        stoplinkprop("#link a");
        return;
    }
    uploadimage(file, callback);
}

/*
 * Function to upload invidual image and return response
 */
function uploadimage(file, callback) {
    uploading();
    var fd = new FormData();
    fd.append("image", file);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-id f30578e81f80336");
    xhr.onload = function(){
        if (callback==null) {
            uploaded(JSON.parse(xhr.response));
        }
        else {
            callback(JSON.parse(xhr.response));
        }
    };
    xhr.send(fd);
}

var num_of_files;
/*
 * Function to upload photos for an album
 */
function album(files) {
    num_of_files=files.length;
    for (var i=0; i<files.length; i++) {
        // Use function expression to keep individual XMLHttpRequest scope
        (function(i){
            verifyimage(files[i], createalbum);
        })(i);
    }
}

var img_ids = [];
/*
 * Function to create albums from images that are received
 */
function createalbum(response) {
    // Add images ids to array
    var id = response.data.id;
    img_ids.push(id);

    // If all individual images have been uploaded and an album can be created
    if (img_ids.length == num_of_files) {

        var formdata = new FormData;
        for (var i = 0; i < img_ids.length; i++) {
            formdata.append('ids[]', img_ids[i]);
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.imgur.com/3/album");
        xhr.setRequestHeader("Authorization", "Client-id f30578e81f80336");
        xhr.onload = function(){
            document.querySelector("#link").innerHTML = "<a target='_blank' href='http://imgur.com/a/"+JSON.parse(xhr.response).data.id+"'>http://imgur.com/a/"+JSON.parse(xhr.response).data.id+"</a>  <i class='fa fa-paperclip'></i>";
            stoplinkprop("#link a");
            setcopybutton();
        };
        xhr.send(formdata);
    }
}

/*
 * Function called when image starts uploading
 */
function uploading() {
    document.querySelector("#link").innerHTML = "<i class='fa fa-spinner fa-spin' style='font-size: 2em;'></i>";
}

/*
 * Function called when image is done uploading 
 */
function uploaded(response) {
    var original = response.data.link;
    document.querySelector("#link").innerHTML = "<a target='_blank' href='"+original+"'>"+original+"</a>  <i class='fa fa-paperclip'></i>";
    //document.querySelector("#link a").addEventListener("click", function (e){e.stopPropagation();}, false);

    stoplinkprop("#link a");
    setcopybutton();

    // Display uploaded image below link
    document.querySelector(".desc img").src = original;
}

function setcopybutton() {
    document.querySelector("#link i").addEventListener('click', function(event) {
        copyTextToClipboard(document.querySelector("#link a").textContent);
        event.stopPropagation();
    }, false);
}

function stoplinkprop(el) {
    document.querySelector(el).addEventListener('click', function(event) {
        event.stopPropagation();
    }, false);
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
        console.log('Unable to copy');
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
    stoplinkprop("a");
    stoplinkprop("span a");

    // Create dialog to select image to upload
    document.querySelector(".upload").addEventListener("click", function(){
        document.querySelector('input').click();
    }, false);

    // After image is chosen, upload immediately
    document.querySelector("input").addEventListener("change", function(){
        upload(this.files, null);
    }, false);

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
            upload(e.dataTransfer.files, null);
        });
    }

})(document, window);
