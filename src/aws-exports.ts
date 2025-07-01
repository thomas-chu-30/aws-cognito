import type { ResourcesConfig } from "aws-amplify";

const awsconfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_Y5tslQMQo",
      userPoolClientId: "76fvfp1bad65i00q1t9nttbn3r",
      identityPoolId: "us-east-1:458549319596",
      identityPoolEndpoint: "https://cognito-idp.us-east-1.amazonaws.com",
      userPoolEndpoint: "https://cognito-idp.us-east-1.amazonaws.com",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
};

export default awsconfig;
