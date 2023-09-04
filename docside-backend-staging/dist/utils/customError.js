"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
const headers = {
    'content-type': 'application/json'
};
const handleError = (e) => {
    if (e instanceof SyntaxError) {
        return {
            statusCode: 400,
            headers,
            body: `Invalid request body format: "${e.message}"`
        };
    }
    return {
        statusCode: e.statusCode,
        headers,
        body: e.message
    };
};
exports.handleError = handleError;
//# sourceMappingURL=customError.js.map