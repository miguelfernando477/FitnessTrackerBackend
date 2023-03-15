const express = require('express');
const router = express.Router();
const { getAllActivities, createActivity, getActivityByName } = require("../db");
const { requireUser } = require("./utils.js")
const errorMessages = require("../errors.js");

// GET /api/activities/:activityId/routines

// GET /api/activities
router.get("/", async (req, res, next) => {
    try {
        let activities = await getAllActivities()
        res.send(activities)
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  
// POST /api/activities
router.post("/", requireUser, async (req, res, next) => {
    const { name, description } = req.body;
    const _activity = await getActivityByName(name);
    try {
        if (_activity) {
            res.status(401);
            next({
              message: errorMessages.ActivityExistsError(name),
              name: "ActivityAlreadyExist",
            });
        }
      const createdActivity = await createActivity({name, description});
      if (createdActivity) {
        res.send( createdActivity );
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  
// PATCH /api/activities/:activityId

module.exports = router;
