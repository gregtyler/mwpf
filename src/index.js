import DB from './db.js'

const $root = document.querySelector('#root');

function renderTagList(tags) {
  if (!tags) return '';

  return tags.map(x => `<a href="#/tag/${x}" class="c-tag">${DB.data.tag[x].tag}</a>`).join(' ');
}

function renderTextListItem(entry) {
  return `
    <div class="c-tile">
      <a class="c-tile__cover-link" href="#/novel/${entry.id}">
        <strong>${entry.title}</strong>
      </a>
      ${entry.author ? `<br>
      by ${entry.author.map(x => DB.data.author[x].name).join(', ')}` : ''}
      <br>
      ${renderTagList(entry.tags)}
    </div>
  `
}

function render() {
  $root.innerHTML = '';
  const path = window.location.hash.substr(2);

  if (path === 'about' || path === 'contribute') {
    $root.innerHTML = document.querySelector('#page-' + path).innerHTML;
  } else if (path.substr(0, 6) === 'novel/') {
    const id = path.substr(6);
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
  } else if (path.substr(0, 4) === 'tag/') {
    const tagId = path.substr(4)

    $root.innerHTML += `<h2 class="c-page__title">Texts tagged <strong>#${DB.data.tag[tagId].tag}</strong></h2>`;

    Object.values(DB.data.novel)
      .filter(novel => novel.tags && novel.tags.indexOf(tagId) > -1)
      .forEach(entry => {
        $root.innerHTML += renderTextListItem(entry);
      })
  } else {
    Object.values(DB.data.novel).forEach(entry => {
      $root.innerHTML += renderTextListItem(entry);
    })
  }
}

DB.update()
    .then(() => {
      render();
      window.addEventListener('hashchange', render);
    });

document.querySelector('[data-js="force-refresh"]').addEventListener('click', (e) => {
  e.preventDefault();
  DB.update({force: true}).then(render);
});
