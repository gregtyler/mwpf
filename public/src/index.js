/** globals DB, Router */
const $root = document.querySelector('#root');
const $subnav = document.querySelector('#subnav');

function isCreativeWork(entry) {
  return entry['@type'] === 'CreativeWork' || entry['@type'] === 'Movie' || entry['@type'] === 'Book';
}

function isWorkByCreator(work, creatorId) {
  return (
    (work.author && work.author.find(y => y.identifier === creatorId)) ||
    (work.director && work.director.find(y => y.identifier === creatorId)) ||
    (work.illustrator && work.illustrator.find(y => y.identifier === creatorId))
  )
}

function renderTagList(tags) {
  if (!tags) return '';

  return tags.map(x => DB.data[x.identifier] ? `<a href="/tag/${x.identifier}" class="c-tag">${DB.data[x.identifier].name}</a>` : '').join(' ');
}

function renderTextList(title = '', filter = () => { return true }) {
  let html = '';

  if (title) html += `<h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">${title}</h2>`;

  const entries = Object.values(DB.data)
    .filter(isCreativeWork)
    .filter(filter);

  if (entries.length) {
    entries.forEach(entry => {
      html += renderTextListItem(entry);
    })
  } else {
    html += '<p>No results found.</p>';
  }

  return html;
}

function renderTextListItem(entry) {
  return `
    <div class="c-tile">
      <a class="c-tile__cover-link" href="/novel/${entry.identifier}">
        <strong>${entry.name}</strong>
      </a>
      ${entry.author ? `<br>
      by ${entry.author.map(x => DB.data[x.identifier].name).join(', ')}` : ''}
      <br>
      ${renderTagList(entry.keywords)}
    </div>
  `
}

const router = (new Router())
  .add(/(about|contribute)/, (page) => {
    if (page === 'contribute') {
      document.querySelector('#contribute-iframe').setAttribute('src', 'https://docs.google.com/forms/d/e/1FAIpQLSdYODHsrgR1HpR1gwXbqMKTjP9JuXkGqzty8t_53VliyOq8Hg/viewform?embedded=true');
    }

    return document.querySelector('#page-' + page).innerHTML
  })
  .add(/tag\/(.+)/, (tagId) => renderTextList(
    `Texts tagged <strong>#${DB.data[tagId].name}</strong>`,
    novel => novel.keywords && novel.keywords.find(k => k.identifier === tagId)
  ))
  .add(/genre\/(.+)/, (genreId) => renderTextList(
    `<strong>${DB.data[genreId].name}</strong> texts`,
    novel => novel.genre && novel.genre.indexOf(DB.data[genreId].name) > -1
  ))
  .add(/year\/(.+)/, (year) => renderTextList(
    `Texts from <strong>${year}</strong>`,
    novel => novel.datePublished && novel.datePublished.substr(0, 4) === year
  ))
  .add(/creator\/(.+)/, (creatorId) => renderTextList(
    `Texts by <strong>${DB.data[creatorId].name}</strong>`,
    novel => isWorkByCreator(novel, creatorId)
  ))
  .add(/publisher\/(.+)/, (publisherId) => renderTextList(
    `Texts published by <strong>${DB.data[publisherId].name}</strong>`,
    novel => novel.publisher && novel.publisher.find(p => p.identifier === publisherId)
  ))
  .add(/novel\/(.+)/, (id) => {
    const entry = DB.data[id];

    let creators = [];
    if (entry.author) creators = creators.concat(entry.author)
    if (entry.director) creators = creators.concat(entry.director)
    if (entry.illustrator) creators = creators.concat(entry.illustrator)


    return `
      <div vocab="https://schema.org/" resource="/novel/${entry.identifier}" typeof="${entry['@type']}">
        <h2 class="c-page__title" property="name" id="skip-to-content-link-target" tabindex="-1">
          ${entry.name}
        </h2>
        <div style="margin-bottom:1rem;">
          ${renderTagList(entry.keywords)}
        </div>

        <table class="c-data-table">
          <tbody>
          ${entry.author ? `
            <tr>
              <th>Creator</th>
              <td>${entry.author.map(x => `
                <a href="/creator/${x.identifier}" property="author">${DB.data[x.identifier].name}</a>
              `).join(', ')}</td>
            </tr>
          ` : ''}
          ${entry.director ? `
            <tr>
              <th>Director</th>
              <td>${entry.director.map(x => `
                <a href="/creator/${x.identifier}" property="director">${DB.data[x.identifier].name}</a>
              `).join(', ')}</td>
            </tr>
          ` : ''}
          ${entry.illustrator ? `
            <tr>
              <th>Illustrator</th>
              <td>${entry.illustrator.map(x => `
                <a href="/creator/${x.identifier}" property="illustrator">${DB.data[x.identifier].name}</a>
              `).join(', ')}</td>
            </tr>
          ` : ''}
          ${entry.genre ? `
            <tr>
              <th>Genre</th>
              <td property="genre">${entry.genre.join(', ')}</td>
            </tr>
          ` : ''}
          ${entry.publisher ? `
            <tr>
              <th>Publisher</th>
              <td>${entry.publisher.map(x => `
                <a href="/publisher/${x.identifier}" property="publisher">${DB.data[x.identifier].name}</a>
              `).join(', ')}</td>
            </tr>
          ` : ''}
          ${entry.datePublished ? `
            <tr>
              <th>Year of publication</th>
              <td>
                <a href="/year/${entry.datePublished.substr(0, 4)}" property="datePublished" content="${entry.datePublished}">
                  ${entry.datePublished.substr(0, 4)}
                </a>
              </td>
            </tr>
          ` : ''}
          ${entry.comment ? `
            <tr>
              <th>Notes</th>
              <td property="comment">${entry.comment.text}</td>
            </tr>
          ` : ''}
          ${entry.citation ? `
            <tr>
              <th>Related texts</th>
              <td>
                ${entry.citation.map((x, i) => {
                  const related = DB.data[x.identifier];
                  return (i !== 0 ? '<br>' : '') + `
                    <a href="/novel/${related.identifier}" property="citation">
                      ${related.name}
                    </a>
                  `;
                }).join('')}
              </td>
            </tr>
          ` : ''}
          ${entry.url ? `
            <tr>
              <th>Link</th>
              <td>
                <a href="${entry.url}" property="url">
                  ${entry.url}
                </a>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="o-svg-icon" title="External link">
                  <path d="M18 17.759v3.366C18 22.159 17.159 23 16.125 23H4.875C3.841 23 3 22.159 3 21.125V9.875C3 8.841 3.841 8 4.875 8h3.429l3.001-3h-6.43C2.182 5 0 7.182 0 9.875v11.25C0 23.818 2.182 26 4.875 26h11.25C18.818 26 21 23.818 21 21.125v-6.367l-3 3.001z" />
                  <path d="M22.581 0H12.322c-1.886.002-1.755.51-.76 1.504l3.22 3.22-5.52 5.519c-1.145 1.144-1.144 2.998 0 4.141l2.41 2.411c1.144 1.141 2.996 1.142 4.14-.001l5.52-5.52 3.16 3.16c1.101 1.1 1.507 1.129 1.507-.757L26 3.419c-.001-3.437.024-3.42-3.419-3.419z" />
                </svg>
              </td>
            </tr>
          ` : ''}
          </tbody>
        </table>
      </div>
    `;
  })
  .add(/creator/, () => {
    const sortedCreators = Object.values(DB.data)
      .filter(entry => entry['@type'] === 'Person')
      .sort((a, b) => a.name.trim().split(' ').pop().localeCompare(b.name.trim().split(' ').pop()))
      .map(creator => ({
        ...creator,
        works: Object.values(DB.data).filter(x => isCreativeWork(x) && (
          (x.author && x.author.find(y => y.identifier === creator.identifier)) ||
          (x.director && x.director.find(y => y.identifier === creator.identifier))
        )),
      }))
      .filter(creator => creator.works.length > 0);

    return `
      <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
        All creators
      </h2>
      <ol>
        ${sortedCreators.map(creator => `
          <li>
            <a href="/creator/${creator.identifier}">${creator.name}</a>
            (${creator.works.length} works)
          </li>
        `).join('')}
      </ol>
    `;
  })
  .add(/publisher/, () => {
    const sortedPublishers = Object.values(DB.data)
      .filter(entry => entry['@type'] === 'Organization')
      .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
      .map(publisher => ({
        ...publisher,
        works: Object.values(DB.data).filter(x => isCreativeWork(x) && x.publisher && x.publisher.find(p => p.identifier === publisher.identifier)),
      }))
      .filter(x => x.works.length > 0);

    return `
      <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
        All publishers
      </h2>
      <ol>
        ${sortedPublishers.map(publisher => `
          <li>
            <a href="/publisher/${publisher.identifier}">${publisher.name}</a>
            (${publisher.works.length} works)
          </li>
        `).join('')}
      </ol>
    `;
  })
  .add(/^\/?$/, () => renderTextList('All entries'))
  .add(/.+/, () => `
    <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
      Page not found
    </h2>
    <p>This page could not be found. Please use the navigation on the left, or <a href="/">return to the home page</a>.</p>
  `)

function render() {
  if (window.location.pathname.length > 3) {
    const path = window.location.pathname.substring(1);

    $root.innerHTML = router.parse(path);
  } else {
    const path = window.location.search.substring(2);

    window.history.replaceState(null, "", "/" + path);

    $root.innerHTML = router.parse(path);
  }
}

function renderSubnav() {
  const sortedGenres = Object.values(DB.data)
    .filter(entry => entry['@type'] === 'DefinedTerm' && entry.inDefinedTermSet && entry.inDefinedTermSet.identifier === 'genre')
    .sort((a, b) => a.name.localeCompare(b.name))

  const sortedYears = Object.values(DB.data)
    .filter(isCreativeWork)
    .map(x => x.datePublished ? x.datePublished.substr(0, 4) : null)
    .filter(x => !!x)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort();

  $subnav.innerHTML = `
    <h3>Genre</h3>
    <ul>
      ${sortedGenres.concat(sortedGenres).map(genre => `
        <li><a href="/genre/${genre.identifier}" class="u-break-words">${genre.name}</a></li>
      `).join('')}
    </ul>

    <h3>Publication year</h3>
    <ol class="c-subnav__grid-list">
    ${sortedYears.map(year => `
      <li><a href="/year/${year}">${year}</a></li>
    `).join('')}
    </ol>
  `
}

DB.update()
    .then(() => {
      render();
      renderSubnav();
      window.addEventListener('popstate', render);
    });

document.querySelector('[data-js="force-refresh"]').addEventListener('click', e => {
  e.preventDefault();
  DB.update({force: true}).then(render);
});

const $tray = document.querySelector('.c-subnav')
Array.from(document.querySelectorAll('.c-subnav-toggle')).forEach($el => {
  $el.addEventListener('click', () => {
    $tray.classList.toggle('c-subnav--show');
    document.body.classList.toggle('u-scroll-lock');
  })
})

var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="//analytics.gregtyler.co.uk/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '9']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
