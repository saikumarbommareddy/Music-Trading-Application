const { body, validationResult } = require("express-validator");

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
};
exports.validateSignup = [
    body("firstName", "FirstName cannot be empty").notEmpty().trim().escape(),
    body("lastName", "LastName cannot be empty").notEmpty().trim().escape(),
    body("email", "Email must be a valid")
      .isEmail()
      .trim()
      .escape()
      .normalizeEmail(),
    body("password", "password must be atleast 8 char and atmost 64").isLength({
      min: 8,
      max: 64,
    }),
  ];

exports.validateLogin = [
    body("email", "Email must be a valid")
      .isEmail()
      .trim()
      .escape()
      .normalizeEmail(),
    body("password", "password must be atleast 8 char and atmost 64").isLength({
      min: 8,
      max: 64,
    }),
  ];

  exports.validationresult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => {
        req.flash("error", error.msg);
      });
      return res.redirect("back");
    } else {
      return next();
    }
  };