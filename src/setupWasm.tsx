import {simd} from "wasm-feature-detect"
function loadWasm (path){
    let Module = require(path); // Your Emscripten JS output file
    return Module;
}

function selectByFeature(){
    const filePath = ""
    const supported = "";
    const unsupported = "";
    simd().then(simdSupported => {
        if (simdSupported) {
            /* SIMD support */
            return loadWasm(filePath + supported);
        } else {
            /* No SIMD support */
            return loadWasm(filePath + unsupported);
        }
    });
}

const module = selectByFeature();
export default module;