var express = require('express');
var smartcar = require('smartcar');
var app = express();

const client = new smartcar.AuthClient({
   clientId: '44507a27-e650-40f5-a7a3-9ae57051e821',
   clientSecret: '1a10dfd4-0382-4c3b-b836-c712bf6fc89e',
   redirectUri: 'http://localhost:3000/register_vehicle',
   scope: ['read_vehicle_info', 'read_location', 'read_vin', 'read_odometer'],
   testMode: true,
});

app.use(express.static('public'));

app.get('/api/v1/orders', function (req, res) {
   // Prepare output in JSON format
   console.log(req.params);
   var response = { hello: 'world' };
   res.end(JSON.stringify(response));
})

app.get('/login', function (req, res) {
   res.end(client.getAuthUrl());
});

app.get('/register_vehicle', function (req, res) {
   let access;

   if (req.query.error) {
      // the user denied your requested permissions
      return next(new Error(req.query.error));
   }

   // exchange auth code for access token
   return client.exchangeCode(req.query.code)
      .then(function (_access) {
         // in a production app you'll want to store this in some kind of persistent storage
         access = _access;
         // get the user's vehicles
         return smartcar.getVehicleIds(access.accessToken);
      })
      .then(function (res) {
         // instantiate first vehicle in vehicle list
         const vehicle = new smartcar.Vehicle(res.vehicles[0], access.accessToken);
         // get identifying information about a vehicle
         return vehicle.info();
      })
      .then(function (data) {
         console.log(data);
         // {
         //   "id": "36ab27d0-fd9d-4455-823a-ce30af709ffc",
         //   "make": "TESLA",
         //   "model": "Model S",
         //   "year": 2014
         // }

         // json response will be sent to the user
         res.json(data);
      });
})

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
