import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

(self as any).MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'json':
        return new JSONWorker();
      case 'yaml':
        // YAML 走默认 editor.worker
        return new EditorWorker();
      case 'xml':
        return new EditorWorker();
      case 'csv':
        return new EditorWorker();
      default:
        return new EditorWorker();
    }
  },
};