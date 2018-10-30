/* @flow */

// REST
export const GET_THREE_ASSET: string = 'GET_THREE_ASSET';
export const THREE_ASSET_LOADED: string = 'THREE_ASSET_LOADED';
export const THREE_METADATA_LOADED: string = 'THREE_METADATA_LOADED';

// Meshes
export const LOAD_MESH: string = 'LOAD_MESH';
export const UPDATE_MESH_LOAD_PROGRESS: string = 'UPDATE_MESH_LOAD_PROGRESS';
export const MESH_LOAD_ERROR: string = 'MESH_LOAD_ERROR';
export const MESH_LOADED: string = 'MESH_LOADED';


// Textures
export const UPDATE_TEXTURE_LOAD_PROGRESS: string = 'UPDATE_TEXTURE_LOAD_PROGRESS';
export const TEXTURE_LOAD_ERROR: string = 'TEXTURE_LOAD_ERROR';
export const TEXTURE_LOADED: string = 'TEXTURE_LOADED';
export const LOAD_TEXTURE: string = 'LOAD_TEXTURE';

// Admin
export const AUTHENTICATE: string = 'AUTHENTICATE';
export const AUTHENTICATE_ATTEMPTED: string = 'AUTHENTICATE_ATTEMPTED';
export const LOGIN_USER: string = 'LOGIN_USER';
export const LOGOUT_USER: string = 'LOGOUT_USER';
export const USER_LOGGED_IN: string = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT: string = 'USER_LOGGED_OUT';

export const ADD_USER: string = 'ADD_USER';
export const USER_ADDED: string = 'USER_ADDED';
export const VERIFY_USER: string = 'VERIFY_USER';
export const USER_VERIFIED: string = 'USER_VERIFIED';
export const DELETE_USER: string = 'DELETE_USER';
export const USER_DELETED: string = 'USER_DELETED';
export const UPDATE_USER: string = 'UPDATE_USER';
export const USER_UPDATED: string = 'USER_UPDATED';

export const LOGIN_ERROR: string = 'LOGIN_ERROR';
export const REMOVE_LOGIN_ERROR: string = 'REMOVE_LOGIN_ERROR';
export const USER_AUTHENTICATED: string = 'USER_AUTHENTICATED';

export const GET_VIEWS: string = 'GET_VIEWS';
export const GET_VIEW: string = 'GET_VIEW';
export const GET_THREEFILE: string = 'GET_THREEFILE';
export const ADD_VIEW: string = 'ADD_VIEW';
export const DELETE_VIEW: string = 'DELETE_VIEW';
export const UPDATE_VIEW: string  = 'UPDATE_VIEW';

export const VIEW_ADDED: string = 'VIEW_ADDED';
export const VIEWS_LOADED: string = 'VIEWS_LOADED';
export const VIEW_LOADED: string = 'VIEW_LOADED';

// Settings
export const SAVE_VIEWER_SETTINGS = 'SAVE_VIEWER_SETTINGS';
export const LOAD_VIEWER_SETTINGS = 'LOAD_VIEWER_SETTINGS';

// Converter
export const START_CONVERSION = 'START_CONVERSION';
export const CONVERSION_STARTED = 'CONVERSION_STARTED';
export const UPDATE_CONVERSION_PROGRESS = 'UPDATE_CONVERSION_PROGRESS';
export const CONVERSION_COMPLETE = 'CONVERSION_COMPLETE';
export const CONVERSION_ERROR = 'CONVERSION_ERROR';
export const RESTART_CONVERTER = 'RESTART_CONVERTER';
