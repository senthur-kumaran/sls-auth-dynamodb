const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const validateBody = (body) => {
  let isValid = true;
  try {
    Object.values(body).forEach((el) => {
      if (!el) isValid = false;
    });
  } catch (e) {
    isValid = false;
  }
  return isValid;
};

const sendResponse = (statusCode, message) => ({
  statusCode,
  body: message,
});

const signJwt = async (payload) => jwt.sign(payload, 'secret', { expiresIn: '24h' });

const createHash = async (password) => bcrypt.hash(password === '' ? undefined : password, 10);

const checkHash = async (password, hash) => bcrypt.compare(password, hash);

const verifyJwt = async (token) => jwt.verify(token, 'secret');

const generatePolicy = (tokenData, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = JSON.stringify(tokenData);
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = '*';
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};

module.exports = {
  validateBody,
  sendResponse,
  signJwt,
  createHash,
  checkHash,
  verifyJwt,
  generatePolicy,
};
