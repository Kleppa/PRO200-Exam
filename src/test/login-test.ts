//Selenium test

import  {MyFamilyPage}  from '../pages/my-family/my-family';
describe('App', () => {
  let page;
  console.log(MyFamilyPage.MyFamilyPage.name)

  beforeEach(() => {
    page = new MyFamilyPage();
  });

  describe('default screen', () => {
    beforeEach(() => {
      page.navigateTo('/');
    });

    it('should have a title saying Page One', () => {
      page.getPageOneTitleText().then(title => {
        expect(title).toEqual('Page One');
      });
    });
  })
});