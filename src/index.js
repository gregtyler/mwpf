import DB from './db.js'

const $root = document.querySelector('#root');

DB.update()
  .then(() => {
    $root.innerHTML = '';
    Object.values(DB.data.novel).forEach(entry => {
      const line = `
        <div>
          <strong>${entry.title}</strong>
          by ${entry.author ? entry.author.map(x => DB.data.author[x].name).join(', ') : ''}
          <br>
          ${entry.tags ? entry.tags.map(x => `<span class="tag">${DB.data.tag[x].tag}</span>`).join(' ') : ''}
        </div>
      `;

      $root.innerHTML += line;
    })
  })
