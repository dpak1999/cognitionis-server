/** @format */
import User from "../models/User";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import { comparePassword, hashPassword } from "../utils/auth.util";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

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
    return res.status(400).send("Unable to register");
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
  } catch (err) {
    return res.status(400).send("Unable to login");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Logged Out" });
  } catch (err) {
    return res.status(400).send("Unable to logout");
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).send("Unable to fetch current user details");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );

    if (!user) {
      return res.status(400).send("User with that email doesnt exist");
    }

    // send email
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: { ToAddresses: ["dashdeepak30@gmail.com"] },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
            <html>
              <h1>Reset password link</h1>
              <p>Please use the following code to reset your password</p>
              <h2 style="color: red">${shortCode}</h2>
            </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Cognitionis Password reset link",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => console.log(`${err}`.red.underline));
  } catch (err) {
    return res.status(400).send("Unable to send mail");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const hashedPassword = await hashPassword(newPassword);
    const user = await User.findOne({ passwordResetCode: code });

    if (!user) {
      return res.status(400).send("Invalid code");
    }

    await User.updateOne(
      { email },
      { password: hashedPassword, passwordResetCode: "" }
    ).exec();

    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).send("Unable to reset password");
  }
};
