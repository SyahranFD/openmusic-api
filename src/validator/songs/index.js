const { songSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = songSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
