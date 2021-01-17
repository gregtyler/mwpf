/** globals DB */
const $root = document.querySelector('#root');
const $subnav = document.querySelector('#subnav');

function renderTagList(tags) {
  if (!tags) return '';

  return tags.map(x => DB.data.tag[x] ? `<a href="#/tag/${x}" class="c-tag">${DB.data.tag[x].tag}</a>` : '').join(' ');
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
  } else if (path.substr(0, 6) === 'genre/') {
    const genreId = path.substr(6)

    $root.innerHTML += `<h2 class="c-page__title"><strong>${DB.data.genre[genreId].genre}</strong> texts</h2>`;

    Object.values(DB.data.novel)
      .filter(novel => novel.genre && novel.genre.indexOf(genreId) > -1)
      .forEach(entry => {
        $root.innerHTML += renderTextListItem(entry);
      })
  } else if (path.substr(0, 5) === 'year/') {
    const year = parseInt(path.substr(5))

    $root.innerHTML += `<h2 class="c-page__title">Texts from <strong>${year}</strong></h2>`;

    Object.values(DB.data.novel)
      .filter(novel => novel.year === year)
      .forEach(entry => {
        $root.innerHTML += renderTextListItem(entry);
      })
  } else {
    Object.values(DB.data.novel).forEach(entry => {
      $root.innerHTML += renderTextListItem(entry);
    })
  }
}

function renderSubnav() {
  const sortedGenres = Object.values(DB.data.genre)
    .sort((a, b) => a.genre.localeCompare(b.genre))
    .map(obj => ({...obj, genre: obj.genre.substr(0, 1).toUpperCase() + obj.genre.substr(1)}))

  const sortedYears = Object.values(DB.data.novel)
    .map(x => x.year)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort();

  $subnav.innerHTML = `
    <h2 class="u-visually-hidden">Find texts by&hellip;</h2>
    <h3>Genre</h3>
    <ul>
      ${sortedGenres.map(genre => `
        <li><a href="/#/genre/${genre.id}">${genre.genre}</a></li>
      `).join('')}
    </ul>

    <h3>Publication year</h3>
    <ol class="c-subnav__grid-list">
    ${sortedYears.map(year => `
      <li><a href="/#/year/${year}">${year}</a></li>
    `).join('')}
    </ol>
  `
}

DB.update()
    .then(() => {
      render();
      renderSubnav();
      window.addEventListener('hashchange', render);
    });

document.querySelector('[data-js="force-refresh"]').addEventListener('click', (e) => {
  e.preventDefault();
  DB.update({force: true}).then(render);
});
