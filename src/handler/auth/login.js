const dynamoDb = require('../../config/dynamodb');
const {
  validateBody,
  sendResponse,
  signJwt,
  checkHash,
} = require('../../utils/helpers');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const isValid = validateBody(body);
    if (!isValid) {
      return sendResponse(400, 'Invalid input details.');
    }

    const checkEmailParams = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      IndexName: process.env.EMAIL_PARTITION_INDEX,
      KeyConditionExpression: 'email = :emailId AND postId = :postId',
      ExpressionAttributeValues: { ':emailId': body.email, ':postId': 'user' },
      ScanIndexForward: true,
      Select: 'ALL_ATTRIBUTES',
    };
    const data = await dynamoDb.query(checkEmailParams).promise();
    if (data.Count <= 0) {
      return sendResponse(404, 'User not found!');
    }

    const Item = data.Items[0];
    const passwordHash = Item.password;
    const { userId } = Item;
    const isPassValid = await checkHash(body.password, passwordHash);

    if (!isPassValid) {
      return sendResponse(401, 'Wrong password!');
    }

    const token = await signJwt({ userId });
    return sendResponse(200, JSON.stringify({ token }));
  } catch (e) {
    console.log(e);
    return sendResponse(401, 'Cannot authenticate');
  }
};
