var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var pokemonsRouter = require("./routes/pokemons");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/pokemons", require("./routes/pokemons"));

app.use("/", indexRouter);
app.use("/pokemons", pokemonsRouter);
app.use("/images", express.static(path.join(__dirname, "images")));
module.exports = app;
