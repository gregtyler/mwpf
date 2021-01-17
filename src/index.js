/** globals DB, Router */
const $root = document.querySelector('#root');
const $subnav = document.querySelector('#subnav');

function renderTagList(tags) {
  if (!tags) return '';

  return tags.map(x => DB.data.tag[x] ? `<a href="#/tag/${x}" class="c-tag">${DB.data.tag[x].tag}</a>` : '').join(' ');
}

function renderTextList(title = '', filter = () => { return true }) {
  if (title) $root.innerHTML += `<h2 class="c-page__title">${title}</h2>`;

  const entries = Object.values(DB.data.novel).filter(filter);

  if (entries.length) {
    entries.forEach(entry => {
      $root.innerHTML += renderTextListItem(entry);
    })
  } else {
    $root.innerHTML += '<p>No results found.</p>';
  }
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

const router = (new Router())
  .add(/(about|contribute)/, (page) => {
    $root.innerHTML = document.querySelector('#page-' + page).innerHTML;
  })
  .add(/tag\/(.+)/, (tagId) => {
    renderTextList(
      `Texts tagged <strong>#${DB.data.tag[tagId].tag}</strong>`,
      novel => novel.tags && novel.tags.indexOf(tagId) > -1
    );
  })
  .add(/genre\/(.+)/, (genreId) => {
    renderTextList(
      `<strong>${DB.data.genre[genreId].genre}</strong> texts`,
      novel => novel.genre && novel.genre.indexOf(genreId) > -1
    );
  })
  .add(/year\/(.+)/, (year) => {
    renderTextList(
      `Texts from <strong>${year}</strong>`,
      novel => novel.year === parseInt(year)
    );
  })
  .add(/creator\/(.+)/, (creatorId) => {
    renderTextList(
      `Texts by <strong>${DB.data.author[creatorId].name}</strong>`,
      novel => (
        (novel.author && novel.author.indexOf(creatorId) > -1) ||
        (novel.filmDirector && novel.filmDirector.indexOf(creatorId) > -1) ||
        (novel.illustrator && novel.illustrator.indexOf(creatorId) > -1)
      )
    );
  })
  .add(/publisher\/(.+)/, (publisherId) => {
    renderTextList(
      `Texts published by <strong>${DB.data.publisher[publisherId].publisher}</strong>`,
      novel => novel.publisher && novel.publisher.indexOf(publisherId) > -1
    );
  })
  .add(/novel\/(.+)/, (id) => {
    const entry = DB.data.novel[id];

    entry.creators = [];
    if (entry.author) entry.creators = entry.creators.concat(entry.author)
    if (entry.filmDirector) entry.creators = entry.creators.concat(entry.filmDirector)
    if (entry.illustrator) entry.creators = entry.creators.concat(entry.illustrator)

    $root.innerHTML = `
      <h2 class="c-page__title">${entry.title}</h2>
      <div style="margin-bottom:1rem;">
        ${renderTagList(entry.tags)}
      </div>

      <table class="c-data-table">
        <tbody>
        ${entry.creators ? `
          <tr>
            <th>Creator</th>
            <td>${entry.creators.map(x => `
              <a href="#/creator/${x}">${DB.data.author[x].name}</a>
            `).join(', ')}</td>
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
            <td>${entry.publisher.map(x => `
            <a href="#/publisher/${x}">${DB.data.publisher[x].publisher}</a>
            `).join(', ')}</td>
          </tr>
        ` : ''}
        ${entry.notes ? `
          <tr>
            <th>Notes</th>
            <td>${entry.notes}</td>
          </tr>
        ` : ''}
        ${entry.relatedTexts ? `
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
  })
  .add(/creator/, () => {
    const sortedCreators = Object.values(DB.data.author)
      .sort((a, b) => a.name.trim().split(' ').pop().localeCompare(b.name.trim().split(' ').pop()))
      .map(creator => ({
        ...creator,
        works: Object.values(DB.data.novel).filter(x => (
          (x.author && x.author.indexOf(creator.id) > -1) ||
          (x.filmDirector && x.filmDirector.indexOf(creator.id) > -1) ||
          (x.illustrator && x.illustrator.indexOf(creator.id) > -1)
        )),
      }));

    $root.innerHTML = `
      <h2 class="c-page__title">All creators</h2>
      <ol>
        ${sortedCreators.map(creator => `
          <li>
            <a href="/#/creator/${creator.id}">${creator.name}</a>
            (${creator.works.length} works)
          </li>
        `).join('')}
      </ol>
    `;
  })
  .add(/publisher/, () => {
    const sortedPublishers = Object.values(DB.data.publisher)
      .sort((a, b) => a.publisher.trim().localeCompare(b.publisher.trim()))
      .map(publisher => ({
        ...publisher,
        works: Object.values(DB.data.novel).filter(x => x.publisher && x.publisher.indexOf(publisher.id) > -1),
      }));

    $root.innerHTML = `
      <h2 class="c-page__title">All publishers</h2>
      <ol>
        ${sortedPublishers.map(publisher => `
          <li>
            <a href="/#/publisher/${publisher.id}">${publisher.publisher}</a>
            (${publisher.works.length} works)
          </li>
        `).join('')}
      </ol>
    `;
  })
  .add(/.*/, () => {
    renderTextList()
  })

function render() {
  $root.innerHTML = '';
  const path = window.location.hash.substr(2);

  router.parse(path);
}

function renderSubnav() {
  const sortedGenres = Object.values(DB.data.genre)
    .sort((a, b) => a.genre.localeCompare(b.genre))

  const sortedYears = Object.values(DB.data.novel)
    .map(x => x.year)
    .filter(x => !!x)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort();

  $subnav.innerHTML = `
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

document.querySelector('[data-js="force-refresh"]').addEventListener('click', e => {
  e.preventDefault();
  DB.update({force: true}).then(render);
});


const $tray = document.querySelector('.c-subnav')
Array.from(document.querySelectorAll('.c-subnav-toggle')).forEach($el => {
  $el.addEventListener('click', () => {
    $tray.classList.toggle('c-subnav--show');
  })
})
