import { saveAs } from 'file-saver';

export {ParameterForm} from "./ParameterForm";
export {GeneralTooltip} from "./Tooltips";
export {DownloadButton} from "./DownloadButton";
export {CloseButton} from "./CloseButton";

export const updateInitialData = (data) => { //Only used to for replacing initialData = not useful in release
    const fileToSave = new Blob([JSON.stringify(data)], {type: 'application/json',});
    saveAs(fileToSave, 'initialData.json');
    //const compressed = pako.deflate(JSON.stringify(data));
    //console.log(compressed);
    //const fileToSave2 = new Blob([compressed], {type: 'text/plain',});
    //saveAs(fileToSave2, 'initialData.deflate');
}