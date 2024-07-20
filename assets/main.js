async function init() {
  document.body.classList.add("u-js-enabled");

  const response = await fetch("/data.json");
  const data = await response.json();

  const sortedYears = Object.values(data)
    .filter((work) => ["CreativeWork", "Book", "Novel"].includes(work["@type"]))
    .map((x) => (x.datePublished ? x.datePublished.substr(0, 4) : null))
    .filter((x) => !!x)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort();

  document.querySelector("#subnav-by-year").innerHTML = `
    ${sortedYears
      .map(
        (year) => `
          <li><a href="/year/${year}">${year}</a></li>
        `,
      )
      .join("")}
  `;

  const $tray = document.querySelector(".c-subnav");
  Array.from(document.querySelectorAll(".c-subnav-toggle")).forEach(($el) => {
    $el.addEventListener("click", (e) => {
      if ($tray?.classList.contains("c-subnav--show")) {
        $tray.classList.remove("c-subnav--show");
      } else {
        $tray.classList.add("c-subnav--show");
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

    const entries = Object.values(data)
      .filter((work) =>
        ["CreativeWork", "Book", "Novel"].includes(work["@type"]),
      )
      .filter((work) => {
        const workSerialised = [
          work.author
            ? work.author
                .map(
                  (a) => data.find((d) => d.identifier === a.identifier).name,
                )
                .join("")
            : "",
          work.name,
        ]
          .join("")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        return workSerialised.includes(searchString);
      });

    $searchTray?.classList.add("c-search__results--show");
    if (entries.length) {
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
                    work.author
                      .map(
                        (a) =>
                          data.find((d) => d.identifier === a.identifier).name,
                      )
                      .join(", ")
                  : ""
              }
            </a>
          </li>
        `,
        )
        .join("");
    } else {
      $searchTray.innerHTML =
        '<li><span class="c-search__result">No results found</span></li>';
    }
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
      clickaways.forEach(({ target, effect, parents }) => {
        if (
          !parents.some((p) => document.querySelector(p).contains(e.target))
        ) {
          document.querySelector(target)?.classList.remove(effect);
        }
      });
    },
    true,
  );
}

document.addEventListener("DOMContentLoaded", init);
