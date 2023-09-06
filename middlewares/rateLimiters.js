const rateLimit = require("express-rate-limit");

exports.logInLimiter = rateLimit({
    windowMs: 60*1000,
    max:3,
    handler:(req,res, next)=>{
        let err = new Error("Your Login requests limit exceeded , try again later");
        err.status = 429;
        return next(err);
    }
});