(function(window, $) {
  var { TEAM, LABELS, TASK, OWNERS, PHASES, MATRIX } = window;

  var isComplete = function(item) {
    var copy = Object.assign({}, item);

    delete copy.blocked;

    var incomplete = Object
      .keys(copy)
      .find(function(key) { return copy[key] !== true && copy[key] !== null; });

    return !incomplete;
  };

  /**
   * @returns {string} markup
   */
  var Blocked = function(data) {
    if (data.completed) {
      return '<p><span class="label label-default">Completed</span></p>';
    } else if (!data.blocked) {
      return '<p><span class="label label-info">Not Blocked</span></p>';
    }

    var result = /(B|b)ug (\d{5,})/.exec(data.blocked);
    var blockedContent = result && result[2] ?
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
  var Progress = function(phase, tasks, data) {
    tasks = tasks.filter(function(t) { return data[t] !== null; });

    if (!tasks.length) {
      return '';
    }

    var percent = 1 / tasks.length * 100;
    var progresses = tasks
      .map(function(task) {
        var content = typeof data[task] === 'number' ?
          `<a href="http://bugzil.la/${data[task]}" target="_blank">${task}</a>`:
          `<span>${task}</span>`;

        return `
          <div class="progress-bar progress-bar-${data[task] === true ? 'success' : 'warning'}" style="width: ${percent}%">
            ${content}
          </div>
        `;
      });

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
  var Heading = function(name, id, data) {
    var indicators = data.completed ?
      `<i class="fa fa-check-circle" aria-hidden="true"></i>` :
      Object
        .keys(data)
        .filter(function(task) { return data[task] !== null && task !== 'blocked' && task !== 'completed'; })
        .map(function(task) {
          var completed = data[task] === true;

          return completed ?
            `<i class="fa fa-circle text-success" aria-hidden="true"></i>` :
            `<i class="fa fa-circle text-warning" aria-hidden="true"></i>`;
        })
        .join('');

    return `
      <div class="panel-heading" role="tab" id="heading-${id}">
        <h4 class="panel-title">
          <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse-${id}" aria-controls="collapse-${id}">
            ${name}
            ${indicators}
          </a>
        </h4>
      </div>
    `;
  };

  /**
   * @returns {string} markup
   */
  var Body = function(data) {
    var progresses = Object
      .keys(PHASES)
      .map(function(phase) {
        var tasks = PHASES[phase];

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
  var Panel = function(name, index, data) {
    var panelClass = 'panel-default';

    if (data.completed) {
      panelClass = 'panel-success';
    } else if (data.blocked) {
      panelClass = 'panel-danger';
    }

    return `
      <div class="panel ${panelClass}">
        ${Heading(name, index, data)}
        <div id="collapse-${index}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-${index}">
          ${Body(data)}
        </div>
      </div>
    `;
  };

  var pending = 0;
  var blocked = 0;
  var completed = 0;

  var keys = Object.keys(MATRIX);
  var markup = keys
    .map(function(name, index) {
      var item = MATRIX[name];

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

  var owners = Object
    .keys(OWNERS)
    .map(function(task) {
      var teams = OWNERS[task];
      var labels = teams.map(function(team) { return `<span class="label label-${LABELS[team]}">${team}</span>`; });

      return `
        <tr>
          <td>${task}</td>
          <td>${labels.join('')}</td>
        </tr>
      `;
    });

  $('#owners').html(owners.join(''));

})(window, jQuery);
