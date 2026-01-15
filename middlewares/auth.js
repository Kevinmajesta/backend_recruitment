
const express = require("express");

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthenticated." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    req.user = {
      id: decoded.id,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    next();
  });
};

module.exports = verifyToken;
