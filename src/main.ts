import { bootstrapApplication } from '@angular/platform-browser';

// entry component
import AppComponent from './app/core/containers/app/app.component';

import '@angular/common/locales/global/en';
import '@angular/common/locales/global/de';
import '@angular/common/locales/global/fr';

// app  config
import { appConfig } from './app/app.config';

// models
import { AppConfig } from './app/core/models';

const requestInit: RequestInit = {
  cache: 'no-cache',
};

fetch('/public/app-config/config.json', requestInit)
  .then((res) => res.json())
  .then((config: AppConfig) => {
    console.info('Application running with config:', config);

    bootstrapApplication(AppComponent, appConfig(config)).catch((err) => console.error(err));
  });
