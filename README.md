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
This command will start the following docker containers:
prf-hotel-nodejs:1.0
prf-hotel-angular:1.0
mongo:4.0

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
    extra_features: Array,          // list of extra services the hotel offers. e.g.: parking, wifi
    rooms [                         // each object here represent a type of room
        {
            _id: string,            // unique identifier
            number_of_beds: Number, // number of beds in the room
            extra_features: Array   // list of extra services the room offers. e.g.: TV, hairdryer
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
    name: string,              // name of the hotel the user is looking for. It can be a partial text. Optional field.
    extra_features: Array,     // list of extra services the hotel offers. Accepts Array of strings. Optional field.
    number_of_beds: Number,    // number of beds in the room. Optional field
    romm_extra_features: Array // list of extra services the hotel offers for the room. Accepts Array of strings. Optional field.
}
```
*Response body*:
```javascript
{
    _id: Number                      // unique identifier
    stars: Number,                   // hotel ratings in stars
    name: String,                    // Registered name of the hotel
    extra_features: Array,           // list of extra services the hotel offers. e.g.: parking, wifi
    rooms [                          // each object here represent a type of room
        {
            _id: string,             // unique identifier
            number_of_beds: Number,  // number of beds in the room
            extra_features: Array,   // list of extra services the room offers. e.g.: TV, hairdryer
            remaining: Number        // number of rooms available for reservation for the selected staying interval.
                                     // It will give the minimum remaining amongst each day in the interval.
        }
    ]
}
```

+ **PUT /hotel/add**
*Content type:* application/json<br>
*Request body parameters:*<br>

+ **POST /hotel/:hotelId/room/add**
*Content type:* application/json<br>
*Path parameters:*<br>
hotelId: identifier of the hotel to which a new type of room is to be added<br>
*Request body parameters:*<br>

+ **POST /hotel/:hotelId/room/:roomId/reserve**
*Content type:* application/json<br>
*Path parameters:*<br>
hotelId: identifier of the hotel where the room is to be reserved<br>
roomId: identifier of the room to be reserved<br>
*Request body parameters:* -<br>