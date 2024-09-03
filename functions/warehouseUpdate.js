// netlify/functions/fetchData.js
const mysql = require('mysql2/promise');


exports.handler = async (event, context) => {
    const {
        name,
        phone,
        address,
        pin,
        city,
        state,
        country
  } = event.body
  try {
  //   const response = await fetch(`https://track.delhivery.com/api/backend/clientwarehouse/edit/`, {
  //       method: 'POST',
  //       headers: {
  //       'Authorization': `Token ${process.env.DELHIVERY_500GM_SURFACE_KEY}`,
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //       },
  //       body: JSON.stringify({name,  phone, address, pin})
  //   });
  //   const response2 = await fetch(`https://track.delhivery.com/api/backend/clientwarehouse/edit/`, {
  //     method: 'POST',
  //     headers: {
  //     'Authorization': `Token ${process.env.DELHIVERY_10KG_SURFACE_KEY}`,
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //     },
  //     body: JSON.stringify({name,  phone, address, pin})
  // });
    // const data = await response.json();
    // const data2 = await response2.json();
    const shipRocketLogin = await fetch('https://api-cargo.shiprocket.in/api/token/refresh/', {
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
          };
    }
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    try {
        
        await connection.execute('UPDATE WAREHOUSES set address = ?, phone = ?, pin = ? WHERE warehouseName = ?', [ address, phone, pin, name]);

      } catch (error) {
        return {
          status: 500,
           message: error.message , success: false ,
        };
      } finally{
        connection.end()
      }
    return {
      status: 200,
      success: true, message:data.data.message,
    };
  } catch (error) {
    return {
      status: 501,
      success:false,  message: error ,
    };
  }
};
