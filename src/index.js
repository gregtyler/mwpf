import DB from './db.js'

const $root = document.querySelector('#root');

function render() {
  $root.innerHTML = '';

  if (window.location.hash.substr(0, 8) === '#/novel/') {
    const id = window.location.hash.substr(8);
    const entry = DB.data.novel[id];

    $root.innerHTML = `
      <h2 class="c-page__title">${entry.title}</h2>
      <p>By ${entry.author ? entry.author.map(x => DB.data.author[x].name).join(', ') : ''}</p>

      <div>
        ${entry.tags ? entry.tags.map(x => `<span class="c-tag">${DB.data.tag[x].tag}</span>`).join(' ') : ''}
      </div>

      <dl>
        ${entry.genre ? `
          <dt>Genre</dt>
          <dd>${entry.genre.map(x => DB.data.genre[x].genre)}</dd>
        ` : ''}
        ${entry.publisher ? `
          <dt>Publisher</dt>
          <dd>${entry.publisher.map(x => DB.data.publisher[x].publisher)}</dd>
        ` : ''}
        ${entry.notes ? `
          <dt>Notes</dt>
          <dd>${entry.notes}</dd>
        ` : ''}
      </dl>

      ${entry.relatedTexts ? `
        <div>
          <h3>Related texts</h3>
          <div class="c-tile__grid-container">
            ${entry.relatedTexts.map(x => {
              const related = DB.data.novel[x];
              return `
                <div class="c-tile">
                  <a class="c-tile__linkbase" href="#/novel/${related.id}">
                    ${related.title}
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    Object.values(DB.data.novel).forEach(entry => {
      const line = `
        <div class="c-tile">
          <a class="c-tile__linkbase" href="#/novel/${entry.id}">
            <strong>${entry.title}</strong>
            <br>
            by ${entry.author ? entry.author.map(x => DB.data.author[x].name).join(', ') : ''}
            <br>
            ${entry.tags ? entry.tags.map(x => `<span class="c-tag">${DB.data.tag[x].tag}</span>`).join(' ') : ''}
          </a>
        </div>
      `;

      $root.innerHTML += line;
    })
  }
}

DB.update()
    .then(() => {
      render();
      window.addEventListener('hashchange', render);
    });
