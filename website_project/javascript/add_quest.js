// function is checking if the radio is selected and display the button as it should
function checkSelectedRadio(){
    var regular_quest = document.getElementById("regular_quest"); // get the element with an id of regular_quest
    if(regular_quest.checked){ // if it's checked
        regular_quest.checked = false; // sets the value to false, so it won't remember that it was selected
        window.location.href = "/add_regular_quest"; // the click on the button will redirect the user to the url - "http://localhost:8080/add_regular_quest"
    }else{ // else - if it's not checked
        var not_selected_message = document.getElementById("not_selected_message"); // get the element with an id of not_selected_message
        not_selected_message.style.color = "black"; // set the color of the letters to black 
        not_selected_message.style.backgroundColor = "whitesmoke"; // set the background of the element to whitesmoke
        setTimeout(function(){ // after 2.5 seconds the color of the letters and the background of the element will match the background color(disappear)
            not_selected_message.style.color = "rgb(175, 175, 175)"; // set color to rgb(175, 175, 175)
            not_selected_message.style.backgroundColor = "rgb(175, 175, 175)"; // set background color to rgb(175, 175, 175)
        }, 1000 * 2.5); // after 2.5 seconds
    }
}
