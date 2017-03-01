var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var massive = require('massive');
//Need to enter username and password for your database
var connString = "postgres://localhost/assessbox";

var app = express();

app.use(bodyParser.json());
app.use(cors());

//The test doesn't like the Sync version of connecting,
//  Here is a skeleton of the Async, in the callback is also
//  a good place to call your database seeds.
var db = massive.connect({connectionString : connString},
  function(err, localdb){
    db = localdb;
    app.set('db', db);

    db.user_create_seed(function(){
      console.log("User Table Init");
    });
    db.vehicle_create_seed(function(){
      console.log("Vehicle Table Init")
    });

    // ENDPOINTS //
    // Will query the database and get all users
    app.get("/api/users", function(req, res) {
      db.run("SELECT * FROM Users", function(err, users) {
        if (err) {
          return res.status(404)
            .send(err);
        }
        res.status(200)
          .send(users);
      });
    });

    // Will query the database and get all vehicles
    app.get("/api/vehicles", function(req, res) {
      db.run("SELECT * FROM Vehicles", function(err, vehicles) {
        if (err) {
          return res.status(404)
            .send(err);
        }
        res.status(200)
          .send(vehicles);
      });
    });

    // Will take a user from the body and add them to the database
    app.post("/api/users", function(req, res) {
      var user = req.body;
      db.run("INSERT INTO Users (firstname, lastname, email) VALUES ($1, $2, $3)", [user.firstname, user.lastname, user.email], function(err, user) {
        res.status(200)
          .send(user);
      });
    });

    // Will take a vehicle from the body and add it to the database
    app.post("/api/vehicles", function(req, res) {
      var vehicle = req.body;
      db.run("INSERT INTO Vehicles (make, model, year, ownerId) VALUES ($1, $2, $3, $4)", [vehicle.make, vehicle.model, vehicle.year, vehicle.ownerId], function(err, vehicle) {
        res.status(200)
          .send(vehicle);
      });
    });

    // Will return a count of how many vehicles belong to the given user
    // Response should be an object with a count property ie: {count:1}
    app.get("/api/user/:userId/vehiclecount", function(req, res) {
      db.run("SELECT count(*) as count FROM Vehicles WHERE Vehicles.ownerId = $1", [req.params.userId], function(err, count) {
        res.status(200)
          .send(count[0]);
      });
    });

    // Will find all vehicles that belong to the user with the provided users id
    app.get("/api/user/:userId/vehicle", function(req, res) {
      db.run("SELECT * FROM Vehicles WHERE Vehicles.ownerId = $1", [req.params.userId], function(err, vehicles) {
        res.status(200)
          .send(vehicles);
      });
    });

    // Will find all vehicles that belong to the user with the provided users Email,
    // and get all vehicles for any user whose first name starts with the provided letters
    app.get("/api/vehicle", function(req, res) {
      if (req.query.UserEmail) {
        db.run("SELECT * FROM Vehicles INNER JOIN Users ON (Vehicles.ownerId = Users.id) WHERE email LIKE $1", [req.query.UserEmail], function(err, vehicles) {
          res.status(200)
            .send(vehicles);
        });
      } else if (req.query.userFirstStart) {
        db.run("SELECT * FROM Vehicles INNER JOIN Users ON (Vehicles.ownerId = Users.id) WHERE firstname LIKE $1", [req.query.userFirstStart + "%"], function(err, vehicles) {
          res.status(200)
            .send(vehicles);
        });
      } else {
        res.status(404)
          .send(err)
      };
    });

    // Gets all vehicles newer than 2000 and sorted by year with the newest car first with the owner first and last name
    app.get("/api/newervehiclesbyyear", function(req, res) {
      db.run("SELECT Vehicles.*, Users.firstname, Users.lastname FROM Vehicles INNER JOIN Users ON (Vehicles.ownerId = Users.id) WHERE Vehicles.year > 2000 ORDER BY Vehicles.year DESC", function(err, vehicles) {
        if (err) {
          return res.status(404)
            .send(err);
        }
        res.status(200)
          .send(vehicles);
      });
    });

    // Changes the ownership of the provided vehicle to be the new user
    app.put("/api/vehicle/:vehicleId/user/:userId", function(req, res) {
      db.run("UPDATE Vehicles SET ownerId = $2 WHERE id = $1", [req.params.vehicleId, req.params.userId], function(err, response) {
        res.status(200)
          .send("Ownership changed successfully!");
        // console.log("Ownership changed successfully!");
      });
    });

    // Removes ownership of that vehicle from the provided user, but does not delete the vehicle
    app.delete("/api/user/:userId/vehicle/:vehicleId", function(req, res) {
      db.run("UPDATE Vehicles SET ownerId = null WHERE ownerId = $1 AND id = $2", [req.params.userId, req.params.vehicleId], function(err, response) {
        res.status(200)
          .send("Ownership deleted successfully!");
        // console.log("Ownership deleted successfully!");
      });
    });

    // Deletes the specified vehicle
    app.delete("/api/vehicle/:vehicleId", function(req, res) {
      db.run("DELETE FROM Vehicles WHERE id = $1", [req.params.vehicleId], function(err, response) {
        res.status(200)
          .send("Vehicle deleted successfully!");
        // console.log("Vehicle deleted successfully!");
      });
    });

})

app.listen('3000', function(){
  console.log("Successfully listening on : 3000")
})

module.exports = app;
