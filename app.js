(({ TEAM, TASK, OWNERS, PHASES, MATRIX }, $) => {

  let isComplete = (item) => {
    let copy = Object.assign({}, item);

    delete copy.blocked;

    let incomplete = Object
      .keys(copy)
      .find(key => !copy[key]);

    return !incomplete;
  };

  let phaseCompletion = (tasks, data) => {
    let numerator = tasks.reduce((acc, task) => acc + (data[task] ? 1 : 0), 0);

    return (numerator / tasks.length) * 100;
  };

  /**
   * @returns {string} markup
   */
  let Blocked = (data) => {
    if (!data.blocked) {
      return '<p><span class="label label-info">Not Blocked</span></p><hr />';
    }

    let result = /(B|b)ug (\d{5,})/.exec(data.blocked);
    let blockedContent = result && result[2] ?
      `<a href="http://bugzil.la/${result[2]}" target="_blank">${data.blocked} <i class="fa fa-external-link" aria-hidden="true"></i></a>` :
      data.blocked;

    return `
      <p class="text-warning">
        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Blocked: ${blockedContent}
      </p>
      <hr />
    `;
  };

  /**
   * @returns {string} markup
   */
  let Progress = (phase, tasks, data) => {
    let percent = phaseCompletion(tasks, data);
    let progressClass = 'progress-bar-default';

    if (percent === 0) {
      progressClass = 'progress-bar-warning';
    } else if (percent === 100) {
      progressClass = 'progress-bar-success';
    }

    return `
      ${phase}
      <div class="progress">
        <div class="progress-bar ${progressClass}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" style="width: ${percent}%;">
          ${percent.toFixed(0)}%
        </div>
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

})(window, jQuery);
