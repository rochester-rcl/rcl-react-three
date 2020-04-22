/* @flow */
import * as _THREE from "three";

// LOADERS
import initLoaders from "../loaders/InitLoaders";

// Constants
import {
  THREE_MESH,
  THREE_GROUP,
  THREE_DIFFUSE_MAP,
  THREE_MESH_STANDARD_MATERIAL,
  OBJ_EXT,
  VRML_EXT,
} from "../../constants/application";

// postrprocessing options

import { getChildren, centerGeometry } from "./geometry";

import { createNormalMap } from "./normals";

// lodash
import lodash from "lodash";

// Abstract Base Class
import ThreeConverter from "./ThreeConverter";
// super obnoxious pattern.
const THREE = _THREE;

export default class ThreeObjConverter extends ThreeConverter {
  OPTIONS_MAP = {
    center: centerGeometry,
    createNormalMap: createNormalMap,
  };
  MESH_FORMATS = {
    VRML: VRML_EXT,
    OBJ: OBJ_EXT,
  };
  constructor(
    mesh: File,
    materials: File,
    maps: Object,
    options: Object,
    progress: ConverterProgress
  ) {
    super(mesh, maps, options, progress);
    this.mtlFile = materials;
    this.loadObj = this.loadObj.bind(this);
    this.loadVRML = this.loadVRML.bind(this);
    this.loadObjCallback = this.loadObjCallback.bind(this);
    this.loadMtl = this.loadMtl.bind(this);
    this.loadMTLCallback = this.loadMTLCallback.bind(this);
    this.handleOptionsCallback = this.handleOptionsCallback.bind(this);
    this.convertWithMaterials = this.convertWithMaterials.bind(this);
    this.convertNoMaterials = this.convertNoMaterials.bind(this);
    this.setUpMaterials = this.setUpMaterials.bind(this);
    this.rectifyDataURLs = this.rectifyDataURLs.bind(this);
    this.loadedMaps = {};
    this.LOADER_METHODS = {
      OBJ: this.loadObj,
      VRML: this.loadVRML,
    };
  }

  getMeshFileFormat() {
    const splitFilename = this.meshFile.name.split(".");
    const ext = splitFilename[splitFilename.length - 1];
    for (let key in this.MESH_FORMATS) {
      const format = this.MESH_FORMATS[key];
      if (format.includes(ext)) {
        return key;
      }
    }
  }

  getLoader() {
    return this.LOADER_METHODS[this.getMeshFileFormat()];
  }

  fixVRMLTextures(vrmlText) {
    return new Promise((resolve, reject) => {
      const windows = /(url)(.*?)\r/g;
      const unix = /(url)(.*?)\r/g;
      let matches = [...vrmlText.matchAll(windows)];
      let isWindows = true;
      if (matches.length === 0) {
        isWindows = false;
        matches = [...vrmlText.matchAll(unix)];
      }
      if (matches.length === 0) {
        resolve(vrmlText); // no textures
        return;
      }
      const unique = [...new Set(matches.map((m) => m[0]))];
      const maps = this.vrmlImageTexturesToObjectUrl(unique, isWindows);
      if (maps.length !== unique.length) reject(new Error(`Not All Maps in ${this.meshFile.name} were uploaded`));
      let updated = vrmlText;
      
      maps.forEach((m) => {
        const regex = new RegExp(this.escapeRegExp(m.url), 'g');
        updated = updated.replace(regex, `url ${m.objectUrl}\n`);
      });
      resolve(updated);
    });
  }

  // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string
  escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
  }

  vrmlImageTexturesToObjectUrl(urls, windows = false) {
    return urls.map((url) => this.vrmlImageTextureToObjectUrl(url, windows)).filter((m) => m !== undefined);
  }

  vrmlImageTextureToObjectUrl(url, windows = false) {
    const splitChar = windows ? "\\" : "/";
    let basename = url.split(splitChar).pop();
    if (basename.includes('"')) {
      basename = basename.replace('"', "");
    }
    basename = lodash.trim(basename);
    for (let key in this.mapFiles) {
      // TODO could be an array as well
      const map = this.mapFiles[key];
      const mapName = lodash.trim(map.name);
      // for now deal with single as a proof of concept
      if (basename === mapName) {
        // read the file to a data url
        return {
          url: url,
          objectUrl: '"http://fakeurl.com/image.png"'
        };
      }
    }
    // return Promise.reject(new Error("No matching maps found in file. Do they have the same file name?"));
  }

  convertToGroup(mesh) {
    const group = new THREE.Group();
    mesh.children.forEach((child) => group.add(child));
    return group;
  }

  loadVRML() {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this mesh."
          );
          return;
        }

        if (this.meshFile !== null) {
          this.readASCII(this.meshFile).then((meshData) => {
            this.fixVRMLTextures(meshData).then((vrmlData) => {
              const vrmlLoader = new THREE.VRMLLoader();
              this.mesh = vrmlLoader.parse(vrmlData);
              // convert all materials to standard
              this.mesh.traverse((child) => {
                if (child.constructor.name === THREE_MESH) {
                  child.material = this.convertMaterialToStandard(child.material);
                }
              });
              this.mesh = this.convertToGroup(this.mesh);
              resolve(this.mesh);
            });
          });
        } else {
          reject(new Error("No Mesh File Attached"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  loadObj(material) {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this mesh."
          );
        } else {
          if (this.meshFile !== null) {
            this.readASCII(this.meshFile)
              .then((meshData) => {
                const objLoader = new THREE.OBJLoader();
                objLoader.setPath("");
                if (material !== undefined) objLoader.setMaterials(material);
                this.mesh = objLoader.parse(meshData);
                this.setUpMaterials().then(() => resolve(this.mesh));
              })
              .catch((error) => reject(error));
          } else {
            resolve(new THREE.Mesh());
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  rectifyTextureURL(
    _materials: THREE.MTLLoader.MaterialCreator,
    maps: Array<Object>
  ) {
    const diffuse = maps.find((map) => map.type === THREE_DIFFUSE_MAP);
    for (let key in _materials.materialsInfo) {
      let val = _materials.materialsInfo[key];
      if (val.map_kd !== undefined) {
        if (diffuse) {
          val.map_kd = diffuse.dataURL;
        }
      }
    }
  }

  rectifyDataURLs(serialized: object) {
    serialized.images.forEach((image) => {
      let mapKey = Object.keys(this.loadedMaps).find((key) => {
        const _map = this.loadedMaps[key];
        return _map.image.uuid === image.uuid;
      });
      const map = this.loadedMaps[mapKey];
      if (map !== undefined) {
        image.url = map.image.currentSrc;
      }
    });
  }

  convertMaterialToStandard(mat) {
    const material = new THREE.MeshStandardMaterial();
    for (let key in mat) {
      if (material[key] !== undefined) {
        material[key] = mat[key];
      }
    }
    material.type = THREE_MESH_STANDARD_MATERIAL;
    return material;
  }

  convertMultiMaterial(mat) {
    return mat.map(this.convertMaterialToStandard);
  }

  // TODO so far only working with ONE MAP - will have to think about how to do it otherwise, UUIDs will work
  setUpMaterials(): Promise {
    const tasks = [];
    let children;
    if (this.mesh.constructor.name === THREE_MESH) {
      children = [this.mesh];
    } else {
      children = this.mesh.children;
    }
    children.forEach((child) => {
      if (child.material.constructor === Array) {
        child.material = this.convertMultiMaterial(child.material);
      } else {
        child.material = this.convertMaterialToStandard(child.material);
      }
      for (let key in this.maps) {
        let map = this.maps[key];
        // because diffuse is handled in the loader via map_kd
        let task = this.loadTexture(map.dataURL, (tex) => {
          child.material[map.type] = tex;
          this.loadedMaps[map.type] = tex;
        });
        tasks.push(task);
      }
    });
    return Promise.all(tasks);
  }

  loadMtl() {
    return new Promise((resolve, reject) => {
      try {
        if (this.loadersInitialized === false) {
          reject(
            "ThreeConverter.init must be called before you can convert this material."
          );
        } else {
          if (this.mtlFile !== null) {
            this.readASCII(this.mtlFile)
              .then((mtlData) => {
                const mtlLoader = new THREE.MTLLoader();
                mtlLoader.setPath("");
                this.materials = mtlLoader.parse(mtlData);
                if (!lodash.isEmpty(this.mapFiles)) {
                  this.readMaps(this.mapFiles).then((maps) => {
                    this.maps = maps;
                    this.rectifyTextureURL(this.materials, this.maps);
                    resolve(this.materials);
                  });
                } else {
                  resolve(this.materials);
                }
              })
              .catch((error) => reject(error));
          } else {
            resolve(new THREE.MeshStandardMaterial());
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  loadMTLCallback(material) {
    this.emitProgress("Reading Geometry Data", 50);
    return this.loadObj(material);
  }

  loadObjCallback(mesh) {
    super.convert();
    this.emitProgress("Applying Post-Processing Options", 75);
    return this.handleOptions();
  }

  handleOptionsCallback(mesh) {
    const exported = mesh.toJSON();
    if (!this.options.compress && this.maps !== undefined) {
      this.rectifyDataURLs(exported);
    }
    this.emitDone(exported);
  }

  convertWithMaterials() {
    return this.loadMtl()
      .then(this.loadMTLCallback)
      .then(this.loadObjCallback)
      .then(this.handleOptionsCallback)
      .then((exported) => Promise.resolve(exported))
      .catch((error) => this.handleError(error));
  }

  convertNoMaterials() {
    const loader = this.getLoader();
    if (loader) {
      return loader()
        .then(this.loadObjCallback)
        .then(this.handleOptionsCallback)
        .then((exported) => Promise.resolve(exported))
        .catch((error) => this.handleError(error));
    } else {
      return this.handleError(
        new Error("No Loader Initialized for the Current Mesh")
      );
    }
  }

  convert(): Promise {
    this.emitProgress("Reading Material Data", 25);
    if (this.mtlFile !== null) {
      return this.convertWithMaterials();
    }
    return this.convertNoMaterials();
  }
}
