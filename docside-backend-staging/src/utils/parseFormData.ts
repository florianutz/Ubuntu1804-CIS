import busboy from 'busboy';
import { APIGatewayProxyEvent } from 'aws-lambda';

export interface UploadedFile {
  filename: string;
  contentType: string;
  encoding: string;
  content: Buffer | string;
}

export interface FormData {
  file?: UploadedFile;
  fields: Record<string, any>;
}

/**
 * Parses the multipart form data and returns the uploaded files and fields
 */
export const parseFormData = async (event: APIGatewayProxyEvent): Promise<FormData> =>
  new Promise((resolve, reject) => {
    const bb = busboy({
      headers: { 'content-type': event.headers['Content-Type'] || event.headers['content-type'] },
    });
    const fields: Record<string, any> = {};
    let uploadedFile: UploadedFile;

    // event listener for the form data
    bb.on('file', ({ field, file, filename, encoding, contentType }: any) => {
      let content = '';

      file.on('data', (data: any) => {
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

export interface POSTParameters {
  filename: string;
  tags?: Record<string, string>;
}
