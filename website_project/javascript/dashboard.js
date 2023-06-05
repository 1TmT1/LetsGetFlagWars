// function that logout the user
function logout(){
    //clearCookies();
    eraseAllCookies(); // clear the non httpOnly cookies
    localStorage.clear(); // clear the localStorage
    sessionStorage.clear(); // clear the sessionStorage
    window.location.href = "http://localhost:8080/login"; // redirect the user to the login page
}

// function that erases all the non httpOnly cookies
function eraseAllCookies(){
    var cookies = document.cookie.split(";");

    for(var i = 0; i < cookies.length; i++){
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        if(eqPos > -1){
            var name = cookie.substr(0, eqPos);
        }else{
            var name = cookie;
        }
        document.cookie = name + "=; Max-Age=0";
    }
}

// delete value from local storage by its name
function deleteLocalStorageByName(name){
    localStorage.removeItem(name);
}


// main function 
function main(){
    deleteLocalStorageByName("startTime"); // delete startTime from local storage
    if(document.getElementById("add-quest")){ // if user admin show the add quest button
        add_quest = document.getElementById("add-quest");
        add_quest.style.backgroundColor = "#66ffff";
        add_quest.style.fontSize = "25px";
        add_quest.style.outline = "none";
        add_quest.style.border = "none";
        add_quest.style.borderRadius = "2.5px";
        add_quest.style.cursor = "pointer";
        add_quest.onclick = rdt_add_quest;
        add_quest.style.transition = "1.5s ease";
        add_quest.addEventListener("mouseout", function(){
            add_quest = document.getElementById("add-quest");
            add_quest.style.backgroundColor = "#66ffff";
            add_quest.style.fontSize = "25px";
            add_quest.style.outline = "none";
            add_quest.style.border = "none";
            add_quest.style.borderRadius = "2.5px";
            add_quest.style.cursor = "pointer";
            add_quest.onclick = rdt_add_quest;
            add_quest.style.transition = "1.5s ease";
        });
        
        add_quest.addEventListener("mouseover", function(){
            add_quest.style.backgroundColor = "#0066ff"
            add_quest.style.transition = "1.5s ease";
        });
    }
}

// redirect to add quest page
function rdt_add_quest(){
    window.location.href = "http://localhost:8080/add_quest";
}

// runs main function on load of the page
window.onload = main();
