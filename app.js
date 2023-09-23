const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:/3000/");
    });
  } catch (e) {
    console.log(`DB Server : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET API
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
        SELECT 
        *
        FROM
        cricket_team;
    `;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// POST API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES 
        (`${playerName}`, `${jerseyNumber}`, `${role}`);`;
  const newPlayer = await db.run(postPlayerQuery);
  response.send(`Player Added to Team`);
});

// GET PLAYER API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE 
    player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// PUT API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE 
        cricket_team
        SET 
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
        WHERE 
        player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    DELETE FROM
    cricket_team
    WHERE 
    player_id = ${playerId};
  `;
  await db.run(getPlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
