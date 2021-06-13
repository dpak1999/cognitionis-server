/** @format */
import colors from "colors";

export const errorHandler = (err, message) => {
  console.log(`${err.message}`.red.underline);
  return res.status(400).send(message);
};

export const genericError = (code, message) => {
  return res.status(code).send(message);
};
