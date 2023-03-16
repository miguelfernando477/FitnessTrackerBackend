const express = require('express');
const router = express.Router();
const { requireUser } = require("./utils.js");
const errorMessages = require("../errors.js");
const { getRoutineActivityById, getRoutineById, updateRoutineActivity, destroyRoutineActivity } = require('../db');

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;
  
    const updateFields = {};
  
    if (count) {
      updateFields.count = count;
    }
  
    if (duration) {
      updateFields.duration = duration;
    }
   
    try {
      const originalRoutineActivity = await getRoutineActivityById(routineActivityId);
      const originalRoutine = await getRoutineById(originalRoutineActivity.routineId);
  
      if (originalRoutine.creatorId === req.user.id) {
        const updatedRoutineActivity = await updateRoutineActivity({
            id: routineActivityId,
            ...updateFields,
          });
        res.send(updatedRoutineActivity);
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

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    
    try {
        const routineActivity = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineActivity.routineId);

        if (routineActivity && routine.creatorId === req.user.id) {
            await destroyRoutineActivity(routineActivityId);
    
            res.send(routineActivity);
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

module.exports = router;
