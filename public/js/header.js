document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.topnav a');
    // console.log(links)
    links.forEach(link => {
    link.addEventListener('click', function() {
        // Remove 'active' class from all links
        links.forEach(link => link.classList.remove('active'));

        // Add 'active' class to the clicked link
        this.classList.add('active');
    });
    });
});