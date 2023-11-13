const AlbumsHandler = require('./handler');
const AlbumsRoutes = require('./routes');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumHandler = new AlbumsHandler(service, validator);
    server.route(AlbumsRoutes(albumHandler));
  },
};
