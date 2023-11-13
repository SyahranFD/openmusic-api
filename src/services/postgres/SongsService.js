const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('sorry lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongs(title, performer) {
    let query = 'SELECT id, title, performer FROM songs';
    const values = [];

    if (title) {
      query += ' WHERE LOWER(title) LIKE $1';
      values.push(`%${title.toLowerCase()}%`);
    }

    if (performer) {
      if (title) {
        query += ' AND LOWER(performer) LIKE $2';
      } else {
        query += ' WHERE LOWER(performer) LIKE $1';
      }
      values.push(`%${performer.toLowerCase()}%`);
    }

    const { rows } = await this._pool.query(query, values);
    return rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('sorry lagu tidak ditemukan');
    }
    return rows[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('sorry gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('sorry gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
