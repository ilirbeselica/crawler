module.exports = {
    apps: [
      {
        name: "xvfb",
        script: "Xvfb",
        args: ":99 -screen 0 1024x768x24",
        autorestart: true
      },
      {
        name: "crawler-app",
        script: "dist/app.js", 
        env: {
          DISPLAY: ":99",
          NODE_ENV: "production"
        }
      }
    ]
  };