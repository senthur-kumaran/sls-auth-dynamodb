const { sendResponse } = require('../../utils/helpers');
const dynamoDb = require('../../config/dynamodb');

module.exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    if (!id) {
      return sendResponse(400, 'Invalid post id.');
    }

    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      IndexName: process.env.OTHER_INDEX,
      KeyConditionExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': id,
      },
      ScanIndexForward: true,
      Select: 'ALL_ATTRIBUTES',
    };

    const data = await dynamoDb.query(params).promise();
    if (data.Count <= 0) {
      return sendResponse(404, 'Post not found.');
    }
    return sendResponse(200, JSON.stringify(data.Items));
  } catch (e) {
    console.log(e);
    return sendResponse(444, 'Cannot fetch this post.');
  }
};
