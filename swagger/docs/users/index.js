const {
  components: {
    schemas: {
      getUsersResponse,
      getUserResponse,
      getUsersInput,
      getUserInput,
      getUserProfileDetailsRequest,
      getUserLogin,
    },
  },
} = require("./components");
const userPaths = {
  "/api/v1/login": {
    post: {
      tags: ["Users"],
      summary: "User Login",
      description: "user login",
      operationId: "userLogin",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: getUserLogin,
          },
        },
      },
      responses: {
        200: {
          description: "Success",
        },
        500: {
          description: "Error",
        },
      },
    },
  },
  "/api/v1/logout": {
    post: {
      tags: ["Users"],
      summary: "User Logout",
      description: "User logout",
      operationId: "userLogout",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["deviceId"],
              properties: {
                deviceId: {
                  type: "string",
                  description: "Device ID",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Success",
        },
        422: {
          description: "Invalid Credentials",
        },
        500: {
          description: "Internal server error",
        },
      },
    },
  },
  "/api/v1/refresh-token": {
    post: {
      tags: ["Users"],
      summary: "Refresh token",
      description: "Refresh the token if previous has been expired",
      operationId: "refreshToken",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token"],
              properties: {
                token: {
                  type: "string",
                  description: "Old Token",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Success",
        },
        500: {
          description: "Error",
        },
      },
    },
  },
  "/api/v1/users": {
    post: {
      tags: ["Users"],
      summary: "Create a User",
      description: "Post Stores",
      operationId: "postUsers",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstName: {
                  type: "string",
                  required: "true",
                  description: "First Name of the user",
                },
                lastName: {
                  type: "string",
                  required: "true",
                  description: "last Name of the user",
                },
                username: {
                  type: "string",
                  required: "true",
                  description: "username of the user",
                },
                email: {
                  type: "string",
                  required: "true",
                  description: "Email Address of the user",
                },
                password: {
                  type: "string",
                  required: "true",
                  description: "Password of the user",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
        },
      },
    },
    get: {
      tags: ["Users"],
      summary: "Get users",
      description: "Get Stores",
      operationId: "getUsers",
      parameters: getUsersInput,
      responses: {
        200: {
          description: "Success",
          content: {
            // content-type
            "application/json": {
              schema: getUsersResponse,
            },
          },
          500: {
            description: "Error",
          },
          400: {
            description: "Validation Error",
          },
        },
      },
    },
  },
  "/api/v1/users/{uuid}": {
    get: {
      tags: ["Users"],
      summary: "Get users",
      description: "Get Stores",
      operationId: "getUserDetail",
      parameters: getUserInput,
      responses: {
        200: {
          description: "Success",
          content: {
            // content-type
            "application/json": {
              schema: getUserResponse,
            },
          },
        },
        500: {
          description: "Error",
        },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update User Profile",
      description: "User Profile Update",
      operationId: "userProfileUpdate",
      parameters: getUserInput,
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: getUserProfileDetailsRequest,
          },
        },
      },
      responses: {
        200: {
          description: "Profile Updated Successfully",
        },
        500: {
          description: "Internal Server Error!",
        },
        204: {
          description: "Error occurred while Updating!",
        },
        403: {
          description: "Validation errors!",
        },
      },
    },
  },
};

module.exports = userPaths;
