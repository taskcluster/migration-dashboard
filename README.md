# TaskCluster Migration Dashboard

This dashboard is a static site driven with GitHub Pages. To view this dashboard,
please visit [http://taskcluster.github.io/migration-dashboard/](http://taskcluster.github.io/migration-dashboard/).

## Making changes

To update the data driving the dashboard UI, you'll need to edit the
[matrix.js](https://github.com/taskcluster/migration-dashboard/blob/gh-pages/matrix.js)
file. Most changes made in the matrix file should automatically reflect in the
UI once committed. Most changes should involve changing a relevant platform
task status in the `MATRIX` map towards the end of the file.

## Questions

Ping :Eli in #taskcluster in Mozilla IRC.
