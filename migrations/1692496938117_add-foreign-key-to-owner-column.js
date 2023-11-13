exports.up = (pgm) => {
  pgm.addConstraint('playlists', 'fk_playlists_owner_id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlists_owner_id');
};
