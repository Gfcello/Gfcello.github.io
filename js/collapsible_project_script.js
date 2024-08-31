var coll = document.getElementsByClassName("project_title");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

const menus = document.querySelectorAll('[data-toggle="collapse"]')
for (const menu of menus) {
  menu.addEventListener('click', function(event) {
    this.classList.toggle('collapsed');
  })
}