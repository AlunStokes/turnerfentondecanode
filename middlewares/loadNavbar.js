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
            title: "Landing",
            alias: [
              "landing"
            ]
          },
          {
            link: "design-timeline",
            title: "Design Timeline",
            alias: [
              "design-timeline"
            ]
          },
          {
            link: "login",
            title: "Login",
            alias: [
              "login"
            ]
          },
          {
            link: "register",
            title: "Register",
            alias: [
              "register"
            ]
          },
          {
            link: "reset-password",
            title: "Reset Password",
            alias: [
              "reset-password"
            ]
          }
        ];
      }
      else {
        res.locals.navbarEntries = [
          {
            link: "home",
            title: "Home",
            alias: [
              "home"
            ]
          },
          {
            link: "landing",
            title: "Landing",
            alias: [
              "landing"
            ]
          },
          {
            link: "design-timeline",
            title: "Design Timeline",
            alias: [
              "design-timeline"
            ]
          },
          {
            link: "logout",
            title: "Logout",
            alias: [
              "logout"
            ]
          }
        ]
      }
      break;
      case "back":
      res.locals.navbarEntries = [
        {
          link: "home",
          title: "Home",
          icon: "home",
          alias: [
            "home"
          ]
        },
        {
          link: "timeline",
          title: "Timeline",
          icon: "clock-o",
          alias: [
            "timeline"
          ]
        },
        {
          link: "practice",
          title: "Practice",
          icon: "pencil",
          alias: [
            "practice",
            "create-exam",
            "exam",
            "add-question"
          ]
        },
        {
          link: "account",
          title: "Account",
          icon: "user",
          alias: [
            "account"
          ]
        }
      ]
      if (res.locals.admin) {
        res.locals.navbarEntries.push(
          {
            link: "attendance",
            title: "Attendance",
            icon: "clipboard",
            alias: [
              "attendance",
              "check-attendance"
            ]
          }
          /*
          {
            link: "admin",
            title: "Admin",
            icon: "wrench",
            alias: [
              "admin"
            ]
          }
          */
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
