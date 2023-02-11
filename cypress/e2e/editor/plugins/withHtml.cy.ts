const NOTE_ID = '2c1f8ccd-42ad-4f94-ab7d-c36abb1328ca';

describe('with html', () => {
  beforeEach(() => {
    cy.setup();
  });

  it('can copy and paste html', function () {
    cy.visit(`/app/note/${NOTE_ID}`);

    const html = `
      <h1>Quis contra in illa aetate pudorem, constantiam, etiamsi sua nihil intersit, non tamen diligat?</h1>

      <p>Etiam ac egestas massa.</p>

      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="http://loripsum.net/" target="_blank">Sine ea igitur iucunde negat posse se vivere?</a> Ex quo intellegitur, quoniam se ipsi omnes natura diligant, tam insipientem quam sapientem sumpturum, quae secundum naturam sint, reiecturumque contraria. Deprehensus omnem poenam contemnet. Duo Reges: constructio interrete. Mihi quidem Homerus huius modi quiddam vidisse videatur in iis, quae de Sirenum cantibus finxerit. Hoc foedus facere si potuerunt, faciant etiam illud, ut aequitatem, modestiam, virtutes omnes per se ipsas gratis diligant. Si verbum sequimur, primum longius verbum praepositum quam bonum. Respondent extrema primis, media utrisque, omnia omnibus. Vitae autem degendae ratio maxime quidem illis placuit quieta. Nos vero, inquit ille; Aut, si nihil malum, nisi quod turpe, inhonestum, indecorum, pravum, flagitiosum, foedum-ut hoc quoque pluribus nominibus insigne faciamus-, quid praeterea dices esse fugiendum? Cum praesertim illa perdiscere ludus esset. <s>ALIO MODO.</s> </p>
      
      <p><i>Cur post Tarentum ad Archytam?</i> <code>Falli igitur possumus.</code> Similiter sensus, cum accessit ad naturam, <strong>tuetur illam quidem</strong>, sed etiam se tuetur; Nec lapathi suavitatem acupenseri Galloni Laelius anteponebat, sed suavitatem ipsam neglegebat; Hanc ergo intuens debet institutum illud quasi signum absolvere. Quam vellem, inquit, te ad Stoicos inclinavisses! erat enim, si cuiusquam, certe tuum nihil praeter virtutem in bonis ducere. </p>
      
      <ul>
        <li>Non enim iam stirpis bonum quaeret, sed animalis.</li>
        <li>In qua si nihil est praeter rationem, sit in una virtute finis bonorum;</li>
        <li>Quid de Platone aut de Democrito loquar?</li>
      </ul>
      
      
      <pre>Scripsit enim et multis saepe verbis et breviter arteque in\neo libro, quem modo nominavi, mortem nihil ad nos pertinere.\n\nNunc reliqua videamus, nisi aut ad haec, Cato, dicere\naliquid vis aut nos iam longiores sumus.</pre>

      
      <blockquote cite="http://loripsum.net">Quid enim me prohiberet Epicureum esse, si probarem, quae ille diceret?</blockquote>
      
      
      <h2>Itaque nostrum est-quod nostrum dico, artis est-ad ea principia, quae accepimus.</h2>
      
      <p>Bonum incolumis acies: misera caecitas. <u>Si longus, levis.</u> Itaque dicunt nec dubitant: <em>mihi sic usus est</em>, tibi ut opus est facto, fac. <mark>Ergo in eadem voluptate eum</mark>, qui alteri misceat mulsum ipse non sitiens, et eum, qui illud sitiens bibat? Vide igitur ne non debeas verbis nostris uti, sententiis tuis. <del>Quid, quod res alia tota est?</del> </p>
      
      <h3>Morbi placerat dolor eu finibus rutrum.</h3>

      <ol>
        <li>Atque ut ceteri dicere existimantur melius quam facere, sic hi mihi videntur facere melius quam dicere.</li>
        <li>Et harum quidem rerum facilis est et expedita distinctio.</li>
        <li>Aliam vero vim voluptatis esse, aliam nihil dolendi, nisi valde pertinax fueris, concedas necesse est.</li>
        <li>Quid igitur dubitamus in tota eius natura quaerere quid sit effectum?</li>
        <li>Bonum negas esse divitias, praeposìtum esse dicis?</li>
      </ol>

      <h4>Heading 4</h4>

      <h5>Heading 5</h5>

      <h6>Heading 6</h6>

      <img src="https://picsum.photos/200" alt="test" />
    `;

    // Paste html content
    cy.getEditor().focus().type('{movetostart}').paste(html, 'text/html');

    // Heading 1
    cy.getEditor()
      .find('h1')
      .eq(0)
      .should(
        'have.text',
        'Quis contra in illa aetate pudorem, constantiam, etiamsi sua nihil intersit, non tamen diligat?'
      );

    // Heading 2
    cy.getEditor()
      .find('h2')
      .eq(0)
      .should(
        'have.text',
        'Itaque nostrum est-quod nostrum dico, artis est-ad ea principia, quae accepimus.'
      );

    // Heading 3
    cy.getEditor()
      .find('h3')
      .eq(0)
      .should('have.text', 'Morbi placerat dolor eu finibus rutrum.');

    cy.getEditor().find('h3').eq(1).should('have.text', 'Heading 4');

    cy.getEditor().find('h3').eq(2).should('have.text', 'Heading 5');

    cy.getEditor().find('h3').eq(3).should('have.text', 'Heading 6');

    // Paragraph
    cy.getEditor()
      .findAllByTestId('paragraph')
      .eq(0)
      .should('have.text', 'Etiam ac egestas massa.');

    // Code block
    cy.getEditor()
      .find('code')
      .eq(1)
      .should(
        'have.text',
        `Scripsit enim et multis saepe verbis et breviter arteque in\neo libro, quem modo nominavi, mortem nihil ad nos pertinere.\n\nNunc reliqua videamus, nisi aut ad haec, Cato, dicere\naliquid vis aut nos iam longiores sumus.`
      );

    // Unordered list
    cy.getEditor()
      .findAllByTestId('paragraph')
      .eq(3)
      .should('have.text', 'Non enim iam stirpis bonum quaeret, sed animalis.');
    cy.getEditor()
      .findAllByTestId('paragraph')
      .eq(4)
      .should(
        'have.text',
        'In qua si nihil est praeter rationem, sit in una virtute finis bonorum;'
      );
    cy.getEditor()
      .findAllByTestId('paragraph')
      .eq(5)
      .should('have.text', 'Quid de Platone aut de Democrito loquar?');

    // Ordered list
    cy.getEditor()
      .findAllByTestId('paragraph')
      .eq(7)
      .should(
        'have.text',
        'Atque ut ceteri dicere existimantur melius quam facere, sic hi mihi videntur facere melius quam dicere.'
      );

    // Blockquote
    cy.getEditor()
      .find('blockquote')
      .should(
        'have.text',
        'Quid enim me prohiberet Epicureum esse, si probarem, quae ille diceret?'
      );

    // External link
    cy.getEditor()
      .find('a')
      .eq(0)
      .should('have.text', 'Sine ea igitur iucunde negat posse se vivere?')
      .should('have.attr', 'href', 'http://loripsum.net/');

    // Image
    cy.getEditor()
      .find('img')
      .eq(0)
      .should('have.attr', 'src', 'https://picsum.photos/200')
      .should('have.attr', 'alt', 'test');

    // Bold
    cy.getEditor().find('b').eq(0).should('have.text', 'tuetur illam quidem');

    // Italics
    cy.getEditor()
      .find('em')
      .eq(0)
      .should('have.text', 'Cur post Tarentum ad Archytam?');

    cy.getEditor().find('em').eq(1).should('have.text', 'mihi sic usus est');

    // Inline code
    cy.getEditor()
      .find('code')
      .eq(0)
      .should('have.text', 'Falli igitur possumus.');

    // Underline
    cy.getEditor().find('u').eq(0).should('have.text', 'Si longus, levis.');

    // Strikethrough
    cy.getEditor().find('s').eq(0).should('have.text', 'ALIO MODO.');

    cy.getEditor()
      .find('s')
      .eq(1)
      .should('have.text', 'Quid, quod res alia tota est?');

    // Highlight
    cy.getEditor()
      .find('mark')
      .eq(0)
      .should('have.text', 'Ergo in eadem voluptate eum');
  });

  it('can paste multiple blocks within the editor', function () {
    cy.visit(`/app/note/${NOTE_ID}`);

    const fragment =
      'JTVCJTdCJTIyaWQlMjIlM0ElMjJiMjBlZTBhNC1kNDRmLTQyMzYtYTVkNC03NmM5YmIxM2Q3ZDYlMjIlMkMlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyVGhpcyUyMGlzJTIwYSUyMHRlc3QlMjIlN0QlNUQlN0QlMkMlN0IlMjJpZCUyMiUzQSUyMmJlMWZhNjEwLTdiNWUtNGYwOS04ODFmLTgzM2M5Y2E4NDgxZSUyMiUyQyUyMnR5cGUlMjIlM0ElMjJibG9jay1xdW90ZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkElMjBibG9ja3F1b3RlJTIyJTdEJTVEJTdEJTVE';

    cy.getEditor()
      .focus()
      .type('{movetostart}')
      .paste(fragment, 'application/x-slate-fragment');

    cy.getEditor()
      .findByTestId('paragraph')
      .should('have.text', 'This is a test');
    cy.getEditor().find('blockquote').should('have.text', 'A blockquote');
  });

  it('preserves whitespace around inline elements', function () {
    cy.visit(`/app/note/${NOTE_ID}`);

    const html = `
      <p>Lorem ipsum dolor sit amet,<span> </span><strong>consectetur</strong><span> </span>adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    `;

    // Paste html content
    cy.getEditor().focus().type('{movetostart}').paste(html, 'text/html');

    cy.getEditor()
      .findByTestId('paragraph')
      .should(
        'have.text',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      );
  });
});

export {};
