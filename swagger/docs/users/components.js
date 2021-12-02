module.exports = {
  components: {
    schemas: {
      getUsersResponse: {
        type: "object", // data type
        properties: {
          status: {
            type: "string",
            description: "success | error",
          },
          data: {
            type: "object",
            properties: {
              records: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer", // data type
                      description: "An id of a user", // desc
                    },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    username: { type: "string" },
                    registrationDate: { type: "date" },
                  },
                },
              },
              totalCount: { type: "integer" },
              page: { type: "integer" },
              pageSize: { type: "integer" },
            },
          },
          message: { type: "string" },
        },
      },
      getUserResponse: {
        type: "object", // data type
        properties: {
          status: {
            type: "string",
            description: "success | error",
          },
          data: {
            type: "object",
            properties: {
              id: {
                type: "integer", // data type
                description: "An id of a user", // desc
              },
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string" },
              username: { type: "string" },
              registrationDate: { type: "date" },
            },
          },
          message: { type: "string" },
        },
      },
      getOtpResponse: {
        type: "object", // data type
        properties: {
          status: {
            type: "string",
            description: "success | error",
          },
          data: {
            type: "object",
            properties: {
              uuid: { type: "string" },
            },
          },
          message: { type: "string" },
        },
      },
      getUsersInput: [
        {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
          },
          description: "First page will be 1",
        },
        {
          in: "query",
          name: "pageSize",
          schema: {
            type: "integer",
          },
          description: "Number of records per page",
        },
        {
          in: "query",
          name: "search",
          schema: {
            type: "string",
          },
          description: "Enter the Name or the Email ID to search user",
        },
        {
          in: "query",
          name: "status",
          schema: {
            type: "string",
          },
          description: "The Status you have selected is Invalid.",
        },
        {
          in: "query",
          name: "fromDate",
          schema: {
            type: "date",
          },
          description:
            "User Registration 'From Date' is not in correct format.",
        },
        {
          in: "query",
          name: "toDate",
          schema: {
            type: "date",
          },
          description: "User Registration 'To Date' is not in correct format.",
        },
        {
          in: "query",
          name: "sortBy",
          schema: {
            type: "integer",
          },
          description: '[{"id":"username","desc":true}]',
        },
      ],
      getUserInput: [
        {
          in: "path",
          name: "uuid",
          schema: {
            type: "string",
          },
          description: "uuid of the user",
        },
      ],
      postUsersInput: {},
      // error model
      Error: {
        type: "object", //data type
        properties: {
          message: {
            type: "string", // data type
            description: "Error message", // desc
            example: "Not found", // example of an error message
          },
          internal_code: {
            type: "string", // data type
            description: "Error internal code", // desc
            example: "Invalid parameters", // example of an error internal code
          },
        },
      },
      getUserProfileDetailsRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            required: "true",
            description: "Full Name",
          },
          image: {
            type: "string",
            format: "binary",
            description: "Profile image url",
          },
          measurementSystem: {
            type: "string",
            required: "true",
            description: "Measurement system",
          },
          height: {
            type: "string",
            required: "true",
            description: "Height of user",
          },
          weight: {
            type: "string",
            required: "true",
            description: "Weight of user",
          },
          gender: {
            type: "string",
            required: "true",
            description: "Gender of the user",
          },
          trainingGoal: {
            type: "string",
            required: "true",
            description: "Training Goal of user",
          },
          workoutFrequency: {
            type: "string",
            required: "true",
            description: "Workout Frequency of user",
          },
          workoutDuration: {
            type: "string",
            required: "true",
            description: "Workout Duration of user",
          },
        },
      },
      getUserLogin: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "Email Address of the Admin",
          },
          password: {
            type: "string",
            description: "Password of the Admin",
          },
          uniqueId: {
            type: "string",
            description: "Unique id of social login",
          },
          name: {
            type: "string",
            description: "Name of the user",
          },
          gender: {
            type: "string",
            description: "Gender of the user",
          },
          type: {
            type: "string",
            description: "Type of login default/facebook/apple/google/admin",
          },
          deviceId: {
            type: "string",
            description: "Device Id",
          },
        },
      },
    },
  },
};
