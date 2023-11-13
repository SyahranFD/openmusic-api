const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Playlist gagal dibuat');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists 
        LEFT JOIN users ON users.id = playlists.owner 
        WHERE playlists.owner = $1 OR playlists.id IN (SELECT playlist_id FROM collaborations WHERE user_id = $1)
      `,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongInPlaylist(playlistId, songId) {
    const songCheckQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const songCheckResult = await this._pool.query(songCheckQuery);

    if (!songCheckResult.rowCount) {
      throw new NotFoundError('id lagu tidak ditemukan');
    }

    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal dimasukkan');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      return [];
    }

    return rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    await this._pool.query(query);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistSongActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new Error('Gagal menambahkan aktivitas playlist');
    }

    return id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `
        SELECT playlist_song_activities.action, playlist_song_activities.time, users.username, songs.title
        FROM playlist_song_activities
        INNER JOIN users ON playlist_song_activities.user_id = users.id
        INNER JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_song_activities.playlist_id = $1
      `,
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = PlaylistsService;
