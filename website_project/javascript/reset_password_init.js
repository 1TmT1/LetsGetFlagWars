window.onload = function(){ // when the page loads it will execute this function first
    var reset_password_form = document.getElementById("reset-password-form"); // get the element by id of reset-password-form
    reset_password_form.action = window.location.href; // sets the action of the form to the current url
}