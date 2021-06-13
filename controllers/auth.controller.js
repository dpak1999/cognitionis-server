/** @format */
import colors from "colors";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth.util";
import jwt from "jsonwebtoken";
import { errorHandler, genericError } from "../utils/error.utils";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validations
    if (!name) {
      genericError(400, "Name is required");
    }

    if (!password || password.length < 7) {
      genericError(400, "Password should be Minimum 8 characters long");
    }

    if (!email) {
      genericError(400, "Email is required");
    }

    let existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      genericError(400, "An user with this email already exists");
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
  } catch (err) {
    errorHandler(err, "Unable to register");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // get the user with email
    const user = await User.findOne({ email }).exec();
    if (!user) {
      genericError(400, "User with that email doesnt exist");
    }

    // check pwd
    const matchPwd = await comparePassword(password, user.password);

    if (!matchPwd) {
      genericError(400, "Incorrect password");
    }

    // create signed jwt
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    // return to client
    user.password = undefined;
    res.cookie("token", token, { httpOnly: true });
    res.json(user);
  } catch (err) {
    errorHandler(err, "Unable to login");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Logged Out" });
  } catch (err) {
    errorHandler(err, "Unable to logout");
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    console.log("Current User", user);
    return res.json(user);
  } catch (err) {
    errorHandler(err, "Unable to fetch current user details");
  }
};
