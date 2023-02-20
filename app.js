const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")

const errorMiddleware = require("./middlewares/error");
const path = require("path");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const cors= require('cors')

const cookiParser = require("cookie-parser");

const app = express();

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(fileUpload());
app.use(cookiParser());
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// parse application/json
app.use(bodyParser.json());

app.use("/public", express.static("public"));

dotenv.config({path:__dirname+'config/.env'})

// import routes
const post = require("./routes/postRoute");
const user = require("./routes/userRoute");
const chat = require("./routes/chatRoute");
const message = require("./routes/messageRoute");

app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/v1", chat);
app.use("/api/v1", message);

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

// error middleware
app.use(errorMiddleware);

module.exports = app;
