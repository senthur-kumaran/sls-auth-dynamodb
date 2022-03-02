const { v4: uuidv4 } = require('uuid');
const dynamoDb = require('../../config/dynamodb');
const {
  validateBody,
  sendResponse,
  createHash,
} = require('../../utils/helpers');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const isValid = validateBody(body);

    if (!isValid) {
      return sendResponse(400, 'Invalid input data.');
    }

    const userId = uuidv4();
    const { name, email, password } = body;
    const tableName = process.env.DYNAMO_TABLE_NAME;

    const emailCheckParams = {
      TableName: tableName,
      IndexName: process.env.EMAIL_PARTITION_INDEX,
      KeyConditionExpression: 'email = :emailId',
      ExpressionAttributeValues: { ':emailId': email },
      ScanIndexForward: true,
      Limit: 1,
      Select: 'ALL_ATTRIBUTES',
    };

    const data = await dynamoDb.query(emailCheckParams).promise();
    if (data.Count > 0) {
      return sendResponse(400, 'Email already exists!');
    }

    const passwordHash = await createHash(password);
    const sortKey = 'user';
    const params = {
      TableName: tableName,
      Item: {
        userId,
        postId: sortKey,
        name,
        email,
        password: passwordHash,
      },
      ConditionExpression: 'attribute_not_exists(userId)',
    };
    await dynamoDb.put(params).promise();
    return sendResponse(200, 'User registered successfully.');
  } catch (e) {
    console.log(e);
    return sendResponse(501, 'Cannot register user.');
  }
};
