/* @flow */

// redux
import { combineReducers } from 'redux';

// Actions
import * as ActionConstants from '../constants/actions';

// Utils
import { LinearGradientShader } from '../utils/image';

// Reducers
import ViewReducer from './ViewReducer';
import ConverterReducer from './ConverterReducer';
import UserReducer from './UserReducer';

const defaultState = {

  mesh: {
    loaded: false,
    progress: {
      label: 'Loading Mesh',
      percent: null,
    },
    object3D: null
  },

  texture: {
    loaded: false,
    progress: {
      label: 'Loading Texture',
      percent: null,
    },
    image: null,
  },

  metadata: [],

  threeAsset: {

  }
}

function uiReducer(state: Object = defaultState, action: Object): Object {

  switch (action.type) {

    case ActionConstants.MESH_LOADED:
      return {
        ...state,
        mesh: {
          loaded: true,
          progress: 'Complete',
          object3D: action.payload.val
        }
      };

    case ActionConstants.UPDATE_MESH_LOAD_PROGRESS:
      return {
        ...state,
        mesh: { ...state.mesh, progress: { label: action.payload.val, percent: action.payload.percent } }
      }

    case ActionConstants.UPDATE_TEXTURE_LOAD_PROGRESS:
      return {
        ...state,
        texture: { ...state.texture, progress: { label: action.payload.val, percent: action.payload.percent } }
      }

    case ActionConstants.TEXTURE_LOADED:
      return {
        ...state,
        texture: {
          ...state.texture,
          loaded: true,
          progress: 'Complete',
          image: action.payload.val
        }
      }

    case ActionConstants.THREE_ASSET_LOADED:
      return {
        ...state,
        threeAsset: action.threeAsset,
      }

    case ActionConstants.THREE_METADATA_LOADED:
      return {
        ...state,
        metadata: action.metadata,
      }

    default:
      return state;
  }

}

const appReducer = combineReducers({
    views: ViewReducer,
    ui: uiReducer,
    user: UserReducer,
    converter: ConverterReducer,
  });

export default appReducer;
