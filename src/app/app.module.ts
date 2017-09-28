import { NgModule }                     from '@angular/core';

import { BrowserModule }                from '@angular/platform-browser';
import { BrowserAnimationsModule }      from '@angular/platform-browser/animations';
import { FormsModule,
         ReactiveFormsModule }          from '@angular/forms';
import { HttpModule }                   from '@angular/http';

import { SelectModule }                 from './ui-modules/angular2-select/select.module';

import { AutoCompleteModule }           from './ui-modules/ui-autocomplete/autocomplete.module';
import { ModalModule }                  from './ui-modules/ui-modal/modal.module';
import { NotificationsModule }          from './ui-modules/ui-notifications/notifications.module';
import { PipesModule }                  from './ui-modules/ui-pipes/pipes.module';
import { TurnEditorModule }             from './ui-modules/ui-turn-editor/turn-editor.module';
import { StarRatingModule }             from './ui-modules/ui-star-rating/star-rating.module';

import { CollapsibleModule }            from './ui-modules/collapsible.module';
import { DataTableModule }              from './ui-modules/data-table/data-table.module';
import { HelpButtonModule }             from './ui-modules/help-button.module';
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
import { MessageBusService }            from './services/message-bus.service';
import { NotificationsService }         from './services/notifications.service';

import { EvaluationsListService }       from './services/evaluations-list.service';
import { ParticipantsListService }      from './services/participants-list.service';
import { SamplesListService }           from './services/samples-list.service';

import { TranscriptionRendererService } from './services/transcription-renderer.service';

import { MapToIterable }                from './pipes/map-to-iterable.pipe';
import { SafePipe }                     from './pipes/safe.pipe';

import { AppComponent }                 from './app.component';
import { SiteLayoutComponent }          from './components/site-layout.component';

import { AboutComponent }               from './components/about.component';
import { HomeComponent }                from './components/home.component';
import { EvaluationBrowserComponent }   from './components/evaluation-browser.component';
import { LoginComponent }               from './components/login.component';
import { LmsBridgeComponent }           from './components/lms-bridge.component';
import { ParticipantLookupComponent }   from './components/participant-lookup.component';
import { ProfileComponent }             from './components/profile.component';
import { SampleBrowserComponent }       from './components/sample-browser.component';
import { SampleEntryComponent }         from './components/sample-entry.component';
import { SampleEvaluationComponent }    from './components/sample-evaluation.component';
import { SampleViewComponent }          from './components/sample-view.component';
import { SamplesCardsComponent }        from './components/samples-cards.component';
import { SamplesCarouselComponent }     from './components/samples-carousel.component';
import { SamplesTableComponent }        from './components/samples-table.component';


@NgModule({
  declarations: [
    TabPanelComponent,
    TabViewComponent,

    MapToIterable,
    SafePipe,

    AppComponent,
    SiteLayoutComponent,

    AboutComponent,
    HomeComponent,
    LmsBridgeComponent,
    LoginComponent,
    ParticipantLookupComponent,
    ProfileComponent,
    SampleEntryComponent,
    EvaluationBrowserComponent,
    SampleViewComponent,
    SampleEvaluationComponent,
    SampleBrowserComponent,
    SamplesCardsComponent,
    SamplesCarouselComponent,
    SamplesTableComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    FormsModule,
    ReactiveFormsModule,

    HttpModule,

    SelectModule,
    DataTableModule,

    AutoCompleteModule,
    ModalModule,
    NotificationsModule,
    PipesModule,
    TurnEditorModule,
    StarRatingModule,

    CollapsibleModule,
    HelpButtonModule,
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
    MessageBusService,
    NotificationsService,

    ParticipantsListService,
    SamplesListService,

    TranscriptionRendererService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
