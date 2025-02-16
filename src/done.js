const moment = require('moment-timezone');
const {stagePool, localpool, formatEmail, formatGender, formatAddress, formatCoordinates} = require('./dbcon');
const { Readable } = require('stream');

let count = 0;
let insertValues = '';


// const getUsers = `select u.id as userId, u.name, u.phone, u.gender,u.email, u.date_of_birth as dob, u.sponsor_id as orgId from users u where u.id > 4644583 and (u.name is not null and u.phone is not null) ;`;
// const getPincodes = `SELECT id,  pincode, division, region, circle, taluk, district, state, city, tier, top_50_city, top_25_city, approx_lng, approx_lat, zone, tier_ops FROM dim_pincodes where active =1 ; `
// const getDoctors = `select id, first_name, last_name, phone, email, gender, speciality, coalesce(registration_no, registrations) as registrations, charges, degrees, college, city,  services, education, organizations from doctors d where phone <> '0'`

const getAddresses = `select id, user_id, address, pincode, locality, lat, \`long\` as lng from labs_addresses where is_location_updated = 1 and lat <> 0`


async function processStream() {
  try {
    // Connect to the database
    stagePool.connect();

    // Create a readable stream from the query
    // const queryStream = stagePool.query(getUsers).stream();
    // const queryStream = stagePool.query(getPincodes).stream();
    const queryStream = stagePool.query(getAddresses).stream();

    // Wrap the query stream as an async iterator
    const asyncIterableStream = Readable.from(queryStream);

    // Process each row with `await`
    // for await (const row of asyncIterableStream) {
    // insertValues += `(${stagePool.escape(row.userId)}, ${null}, ${stagePool.escape(formatName(row.name.substring(0, 50)))}, ${stagePool.escape(row.gender ? (row.gender === 'Male') ? 'M' : 'F' : null)}, ${stagePool.escape(row.dob?(moment(row.dob).format('YYYY-MM-DD')): null)}, ${stagePool.escape(row.email)}, ${stagePool.escape(row.phone.toString().length>10?null:row.phone)}, ${stagePool.escape(row.orgId)}),`;
    //     count++;
    //     let len = row.phone.toString().length;
    //     if (count % 10000 === 0) {
    //         if(insertValues.length){

    //             // remove last char
    //             insertValues = insertValues.slice(0, -1);
    //         }
    //         let userQuery = `INSERT INTO care.vusers (userId, patientId, name, gender, dob, email, phone, orgId) VALUES ${insertValues}`;
    //         await (await localpool).query(userQuery);
    //         console.log(`Processed ${count} rows. Recent user id ${row.userId}`);
    //         insertValues = '';
    //         userQuery ='';
    //     }
    // //   console.log('Processed row:', row);
    // }

    // for await (const row of asyncIterableStream) {
    //     insertValues += `(${stagePool.escape(row.pincode)}, ${stagePool.escape(row.division)}, ${stagePool.escape(row.region)}, ${stagePool.escape(row.circle)}, ${stagePool.escape(row.taluk)}, ${stagePool.escape(row.district)}, ${stagePool.escape(row.state)},${stagePool.escape(row.city)}, ST_GeomFromText('POINT(${row.approx_lng} ${row.approx_lat})'), ${stagePool.escape(row.zone)}, ${stagePool.escape(row.tier)}, ${stagePool.escape(row.top_50_city)}, ${stagePool.escape(row.top_25_city)}),`;
    //     count++;
    //     if (count % 100 === 0) {
    //         if(insertValues.length){
    //             insertValues = insertValues.slice(0, -1);
    //         }
    //         let userQuery = `INSERT INTO care.stored_pincodes (pincode, division, region, circle, taluk, district, state, city, coordinates, zone, tier, top_50_city, top_25_city) VALUES ${insertValues} on duplicate key update state = values(state) , city = values(city) `;
    //         await (await localpool).query(userQuery);
    //         console.log(`Processed ${count} rows. Recent id ${row.id}`);
    //         insertValues = '';
    //         userQuery ='';
    //     }
    // }

  //   for await (const row of asyncIterableStream) {
  //     insertValues += `(${stagePool.escape(row.first_name + ' ' +row.last_name)}, ${stagePool.escape(row.phone)}, ${stagePool.escape(formatEmail(row.email))}, ${stagePool.escape(formatGender(row.gender))}, ${stagePool.escape(row.speciality)}, ${stagePool.escape(row.registrations)}, ${stagePool.escape(row.charges)}, ${stagePool.escape(row.degrees)}, ${stagePool.escape(row.college)}, ${stagePool.escape(row.city)}, ${stagePool.escape(row.services)}, ${stagePool.escape(row.education)}, ${stagePool.escape(row.organizations)}),`;
  //     count++;
  //     if (count % 100 === 0) {
  //         if(insertValues.length){
  //             insertValues = insertValues.slice(0, -1);
  //         }
  //         let userQuery = `INSERT INTO care.vdoctors (name, phone, email, gender, speciality, registrations, charges, degrees, college, city, services, education, organizations) VALUES ${insertValues}`;
  //         await (await localpool).query(userQuery);
  //         console.log(`Processed ${count} rows. Recent id ${row.id}`);
  //         insertValues = '';
  //         userQuery ='';
  //     }
  // }

  for await (const row of asyncIterableStream) {
    insertValues += `(${stagePool.escape( formatAddress(row.address + ',' +row.locality ))}, ${stagePool.escape(row.user_id)}, ${stagePool.escape(row.pincode)}, ${formatCoordinates(row.lat,row.lng)}),`;
    count++;
    if (count % 100 === 0) {
        if(insertValues.length){
            insertValues = insertValues.slice(0, -1);
        }
        let userQuery = `INSERT INTO care.vaddress (address, userId, pincode, coordinates) VALUES ${insertValues}`;
        await (await localpool).query(userQuery);
        console.log(`Processed ${count} rows. Recent id ${row.id}`);
        insertValues = '';
        userQuery ='';
    }
  }


    console.log('All rows processed.');
  } catch (err) {
    console.error('Error while processing stream:', err);
  } finally {
    // Close the connection when done
    stagePool.end();
  }
}

// Run the function
processStream();

// create table vusers
// (
//     id         int unsigned auto_increment
//         primary key,
//     userId     int                                   null,
//     patientId  int                                   null,
//     name       varchar(50)                           null,
//     dob        date                                  null,
//     gender     varchar(1)                            null,
//     phone      varchar(10)                           null,
//     email      varchar(100)                          null,
//     orgId      smallint unsigned                     null,
//     created_at timestamp default current_timestamp() not null,
//     updated_at timestamp default current_timestamp() not null on update current_timestamp()
// );
// mysql  commands
// select user from mysql.user;
// create  user 'care'@'localhost' identified by 'careisgenius';
// drop user 'care@localhost';


// GRANT ALL PRIVILEGES ON care.* TO 'care'@'localhost';
// GRANT SELECT, INSERT, UPDATE PRIVILEGES ON care.* TO 'care'@'localhost';
// GRANT SELECT ON *.* TO 'user'@'localhost' IDENTIFIED BY 'password';
// FLUSH PRIVILEGES;

// select u.id as userId, u.name, u.phone, u.gender, u.date_of_birth as dob from users u
// where u.id >100 and (u.name is not null and u.phone is not null) limit 10

// alter table vusers
//     modify id int unsigned auto_increment;



// users table  -done
// pincode table -done
// partners table 
// centers table
// address table -done
// tests table -done
// doctor -done
// doctor education 
// 
// create table dim_pincodes
// (
//     pincode               int unsigned
//         primary key,
//     pincode          int unsigned                            null,
//     division         varchar()                                null,
//     region           varchar(40)                                null,
//     circle           varchar(40)                                null,
//     taluk            varchar(40)                                null,
//     district         varchar(40)                                null,
//     state            varchar(25)                                null,
//     city             varchar(35)                                null,
//     coordinates      POINT                          null,
//     zone             enum ('north', 'south', 'east', 'west') null,
//     tier             tinyint default 3                       not null,
//     top_50_city      tinyint default 0                       not null,
//     top_25_city      tinyint default 0                       not null,
//     created_at       timestamp                               null,
//     updated_at       timestamp                               null,
// )

// CREATE TABLE locations (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(255),
//   location POINT NOT NULL,
//   SPATIAL INDEX (location)
// );

// create table vusers
// (
//     id         int unsigned auto_increment
//         primary key,
//     userId     int                                   null,
//     patientId  int                                   null,
//     name       varchar(50)                           null,
//     dob        date                                  null,
//     gender     varchar(1)                            null,
//     phone      varchar(10)                           null,
//     email      varchar(100)                          null,
//     orgId      smallint unsigned                     null,
//     created_at timestamp default current_timestamp() not null,
//     updated_at timestamp default current_timestamp() not null on update current_timestamp()
// );


// INSERT INTO stored_pincodes 
// (pincode, division, region, circle, taluk, district, state, city, coordinates, zone, tier, top_50_city, top_25_city,)
// VALUES     (110001, 'Delhi', 'North', 'Delhi', 'Connaught Place', 'New Delhi', 'Delhi', 'New Delhi', ST_GeomFromText('POINT(77.2296 28.6139)'), 'North', 1, 1, 1, NOW(), NOW())


// create table vaddress
// (
//     id                   int unsigned auto_increment
//         primary key,
//     address     tinytext                            null,
//     userId     int                                  null,
//     pincode          int unsigned                   null,
//     coordinates      POINT                          null,
//     created_at           datetime    default CURRENT_TIMESTAMP not null,
//     updated_at           datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
// )