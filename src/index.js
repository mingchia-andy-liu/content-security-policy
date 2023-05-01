const path = require("path");
const express = require("express");
const { expressCspHeader, NONCE } = require("express-csp-header");

const app = express();
const EJS = path.resolve(`${__dirname}/../ejs`);
const PUBLIC = path.resolve(`${__dirname}/../public`);

// set the view engine to ejs
app.set("view engine", "ejs");

/**
 * NO CSP
 *
 * /xss
 *
 * Server by static files
 */
app.use(express.static("public", { extensions: ["html"] }));


/**
 *  no CSP
 */
app.get(
  "/xss-1",
  (req, res) => {
    res.sendFile(`${PUBLIC}/xss.html`);
  }
);

/**
 * NONCE
 */
app.get(
  "/nonce",
  expressCspHeader({
    directives: {
      "script-src": [NONCE], // NONCE is a random number that should only be used once
    },
  }),
  (req, res) => {
    res.render(`${EJS}/xss`, { nonce: req.nonce });
  }
);

/**
 * HASH
 */
app.get(
  "/hash",
  expressCspHeader({
    directives: {
      "script-src": ["'self'", "'sha256-z3MGfz90JNhIhwtX4cVwlPL68VW5e8s76qSDIcfLtY4='"],
    },
  }),
  (req, res) => {
    res.sendFile(`${PUBLIC}/xss.html`);
  }
);

/**
 * Real world - 1
 */
app.get(
  "/twitter-1",
  expressCspHeader({
    directives: {
      "script-src": ["'self'"],
    },
  }),
  (req, res) => {
    res.sendFile(`${PUBLIC}/twitter.html`);
  }
);


/**
 * Real world - 2
 */
app.get(
  "/twitter-2",
  expressCspHeader({
    directives: {
      "script-src": ["'self'", "'sha256-rS2m0YpmTIVm725d2RK4w8Nkh/+xHJIpv96TRPP0LXQ='"],
    },
  }),
  (req, res) => {
    res.sendFile(`${PUBLIC}/twitter.html`);
  }
);


/**
 * Real world - 3
 * add missing script
 */
app.get(
  "/twitter-3",
  expressCspHeader({
    directives: {
      "script-src": ["'self'", "'sha256-rS2m0YpmTIVm725d2RK4w8Nkh/+xHJIpv96TRPP0LXQ='", "platform.twitter.com"],
    },
  }),
  (req, res) => {
    res.sendFile(`${PUBLIC}/twitter.html`);
  }
);

/**
 * Real world - 4
 * Strict CSP
 */
app.get(
  "/twitter-4",
  expressCspHeader({
    directives: {
      "script-src": ["'self'", NONCE, "'strict-dynamic'", "'unsafe-inline'", "http:", "https:"],
    },
  }),
  (req, res) => {
    res.render(`${EJS}/twitter`, { nonce: req.nonce });
  }
);


/**
 * Single Page Application (SPA)
 */
app.use("/static", express.static("react/build/static", { extensions: ["html"] }));
app.use("/react", express.static("react/build", { extensions: ["html"] }));

app.listen(8787);
console.log("Server is listening on port 8787");
