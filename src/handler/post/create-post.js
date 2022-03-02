const { v4: uuidv4 } = require('uuid');
const dynamoDb = require('../../config/dynamodb');
const { sendResponse, validateBody } = require('../../utils/helpers');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const isValid = validateBody(body);
    if (!isValid) {
      return sendResponse(400, 'Invalid input details.');
    }

    const userData = event.requestContext.authorizer.principalId;
    const parsedData = JSON.parse(userData);
    const { userId } = parsedData;
    const {
      title, content, imgUrl, tags,
    } = body;
    if (!userId) {
      return sendResponse(444, 'Cannot find this user.');
    }

    const postId = uuidv4();
    const TableName = process.env.DYNAMO_TABLE_NAME;
    const isUserExistsParams = {
      TableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: true,
      Select: 'ALL_ATTRIBUTES',
    };

    const isUserIdExists = await dynamoDb
      .query(isUserExistsParams)
      .promise();
    if (isUserIdExists.Count <= 0) {
      return sendResponse(404, 'Data not found.');
    }

    const params = {
      TableName,
      Item: {
        userId,
        postId: `post-${postId}`,
        title,
        content,
        imgUrl,
        tags,
      },
      ConditionExpression: 'attribute_not_exists(postId)',
    };

    await dynamoDb.put(params).promise();

    return sendResponse(200, 'Post created successfully.');
  } catch (e) {
    console.log(e);
    return sendResponse(444, 'Cannot create a post.');
  }
};
