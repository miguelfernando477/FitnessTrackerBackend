const express = require("express");
const router = express.Router();
const {
  getAllActivities,
  createActivity,
  getActivityByName,
  getActivityById,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");
const { requireUser } = require("./utils.js");
const errorMessages = require("../errors.js");

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  const activityExists = await getActivityById(activityId);
  try {
    if (!activityExists) {
      res.status(401);
      next({
        message: errorMessages.ActivityNotFoundError(activityId),
        name: "ActivityNotFound",
      });
    } else {
      let publicRoutines = await getPublicRoutinesByActivity({
        id: activityId,
      });
      res.send(publicRoutines);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    let activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

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
    const createdActivity = await createActivity({ name, description });
    if (createdActivity) {
      res.send(createdActivity);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;

  const updateFields = {};

  if (name) {
    updateFields.name = name;
  }

  if (description) {
    updateFields.description = description;
  }

  try {
    const activityExists = await getActivityById(activityId);

    const _activity = await getActivityByName(name);

    if (!activityExists) {
      res.status(401);
      next({
        message: errorMessages.ActivityNotFoundError(activityId),
        name: "ActivityNotFound",
      });
    } else if (_activity) {
      res.status(401);
      next({
        message: errorMessages.ActivityExistsError(name),
        name: "ActivityAlreadyExist",
      });
    } else {
      const updatedActivity = await updateActivity({
        id: activityId,
        ...updateFields,
      });
      res.send(updatedActivity);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;
