const express = require('express');
const { getAllRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, addActivityToRoutine, getRoutineActivitiesByRoutine } = require('../db');
const router = express.Router();
const { requireUser } = require("./utils.js");
const errorMessages = require("../errors.js");

// GET /api/routines
router.get("/", async (req, res, next) => {
    try {
      let routines = await getAllRoutines();
      res.send(routines);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
// POST /api/routines
router.post("/", requireUser, async (req, res, next) => {
    const { name, goal, isPublic } = req.body;
    const creatorId = req.user.id
    try {
      const createdRoutine = await createRoutine({ name, goal, isPublic, creatorId });
      res.send(createdRoutine);
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  
// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { name, goal, isPublic } = req.body;
  
    const updateFields = {};
  
    if (name) {
      updateFields.name = name;
    }
  
    if (goal) {
      updateFields.goal = goal;
    }

    if (isPublic===true||isPublic===false) {
        updateFields.isPublic = isPublic;
      }
   
    try {
      const originalRoutine = await getRoutineById(routineId);
  
      if (originalRoutine.creatorId === req.user.id) {
        const updatedRoutine = await updateRoutine({
            id: routineId,
            ...updateFields,
          });
        res.send(updatedRoutine);
      } else {
        res.status(403)
        next({
          name: "UnauthorizedUserError",
          message: errorMessages.UnauthorizedUpdateError(req.user.username, originalRoutine.name),
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const routine = await getRoutineById(routineId);
    try {
  
      if (routine && routine.creatorId === req.user.id) {
        await destroyRoutine(routineId);
  
        res.send(routine);
      } else {
        res.status(403)
        next({
          name: "UnauthorizedUserError",
          message: errorMessages.UnauthorizedDeleteError(req.user.username, routine.name),
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
    const { activityId, count, duration } = req.body;

    const { routineId } = req.params;

    try {
      //To prevent duplicate routine/activity pairs:
      //-get list from getRoutineActivitiesByRoutine(routineId)
      //-search through list to see if it contains activityId
      //-if it does, throw an error, else do the rest of the code
      
      const routineActivities = await getRoutineActivitiesByRoutine({id:routineId});

      let duplicates = false;

      routineActivities.map((routineActivity) => {
        if (routineActivity.activityId === activityId) {
          duplicates = true;
        }
      })

      if (duplicates) {
        next({
          name: "DuplicateRoutineActivityError",
          message: errorMessages.DuplicateRoutineActivityError(routineId, activityId),
        });
      } else {
        const routineActivity = await addActivityToRoutine({ routineId, activityId, count, duration });
        res.send(routineActivity);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

module.exports = router;
