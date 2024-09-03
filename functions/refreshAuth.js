const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const cookies = event.headers.cookie;
  if (!cookies) {
    return {
      status: 401,
      message: 'Unauthorized', success: false 
    };
  }
  try{
  const refreshToken = cookies.split('; ').find(row => row.startsWith('refreshToken')).split('=')[1];

  if (!refreshToken) {
    return {
      status: 401,
      message: 'Unauthorized', success: false 
    };
  }

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    return {
      status: 200,
      headers: {
        'Set-Cookie': `accessToken=${newAccessToken}; HttpOnly; Secure; Path=/; Max-Age=900`
      },
       message: 'Access token refreshed', success : true 
    };
  } catch (err) {
    return {
      status: 403,
      message: 'Forbidden', success : false 
    };
  }
} catch (e){
    return {
      status: 400,
      message: 'Invalid Token', success : false ,
    };
  
}
};
