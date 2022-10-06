const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API1
convertDbToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const sqlQuery = `
    SELECT *
    FROM state;`;
  const stateList = await db.all(sqlQuery);
  response.send(stateList.map((each) => convertDbToResponseObject(each)));
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const stateId = request.params;
  const sqlQuery = `
    SELECT *
    FROM state
    WHERE state_id = ${stateId};`;
  const state = await db.get(sqlQuery);
  response.send(state.map((each) => convertDbToResponseObject(each)));
});

//API 3
app.post("/districts/", async (request, response) => {
  const {
    districtId,
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = request.body;
  const sqlQuery = `
    insert into 
    district(district_id, district_name,state_id, cases, cured, active,
        deaths)
    values(district_id = ${districtId},district_name = ${districtName}, 
      state_id = ${stateId}, cases = ${cases}, cured = ${cured},
      active = ${active};`;
  const addedDistrict = await db.run(sqlQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const districtId = request.params;
  const sqlQuery = `
    select *
    from district
    where district_id = ${districtId};`;
  const dbResponse = await db.get(sqlQuery);
  response.send(dbResponse.map((dis) => convertDbToResponseObject(dis)));
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const districtId = request.params;
  const sqlQuery = `
    delete 
    from district
    where district_id = ${districtId};`;
  const dbResponse = await db.run(sqlQuery);
  response.send("District Details Updated");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const districtId = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const sqlQuery = `
    update district
    set district_name = ${districtName}, 
      state_id = ${stateId}, cases = ${cases}, cured = ${cured},
      active = ${active};`;
  const dbResponse = await db.run(sqlQuery);
  response.send("district details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const stateId = request.params;
  const sqlQuery = `
    select count(cases) AS totalCases,
    count(cured) AS totalCured,
    count(active) AS totalActive,
    count(deaths) AS totalDeaths
    from district
    where state_id = ${stateId};`;
  const dbResponse = await db.get(sqlQuery);
  response.send(dbResponse);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const districtId = request.params;
  const sqlQuery = `
    select state_name as stateName
    from state inner join district on state.id = district.state_id
    where district_id = ${districtId};`;
  const dnResponse = await db.get(sqlQuery);
  response.send(dnResponse);
});
module.exports = app;
