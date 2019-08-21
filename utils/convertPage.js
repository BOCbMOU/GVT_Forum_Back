import { DEF_PAGE_SIZE } from '../consts';

/**
 *
 * @param {Number} page
 * @param {Object} user
 */
const convertPage = (page = 1, { settings = {} }) => {
  const limit = settings.pageSize || DEF_PAGE_SIZE;
  const skip = (page - 1) * limit;

  return { skip, limit };
};

export default convertPage;
