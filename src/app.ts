import * as dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import bodyParser from "body-parser";
import userRoutes from "./routes/users";
import languagesRoutes from "./routes/languges";
// import stripeRoutes from "./routes/stripe";
import contactRoutes from "./routes/contact";

dotenv.config();
const app = express();
const router = express.Router();

app.use((req, res, next) => {
  if (req.originalUrl === "/webhooks") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use(userRoutes);
app.use(languagesRoutes);
// app.use(stripeRoutes);
app.use(contactRoutes);

app.get("/", (req, res) => {
  return res.json("Hello Wannabe");
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoose.set("strictQuery", false);
mongoose
  .connect(
    (process.env.MONGODB_URI_TEST as string) ||
      (process.env.MONGODB_URI as string),
    {
      dbName: "FlashCards",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  )
  .then(() => {
    console.log("server is running on port 8080");
    const server = app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
