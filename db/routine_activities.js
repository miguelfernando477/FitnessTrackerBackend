const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [newRoutineActivity],
    } = await client.query(`
    INSERT INTO routine_activities ("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [routineId, activityId, count, duration]
    );
    return newRoutineActivity
  } catch (error) {
    throw error
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows
    } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1
      `, [id])
  
    return rows[0]
  } catch (error) {
    throw error
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const {
      rows
    } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1
      `, [id])
  
    return rows
  } catch (error) {
    throw error
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  
  if (setString.length === 0) {
    return;
    
  }
    const {
      rows: [routine_activity]
    } =
    await client.query(`
    UPDATE routine_activities
          SET ${setString}
          WHERE id=${ id }
          RETURNING *;
    `, Object.values(fields))
    return routine_activity
  } catch (error) {
    throw error
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [deletedRoutine]
    } = await client.query(`
    SELECT * FROM routine_activities
    WHERE routine_activities.id=$1
    `,[id])
    
    await client.query(`
      DELETE FROM routine_activities
      WHERE routine_activities.id=$1
      `,[id])

    return deletedRoutine
    } catch (error) {
      throw error
    }
}

async function canEditRoutineActivity(routineActivityId, userId) {
try {
  const {
    rows
  } = await client.query(`
    SELECT routines."creatorId", routine_activities.id, routines.id, routine_activities."routineId"
    FROM routines
    JOIN routine_activities 
    ON routines.id=routine_activities."routineId"
    WHERE routine_activities.id=$1 AND routines."creatorId"=$2
    `,[routineActivityId, userId])
    return (rows.length > 0)
} catch (error) {
  throw error
}
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
