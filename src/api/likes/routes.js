const AlbumsRoutes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postLikeAlbumByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getLikeAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteLikeAlbumByIdHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = AlbumsRoutes;
