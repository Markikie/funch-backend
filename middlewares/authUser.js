import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    try {
      // Extract token from headers
      const token = req.headers.token;
  
      // Check if token is present
      if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized. Please log in again." });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach user ID to request body for later use
      req.body.userId = decoded.id;
  
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Token verification failed. Please log in again." });
    }
  };
  
  export default authUser;
  