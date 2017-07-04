import { NgModule }                     from '@angular/core';
import { BrowserModule }                from '@angular/platform-browser';
import { BrowserAnimationsModule }      from '@angular/platform-browser/animations';
import { FormsModule }                  from '@angular/forms';
import { HttpModule }                   from '@angular/http';

import { DialogModule }                 from './primeng/dialog';
import { MenubarModule }                from './primeng/menubar';

import { SelectModule }                 from './ui-modules/angular2-select/select.module';

import { AutoCompleteModule }           from './ui-modules/ui-autocomplete/autocomplete.module';
import { ModalModule }                  from './ui-modules/ui-modal/modal.module';

import { CollapsibleModule }            from './ui-modules/collapsible.module';
import { DataTableModule }              from './ui-modules/data-table/data-table.module';
import { OverlayPanelModule }           from './ui-modules/overlay-panel.module';
import { PaginationModule }             from './ui-modules/pagination.module';
import { RangeSliderModule }            from './ui-modules/range-slider.module';
import { SwitchToggleModule }           from './ui-modules/switch-toggle.module';
import { ToggleModule }                 from './ui-modules/toggle.module';
import { TooltipModule }                from './ui-modules/tooltip.module';

import { TabPanelComponent }            from './ui-modules/tab-panel.component';
import { TabViewComponent }             from './ui-modules/tab-view.component';

import { AppRoutingModule }             from './app-routing.module';

import { AuthConfig }                   from './auth.config';

import { ApiService }                   from './services/api.service';
import { AuthService }                  from './services/auth.service';
import { PubSubService }                from './services/pubsub.service';

import { EvaluationsListService }       from './services/evaluations-list.service';
import { ParticipantsListService }      from './services/participants-list.service';
import { SamplesListService }           from './services/samples-list.service';

import { TranscriptionRendererService } from './services/transcription-renderer.service';

import { FormatThousands }              from './pipes/format-thousands.pipe';
import { MapToIterable }                from './pipes/map-to-iterable.pipe';
import { SafePipe }                     from './pipes/safe.pipe';

import { AppComponent }                 from './app.component';
import { AboutComponent }               from './components/about.component';
import { HomeComponent }                from './components/home.component';
import { LoginComponent }               from './components/login.component';
import { ParticipantLookupComponent }   from './components/participant-lookup.component';
import { ProfileComponent }             from './components/profile.component';
import { SampleBrowserComponent }       from './components/sample-browser.component';
import { SampleEntryComponent }         from './components/sample-entry.component';
import { SampleViewComponent }          from './components/sample-view.component';
import { SamplesCardsComponent }        from './components/samples-cards.component';
import { SamplesCarouselComponent }     from './components/samples-carousel.component';
import { SamplesTableComponent }        from './components/samples-table.component';


@NgModule({
  declarations: [
    TabPanelComponent,
    TabViewComponent,

    FormatThousands,
    MapToIterable,
    SafePipe,

    AppComponent,
    AboutComponent,
    HomeComponent,
    LoginComponent,
    ParticipantLookupComponent,
    ProfileComponent,
    SampleEntryComponent,
    SampleViewComponent,
    SampleBrowserComponent,
    SamplesCardsComponent,
    SamplesCarouselComponent,
    SamplesTableComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,

    DialogModule,
    MenubarModule,

    SelectModule,
    DataTableModule,

    AutoCompleteModule,
    ModalModule,

    CollapsibleModule,
    OverlayPanelModule,
    PaginationModule,
    ToggleModule,
    RangeSliderModule,
    SwitchToggleModule,
    TooltipModule,
    AppRoutingModule
  ],
  providers: [
    AuthConfig,

    ApiService,
    AuthService,
    PubSubService,

    EvaluationsListService,
    ParticipantsListService,
    SamplesListService,

    TranscriptionRendererService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
