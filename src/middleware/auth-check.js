const {
  sendResponse,
  verifyJwt,
  generatePolicy,
} = require('../utils/helpers');

module.exports.handler = async (event) => {
  try {
    if (!event.authorizationToken) {
      return sendResponse(403, 'Not allowed!');
    }

    const authToken = event.authorizationToken.split(' ');
    const jwtToken = authToken[1];
    if (!jwtToken) {
      return sendResponse(403, 'Not allowed!');
    }

    const tokenData = await verifyJwt(jwtToken);
    return generatePolicy(tokenData, 'Allow', event.methodArn);
  } catch (e) {
    console.log(e);
    return sendResponse(403, 'Not allowed!');
  }
};
