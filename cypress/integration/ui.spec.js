describe('UI Base Test', () => {
    const basePath = '/defaultPage'
    beforeEach(() => {
        cy.clearLocalStorage()
    })

    it('Dummy Test', () => {
        expect(window.localStorage.getItem('some-item')).to.equal(null)
        cy.visit(basePath + '/index.html')
        cy.get('header a').should('exist')
        cy.get('.overlay-privacy').should('not.exist')
    })
})
