import { Component } from '@angular/core';

@Component({
  selector: 'lr-home',
  template: `
    <div class="homepage">
      <img class="main-image" src="assets/img/homepage_kids_1400x783.jpg">


      <div class="g items">
        <div class="u-1-3">
          <img src="assets/img/homepage-research.png">
          <br>Research
        </div>
        <div class="u-1-3">
          <img src="assets/img/homepage-theory.png">
          <br>Theory
        </div>
        <div class="u-1-3">
          <img src="assets/img/homepage-online-learning.png">
          <br>Online Learning
        </div>
      </div>

      <div class="g items">
        <div class="u-1-3">
          <img src="assets/img/homepage-schools-and-districts.png">
          <br>Schools and Districts
        </div>
        <div class="u-1-3">
          <img src="assets/img/homepage-our-team.png">
          <br>Our Team
        </div>
        <div class="u-1-3">
          <img src="assets/img/homepage-collaborators.png">
          <br>Collaborators
        </div>
      </div>



    </div>
  `
})
export class HomeComponent {
  // constructor() { }
}
