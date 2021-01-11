import DB from './db.js'

const $root = document.querySelector('#root');

DB.update()
  .then(() => {
    $root.innerHTML = '';
    DB.data.novel.forEach(entry => {
      const line = `
        <div>
          <strong>${entry.title}</strong>
          by ${entry.author.map(x => x.fields.name).join(', ')}
          <br>
          ${entry.tags.map(x => `<span class="tag">${x.fields.tag}</span>`).join(' ')}
        </div>
      `;

      $root.innerHTML += line;
    })
  })
