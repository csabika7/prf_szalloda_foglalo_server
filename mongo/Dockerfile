FROM mongo:4.0

WORKDIR /

COPY example-db/user.json .
COPY example-db/reservationlog.json .
COPY example-db/hotel.json .

CMD mongoimport --host prf-hotel-mongo --db admin --collection user --file user.json \
    && mongoimport --host prf-hotel-mongo --db admin --collection hotel --file hotel.json \
    && mongoimport --host prf-hotel-mongo --db admin --collection reservationlog --file reservationlog.json