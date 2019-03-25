module.exports = {
  apps: [
    {
      name: 'bfban',
      script: './app.js',
      env: {
        port: 4000,
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};
