import { Component } from '@angular/core';

@Component({
  selector: 'lr-about',
  template: `
    <div class="panel">
      <h3>About the Site</h3>
      <p>This site is for development of the LogoSearch platform. If you find
         yourself here and have questions or comments, please get in touch with me --
         <a href="mailto:simonjwiles@gmail.com">simonjwiles@gmail.com</a>.
      </p>
      <p>For testing and demonstration purposes, a test account is available so that the sample
         input screens can be accessed:</p>
      <pre>
         Username: test@simonwiles.net
         Password: telos123
      </pre>
      <p>You are also welcome to sign in using your own google/gmail account, if you wish.  This
         will create a new user for you on the system.  Please note that new users may be
         reset at any time during development, however.</p>
    </div>
    `,
})
export class AboutComponent {
  // constructor() { }
}

