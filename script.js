document.addEventListener("DOMContentLoaded", function () {
  var navItems = document.querySelectorAll(".navbar-nav .nav-item:not(:last-child)");
  var logoutButton = document.querySelector(".navbar-nav .nav-item:last-child");
  var contentDivs = document.querySelectorAll("#content, #labour, #vendor, #site, #report");

  function removeActiveClasses() {
    navItems.forEach(function (item) {
      item.classList.remove("active");
    });
  }

  navItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      if (!this.classList.contains("active")) {
        removeActiveClasses();
        this.classList.add("active");

        // Hide all content divs
        contentDivs.forEach(function (div) {
          div.style.display = "none";
        });

        // Show the corresponding content div based on the index
        contentDivs[index + 1].style.display = "block";
      }
    });
  });

  logoutButton.addEventListener("click", function () {
    removeActiveClasses();
    // Show only the default content div
    document.getElementById("content").style.display = "block";
  });

  var reportGenerationItem = document.querySelector(".navbar-nav .nav-item:nth-child(4)");

  reportGenerationItem.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
      removeActiveClasses();
      this.classList.add("active");
      // Show only the report div
      document.getElementById("report").style.display = "block";
    }
  });

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      if (reportGenerationItem.classList.contains("active") && this !== reportGenerationItem) {
        reportGenerationItem.classList.remove("active");
        // Hide the report div
        document.getElementById("report").style.display = "none";
      }
    });
  });
});







// document.addEventListener("DOMContentLoaded", function() {
//   var sidebarItems = document.querySelectorAll(".sidebar-menu-item");
//   var contentItems = document.querySelectorAll(".content-item");

//   function removeActiveClasses() {
//     sidebarItems.forEach(function(item) {
//       item.classList.remove("active");
//     });

//     contentItems.forEach(function(item) {
//       item.style.display = "none";
//     });
//   }

//   sidebarItems.forEach(function(item, index) {
//     item.addEventListener("click", function() {
//       if (!this.classList.contains("active")) {
//         removeActiveClasses();
//         this.classList.add("active");
//         contentItems[index].style.display = "block";
//       }
//     });
//   });

//   // Initially set the first sidebar item as active
//   sidebarItems[0].classList.add("active");
//   contentItems[0].style.display = "block";
// });



// $(document).ready(function() {
//   // Click event for sidebar items
//   $('.sidebar-menu-item').click(function() {
//     // Remove 'active' class from all sidebar items
//     $('.sidebar-menu-item').removeClass('active');

//     // Add 'active' class to the clicked sidebar item
//     $(this).addClass('active');

//     // Get the index of the clicked sidebar item
//     var index = $(this).index();

//     // Show the corresponding content item based on the index
//     $('.content-item').eq(index).show().siblings('.content-item').hide();
//   });
// });


document.addEventListener("DOMContentLoaded", function() {
  var sidebarItems = document.querySelectorAll(".sidebar-menu-item");
  var contentItems = document.querySelectorAll(".content-item");

  function removeActiveClasses() {
    sidebarItems.forEach(function(item) {
      item.classList.remove("active");
    });

    contentItems.forEach(function(item) {
      item.style.display = "none";
    });
  }

  sidebarItems.forEach(function(item, index) {
    item.addEventListener("click", function() {
      if (!this.classList.contains("active")) {
        removeActiveClasses();
        this.classList.add("active");
        var itemId = this.getAttribute("data-content-id");
        document.getElementById(itemId).style.display = "block";
      }
    });
  });
});


// MaterialOutward


function openFormout() {
  var formPopup = document.getElementById("myFormout");
  formPopup.style.display = "block";
  formPopup.style.backgroundColor = "transparent";
}
  
  function closeFormout() {
    document.getElementById("myFormout").style.display = "none";
  }


// MaterialInward

function openFormin() {
  var formPopup = document.getElementById("myFormin");
  formPopup.style.display = "block";
  formPopup.style.backgroundColor = "transparent";
}
  
  function closeFormin() {
    document.getElementById("myFormin").style.display = "none";
  }
  