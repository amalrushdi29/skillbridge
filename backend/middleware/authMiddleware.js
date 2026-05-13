import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in the request header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach the user to the request object
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;