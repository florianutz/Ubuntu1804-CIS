"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormData = void 0;
const busboy_1 = __importDefault(require("busboy"));
/**
 * Parses the multipart form data and returns the uploaded files and fields
 */
const parseFormData = async (event) => new Promise((resolve, reject) => {
    const bb = (0, busboy_1.default)({
        headers: { 'content-type': event.headers['Content-Type'] || event.headers['content-type'] },
    });
    const fields = {};
    let uploadedFile;
    // event listener for the form data
    bb.on('file', ({ field, file, filename, encoding, contentType }) => {
        let content = '';
        file.on('data', (data) => {
            // reads the file content in one chunk
            content = data;
        });
        file.on('error', reject);
        file.on('end', () => {
            uploadedFile = {
                filename,
                encoding,
                contentType,
                content,
            };
        });
    });
    bb.on('field', (fieldName, value) => {
        fields[fieldName] = value;
    });
    bb.on('error', reject);
    bb.on('finish', () => {
        resolve({ file: uploadedFile, fields });
    });
    bb.write(event.body || '', event.isBase64Encoded ? 'base64' : 'binary');
    bb.end();
});
exports.parseFormData = parseFormData;
//# sourceMappingURL=parseFormData.js.map