const model = require('../models/trade');
const offerModel = require('../models/offers');
const watchlistModel = require('../models/wishlist');

exports.index= (req,res)=>{
    
    res.render('./index',{items, singers})
};

exports.new= (req,res)=>{

    res.render('./newTrade',{})
};
exports.create = (req,res,next)=>{
    let trade  = new model(req.body);
    trade.author = req.session.user;
    trade.Offered = false;
    trade.offerName = "";
    trade.Watchlist = false;
    trade.save()
    .then(story => 
        res.redirect('/trades'),
        req.flash('success', 'Created Successfully'))
    .catch(err =>{
        if(err.name === 'ValidationError')
             err.status =400; 
        next(err);
    })
};

exports.trades= (req,res,next)=>{
    model.find()
   .then(trades =>{
    console.log(trades)
    let item_cat_arr = new Set();
    for(var ii=0; ii<trades.length;ii++){
        item_cat_arr.add(trades[ii].singer);
    }
    let singers = Array.from(item_cat_arr);
    console.log(singers);
    res.render('./trades',{trades, singers})
})
   .catch(err =>next(err));
    
};
exports.trade= (req,res,next)=>{
    let id = req.params.id
    if(!id.match(/^[0-9a-fA-F]{24}$/))
    {
       let err =new Error('Invalid trade id');
       err.status=400;
       return next(err);
    }

    model.findById(id).populate('author', 'firstName lastName')
    .then(trade =>{
        if(trade) {
           
            res.render('./trade',{trade}); 
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }}
    )
    .catch(err =>next(err));
    
};
exports.edit = (req,res,next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/))
    {
       let err =new Error('Invalid trade id');
       err.status=400;
       return next(err);
    }
    model.findById(id)
    .then(trade=>{
        if(trade) {
           
            return res.render('./edit',{trade});
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }}
    )
    .catch(err =>next(err));
 
    
};
exports.update = (req,res,next)=>{
    let trade = req.body;
    let id = req.params.id;
         if(!id.match(/^[0-9a-fA-F]{24}$/))
         {
            let err =new Error('Invalid trade id');
            err.status=400;
            return next(err);
         }
         model.findByIdAndUpdate(id,trade,{useFindAndModify:false, runValidators:true})
         .then(trade =>{
             if(trade) {
                req.flash('success', 'Updated Successfully');
                 return res.redirect('/trades/'+id);
             } else {
                 let err = new Error('Cannot find a trade with id: ' + id+' to update');
                 err.status = 404;
                 next(err);
             }}
         )
         .catch(err =>{
            if(err.name === 'ValidationError')
            err.status =400;
            next(err)
        });
};  
exports.delete = (req,res,next)=>{
    let id = req.params.id;
     if(!id.match(/^[0-9a-fA-F]{24}$/))
     {
        let err =new Error('Invalid story id');
        err.status=400;
        return next(err);
     }
     model.findByIdAndDelete(id,{useFindAndModify:false})
     .then(story =>{
         if(story) {
            req.flash('success', 'Deleted Successfully');
            res.redirect('/trades');
         } else {
             let err = new Error('Cannot find a trade with id:' + id +' to delete');
             err.status = 404;
             return next(err);
         }}
     )
     .catch(err =>next)
};

exports.createtrade = (req, res, next) => {
    let user = req.session.user;
    iD = req.params.id;
    model
      .findByIdAndUpdate(
        iD,
        { status: "Offer pending", Offered: true },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((item) => {
        let newOfferItem = new offerModel({
          Name: item.name,
          Status: "Offer pending",
          Singer: item.singer,
          OfferedBy: user,
        });
        newOfferItem.save().then((offer) => {
          model
            .find({ author: user })
            .then((items) => {
              res.render("./trade_maker_page", { items });
            })
            .catch((err) => {
              next(err);
            });
        });
      })
      .catch((err) => {
        next(err);
      })
  
      .catch((err) => {
        next(err);
      });
  };

  exports.tradeown = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    Promise.all([
      model.findByIdAndUpdate(
        id,
        { status: "Offer pending" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      ),
      offerModel.findOne({ OfferedBy: user }).sort({ _id: -1 }),
    ])
      .then((results) => {
        const [item, Offered] = results;
        let name = Offered.Name;
        model
          .findByIdAndUpdate(
            id,
            { offerName: name },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          )
          .then((item) => {
            req.flash("success", "Offer Created");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.offerdelete = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { status: "Available", Offered: false },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((item) => {
        let name = item.name;
  
        Promise.all([
          model.findOneAndUpdate(
            { offerName: name },
            { status: "Available", offerName: "" }
          ),
          offerModel.findOneAndDelete(
            { Name: name },
            { useFindAndModify: false }
          ),
        ])
          .then((results) => {
            const [item, offer] = results;
            req.flash("success", "You cancelled the offer you made");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.managetrades = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    model
      .findById(id)
      .then((item) => {
        if (item.offerName === "") {
          let name = item.name;
          model
            .findOne({ offerName: name })
            .then((item) => {
              res.render("./managetradepage", { item });
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let name = item.offerName;
          offerModel
            .findOne({ Name: name })
            .then((offer) => {
              res.render("./manageofferpage", { item, offer });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  };


  exports.managedeleteoffer = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(id, { status: "Available", offerName: "" })
      .then((item) => {
        let name = item.offerName;
        Promise.all([
          offerModel.findOneAndDelete({ Name: name }),
          model.findOneAndUpdate(
            { name: name },
            { status: "Available", Offered: false }
          ),
        ])
          .then((results) => {
            const [offer, item] = results;
            req.flash("success", "You cancelled the offer you made");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  

  exports.accept = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { status: "Traded" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((item) => {
        let name = item.offerName;
  
        Promise.all([
          model.findOneAndUpdate(
            { name: name },
            { status: "Traded" },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          ),
          offerModel.findOneAndDelete(
            { Name: name },
            { useFindAndModify: false }
          ),
        ])
          .then((results) => {
            const [item, offer] = results;
            req.flash("success", "Acccepted the offer");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.reject = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { status: "Available", offerName: "" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((item) => {
        let name = item.offerName;
        Promise.all([
          model.findOneAndUpdate(
            { name: name },
            { status: "Available", Offered:false },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          ),
          offerModel.findOneAndDelete({ Name: name }),
        ])
          .then((results) => {
            const [item, offer] = results;
            let name = item.name;
            let status = item.status;
            if (item.Watchlist) {
              watchlist_model
                .findOneAndUpdate(
                  { Name: name },
                  { Status: status },
                  {
                    useFindAndModify: false,
                    runValidators: true,
                  }
                )
                .then((save) => {})
                .catch((err) => {
                  next(err);
                });
            }
            req.flash("success", "You rejected the offer..");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };


  exports.watchlistadd = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { Watchlist: true },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((item) => {
        let name = item.name;
        let newSaveItem = new watchlistModel({
          Name: item.name,
          Singer: item.singer,
          Status: item.status,
        });
        newSaveItem.SavedBy = req.session.user;
        watchlistModel
          .findOne({ Name: name })
          .then((item) => {
            if (!item) {
              newSaveItem
                .save()
                .then((newSaveItem) => {
                  req.flash("success", "Saved to Watchlist");
                  res.redirect("/users/profile");
                })
                .catch((err) => {
                  if (err.name === "ValidationError") {
                    err.status = 400;
                  }
                  next(err);
                });
            } else {
              req.flash("error", "This item already exists in the watchlist");
              res.redirect("/users/watchlist");
            }
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  


  exports.savedelete = (req, res, next) => {
    let id = req.params.id;
    model
      .findByIdAndUpdate(id, { Watchlist: false })
      .then((item) => {
        let name = item.name;
  
        watchlistModel
          .findOneAndDelete({ Name: name }, { useFindAndModify: false })
          .then((save) => {
            req.flash("success", "Removed from watchlist");
            res.redirect("back");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };