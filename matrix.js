'use strict';

/**
 * Map of team IDs to team names. Modify if you wish to add a
 * new team involved in the migration process, or to change the name of a team
 */
var TEAM = {
  TASKCLUSTER: 'TaskCluster',
  REL_OPS: 'Release Operations',
  ENG_PROD: 'Engineering Productivity',
  BUILD: 'Build Systems Team',
  TESTS: 'Tests Platform',
  REL_ENG: 'Release Engineering'
};

/**
 * Map of team IDs to bootstrap label CSS classes for differentiating
 * the colors of each team in the UI. Modify with a label-* class name
 */
var LABELS = {
  [TEAM.TASKCLUSTER]: 'default',
  [TEAM.REL_OPS]: 'primary',
  [TEAM.ENG_PROD]: 'success',
  [TEAM.BUILD]: 'info',
  [TEAM.TESTS]: 'warning',
  [TEAM.REL_ENG]: 'danger'
};

/**
 * Map of task IDs to display names. Modify if you wish to add a new migration
 * task, or wish to change the display of an existing task in the UI.
 */
var TASK = {
  WORKER: 'TaskCluster worker ready',
  AMI: 'image/AMI ready',
  MACH: 'mach build set up',
  MOZHARNESS: 'mozharness config',
  TRY: 'try',
  BUILD_PEER: 'build peer review',
  SYMBOL: 'symbol upload',
  IMAGE: 'image creation',
  UNIT: 'unit',
  MOCHITEST: 'mochitest',
  REF: 'reftest',
  WEB_PLATFORM: 'web-platform-tests',
  E10S: 'e10s',
  TALOS: 'talos',
  TIER2: 'tier2',
  TIER1: 'tier1',
  SIGNED: 'signed builds',
  MAR: 'complete MAR',
  L10N: 'l10n'
};

/**
 * Map of task IDs to collection of teams which own the task. Modify a collection
 * to add or remote teams from the task.
 */
var OWNERS = {
  [TASK.WORKER]: [TEAM.TASKCLUSTER],
  [TASK.AMI]: [TEAM.TASKCLUSTER, TEAM.REL_OPS],
  [TASK.MACH]: [],
  [TASK.MOZHARNESS]: [TEAM.REL_OPS, TEAM.TASKCLUSTER, TEAM.ENG_PROD],
  [TASK.TRY]: [TEAM.REL_OPS, TEAM.TASKCLUSTER],
  [TASK.BUILD_PEER]: [TEAM.BUILD],
  [TASK.SYMBOL]: [TEAM.BUILD],
  [TASK.IMAGE]: [TEAM.TESTS],
  [TASK.UNIT]: [TEAM.TESTS, TEAM.ENG_PROD],
  [TASK.MOCHITEST]: [TEAM.TESTS, TEAM.ENG_PROD],
  [TASK.REF]: [TEAM.TESTS, TEAM.ENG_PROD],
  [TASK.WEB_PLATFORM]: [TEAM.TESTS, TEAM.ENG_PROD],
  [TASK.E10S]: [TEAM.TESTS, TEAM.ENG_PROD],
  [TASK.TALOS]: [TEAM.TESTS],
  [TASK.TIER2]: [TEAM.TASKCLUSTER],
  [TASK.TIER1]: [TEAM.TASKCLUSTER],
  [TASK.SIGNED]: [TEAM.REL_ENG],
  [TASK.MAR]: [TEAM.REL_ENG],
  [TASK.L10N]: [TEAM.REL_ENG]
};

/**
 * Map of migration phases to a collection of tasks belong to that phase,
 * e.g. the Release Operations "phase" includes TRY and BUILD_PEER tasks.
 * Modify this to add new release phases, or change the entries in the phase
 * collection.
 */
var PHASES = {
  'TaskCluster': [TASK.WORKER, TASK.AMI, TASK.MACH, TASK.MOZHARNESS],
  'Release Operations': [TASK.TRY, TASK.BUILD_PEER],
  'Symbols': [TASK.SYMBOL],
  'Tests': [TASK.IMAGE, TASK.UNIT, TASK.MOCHITEST, TASK.REF, TASK.WEB_PLATFORM, TASK.E10S],
  'Talos': [TASK.TALOS],
  'Tier 2': [TASK.TIER2],
  'Tier 1': [TASK.TIER1],
  'Release Engineering': [TASK.SIGNED, TASK.MAR, TASK.L10N]
};

/**
 * Map of migration platforms to metadata about the platform's migration. A
 * platform consists of a blocked property, and other properties mapping a
 * platform migration task to the task's state.
 *
 * Modify this to change the status of a platform migration task. Relevant
 * properties:
 *
 * "blocked":
 * used to denote if there is something blocking the platform from continuing
 * its migration tasks
 *    use `null` or `false` to denote not blocked
 *    use 'string' to denote platform as blocked with a message indicating the
 *      reason. Using the phrase 'bug <number>' within the message with link-ify
 *      the message in the UI to the bug mentioned in the message.
 *      NOTE: You do not need to paste a link, this is done automatically.
 *
 *    examples:
 *      {
 *        'Sample x64 debug': {
 *          blocked: null, // not blocked
 *          blocked: false, // not blocked
 *          blocked: 'AWS Sucks', // blocked, here's why
 *          blocked: 'bug 111111', // blocked, here's a bug which gets linked
 *          blocked: 'Reticulating splines - Bug 111111' // blocked, here's why, along with a linked bug
 *        }
 *      }
 *
 * [TASK.<id>]: <value>
 * set the status of a platform migration task.
 *    use `false` to denote the task as incomplete
 *    use a bug number to denote the task as incomplete, will be linked in UI
 *    use `true` to denote the task as complete
 *    use `null` to denote the task as not applicable to the platform
 *
 *    example:
 *      {
 *        'Sample x64 debug': {
 *          [TASK.WORKER]: false, // task not done
 *          [TASK.AMI]: 111111, // task not done, relevant bug number, will be linked
 *          [TASK.MACH]: true, // task is done
 *          [TASK.MOZHARNESS]: null // task is not applicable to this platform
 *        }
 *      }
 */
var MATRIX = {
  'Linux x64 debug': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: true,
    [TASK.MOZHARNESS]: true,
    [TASK.TRY]: true,
    [TASK.BUILD_PEER]: true,
    [TASK.SYMBOL]: true,
    [TASK.IMAGE]: true,
    [TASK.UNIT]: true,
    [TASK.MOCHITEST]: true,
    [TASK.REF]: true,
    [TASK.WEB_PLATFORM]: true,
    [TASK.E10S]: true,
    [TASK.TALOS]: null,
    [TASK.TIER2]: true,
    [TASK.TIER1]: true
  },
  'Linux x64 opt': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: true,
    [TASK.MOZHARNESS]: true,
    [TASK.TRY]: true,
    [TASK.BUILD_PEER]: true,
    [TASK.SYMBOL]: true,
    [TASK.IMAGE]: true,
    [TASK.UNIT]: true,
    [TASK.MOCHITEST]: true,
    [TASK.REF]: true,
    [TASK.WEB_PLATFORM]: true,
    [TASK.E10S]: true,
    [TASK.TALOS]: false,
    [TASK.TIER2]: true,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x64 PGO': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: true,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: true,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x64 ASAN': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: true,
    [TASK.MOZHARNESS]: true,
    [TASK.TRY]: true,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: true,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x64 Hazard': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x64 ???': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x32 debug': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x32 opt': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Linux x32 PGO': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Android 4.0 API15+ debug': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Android 4.0 API15+ opt': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Android 4.2 x86 opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Android 4.3 API15+ debug': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Android 4.3 API15+ opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 2012 x64 debug': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: true,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 2012 x64 opt': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 2012 x64 PGO': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 7 opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 7 debug': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TALOS]: false,
    [TASK.TIER2]: false,
    [TASK.TIER1]: false,
    [TASK.SIGNED]: false,
    [TASK.MAR]: false,
    [TASK.L10N]: false
  },
  'Windows 8 opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'Windows 8 debug': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'Windows 10 opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'Windows 10 debug': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'OS X debug': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'OS X opt': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'OS X cross-compiled debug': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.MACH]: false,
    [TASK.MOZHARNESS]: false,
    [TASK.TRY]: false,
    [TASK.BUILD_PEER]: false,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: false
  },
  'OS X cross-compiled opt': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MACH]: true,
    [TASK.MOZHARNESS]: true,
    [TASK.TRY]: true,
    [TASK.BUILD_PEER]: true,
    [TASK.SYMBOL]: false,
    [TASK.IMAGE]: false,
    [TASK.UNIT]: false,
    [TASK.MOCHITEST]: false,
    [TASK.REF]: false,
    [TASK.WEB_PLATFORM]: false,
    [TASK.E10S]: false,
    [TASK.TIER2]: true
  },
  'Signing': {
    blocked: null,
    [TASK.WORKER]: false,
    [TASK.AMI]: false,
    [TASK.SIGNED]: false
  },
  'L10N': {
    blocked: null,
    [TASK.WORKER]: true,
    [TASK.AMI]: true,
    [TASK.MOZHARNESS]: true,
    [TASK.TRY]: false,
    [TASK.SIGNED]: false
  },
  'Talos': {
    blocked: false,
    [TASK.TALOS]: false
  }
};

Object.assign(window, { TEAM, LABELS, TASK, OWNERS, PHASES, MATRIX });
