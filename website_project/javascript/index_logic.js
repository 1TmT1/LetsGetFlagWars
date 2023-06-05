const scrolling = () => { // check when the page is being scrolled and add or remove an element named scrolled that was styled in the css file
    const header = document.querySelector('.main-header'); // get the element with the id of main-header
    window.addEventListener('scroll', () => { // when the event scroll is happening
        const scrollPos = window.scrollY; // get the Y position of the scroll
        if(scrollPos > 10){ // if it's greater than 10
            header.classList.add('scrolled'); // add class named scrolled
        }else{ // else - if it's less than 10
            header.classList.remove('scrolled'); // remove class named scrolled
        }
    });
}

const main = () => { // main function
    scrolling(); // run scrolling function
}

main(); // run main function
