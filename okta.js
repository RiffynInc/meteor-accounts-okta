

if (Meteor.isClient) {

  setTimeout(() =>
    Accounts.oauth.registerService('okta'),
    10000
  );

  /**
   * Meteor.loginWithOkta(options, callback)
   *
   * This method is used on the client side to summon the Okta login page
   * just like you would with any other accounts package. It utilizes the
   * Accounts Base package.
   *
   * @param options
   * @param callback
   */
  Meteor.loginWithOkta = function (options, callback) {

    console.log('MeteorAccounts: loginWithOkta');

    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {
      options = options ? { ...options } : {};
      options.loginUrlParameters = options.loginUrlParameters ? { ...options.loginUrlParameters } : {};
      options.loginUrlParameters.hd = Accounts._options.restrictCreationByEmailDomain;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Okta.requestCredential(options, credentialRequestCompleteCallback);
  };

} else {

  Accounts.oauth.registerService('okta')

  /**
   If autopublish is on, publish these user fields. Login service
   packages (eg accounts-google). Notably, this isn't implemented with
   multiple publishes since DDP only merges only across top-level
   fields, not subfields (such as 'services.okta.accessToken')
   */
  const whitelistedFields = Okta.whitelistedFields.filter(function (f) { return f !== 'emails'; });
  Accounts.addAutopublishFields({

    forLoggedInUser:
      // publish access token since it can be used from the client
      Okta.whitelistedFields.concat(['accessToken', 'expiresAt']).map( // don't publish refresh token
        function (subfield) { return 'services.okta.' + subfield; }
      ),

    forOtherUsers:
      // even with autopublish, no legitimate web app should be
      // publishing all users' emails
      whitelistedFields.map(
        function (subfield) { return 'services.okta.' + subfield; })
  });

}
