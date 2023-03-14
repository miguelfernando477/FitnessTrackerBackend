const client = require("./client");

const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [newRoutine],
    } = await client.query(`
    INSERT INTO routines ("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
    RETURNING *
    `,
    [creatorId, isPublic, name, goal]
    );
    return newRoutine
  } catch (error) {
    throw error
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine]
    } = await client.query(`
    SELECT * FROM routines
    WHERE id=$1
    `, [id]
    )
    return routine
  } catch (error) {
    throw error
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const {
      rows
    } = await client.query(`
      SELECT * FROM routines
      `)
  
    return rows
  } catch (error) {
    throw error
  }
}

async function getAllRoutines() {
  try {
    const {
      rows
    } = await client.query(`
      SELECT routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, users.username AS "creatorName" 
      FROM routines
      JOIN users 
      ON routines."creatorId"=users.id
      `)
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }
}

async function getAllPublicRoutines() {
  try {
    const {
      rows
    } = await client.query(`
      SELECT routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, users.username AS "creatorName" 
      FROM routines
      JOIN users 
      ON routines."creatorId"=users.id
      WHERE routines."isPublic"=true
      `)
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const {
      rows
    } = await client.query(`
      SELECT routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, users.username AS "creatorName" 
      FROM routines
      JOIN users 
      ON routines."creatorId"=users.id
      WHERE users.username=$1
      `, [username])
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const {
      rows
    } = await client.query(`
      SELECT routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, users.username AS "creatorName" 
      FROM routines
      JOIN users 
      ON routines."creatorId"=users.id
      WHERE users.username=$1
      AND routines."isPublic"=true
      `, [username])
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const {
      rows
    } = await client.query(`
      SELECT routines.id, routines."creatorId", routines."isPublic", routines.name, routines.goal, users.username AS "creatorName" 
      FROM routines
      JOIN users 
      ON routines."creatorId"=users.id
      JOIN routine_activities ON routines.id=routine_activities."routineId"
      WHERE routines."isPublic"=true AND routine_activities."activityId"=$1
      `,[id])
   
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }
}

async function updateRoutine({ id, ...fields }) {
try {
  const setString = Object.keys(fields)
  .map((key, index) => `"${key}"=$${index + 1}`)
  .join(", ");

if (setString.length === 0) {
  return;
  
}
  const {
    rows: [routine]
  } =
  await client.query(`
  UPDATE routines
        SET ${setString}
        WHERE id=${ id }
        RETURNING *;
  `, Object.values(fields))
  return routine
} catch (error) {
  throw error
}
}


async function destroyRoutine(id) {
try {
 await client.query(`
  DELETE FROM routine_activities
  WHERE routine_activities."routineId"=$1
  `,[id])
  await client.query(`
  DELETE FROM routines
  WHERE routines.id=$1
  `,[id])
} catch (error) {
  throw error
}
}
module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
