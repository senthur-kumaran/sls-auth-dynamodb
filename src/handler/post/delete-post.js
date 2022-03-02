const { sendResponse } = require('../../utils/helpers');
const dynamoDb = require('../../config/dynamodb');

module.exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    if (!id) {
      return sendResponse(400, 'Invalid post id.');
    }

    const userData = event.requestContext.authorizer.principalId;
    const parsedData = JSON.parse(userData);
    const { userId } = parsedData;

    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        userId,
        postId: `post-${id}`,
      },
    };

    await dynamoDb.delete(params).promise();
    return sendResponse(200, 'Post deleted successfully.');
  } catch (e) {
    console.log(e);
    return sendResponse(444, 'Cannot delete this post.');
  }
};
