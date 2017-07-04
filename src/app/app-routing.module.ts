import { NgModule }                from '@angular/core';
import { Routes,
         RouterModule }            from '@angular/router';

import { AboutComponent }          from './components/about.component';
import { SampleEntryComponent }    from './components/sample-entry.component';
import { HomeComponent }           from './components/home.component';
import { LoginComponent }          from './components/login.component';
import { ProfileComponent }        from './components/profile.component';
import { SampleBrowserComponent }  from './components/sample-browser.component';
import { SampleViewComponent }     from './components/sample-view.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/social', component: LoginComponent },
  { path: 'my-samples', component: ProfileComponent, data: { tab: 'samples' } },
  { path: 'sample-entry', component: SampleEntryComponent },
  { path: 'user/:uuid', component: ProfileComponent },
  { path: 'users', component: ProfileComponent },
  { path: 'sample/:uuid', component: SampleViewComponent },
  { path: 'samples', component: SampleBrowserComponent },

  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
