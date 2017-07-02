import { browser, by, element } from 'protractor';

export class LanguageRepositoryPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('lr-root h1')).getText();
  }
}
