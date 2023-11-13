const autoBind = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateCoverHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
    await this._service.updateCoverUrlById(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
