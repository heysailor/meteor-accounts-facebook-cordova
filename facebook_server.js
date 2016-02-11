/* eslint-disable no-param-reassign */
/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
Accounts.registerLoginHandler(loginRequest => {
  if (!loginRequest.cordova) {
    return undefined;
  }

  loginRequest = loginRequest.authResponse;
  const whitelisted = [
    'id', 'email', 'name', 'first_name', 'last_name', 'link', 'gender', 'locale', 'age_range',
  ];
  const identity = getIdentity(loginRequest.accessToken, whitelisted);
  const profilePicture = getProfilePicture(loginRequest.accessToken);
  const serviceData = {
    accessToken: loginRequest.accessToken,
    expiresAt: (+new Date) + (1000 * loginRequest.expiresIn),
  };
  const fields = _.pick(identity, whitelisted);
  const options = { profile: { } };
  const profileFields = _.pick(identity, Meteor.settings.public.facebook.profileFields);

  _.extend(serviceData, fields);
  _.extend(options.profile, profileFields);
  options.profile.profilePictureURL = profilePicture;
  serviceData.profilePictureURL = profilePicture;

  return Accounts.updateOrCreateUserFromExternalService('facebook', serviceData, options);
});

function getIdentity(accessToken, fields) {
  try {
    return HTTP.get('https://graph.facebook.com/me', {
      params: {
        access_token: accessToken,
        fields,
      },
    }).data;
  } catch (err) {
    throw _.extend(new Error(`Failed to fetch identity from Facebook: ${err.message}`),
                   { response: err.response });
  }
}

function getProfilePicture(accessToken) {
  try {
    // Minimum FB profile pic size is 180x180px
    return HTTP.get('https://graph.facebook.com/v2.0/me/picture/?redirect=false&height=180&width=180', {
      params: { access_token: accessToken },
    }).data.data.url;
  } catch (err) {
    throw _.extend(new Error(`Failed to fetch identity from Facebook: ${err.message}`),
                   { response: err.response });
  }
}
