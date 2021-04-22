import { expect } from 'chai'
import { describe, it } from '../../utils/mochaw'
import { localhostUrl } from '../../config.json'
const percySnapshot = require('@percy/selenium-webdriver')

const options = {
  pageObjects: ['BasePage', 'Welcome'],
}

export const welcomeScenarios = async (lang) => {
  describe.only(
    `WELCOME scenarios in ${lang}`,
    options,
    ({ driver, pageObjects }) => {
      const { welcome } = pageObjects
      const copy = welcome.copy(lang)

      it('should verify website title', async () => {
        driver.get(`${localhostUrl}?language=${lang}`)
        const title = driver.getTitle()
        expect(title).to.equal('Onfido SDK Demo')
      })

      it('should verify UI elements on the welcome screen', async () => {
        driver.get(`${localhostUrl}?language=${lang}`)
        welcome.verifyTitle(copy)
        welcome.verifySubtitle(copy)
        welcome.verifyIdentityButton(copy)
        welcome.verifyFooter(copy)
        await percySnapshot(
          driver,
          `Onfido SDK UI elements on the welcome screen in ${lang}`
        )
      })
    }
  )
}
