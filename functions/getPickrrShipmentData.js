
exports.handler = async (event) => {
    const shipRocketLogin = await fetch('https://api-cargo.shiprocket.in/api/token/refresh/', {
        method : "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: process.env.SHIPROCKET_REFRESH_TOKEN }),
      })
      const shiprocketLoginData = await shipRocketLogin.json()
      const shiprocketAccess = shiprocketLoginData.access
    const getShiprocketShipment = await fetch(`https://api-cargo.shiprocket.in/api/external/get_shipment/482115/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${shiprocketAccess}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const getShiprocketShipmentData = await getShiprocketShipment.json();
    return {
        statusCode: 200,
        body: getShiprocketShipmentData,
    }
}