import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MatFormioModule, FormioAppConfig } from 'angular-material-formio';
import 'hammerjs';
import './CustomComponent';
import { MaterialCustomComponent } from './CustomComponent';
import { FormDemoComponent } from './form-demo/form-demo.component';
import { FormBuilderComponent } from './form-builder/form-builder.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    MaterialCustomComponent,
    FormDemoComponent,
    FormBuilderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatFormioModule
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' },
  {
    provide: FormioAppConfig, useValue: {
      appUrl: '',//https://example.form.io',
      apiUrl: 'https://api.form.io'
    }
  }],
  bootstrap: [AppComponent],
  entryComponents: [MaterialCustomComponent]
})
export class AppModule { }
