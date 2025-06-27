const awsconfig = {
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_fwwk6rvn2",
      userPoolWebClientId: "2pdlkel377hajgnduf37aag4ha",
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
