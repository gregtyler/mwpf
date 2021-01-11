import DB from './db.js'

const $root = document.querySelector('#root');

function renderTagList(tags) {
  if (!tags) return '';

  return tags.map(x => `<a href="#/tag/${x}" class="c-tag">${DB.data.tag[x].tag}</a>`).join(' ');
}

function render() {
  $root.innerHTML = '';

  if (window.location.hash.substr(0, 8) === '#/novel/') {
    const id = window.location.hash.substr(8);
    const entry = DB.data.novel[id];

    $root.innerHTML = `
      <h2 class="c-page__title">${entry.title}</h2>
      <div style="margin-bottom:1rem;">
        ${renderTagList(entry.tags)}
      </div>

      <table class="c-data-table">
        <tbody>
        ${entry.author ? `
          <tr>
            <th>Creator</th>
            <td>${entry.author.map(x => DB.data.author[x].name).join(', ')}</td>
          </tr>
        ` : ''}
        ${entry.genre ? `
          <tr>
            <th>Genre</th>
            <td>${entry.genre.map(x => DB.data.genre[x].genre).join(', ')}</td>
          </tr>
        ` : ''}
        ${entry.publisher ? `
          <tr>
            <th>Publisher</th>
            <td>${entry.publisher.map(x => DB.data.publisher[x].publisher).join(', ')}</td>
          </tr>
        ` : ''}
        ${entry.notes ? `
          <tr>
            <th>Notes</th>
            <td>${entry.notes}</td>
          </tr>
        ` : ''}
        ${entry.notes ? `
          <tr>
            <th>Related texts</th>
            <td>
              ${entry.relatedTexts.map((x, i) => {
                const related = DB.data.novel[x];
                return (i !== 0 ? '<br>' : '') + `
                  <a href="#/novel/${related.id}">
                    ${related.title}
                  </a>
                `;
              }).join('')}
            </td>
          </tr>
        ` : ''}
        </tbody>
      </table>
    `;
  } else if (window.location.hash.substr(0, 6) === '#/tag/') {
    const tagId = window.location.hash.substr(6)

    $root.innerHTML += `<h2 class="c-page__title">Texts tagged <strong>#${DB.data.tag[tagId].tag}</strong></h2>`;

    Object.values(DB.data.novel).filter(novel => novel.tags && novel.tags.indexOf(tagId) > -1).forEach(entry => {
      const line = `
        <div class="c-tile">
          <a class="c-tile__cover-link" href="#/novel/${entry.id}">
            <strong>${entry.title}</strong>
          </a>
          <br>
          by ${entry.author ? entry.author.map(x => DB.data.author[x].name).join(', ') : ''}
          <br>
          ${renderTagList(entry.tags)}
        </div>
      `;

      $root.innerHTML += line;
    })
  } else {
    Object.values(DB.data.novel).forEach(entry => {
      const line = `
        <div class="c-tile">
          <a class="c-tile__cover-link" href="#/novel/${entry.id}">
            <strong>${entry.title}</strong>
          </a>
          <br>
          by ${entry.author ? entry.author.map(x => DB.data.author[x].name).join(', ') : ''}
          <br>
          ${renderTagList(entry.tags)}
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
