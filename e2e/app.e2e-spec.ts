import { LanguageRepositoryPage } from './app.po';

describe('language-repository App', () => {
  let page: LanguageRepositoryPage;

  beforeEach(() => {
    page = new LanguageRepositoryPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to lr!!');
  });
});
