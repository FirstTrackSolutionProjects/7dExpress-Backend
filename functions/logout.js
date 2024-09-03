exports.handler = async () => {
    return {
      status: 200,
      headers: {
        'Set-Cookie': 'accessToken=; HttpOnly; Secure; Path=/; Max-Age=0'
      },
      message: 'Logged out', success: true 
    };
  };
  