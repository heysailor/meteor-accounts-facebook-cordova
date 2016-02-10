// https://github.com/meteor/meteor/blob/devel/packages/facebook/facebook_server.js
Accounts.oauth.registerService('facebook');
Accounts.registerLoginHandler(function(loginRequest) {
    if(!loginRequest.cordova) {
        return undefined;
    }

    loginRequest = loginRequest.authResponse;

    var identity = CFB.getIdentity(loginRequest.accessToken);
    var profilePicture = CFB.getProfilePicture(loginRequest.accessToken);

    var serviceData = {
        accessToken: loginRequest.accessToken,
        expiresAt: (+new Date) + (1000 * loginRequest.expiresIn)
    };

    var whitelisted = ['id', 'email', 'name', 'first_name',
        'last_name', 'link', 'gender', 'locale', 'age_range'];

    var fields = _.pick(identity, whitelisted);
    _.extend(serviceData, fields);

    var options = {profile: {}};
    var profileFields = _.pick(identity, CFB.getProfileFields());
    _.extend(options.profile, profileFields);

    options.profile.avatar = profilePicture;

    // https://github.com/meteor/meteor/blob/devel/packages/accounts-base/accounts_server.js#L1129
    let result = Accounts.updateOrCreateUserFromExternalService("facebook", serviceData, options);
    console.log(result);
    return result;

});
