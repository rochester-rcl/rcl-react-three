/* @flow */
import loadOBJExporter from './exporters/OBJExporter';
import loadSTLExporter from './exporters/STLExporter';
export default function loadExporters(threeInstance) {
  const exporters = [
    loadOBJExporter(threeInstance),
    loadSTLExporter(threeInstance),
  ];
  return Promise.all(exporters).then(() => threeInstance);
}
