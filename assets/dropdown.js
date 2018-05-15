window.addEventListener("click", (event) => {
    // Close the dropdown if the user clicks outside of it
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
});


Array.prototype.forEach.call(document.getElementsByClassName("dropbtn"), (element) => {
    element.addEventListener("click", () => {
        element.parentElement.getElementsByClassName("dropdown-content")[0].classList.toggle("show");
    });
});