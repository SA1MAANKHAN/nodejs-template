const MESSAGES = require("../../../utils/messages");

module.exports = {
    testServer: {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.SERVER_IS_WORKING_FINE,
                    "status": true,
                    "type": "Default",
                }
            }
        }
    }
}