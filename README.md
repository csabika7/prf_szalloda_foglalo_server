# SZTE TTIK MI Msc. Programrendszerek fejlesztése lab.
**Title:** Szállodai foglalórendszer<br>
**Author:** Csaba Kocsis<br>
This project contains two subproject.<br>
One under the "service" directory containing the node.js app that acts as a REST API.<br>
The other is under the "ui" directory containing an angular app that acts as a web GUI.<br>
# Running the application
The root of the project contains a docker-compose.yml file. This file contains all the information to build the subprojects and run them in the proper order.
In order to run the application you will to have docker-compose installed on your system.
Install documentation: https://docs.docker.com/compose/install/
To start the app go to the root of the project and execute:
```bash
docker-compose up -d
```
To stop the app execute:
```bash
docker-compose down;
```
This command will start the following docker containers:<br>
- prf-hotel-nodejs:1.0
- prf-hotel-angular:1.0
- mongo:4.0
- nginx:1.16.0

It also starts up a temporary container that fills up the mongodb with the example db.<br>

The nginx server in this setup is used as a reverse proxy. It is used so that CORS is not a problem when accessing the nodejs REST API from the angular app.

# Configuration
The docker-compose.yml file contains to unfilled environment variables: EMAIL_USER, EMAIL_PASS.<br>
The application sends out emails for each reservation. These env vars will be used for sending the emails (the email needs to be a gmail account).

# Service API
The service directory contains the node.js app serving as a REST API.
## Available endpoints:
* **GET /hotel/list**
This endpoints returns all the stored hotels.<br>
*Content type:* application/json<br>
*Response body*:
```javascript
{
    _id: Number                     // unique identifier
    stars: Number,                  // hotel ratings in stars
    name: String,                   // Registered name of the hotel
    city: String,                   // City where the hotel is located
    extraFeatures: Array,           // list of extra services the hotel offers. e.g.: parking, wifi
    rooms [                         // each object here represent a type of room
        {
            _id: string,            // unique identifier
            numberOfBeds: Number,   // number of beds in the room
            extraFeatures: Array    // list of extra services the room offers. e.g.: TV, hairdryer
        }
    ]
}
```

+ **POST /hotel/find**
This endpoint offers a way of searching for a room with the intent of reserving one.<br>
*Content type:* application/json<br>
*Request body parameters:*<br>
```javascript
{
    arrival: string            // date of arrival in the hotel. format: YYYY-MM-DD. Required field.
    leaving: string,           // date of leaving the hotel. format: YYYY-MM-DD, Required field.
    cityName: string,          // name of the city the hotel is located. It can be a partial text. Optional field.
}
```
*Response body*:
```javascript
{
    _id: Number                      // unique identifier
    stars: Number,                   // hotel ratings in stars
    name: String,                    // Registered name of the hotel
    city: String,                    // City where the hotel is located
    extraFeatures: Array,            // list of extra services the hotel offers. e.g.: parking, wifi
    rooms: [                          // each object here represent a type of room
        {
            _id: string,             // unique identifier
            numberOfBeds: Number,    // number of beds in the room
            price: Number,           // price of the room in dollars for a night
            extraFeatures: Array,    // list of extra services the room offers. e.g.: TV, hairdryer
            remaining: Number        // number of rooms available for reservation for the selected staying interval.
                                     // It will give the minimum remaining amongst each day in the interval.
        }
    ]
}
```

+ **PUT /hotel/add**
This endpoint adds a new hotel to the database.
*Content type:* application/json<br>
*Request body parameters:*<br>
```javascript
{
    name: string                   // Name of the hotel. Required field.
    stars: string,                 // Rating of the hotel. A number between 1-5. Required field.
    extraFeatures: Array,          // Array of texts describing features of the hotel. Optional field.
    rooms: [                       // List of rooms available in the hotel. Optional field. (rooms can be added later)
        numberOfBeds: Number,      // Number of beds in the room.
        price: Number,             // Price of the room in dollars for a night.
        available: Number,         // Number of such room available in the hotel.
        extraFeatures: Array       // Array of texts describing the features of the room.
    ]
}
```

+ **POST /hotel/:hotelId/room/add**
This endpoint adds a room to an existing hotel.
*Content type:* application/json<br>
*Path parameters:*<br>
hotelId: identifier of the hotel to which a new type of room is to be added<br>
*Request body parameters:*<br>
```javascript
{
    numberOfBeds: Number,      // Number of beds in the room.
    price: Number,             // Price of the room in dollars for a night.
    available: Number,         // Number of such room available in the hotel.
    extraFeatures: Array       // Array of texts describing the features of the room.
}
```

+ **POST /hotel/:hotelId/room/:roomId/:arrival/:leaving/reserve**
This endpoint will reserve a room in a hotel for the given date interval.
*Path parameters:*<br>
hotelId: identifier of the hotel where the room is to be reserved<br>
roomId: identifier of the room to be reserved<br>
arrival: date of the check-in to the hotel. format: YYYY-MM-DD.<br>
leaving: date of the check-out from the hotel. format: YYYY-MM-DD

+ **GET /hotel/:hotelId/ratings**
This endpoint returns the user ratings for a hotel.
*Path parameters:*<br>
hotelId: identifier of the hotel<br>

+ **POST /hotel/:hotelId/rate/:rating**
This endpoint adds the currently logged in user's rating to the given hotel.
*Path parameters:*<br>
hotelId: identifier of the hotel<br>
rating: number between 1-5