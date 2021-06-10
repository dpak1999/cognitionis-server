/** @format */
import colors from "colors";
import User from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth.util";

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
