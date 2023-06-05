// get elements by their id
const input_file = document.getElementById("input-file");
const upload_form = document.getElementById("upload-form");
const progress_bar_fill = document.getElementById("progress-bar-fill");
const progress_bar_text = document.getElementById("progress-bar-text");
const preview_container = document.getElementById("image-preview");
const preview_image = document.getElementById("image-preview-itself");
const preview_image_text = document.getElementById("image-preview-text");
const bad_file_type = document.getElementById("bad-file-type");
const submit_image_btn = document.getElementById("submit-image-btn");
const add_quest_form = document.getElementById("add-quest-form");
var timeouts = []; // an array for the timeouts
var imageFile;
var isImage = false; 


submit_image_btn.addEventListener("click", function(e){ // when submit_image_btn is clicked the callback function will run with e passed to it
    if(isImage){ // if isImage is set to true
        return true; // return true(the button will do its default - submit the form)
    }else{ // else - if isImage is set to false
        e.preventDefault(); // prevent from the button to submit the form as its should to
    }
});

input_file.addEventListener("change", function(){ // runs when the input_file is changed the callback function
    try{ // if there is an error the catch block will run
        for(var i = 0; i < timeouts.length; i++){ // for loop through the entire timeouts array
            clearTimeout(timeouts[i]); // clear all the timeouts there
        }
        const file = this.files[0]; // the first file that is selected
        const fileType = file['type']; // gets the file type
        const valid_image_types = ['image/gif', 'image/jpeg', 'image/png']; // an array of all the supported file types
        if(valid_image_types.includes(fileType)){ // if the type of the image is in the array of supported types
            if(file){ // if there is a file
        
                imageFile = file;
                isImage = true;
                const reader = new FileReader(); // newly constructed FileReader(can read files)

                // change the preview when image selected
                preview_image_text.style.display = "none";
                bad_file_type.style.display = "none";
                preview_image.style.display = "block";

                reader.addEventListener("load", function(){ // when the reading process has completed successfully
                    preview_image.setAttribute("src", this.result); // changes the src attribute of the preview image to the selected one(shows preview of the selected image)
                });
        
                reader.readAsDataURL(file); // read the contents of the selected file 

                upload_form.addEventListener("submit", upload_file); // add event of submit to upload_form with function called upload_file
            }else{ // there is not a file
                // set all the style properties of preview image to null
                preview_image_text.style.display = null;
                preview_image.style.display = null;
                bad_file_type.style.display = null;
                isImage = false; // isImage is false because there is no image
                upload_form.removeEventListener("submit", upload_file); // the submit event is being removed
            }
        }else{ // the file type is not supported
            isImage = false; // isImage is set to false because there is no image
            preview_image.style.display = null; 
            preview_image_text.style.color = "rgb(212, 212, 212)";
            timeouts.push(setTimeout(function(){ // set timeouts to change some style properties of these elements to 0.5 seconds 
                preview_image_text.style.display = "none";
                bad_file_type.style.display = "flex";
                timeouts.push(setTimeout(function(){
                    bad_file_type.style.color = "black";
                    timeouts.push(setTimeout(function(){
                        bad_file_type.style.color = "rgb(212, 212, 212)";
                    }, 1000 * 3));
                }, 1000 * 0.5));
            }, 1000 * 0.5));
            input_file.value = null;
            timeouts.push(setTimeout(function(){ // set timeouts to change some style properties of these elements to 4.5 seconds 
                preview_image_text.style.display = null;
                bad_file_type.style.display = null;
                setTimeout(function(){
                    preview_image_text.style.color = "black";
                }, 1000 * 0.5);
            }, 1000 * 4.5));
        }
    }catch{
        isImage = false;
        preview_image_text.style.display = null;
        preview_image.style.display = null;
        bad_file_type.style.display = null;
        input_file.value = null;
        upload_form.removeEventListener("submit", upload_file);
    }
});


add_quest_form.addEventListener("submit", function(e){
    e.preventDefault();
    
    const quest_input = add_quest_form.elements; 
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/add_regular_quest", true);

    xhr.onload = function(){
        window.location.replace(xhr.response);
    }

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if(imageFile){
        if(isImage){
            upload_form.dispatchEvent(new Event('submit'));
        }
        xhr.send(JSON.stringify({ "imageName": imageFile.name, "quest": quest_input["quest"].value, "clue": quest_input["clue"].value, "answer": quest_input["answer"].value }));
    }else{
        xhr.send(JSON.stringify({ "quest": quest_input["quest"].value, "clue": quest_input["clue"].value, "answer": quest_input["answer"].value }));
    }
});


function upload_file(e){
    e.preventDefault();
    isImage = false;
    input_file.disabled = true;
    const xhr = new XMLHttpRequest();
    // const data = new FormData();

    xhr.open("POST", "/upload_quest_image", true);
    xhr.upload.addEventListener("progress", e => {
        var percent;
        if(e.lengthComputable){
            percent = (e.loaded / e.total) * 100
        }else{
            percent = 0;
        }
        progress_bar_fill.style.width = percent.toFixed(2) + "%";
        progress_bar_fill.textContent = percent.toFixed(2) + "%"
    });

    xhr.onload = function(){
        if(xhr.status === 500){
            window.location.replace("http://localhost:8080/error");
        }
    };

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.send(JSON.stringify( {"imageType": imageFile["type"], "imageName": imageFile.name, "imageFile": preview_image.getAttribute("src")} ));
}
