# SZTE TTIK MI Msc. Programrendszerek fejlesztése lab.
**Title:** Szállodai foglalórendszer<br/>
**Author:** Csaba Kocsis
This project contains two subproject.
One under the "service" directory containing the node.js app that acts as a REST API.
The other is under the "ui" directory containing an angular app that acts as a web GUI.
# Running the application
The root of the project contains a docker-compose.yaml file. This file contains all the information to build the subprojects and run them in the proper order.
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
* **/hotel/list**
This endpoints returns all the stored hotels.
*Parameters:* -
*Content type:* application/json
*Response body*:
```javascript
{
    _id: Number // unique identifier
    stars: Number // hotel ratings in stars
    name: String // Registered name of the hotel
    extra_features: Array // list of extra services the hotel offers. e.g.: parking, wifi
    rooms [ // each object here represent a type of room
        {
            number_of_beds: Number // number of beds in the room
            extra_features: Array // list of extra services the room offers. e.g.: TV, hairdryer
        }
    ]
}
```

+ **/hotel/find**
This endpoint offers a way of searching for a room with the intent of reserving one.
+ **/hotel/add**
+ **/hotel/<hotel id>/room/add**
+ **/hotel/<hotel id>/room/<room id>/reserve**