const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const tempUserMiddleware = require("./middleware/userID");
const authMiddleware = require("./middleware/auth");
const authRouter = require("./routes/authRouter");
const conversations = require("./routes/conversationsRouter");
const messages = require("./routes/messagesRouter");
const contacts = require("./routes/contactsRouter");
const images = require("./routes/imagesRouter");
const form = require("./routes/contactFormRouter");
const cors = require("cors");
const whitelist = ["https://fancreate.netlify.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.options("*", cors(corsOptions));

app.use(cors(corsOptions));

const connectDB = require("./database/connect");
require("dotenv").config();
app.get("/", (req, res) => {
  res.send("FanCreate");
});
app.use(bodyParser.json({ limit: "2000mb" }));
app.use(bodyParser.urlencoded({ limit: "2000mb", extended: true }));
app.use(express.static(path.join(__dirname, "build")));
app.use(express.json());
app.use(cookieParser());
app.use(tempUserMiddleware);
app.use(authMiddleware);

app.use(`/api/v1/auth`, authRouter);
app.use("/api/v1/conversations", conversations);
app.use("/api/v1/messages", messages);
app.use("/api/v1/contacts", contacts);
app.use("/api/v1/images", images);
app.use("/api/v1/form", form);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log("it's giving server");
    });
  } catch (error) {
    console.log(error);
  }
};
start();
