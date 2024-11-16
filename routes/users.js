import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { db } from "../db-utils/mongoDB-connection.js";
import { v4 } from "uuid";
import { userModel } from "../db-utils/models.js";
import mongoose from "mongoose";
import { mailOptions, transporter } from "../utils/mail-utils.js";
import { createJwtToken } from "../utils/jwt-utils.js";

const userRouter = express.Router();

userRouter.post('/', async (req, res) => {
    const userDetails = req.body;
    const userCollection = db.collection('users');
    console.log(`Userdetails: ${userDetails}`)
    const user = await userCollection.findOne({ email: userDetails.email });

    if (user) {
        res.status(400).json({ msg: 'User Already Exist' })
    } else {
        const userObj = new userModel({
            ...userDetails,
        });
        await userObj.validate();
        bcrypt.hash(userDetails.password, 10, async (err, hash) => {
            try {
                userDetails.password = hash;
                await userCollection.insertOne({
                    ...userDetails,
                    id: v4(),
                    isVerified: false,
                });

                const token = createJwtToken({ email: userDetails.email }, "1d");

                const link = `${process.env.FE_URL}/verify-account?token=${token}`;

                await transporter.sendMail({
                    ...mailOptions,
                    to: userDetails.email,
                    subject: `Welcome to the Application ${userDetails.name}`,
                    text: `Hi ${userDetails.name}, \nThank You for Registering with Us. \nTo Verify You account Click ${link}`,
                });
                res.json({ msg: "User created Successfully" });
            } catch (e) {
                if (e instanceof mongoose.Error.ValidationError) {
                    res.status(400).json({ msg: e.message });
                } else {
                    res.status(500).json({ msg: "Internal Server Error", e });
                }
                console.log(e);
            }
        });
    }

    try {

    } catch (error) {
        res.status(404).json({ msg: 'Error in creating a User' });
    }
})

userRouter.get("/verify-account", async (req, res) => {
    const { token } = req.query;
    const userCollection = db.collection('users');
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
      if (err) {
        res
          .status(400)
          .json({ msg: "Link Seems To Be Expired, Please try again" });
      }
      const { email } = data;
      await userCollection.updateOne(
        { email },
        {
          $set: {
            isVerified: true,
          },
        }
      );
      res.json({ msg: "User verified successfully" });
    });
});

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const userCollection = db.collection('users');
    try {
      const user = await userCollection.findOne({ email });
  
      if (user) {
        // user exists in DB
        // Verify the incoming pass with the DB password
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).json({ msg: "Something went wrong" });
          } else if (result) {
            delete user.password;
            res.json({ msg: "User Logged In Successfully", user });
          } else {
            res.status(400).json({ msg: "Invalid Credentials" });
          }
        });
      } else {
        res.status(404).json({ msg: "User Not Found" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });

userRouter.post("/forgot-password", async (req, res) => {

    const { email } = req.body;
    const userCollection = db.collection('users');
    try {
        const user = await userCollection.findOne({ email });

        const uniqueString = v4();

        if(user) {
            const link = `${process.env.FE_URL}/check-password?token=${uniqueString}`;

            await transporter.sendMail({
                ...mailOptions,
                to: user.email,
                subject: `Link to Reset Password`,
                text: `Hi ${user.name}, \nTo Reset Password click on this link ${link}`,
            });
            await userCollection.updateOne(
                { email },
                {
                    $set: {
                        resetToken: uniqueString,
                    },
                }
            );
            res.json({ msg: "Password reset link sent successfully", user });

        } else {
            res.status(404).json({ msg: "User Not Found" });
        }
    } catch (error) {
        
    }
})

userRouter.post("/check-password", async (req, res) => {
    try {
        const { token } = req.body;

        const userCollection = db.collection('users');
        const user = await userCollection.findOne({ resetToken: token });

        if(user) {
            res.json({ msg: "User exists. Redirect to Reset Password page" });
        } else {
            res.status(404).json({ msg: "User Not Found" });
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
    }

})

userRouter.post("/reset-password", async (req, res) => {

    const { token,password } = req.body;
    console.log(token, password);
    const userCollection = db.collection('users');
    const user = await userCollection.findOne({ resetToken: token });

    if(user) {
        bcrypt.hash(password, 10, async (err, hash) => {
            try {
                user.password = hash;
                await userCollection.updateOne(
                    { email: user.email },
                    {
                        $set: {
                            resetToken: null,
                            password: hash,
                        },
                    }
                );
                res.json({ msg: "Password reset successfully" });
            } catch (error) {
                res.status(500).json({ msg: "Internal Server Error" });
            }
        });
    }
})

export default userRouter