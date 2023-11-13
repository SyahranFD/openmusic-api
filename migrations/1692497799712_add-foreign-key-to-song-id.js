exports.up = (pgm) => {
  pgm.addConstraint('playlist_songs', 'fk_songs', {
    foreignKeys: {
      columns: 'song_id',
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'fk_songs');
};
