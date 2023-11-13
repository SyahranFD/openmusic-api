const LikesHandler = require('./handler');
const LikesRoutes = require('./routes');

module.exports = {
  name: 'like',
  version: '1.0.0',
  register: async (server, { service }) => {
    const albumHandler = new LikesHandler(service);
    server.route(LikesRoutes(albumHandler));
  },
};
