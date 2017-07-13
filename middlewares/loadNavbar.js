var Utilities = require("../models/utilities");

//Loads navbar elements, takes route (front/back) as input, adds navbar elements to res.locals.navbarEntries
module.exports = function(route) {
  return function(req, res, next) {
    if (req.originalUrl == "/") {
      next();
      return;
    }
    switch (route) {
      case "front":
      if (!res.locals.loggedIn) {
        res.locals.navbarEntries = [
          {
            link: "landing",
            title: "Landing"
          },
          {
            link: "design-timeline",
            title: "Design Timeline"
          },
          {
            link: "login",
            title: "Login"
          },
          {
            link: "register",
            title: "Register"
          },
          {
            link: "reset-password",
            title: "Reset Password"
          }
        ];
      }
      else {
        res.locals.navbarEntries = [
          {
            link: "home",
            title: "Home"
          },
          {
            link: "landing",
            title: "Landing"
          },
          {
            link: "design-timeline",
            title: "Design Timeline"
          },
          {
            link: "logout",
            title: "Logout"
          }
        ]
      }
      break;
      case "back":
      res.locals.navbarEntries = [
        {
          link: "home",
          title: "Home",
          icon: "home"
        },
        {
          link: "timeline",
          title: "Timeline",
          icon: "clock-o"
        },
        {
          link: "practice",
          title: "Exams",
          icon: "pencil"
        },
        {
          link: "attendance",
          title: "Attendance",
          icon: "clipboard"
        },
        {
          link: "account",
          title: "Account",
          icon: "user"
        }
      ]
      if (res.locals.admin) {
        res.locals.navbarEntries.push(
          {
            link: "admin",
            title: "Admin",
            icon: "wrench"
          }
        );
      }
      break;
    }

    Utilities.getActivePage(req.originalUrl, res.locals.navbarEntries, function(index) {
      if (index != -1) {
        res.locals.navbarEntries[index].active = true;
        res.locals.navbarActiveIndex = index;
      }
      next();
    });
  }
}
