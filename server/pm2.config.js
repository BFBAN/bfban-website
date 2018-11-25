module.exports = {
  apps: [
    {
      name: 'bfban',
      script: './app.js',
      env: {
        port: 4000,
        NODE_ENV: 'production',
      },
    },
  ],
};
