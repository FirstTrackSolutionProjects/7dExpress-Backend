const mysql = require('mysql2/promise');

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  const token = event.headers.Authorization;
  if (!token) {
    return {
      status : 401,
      message: 'Access Denied'
    };
  }
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    const id = verified.id;
    if (!id) {
      return {
        status: 400,
        message: 'Invalid token'
      };
    }
    const { ord_id } = event.body;
    if (!ord_id) {
      return {
        status: 400,
        message: 'Order id is required'
      };
    }
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [orders] = await connection.execute('SELECT * FROM SHIPMENTS WHERE ord_id = ?  AND in_process = true', [ord_id]);
      if (!orders.length) {
        return {
          status: 400,
          message: 'Order is already processed'
        };
      }
      const order = orders[0];
      const serviceId = order.serviceId;
      const categoryId = order.categoryId;
      const vendorRefId = order.vendor_shipping_reference_id;
      if (serviceId == 3) {

        const shipRocketLogin = await fetch('https://api-cargo.shiprocket.in/api/token/refresh/', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: process.env.SHIPROCKET_REFRESH_TOKEN }),
        })
        const shiprocketLoginData = await shipRocketLogin.json()
        const shiprocketAccess = shiprocketLoginData.access

        const getShipmentStatus = await fetch(`https://api-cargo.shiprocket.in/api/external/get_shipment/${vendorRefId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${shiprocketAccess}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });

        const getShipmentStatusData = await getShipmentStatus.json();

        if (getShipmentStatusData.waybill_no){
          await connection.execute('UPDATE SHIPMENTS SET awb = ? WHERE ord_id = ?',[getShipmentStatusData.waybill_no, ord_id]);
          return { status: 200, success : true,  message: 'Shipment processed successfully', awb : getShipmentStatusData.waybill_no };
        } else {
          return { status: 200, success : false, message: 'Shipment is still under process' };
        }

      } else {
        return { status: 404, message: 'Service not found' };
      }
    } catch (e) {
      console.error(e);
      return {
        status: 500,
        message: 'Internal Server Error'
      };
    } finally {
      await connection.end();
    }
  } catch (err) {
    console.error(err);
    return {
      status: 500,
      message: 'Internal Server Error'
    };
  }
}