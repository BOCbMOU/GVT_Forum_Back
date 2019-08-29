export const TOKEN_EXPIRES_IN = '20h';

export const AVATAR_SIZE = 250;

// Access Level (AL)
export const BASE_USER_AL = 9000;
export const UNAUTHORIZED_USER_AL = 9999;
export const BANNED_USER_AL = 9998;
export const MODERATOR_AL = 5000;
export const SUPER_AL = 100;
export const ADMIN_AL = 1;

export const ADD_CATEGORY_AL = SUPER_AL;
export const ADD_COMMENT_AL = BASE_USER_AL;
export const ADD_TOPIC_AL = ADD_COMMENT_AL;
export const VIEW_CATEGORIES_AL = UNAUTHORIZED_USER_AL;

// User defaults
export const UNAUTHORIZED_USER_OBJECT = {
  username: 'UNAUTHORIZED',
  email: 'UNAUTHORIZED',
  accessLevel: UNAUTHORIZED_USER_AL,
};
export const DEF_PAGE_SIZE = 20;
