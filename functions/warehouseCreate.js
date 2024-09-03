// netlify/functions/fetchData.js
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET

exports.handler = async (event, context) => {
    const {
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        pin
  } = event.body
  const token = event.headers.Authorization
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    const verified = jwt.verify(token, SECRET_KEY)
    const id = verified.id
    
        await connection.beginTransaction();
        await connection.execute('INSERT INTO WAREHOUSES (uid, warehouseName, address, phone, pin, city, state, country) VALUES (?,?,?,?,?,?,?,?)', [id, name, address, phone, pin, city, state, country]);
    // const delhivery_500 = await fetch(`https://track.delhivery.com/api/backend/clientwarehouse/create/`, {
    //     method: 'POST',
    //     headers: {
    //     'Authorization': `Token ${process.env.DELHIVERY_500GM_SURFACE_KEY}`,
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json'
    //     },
    //     body: JSON.stringify({name, email, phone, address, city, state, country, pin, return_address:address, return_pin:pin, return_city:city, return_state:state, return_country:country})
    // });
    // const delhivery_10 = await fetch(`https://track.delhivery.com/api/backend/clientwarehouse/create/`, {
    //     method: 'POST',
    //     headers: {
    //     'Authorization': `Token ${process.env.DELHIVERY_10KG_SURFACE_KEY}`,
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json'
    //     },
    //     body: JSON.stringify({name, email, phone, address, city, state, country, pin, return_address:address, return_pin:pin, return_city:city, return_state:state, return_country:country})
    // });
    // const data = await delhivery_500.json();
    // const data2 = await delhivery_10.json();
    const shipRocketLogin = await fetch('https://api-cargo.shiprocket.in/api/token/refresh/', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: process.env.SHIPROCKET_REFRESH_TOKEN }),
    })
    const shiprocketLoginData = await shipRocketLogin.json()
    const shiprocketAccess = shiprocketLoginData.access
    const shipRocketCargo = await fetch(`https://api-cargo.shiprocket.in/api/warehouses/`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${shiprocketAccess}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          client_id: 6488,
          address: {
              address_line_1: address,
              address_line_2: address,
              pincode: pin,
              city: city,
              state: state,
              country: country
          },
          "warehouse_code": name.replace(/\s+/g, ''),
          "contact_person_name": verified.name,
          "contact_person_email": verified.email,
          "contact_person_contact_no": "1234567890"
      })
    });
    const data3 = await shipRocketCargo.json();
    if (data3.non_field_errors){
        return {
            status: 400,
            success: false, message: data3.non_field_errors,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*', // Allow all origins (CORS)
              
            },
          };
    }
    try {
        
        await connection.commit();

      } catch (error) {
        return {
          status: 500,
           message: error.message , success: false ,
        };
      }
    return {
      status: 200,
      success: true, message:"Warehouse has been created",
    };
  } catch (error) {
    return {
      status: 501,
      success:false,  message: error.message + token ,
    };
  } finally {
    connection.end()
  }
};
