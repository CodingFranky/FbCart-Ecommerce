import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productsRouter from "./routes/Products.js";
import brandsRouter from "./routes/Brands.js";
import categoriesRouter from "./routes/Category.js";
import usersRouter from "./routes/Users.js";
import authRouter from "./routes/Auth.js";
import cartRouter from "./routes/Cart.js";
import orderRouter from "./routes/Order.js";
import session from "express-session";
import passport from "passport";
import userModel from "./model/User.js";
import crypto from "crypto";
import { cookieExtractor, isAuth, sanitizeUser } from "./services/common.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const app=express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cors({
  exposedHeaders: ["X-Total-Count"]
}))


app.get("/", (req, res) => {
   app.use(express.static(path.resolve(__dirname, "frontend", "build")));
   res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });

// JWT options

const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; 

//middlewares

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
app.use(passport.authenticate('session'));


app.use('/products', isAuth(), productsRouter);
// we can also use JWT token for client-only auth
app.use('/categories', isAuth(), categoriesRouter);
app.use('/brands', isAuth(), brandsRouter);
app.use('/users', isAuth(), usersRouter);
app.use('/auth', authRouter);
app.use('/cart', isAuth(), cartRouter);
app.use('/orders', isAuth(), orderRouter);

// Passport Strategies
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async function (
    email,
    password,
    done
  ) {
    // by default passport uses username
    try {
      const user = await userModel.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'invalid credentials' }); // for safety
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: 'invalid credentials' });
          }
          const token = jwt.sign(
            sanitizeUser(user),
            process.env.JWT_SECRET_KEY
          );
          done(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await userModel.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments

// This is your test secret API key.

const stripe = Stripe(process.env.STRIPE_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { products, url } = req.body;
  const lineItems = products.items.map((item)=>({
    price_data:{
      currency:"inr",
      product_data:{
        name: item.product.title,
        images:[item.product.thumbnail]
      },
      unit_amount: item.product.price*8200,
    },
    quantity: item.quantity
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems, 
      mode: 'payment',
      success_url: `http://localhost:8080/${url}`,

      cancel_url:`http://localhost:8080/payment-cancel`
    });
    res.json({id:session.id})
  } catch (error) {
  }

});


async function DBConnection(url) {
  try {
    const DBOptions={
      dbName:"Ecommerce"
    };
    await mongoose.connect(url,DBOptions);
    console.log('database connected');
  } catch (error) {
    console.log(error)
  }
  
}
DBConnection(process.env.MONGODB_URL);

app.listen(process.env.PORT, () => {
  console.log('server started');
});
