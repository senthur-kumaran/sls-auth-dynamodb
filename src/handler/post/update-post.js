const { sendResponse, validateBody } = require('../../utils/helpers');
const dynamoDb = require('../../config/dynamodb');

module.exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;
    if (!id) {
      return sendResponse(400, 'Invalid post id.');
    }

    const body = JSON.parse(event.body);
    const isValid = validateBody(body);
    if (!isValid) {
      return sendResponse(400, 'Invalid input data.');
    }

    const {
      title, content, imgUrl, tags,
    } = body;
    const userData = event.requestContext.authorizer.principalId;
    const parsedData = JSON.parse(userData);
    const { userId } = parsedData;

    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        userId,
        postId: `post-${id}`,
      },
      ExpressionAttributeValues: {
        ':title': title,
        ':content': content,
        ':imgUrl': imgUrl,
        ':tags': tags,
      },
      UpdateExpression:
        'SET title = :title, content = :content, imgUrl = :imgUrl, tags = :tags',
      ReturnValues: 'ALL_NEW',
    };

    const data = await dynamoDb.update(params).promise();
    if (!data.Attributes) {
      return sendResponse(404, 'Post not found.');
    }
    return sendResponse(200, JSON.stringify(data.Attributes));
  } catch (e) {
    console.log(e);
    return sendResponse(444, 'Cannot update this post.');
  }
};
