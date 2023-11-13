const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('sorry album gagal ditambahkan');
    }
    return rows[0].id;
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1',
      values: [albumId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = rows[0];
    const songs = await this.getSongsByAlbumId(id);
    album.songs = songs;

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('sorry gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('sorry gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyAlbumOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = rows[0];

    if (album.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses album ini');
    }
  }
}

module.exports = AlbumsService;
