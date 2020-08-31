
describe('Testing Functions for Data Entry Form', function() {
  // it('Relative URI, Relative URI, Curie', () => {
  //   // Visit the data entry form page
  //   cy.visit('http://kingsley.idehen.net/DAV/home/jordan/HTML/Form%202.0/main.html')
  //   // type Jordan into subject field
  //   cy.get('#subject').type('jordan')
  //   // type likes into predicate field
  //   cy.get('#predicate').type('likes')
  //   // type dbpedia:Linked_Data into object field
  //   cy.get('#object').type('dbpedia:Linked_Data')
  //   // insert
  //   cy.get('#insertBtn').click()
  //   // clear
  //   cy.get('#clearBtn').click()
  //   // type Jordan into subject field
  //   cy.get('#subject').type(':jordan')
  //   // type likes into predicate field
  //   cy.get('#predicate').type(':likes')
  //   // type dbpedia:Linked_Data into object field
  //   cy.get('#object').type('dbpedia:Linked_Data')
  //   // insert
  //   cy.get('#insertBtn').click()
  //   // check that POST returns status 200
  //   // check that POST returns status 200
  //   cy.server()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   // query
  //   cy.get('#queryBtn').click()
  //   // delete
  //   cy.get('#deleteBtn').click()
  //   // check that POST returns status 200
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   // clear
  //   cy.get('#clearBtn').click()
  // })
  //
  // it('Curie, Curie, Curie', () => {
  //   cy.visit('http://kingsley.idehen.net/DAV/home/jordan/HTML/Form%202.0/main.html')
  //   cy.get('#subject').type('dbpedia:Linked_Data')
  //   cy.get('#predicate').type('skos:related')
  //   cy.get('#object').type('dbpedia:Semantic_Web')
  //   cy.get('#insertBtn').click()
  //   cy.server()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#queryBtn').click()
  //   cy.get('#deleteBtn').click()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#clearBtn').click()
  // })
  //
  // it('Test predicate range lookup', () => {
  //   cy.visit('http://kingsley.idehen.net/DAV/home/jordan/HTML/Form%202.0/main.html')
  //   cy.get('#subject').type('i')
  //   cy.get('#predicate').type('foaf:name')
  //   cy.get('#object').type('Jordan Idehen')
  //   cy.get('#insertBtn').click()
  //   cy.get('#clearBtn').click()
  //   cy.get('#subject').type('i')
  //   cy.get('#predicate').type('foaf:name')
  //   cy.get('#object').type('"Jordan Idehen"')
  //   cy.get('#insertBtn').click()
  //   cy.server()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#queryBtn').click()
  //   cy.get('#deleteBtn').click()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#clearBtn').click()
  // })
  //
  // it('Languge Tag Test', () => {
  //   cy.visit('http://kingsley.idehen.net/DAV/home/jordan/HTML/Form%202.0/main.html')
  //   cy.get('#subject').type('me')
  //   cy.get('#predicate').type('foaf:name')
  //   cy.get('#object').type('"Jordan Idehen"@en')
  //   cy.get('#insertBtn').click()
  //   cy.server()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#queryBtn').click()
  //   cy.get('#deleteBtn').click()
  //   cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
  //   cy.wait('@post').should((xhr) => {
  //     expect(xhr.status, 'successful POST').to.equal(200)
  //   })
  //   cy.get('#clearBtn').click()
  // })

  it('Typed Literal Test', () => {
    cy.visit('http://kingsley.idehen.net/DAV/home/jordan/HTML/Form%202.0/main.html')
    cy.get('#subject').type('I')
    cy.get('#predicate').type('foaf:age')
    cy.get('#object').type('"19"^^xsd:integer')
    cy.get('#insertBtn').click()
    cy.server()
    cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
    cy.wait('@post').should((xhr) => {
      expect(xhr.status, 'successful POST').to.equal(200)
    })
    cy.get('#queryBtn').click()
    cy.get('#deleteBtn').click()
    cy.route('POST', 'https://linkeddata.uriburner.com/*').as('post')
    cy.wait('@post').should((xhr) => {
      expect(xhr.status, 'successful POST').to.equal(200)
    })
    cy.get('#clearBtn').click()
  })
})
