exports.up = (pgm) => {
  pgm.addConstraint('playlist_songs', 'fk_playlists', {
    foreignKeys: {
      columns: 'playlist_id',
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'fk_playlists');
};
