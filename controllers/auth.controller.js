/** @format */
import colors from "colors";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth.util";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validations
    if (!name) {
      return res.status(400).send("Name is required");
    }

    if (!password || password.length < 7) {
      return res
        .status(400)
        .send("Password should be Minimum 8 characters long");
    }

    if (!email) {
      return res.status(400).send("Email is required");
    }

    let existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return res.status(400).send("An user with this email already exists");
    }

    if (!name) {
      return res.status(400).send("Name is required");
    }

    // hash pwd
    const hashedPwd = await hashPassword(password);

    // register
    const user = new User({
      name,
      email,
      password: hashedPwd,
    });
    await user.save();

    return res.json({ ok: true });
  } catch (error) {
    console.log(`${error.message}`.red.underline);
    return res.status(400).send("Try again");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // get the user with email
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(400).send("User with that email doesnt exist");
    }

    // check pwd
    const matchPwd = await comparePassword(password, user.password);

    if (!matchPwd) {
      return res.status(400).send("Incorrect password");
    }

    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    // return to client
    user.password = undefined;
    res.cookie("token", token, { httpOnly: true });
    res.json(user);
  } catch (error) {
    console.log(`${error.message}`.red.underline);
    return res.status(400).send("Try again");
  }
};
