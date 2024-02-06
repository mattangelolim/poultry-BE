const cors = require("cors");

// TO BLOCK OTHER ORIGIN FROM GETTING ACCESS TO OUR BACKEND SERVER, IN CASE THE DOMAIN OF FRONTEND HAS BEEN DECLARED; YOU CAN ADD THE DOMAIN HERE
module.exports = cors({
  origin: function (origin, callback) {
    if (
      [
        "http://localhost:3000",
      ].includes(origin) ||
      !origin
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed"));
    }
  },
});
