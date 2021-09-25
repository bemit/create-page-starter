describe('UI Base Test', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
    })

    it('PrivacyModule Test Deny', () => {
        expect(window.localStorage.getItem('noTrack')).to.equal(null)
        cy.visit('/index.html')
        cy.get('.overlay-privacy').should('exist')
        cy.get('.overlay-privacy').get('.deny').click()
            .should(() => {
                expect(window.localStorage.getItem('noTrack')).to.equal('1')
            })
        cy.get('.overlay-privacy').should('not.exist')
    })

    it('PrivacyModule Test Allow', () => {
        expect(window.localStorage.getItem('noTrack')).to.equal(null)
        cy.visit('/index.html')
        cy.get('.overlay-privacy').should('exist')
        cy.get('.overlay-privacy').get('.accept').click()
            .should(() => {
                expect(window.localStorage.getItem('noTrack')).to.equal('0')
            })
        cy.get('.overlay-privacy').should('not.exist')
    })
})
