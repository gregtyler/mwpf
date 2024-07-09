/** globals DB, Router */
const $root = document.querySelector("#root");
const $subnav = document.querySelector("#subnav");

function isCreativeWork(entry) {
  return (
    entry["@type"] === "CreativeWork" ||
    entry["@type"] === "Movie" ||
    entry["@type"] === "Book"
  );
}

function isWorkByCreator(work, creatorId) {
  return (
    (work.author && work.author.find((y) => y.identifier === creatorId)) ||
    (work.director && work.director.find((y) => y.identifier === creatorId)) ||
    (work.illustrator &&
      work.illustrator.find((y) => y.identifier === creatorId))
  );
}

function renderTagList(tags) {
  if (!tags) return "";

  return tags
    .map((x) =>
      DB.data[x.identifier]
        ? `<a href="/tag/${x.identifier}" class="c-tag">${
            DB.data[x.identifier].name
          }</a>`
        : ""
    )
    .join(" ");
}

function renderTextList(
  title = "",
  filter = () => {
    return true;
  }
) {
  let html = "";

  if (title)
    html += `<h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">${title}</h2>`;

  const entries = Object.values(DB.data).filter(isCreativeWork).filter(filter);

  if (entries.length) {
    html += '<div class="c-tile__grid-container">';
    entries.forEach((entry) => {
      html += renderTextListItem(entry);
    });
    html += "</div>";
  } else {
    html += "<p>No results found.</p>";
  }

  return html;
}

function renderTextListItem(entry) {
  return `
    <div class="c-tile"
      ${
        entry.thumbnailUrl
          ? `
            style="background-image: url('${entry.thumbnailUrl}')"
          `
          : ""
      }
    >
      <div class="c-tile__contents">
        <a class="c-tile__cover-link" href="/novel/${entry.identifier}">
          <strong>${entry.name}</strong>
        </a>
        ${
          entry.author
            ? `<br>
        by ${entry.author.map((x) => DB.data[x.identifier].name).join(", ")}`
            : ""
        }
        <br>
        ${renderTagList(entry.keywords)}
      </div>
    </div>
  `;
}

const router = new Router()
  .add(/(about|contribute)/, (page) => {
    if (page === "contribute") {
      document
        .querySelector("#contribute-iframe")
        .setAttribute(
          "src",
          "https://docs.google.com/forms/d/e/1FAIpQLSdYODHsrgR1HpR1gwXbqMKTjP9JuXkGqzty8t_53VliyOq8Hg/viewform?embedded=true"
        );
    }

    return document.querySelector("#page-" + page).innerHTML;
  })
  .add(/tag\/(.+)/, (tagId) =>
    renderTextList(
      `Texts tagged <strong>#${DB.data[tagId].name}</strong>`,
      (novel) =>
        novel.keywords && novel.keywords.find((k) => k.identifier === tagId)
    )
  )
  .add(/genre\/(.+)/, (genreId) =>
    renderTextList(
      `<strong>${DB.data[genreId].name}</strong> texts`,
      (novel) => novel.genre && novel.genre.indexOf(DB.data[genreId].name) > -1
    )
  )
  .add(/year\/(.+)/, (year) =>
    renderTextList(
      `Texts from <strong>${year}</strong>`,
      (novel) =>
        novel.datePublished && novel.datePublished.substr(0, 4) === year
    )
  )
  .add(/creator\/(.+)/, (creatorId) =>
    renderTextList(
      `Texts by <strong>${DB.data[creatorId].name}</strong>`,
      (novel) => isWorkByCreator(novel, creatorId)
    )
  )
  .add(/publisher\/(.+)/, (publisherId) =>
    renderTextList(
      `Texts published by <strong>${DB.data[publisherId].name}</strong>`,
      (novel) =>
        novel.publisher &&
        novel.publisher.find((p) => p.identifier === publisherId)
    )
  )
  .add(/novel\/(.+)/, (id) => {
    const entry = DB.data[id];

    let creators = [];
    if (entry.author) creators = creators.concat(entry.author);
    if (entry.director) creators = creators.concat(entry.director);
    if (entry.illustrator) creators = creators.concat(entry.illustrator);

    return `
      <div vocab="https://schema.org/" resource="/novel/${
        entry.identifier
      }" typeof="${entry["@type"]}" class="c-entry">
        <div class="c-entry__fill">
          <h2 class="c-page__title" property="name" id="skip-to-content-link-target" tabindex="-1">
            ${entry.name}
            ${
              entry.author
                ? `<small class="c-page__subtitle">by ${entry.author
                    .map((a) => DB.data[a.identifier].name)
                    .join(", ")}</small>`
                : ""
            }
          </h2>
          <div style="margin-bottom:1rem;">
            ${renderTagList(entry.keywords)}
          </div>

          <table class="c-data-table">
            <tbody>
            ${
              entry.author
                ? `
              <tr>
                <th>Creator</th>
                <td>${entry.author
                  .map(
                    (x) => `
                  <a href="/creator/${x.identifier}" property="author">${
                      DB.data[x.identifier].name
                    }</a>
                `
                  )
                  .join(", ")}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.director
                ? `
              <tr>
                <th>Director</th>
                <td>${entry.director
                  .map(
                    (x) => `
                  <a href="/creator/${x.identifier}" property="director">${
                      DB.data[x.identifier].name
                    }</a>
                `
                  )
                  .join(", ")}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.illustrator
                ? `
              <tr>
                <th>Illustrator</th>
                <td>${entry.illustrator
                  .map(
                    (x) => `
                  <a href="/creator/${x.identifier}" property="illustrator">${
                      DB.data[x.identifier].name
                    }</a>
                `
                  )
                  .join(", ")}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.genre
                ? `
              <tr>
                <th>Genre</th>
                <td property="genre">${entry.genre.join(", ")}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.publisher
                ? `
              <tr>
                <th>Publisher</th>
                <td>${entry.publisher
                  .map(
                    (x) => `
                  <a href="/publisher/${x.identifier}" property="publisher">${
                      DB.data[x.identifier].name
                    }</a>
                `
                  )
                  .join(", ")}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.datePublished
                ? `
              <tr>
                <th>Year of publication</th>
                <td>
                  <a href="/year/${entry.datePublished.substr(
                    0,
                    4
                  )}" property="datePublished" content="${entry.datePublished}">
                    ${entry.datePublished.substr(0, 4)}
                  </a>
                </td>
              </tr>
            `
                : ""
            }
            ${
              entry.comment
                ? `
              <tr>
                <th>Notes</th>
                <td property="comment">${entry.comment.text}</td>
              </tr>
            `
                : ""
            }
            ${
              entry.citation
                ? `
              <tr>
                <th>Related texts</th>
                <td>
                  ${entry.citation
                    .map((x, i) => {
                      const related = DB.data[x.identifier];
                      return (
                        (i !== 0 ? "<br>" : "") +
                        `
                      <a href="/novel/${related.identifier}" property="citation">
                        ${related.name}
                      </a>
                    `
                      );
                    })
                    .join("")}
                </td>
              </tr>
            `
                : ""
            }
            ${
              entry.url
                ? `
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
            `
                : ""
            }
            </tbody>
          </table>
        </div>
        ${
          entry.thumbnailUrl
            ? `
          <img property="thumbnail" class="c-entry__image" src="${entry.thumbnailUrl}" alt="Front cover of ${entry.name}" />
        `
            : ""
        }
      </div>
    `;
  })
  .add(/creator/, () => {
    const sortedCreators = Object.values(DB.data)
      .filter((entry) => entry["@type"] === "Person")
      .sort((a, b) =>
        a.name
          .trim()
          .split(" ")
          .pop()
          .localeCompare(b.name.trim().split(" ").pop())
      )
      .map((creator) => ({
        ...creator,
        works: Object.values(DB.data).filter(
          (x) =>
            isCreativeWork(x) &&
            ((x.author &&
              x.author.find((y) => y.identifier === creator.identifier)) ||
              (x.director &&
                x.director.find((y) => y.identifier === creator.identifier)))
        ),
      }))
      .filter((creator) => creator.works.length > 0);

    return `
      <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
        All creators
      </h2>
      <ol>
        ${sortedCreators
          .map(
            (creator) => `
          <li>
            <a href="/creator/${creator.identifier}">${creator.name}</a>
            (${creator.works.length} works)
          </li>
        `
          )
          .join("")}
      </ol>
    `;
  })
  .add(/publisher/, () => {
    const sortedPublishers = Object.values(DB.data)
      .filter((entry) => entry["@type"] === "Organization")
      .sort((a, b) => a.name.trim().localeCompare(b.name.trim()))
      .map((publisher) => ({
        ...publisher,
        works: Object.values(DB.data).filter(
          (x) =>
            isCreativeWork(x) &&
            x.publisher &&
            x.publisher.find((p) => p.identifier === publisher.identifier)
        ),
      }))
      .filter((x) => x.works.length > 0);

    return `
      <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
        All publishers
      </h2>
      <ol>
        ${sortedPublishers
          .map(
            (publisher) => `
          <li>
            <a href="/publisher/${publisher.identifier}">${publisher.name}</a>
            (${publisher.works.length} works)
          </li>
        `
          )
          .join("")}
      </ol>
    `;
  })
  .add(/^all\/?$/, () => renderTextList("All entries"))
  .add(/^\/?$/, () => {
    const sortedGenres = Object.values(DB.data)
      .filter(
        (entry) =>
          entry["@type"] === "DefinedTerm" &&
          entry.inDefinedTermSet &&
          entry.inDefinedTermSet.identifier === "genre"
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return `
      <!--<p>About content here</p>-->

      <div class="c-tile__grid-container">
        ${sortedGenres
          .map(
            (genre) => `
              <div class="c-tile"
                ${
                  genre.image
                    ? `
                      style="background-image: url('${genre.image}')"
                    `
                    : ""
                }
              >
                <div class="c-tile__contents">
                  <a class="c-tile__cover-link" href="/genre/${
                    genre.identifier
                  }">
                    <strong>${genre.name}</strong>
                  </a>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  })
  .add(
    /.+/,
    () => `
    <h2 class="c-page__title" id="skip-to-content-link-target" tabindex="-1">
      Page not found
    </h2>
    <p>This page could not be found. Please use the navigation on the left, or <a href="/">return to the home page</a>.</p>
  `
  );

function render() {
  const path = window.location.pathname.substr(1);

  $root.innerHTML = router.parse(path);
  const $h2 = $root?.querySelector("h2");
  if ($h2) {
    document.title =
      $h2.innerText.trim() + " - Muslim Women's Popular Fiction database";
  }
}

function renderSubnav() {
  const sortedYears = Object.values(DB.data)
    .filter(isCreativeWork)
    .map((x) => (x.datePublished ? x.datePublished.substr(0, 4) : null))
    .filter((x) => !!x)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort();

  document.querySelector("#subnav-by-year").innerHTML = `
    ${sortedYears
      .map(
        (year) => `
          <li><a href="/year/${year}">${year}</a></li>
        `
      )
      .join("")}
  `;
}

DB.update().then(() => {
  render();
  renderSubnav();
  window.addEventListener("popstate", render);
});

document
  .querySelector('[data-js="force-refresh"]')
  .addEventListener("click", (e) => {
    e.preventDefault();
    DB.update({ force: true }).then(render);
  });

const $tray = document.querySelector(".c-subnav");
Array.from(document.querySelectorAll(".c-subnav-toggle")).forEach(($el) => {
  $el.addEventListener("click", (e) => {
    if ($tray?.classList.contains("c-subnav--show")) {
      $tray.classList.remove("c-subnav--show");
    } else {
      $tray.classList.add("c-subnav--show");
      // $tray.style.top = `${$el.getBoundingClientRect().bottom}px`;
    }
  });
});

const $searchTray = document.querySelector(".c-search__results");
document.querySelector(".c-search__input").addEventListener("input", (e) => {
  const searchString = (e.target.value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (searchString.length < 3) {
    $searchTray?.classList.remove("c-search__results--show");
    return;
  }

  const entries = Object.values(DB.data)
    .filter(isCreativeWork)
    .filter((work) => {
      const workSerialised = [
        work.author
          ? work.author.map((a) => DB.data[a.identifier].name).join("")
          : "",
        work.name,
      ]
        .join("")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      return workSerialised.includes(searchString);
    });

  $searchTray?.classList.add("c-search__results--show");
  $searchTray.innerHTML = entries
    .slice(0, 8)
    .map(
      (work) => `
        <li>
          <a class="c-search__result" href="/novel/${work.identifier}">
            <strong>${work.name}</strong>
            ${
              work.author
                ? "<br>" +
                  work.author.map((a) => DB.data[a.identifier].name).join(", ")
                : ""
            }
          </a>
        </li>
      `
    )
    .join("");
});

const clickaways = [
  {
    target: ".c-subnav",
    effect: "c-subnav--show",
    parents: [".c-subnav-toggle", ".c-subnav"],
  },
  {
    target: ".c-search__results",
    effect: "c-search__results--show",
    parents: [".c-search"],
  },
];

document.addEventListener("click", (e) => {
  clickaways.forEach(({ target, effect, parents }) => {
    if (!parents.some((p) => document.querySelector(p).contains(e.target))) {
      document.querySelector(target)?.classList.remove(effect);
    }
  });
});

document.addEventListener(
  "focus",
  (e) => {
    console.log(e.target);
    clickaways.forEach(({ target, effect, parents }) => {
      if (!parents.some((p) => document.querySelector(p).contains(e.target))) {
        document.querySelector(target)?.classList.remove(effect);
      }
    });
  },
  true
);
