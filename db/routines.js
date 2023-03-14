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
      SELECT * FROM routines
      JOIN users ON routines."creatorId"=users.id;
     
      `)
    // return rows
    return attachActivitiesToRoutines(rows)
  } catch (error) {
    throw error
  }

  //mostly finished, just need to do a JOIN function with an AS keyword to rename usernames as creatorName.
  //start with JOIN function from juicebox
}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
