class CustomError extends Error {
  statusCode: null | number;

  constructor(message: string, statusCode: number) {
    super()
    this.message = message;
    this.statusCode = statusCode
  }
}

const headers = {
  'content-type': 'application/json'
}

export const handleError = (e: any) => {
  if (e instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: `Invalid request body format: "${e.message}"`
    }
  }

  return {
    statusCode: e.statusCode,
    headers,
    body: e.message
  }
}