const dotenv                  = require('dotenv').config(),
      jwt                     = require('jsonwebtoken'),
      express                 = require("express"),
      app                     = express(),
      bodyParser              = require("body-parser"),
      methodOverride          = require("method-override"),
      mongoose                = require("mongoose"),
      seedDb 			      = require("./mondaySeeds"),
      mondaySdk               = require("monday-sdk-js"),
      monday                  = mondaySdk();

// Import Models
const User = require("./models/user");

// Configure Express
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
// app.use(methodOverride("_method"));

// Configure Mongoose
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error.message));

// seedDb();

// Import Routes
var timeEntryRoutes = require("./routes/timeEntry");

// Import Middleware
var middleware = require("./middlewares/authentication");

app.use("/timeEntry", timeEntryRoutes);

app.get("/", function (req, res) {
    res.render('index');
});

app.get("/user", middleware.authenticate, function (req, res) {
    res.json(req.session.user);
});

app.post("/registerToggl", middleware.authenticate, function(req, res){
    let togglApiToken = req.body.togglApiToken;
    console.log(togglApiToken);
    User.findByIdAndUpdate(req.session.user.id, {togglApiToken: togglApiToken}, function(err, updatedUser){
		if(err){
            console.log("TODO: HANDLE ERROR")
			console.log(err);
			res.redirect("/");
		} else{
			res.redirect("/");
		}
	});
});


app.get("/test", function(req, res){
    console.log(req.session);
    res.send({test: "test"});
});


// Start Server
app.listen(process.env.PORT, function () {
    console.log('Server listening on port');
});