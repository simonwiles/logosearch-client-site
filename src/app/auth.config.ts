import { Injectable } from '@angular/core';

@Injectable()
export class AuthConfig {
  public oauthProviders: any = {

    facebookOauth2: {
      provider: 'facebook-oauth2',
      apiEndpoint: '',
      authParams: {
        response_type: 'code',
        client_id: '',
        scope: ''
      },
      name: 'Facebook',
      icon: 'fa-facebook',
      class: 'facebook',
      managementUrl: ''
    },

    googleOauth2: {
      provider: 'google-oauth2',
      apiEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      authParams: {
        response_type: 'code',
        client_id: '1073653691987-4mu86454328ccosf9k0lg43lt4c84r47.apps.googleusercontent.com',
        scope: 'email profile'
      },
      name: 'Google',
      icon: 'fa-google',
      class: 'google',
      managementUrl: 'https://security.google.com/settings/security/permissions?pli=1'
    },

    dropboxOauth2: {
      provider: 'dropbox-oauth2',
      apiEndpoint: 'https://www.dropbox.com/1/oauth2/authorize',
      authParams: {
        response_type: 'code',
        client_id: 'mfopiya1h31etbj'
      },
      name: 'Dropbox',
      icon: 'fa-dropbox',
      class: 'dropbox',
      managementUrl: 'https://www.dropbox.com/account#security'
    }
  };
}
