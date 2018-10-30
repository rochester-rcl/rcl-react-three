import * as THREE from 'three';

const computeProgress = (request: ProgressEvent): string => {
  return parseFloat(request.loaded / 1000000).toFixed(2) + ' MB';
}

const handlePayload = (payload: Object): void => {
  // We're going to use this as a skybox texture so ...
  payload.mapping = THREE.EquirectangularReflectionMapping;
  payload.magFilter = THREE.LinearFilter;
  payload.minFilter = THREE.LinearMipMapLinearFilter;
  postMessage({
    status: true,
    modelLoader: {
      eventType: 'loaded',
      val: payload,
      loaderType: self.loaderType
    }
  });
}

const handleUpdate = (progress: ProgressEvent): void => {
  const update = computeProgress(progress);
  postMessage({
    status: true,
    modelLoader: {
      eventType: 'progress',
      val: update,
      loaderType: self.loaderType
    }
  });
}

const handleError = (error: Error): void => {
  postMessage({
    status: false,
    modelLoader: {
      eventType: 'error',
      val: error,
      loaderType: self.loaderType
    }
  })
}

self.onmessage = (event: MessageEvent): void => {
  const { type, url } = event.data;
  if (type === undefined || url === undefined) postMessage({status: false, error: 'Invalid data passed to ModelLoaderWorker'});
  self.loaderType = type;
  const loader = new THREE.ObjectLoader();
  console.log(loader.parseGeometries);
  loader.load(url, handlePayload, handleUpdate, handleError);
}
