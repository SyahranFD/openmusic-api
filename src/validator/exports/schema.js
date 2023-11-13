const Joi = require('joi');

const ExportSongsPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongsPlaylistsPayloadSchema;
