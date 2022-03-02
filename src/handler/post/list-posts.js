const dynamoDb = require('../../config/dynamodb');
const { sendResponse } = require('../../utils/helpers');

module.exports.handler = async (event) => {
  try {
    const userData = event.requestContext.authorizer.principalId;
    const parsedData = JSON.parse(userData);
    const { userId } = parsedData;
    if (!userId) {
      return sendResponse(400, 'Invalid user id.');
    }

    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      KeyConditionExpression:
        'userId = :userId AND begins_with(postId,:postId)',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':postId': 'post',
      },
      ScanIndexForward: true,
      Select: 'ALL_ATTRIBUTES',
    };

    const posts = await dynamoDb.query(params).promise();
    return sendResponse(200, JSON.stringify(posts.Items));
  } catch (e) {
    console.log(e);
    return sendResponse(444, 'Cannot get user posts.');
  }
};
