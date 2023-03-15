/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { getUserByUsername, createUser } = require("../db");
const jwt = require("jsonwebtoken");
const errorMessages = require("../errors.js");

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const _user = await getUserByUsername(username);

    if (_user) {
      res.status(401);
      next({
        message: errorMessages.UserTakenError(username),
        name: "UserAlreadyExist",
      });
    } else if (password.length < 8) {
        res.status(401);
      next({
        message: errorMessages.PasswordTooShortError(),
        name: "PasswordToShort",
      });
    } else {
      const user = await createUser({
        username,
        password,
      });

      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      res.send({
        user,
        message: "thank you for signing up",
        token,
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
  
    //request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password",
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET
        );
        res.send({ message: "you're logged in!", token: token });
      } else {
        next({
          name: "IncorrectCredentialsError",
          message: "Username or password is incorrect",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
