module.exports = {
    apps: [
      {
        name: 'ereg-account-tracker-app',
        script: 'npm start',
        exec_mode: 'cluster',
        instances: 1
      }
    ]
  };