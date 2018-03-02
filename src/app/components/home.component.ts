import { AfterViewInit, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'lr-home',
  template: `
    <div class="homepage">
      <div class="video">
        <iframe #ytFrame
              src="https://www.youtube-nocookie.com/embed/rDX1cXz37EA?rel=0&amp;showinfo=0&amp;modestbranding=1&amp;enablejsapi=1"
              frameborder="0"
              allow="encrypted-media">
        </iframe>
      </div>
      <img #image class="main-image" src="assets/img/homepage_kids_1120x630.jpg" alt="Kids in a Classroom">
      <div #button class="video-button" (click)="playVideo()">
        <div class="title">A Tool for Research on Equity and Fairness in Linguistically Diverse Classrooms</div>
        <div class="button"><i class="fa fa-play-circle"></i> Play</div>
      </div>
    </div>
  `
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('ytFrame') ytFrame;
  @ViewChild('image') image;
  @ViewChild('button') button;

  private ytPlayer: any;

  ngAfterViewInit() {
    if (window['YT']) {
      // if the YouTubeIframeAPI is already loaded, then we've navigated away from the homepage
      //  and then back again, and (for some reason) the reference to this.ytPlayer seems to get
      //  lost, so we need to initialize it again.
      this.initYTPlayer();
    } else {
      // otherwise, inject the script tag, and initialize this.ytPlayer from the APIReady callback.
      const homeComponent = this;
      window.onYouTubeIframeAPIReady = function() { homeComponent.initYTPlayer(); };
      const ytScriptTag = document.createElement('script');
      ytScriptTag.type = 'text/javascript';
      ytScriptTag.src = '//www.youtube.com/iframe_api';
      document.body.appendChild(ytScriptTag);
    }
  }

  initYTPlayer() {
    const homeComponent = this;
    homeComponent.ytPlayer = new window.YT.Player(homeComponent.ytFrame.nativeElement, {
      events: {
        'onStateChange': (event) => {
          if (event.data == window.YT.PlayerState.ENDED) {
            homeComponent.ytFrame.nativeElement.style.opacity = 0;
            homeComponent.image.nativeElement.style.opacity = 1;
            homeComponent.image.nativeElement.style.pointerEvents = 'auto';
            homeComponent.button.nativeElement.style.opacity = 1;
            homeComponent.button.nativeElement.style.pointerEvents = 'auto';
          }
        }
      }
    });
  }

  playVideo() {
    this.ytPlayer.playVideo();
    this.ytFrame.nativeElement.style.opacity = 1;
    this.image.nativeElement.style.opacity = 0;
    this.image.nativeElement.style.pointerEvents = 'none';
    this.button.nativeElement.style.opacity = 0;
    this.button.nativeElement.style.pointerEvents = 'none';
  }
}
