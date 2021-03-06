const GoogleAnalytics = require('./GoogleAnalytics');
const Header = require('./Header');
const React = require('react');
const settings = require('../settings');

module.exports = ({ active = '', children, title = 'Kenneth Chung' }) => (
  <html>
    <head>
      <title>{`${title} - www.kentor.dev`}</title>
      <meta name="author" content={settings.author} />
      <meta name="description" content={settings.description} />
      <meta name="viewport" content="width=device-width" />
      <link
        href="/posts/feed.xml"
        rel="alternate home"
        type="application/rss+xml"
      />
      <link href="/app.css" rel="stylesheet" />
    </head>
    <body className="mv4">
      <div className="mw7 ph4 margin-auto">
        <Header active={active} />
        <hr />
        {children}
      </div>
      {process.env.NODE_ENV === 'production' && <GoogleAnalytics />}
      {/* Uncomment this if needed <script src="/bundle.js" /> */}
    </body>
  </html>
);
