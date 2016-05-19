(({ TEAM, LABELS, TASK, OWNERS, PHASES, MATRIX }, $) => {

  let isComplete = (item) => {
    let copy = Object.assign({}, item);

    delete copy.blocked;

    let incomplete = Object
      .keys(copy)
      .find(key => !copy[key]);

    return !incomplete;
  };

  /**
   * @returns {string} markup
   */
  let Blocked = (data) => {
    if (!data.blocked) {
      return '<p><span class="label label-info">Not Blocked</span></p>';
    }

    let result = /(B|b)ug (\d{5,})/.exec(data.blocked);
    let blockedContent = result && result[2] ?
      `<a href="http://bugzil.la/${result[2]}" target="_blank">${data.blocked} <i class="fa fa-external-link" aria-hidden="true"></i></a>` :
      data.blocked;

    return `
      <p class="text-warning">
        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Blocked: ${blockedContent}
      </p>
    `;
  };

  /**
   * @returns {string} markup
   */
  let Progress = (phase, tasks, data) => {
    tasks = tasks.filter(t => data[t] !== null);

    if (!tasks.length) {
      return '';
    }

    let percent = 1 / tasks.length * 100;
    let progresses = tasks
      .map(task => `
        <div class="progress-bar progress-bar-${data[task] ? 'success' : 'warning'}" style="width: ${percent}%">
          <span>${task}</span>
        </div>
      `);

    return `
      <hr />
      ${phase}
      <div class="progress">
        ${progresses.join('')}
      </div>
    `;
  };

  /**
   * @returns {string} markup
   */
  let Heading = (name, id) => {
    return `
      <div class="panel-heading" role="tab" id="heading-${id}">
        <h4 class="panel-title">
          <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-${id}" aria-controls="collapse-${id}">
            ${name}
          </a>
        </h4>
      </div>
    `;
  };

  /**
   * @returns {string} markup
   */
  let Body = (data) => {
    let progresses = Object
      .keys(PHASES)
      .map(phase => {
        let tasks = PHASES[phase];

        return Progress(phase, tasks, data);
      });

    return `
      <div class="panel-body">
        ${Blocked(data)}
        ${progresses.join('')}
      </div>
    `;
  };

  /**
   * @returns {string} markup
   */
  let Panel = (name, index, data) => {
    let panelClass = 'panel-default';

    if (data.completed) {
      panelClass = 'panel-success';
    } else if (data.blocked) {
      panelClass = 'panel-danger';
    }

    return `
      <div class="panel ${panelClass}">
        ${Heading(name, index)}
        <div id="collapse-${index}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-${index}">
          ${Body(data)}
        </div>
      </div>
    `;
  };

  let pending = 0;
  let blocked = 0;
  let completed = 0;

  let keys = Object.keys(MATRIX);
  let markup = keys
    .map((name, index) => {
      let item = MATRIX[name];

      item.completed = isComplete(item);

      if (item.completed) {
        completed++;
      } else if (item.blocked) {
        blocked++;
      } else {
        pending++;
      }

      return Panel(name, index, item);
    });

  $('#accordion')
    .html(markup);

  $('#pending').html(`<sup>${pending}</sup>/<sub>${keys.length}</sub>`);
  $('#blocked').html(`<sup>${blocked}</sup>/<sub>${keys.length}</sub>`);
  $('#migrated').html(`<sup>${completed}</sup>/<sub>${keys.length}</sub>`);

  let owners = Object
    .keys(OWNERS)
    .map(task => {
      let teams = OWNERS[task];
      let labels = teams.map(team => `<span class="label label-${LABELS[team]}">${team}</span>`);

      return `
        <tr>
          <td>${task}</td>
          <td>${labels.join('')}</td>
        </tr>
      `;
    });

  $('#owners').html(owners.join(''));

})(window, jQuery);
