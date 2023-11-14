//  __  __   _ _____ ___ ___ ___   _   _      ___  ___ ___ ___ ___ _  _ 
// |  \/  | /_\_   _| __| _ \_ _| /_\ | |    |   \| __/ __|_ _/ __| \| |
// | |\/| |/ _ \| | | _||   /| | / _ \| |__  | |) | _|\__ \| | (_ | .` |
// |_|  |_/_/ \_\_| |___|_|_\___/_/ \_\____| |___/|___|___/___\___|_|\_|
//
const MDCSwitch = mdc.switchControl.MDCSwitch;
const MDCSlider = mdc.slider.MDCSlider;
const MDCDrawer = mdc.drawer.MDCDrawer;
const MDCList = mdc.list.MDCList;
const MDCTextField = mdc.textField.MDCTextField;

mdc.autoInit();

const DEFAULT_TITLE = document.querySelector('h1').textContent;
const titleTextField = new MDCTextField(document.getElementById("title-input"));
titleTextField.input.addEventListener('input', (e) => {
    const val = titleTextField.value.trim();
    if (val.length < 1) {
        document.querySelector('h1').textContent = DEFAULT_TITLE;
        delete state.settings.title;
    } else {
        document.querySelector('h1').textContent = val;
        state.settings.title = val;
    }
})

let elasticityControl;
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
document.body.addEventListener('MDCDrawer:opened', () => {
    // we initialize the elasticityControl the first time we open the settings
    // drawer as MDC somehow doesn't properly setup the width of the slider if
    // its parent is hidden...  
    if (!elasticityControl) {
        const elasticitySlider = document.querySelector('#elasticity-slider');
        elasticityControl = new MDCSlider(elasticitySlider);
        elasticityControl.foundation.setValue(state.settings.elasticity * 100);
        elasticitySlider.addEventListener('MDCSlider:change', (e) => {
            state.settings.elasticity = e.detail.value / 100;
        });
    }
    updateShareLink();
});
function initSwitch(selector, field, onClick) {
    const onClickListener = onClick || function(){};
    const el = document.querySelector(selector);
    const ctl = new MDCSwitch(el);
    el.addEventListener('click', (e) => {
        state.settings[field] = el.ariaChecked == "true";
        onClickListener();
    });
    return ctl;    
}
const switchControl  = initSwitch('#basic-switch', 'showVisualMedia');
const kControl  = initSwitch('#knowledge-switch', 'showKnowledge');
const darkControl  = initSwitch('#darkmode-switch', 'darkMode', () => {
    if (state.settings.darkMode) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});
const linkTextField = new MDCTextField(document.getElementById("link-text-field"));

//  ___   _   ___ ___  __ _ _    _         _     _   _ ___ _       ___   _   ___ ___ 
// | _ ) /_\ / __| __|/ /| | |  | |__ _  _| |_  | | | | _ \ |  ___/ __| /_\ | __| __|
// | _ \/ _ \\__ \ _|/ _ \_  _| | '_ \ || |  _| | |_| |   / |_|___\__ \/ _ \| _|| _| 
// |___/_/ \_\___/___\___/ |_|  |_.__/\_,_|\__|  \___/|_|_\____|  |___/_/ \_\_| |___|
//                                                                               
const Base64url = {
    encodeBase64: (input) => {
        let unencoded = input
        const CHUNK_SIZE = 0x8000
        const arr = []
        for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
            // @ts-expect-error
            arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)))
        }
        return btoa(arr.join(''))
    },

    encode: (input) => {
        return Base64url.encodeBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    },

    decodeBase64: (encoded) => {
        const binary = atob(encoded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes
    },

    decode: (input) => {
        let encoded = input
        encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
        try {
            return Base64url.decodeBase64(encoded)
        } catch {
            throw new TypeError('The input to be decoded is not correctly encoded.')
        }
    }
}

//   ___ _    ___ ___ ___  ___   _   ___ ___    ___ _____ _   _ ___ ___ 
//  / __| |  |_ _| _ \ _ )/ _ \ /_\ | _ \   \  / __|_   _| | | | __| __|
// | (__| |__ | ||  _/ _ \ (_) / _ \|   / |) | \__ \ | | | |_| | _|| _| 
//  \___|____|___|_| |___/\___/_/ \_\_|_\___/  |___/ |_|  \___/|_| |_|  
//                                                               
new ClipboardJS('#copy-link-btn', {
    target: function (trigger) {
        //return document.querySelector('#json-code-container textarea');
        updateShareLink();
        return linkTextField.input;
    }
});

//   ___ __  __   _   ___ ___   ___   _____      ___  _ _    ___   _   ___  
//  |_ _|  \/  | /_\ / __| __| |   \ / _ \ \    / / \| | |  / _ \ /_\ |   \ 
//   | || |\/| |/ _ \ (_ | _|  | |) | (_) \ \/\/ /| .` | |_| (_) / _ \| |) |
//  |___|_|  |_/_/ \_\___|___| |___/ \___/ \_/\_/ |_|\_|____\___/_/ \_\___/ 
//
function downloadAsImage() {
    //var dt = canvas.toDataURL('image/png');
    //this.href = dt;
    const imageFileName = "performance_analysis.png";
    if (state.settings.showKnowledge) {
        saveCanvas(imageFileName);
    } else {
        const i = get(width - 800, 0, 800, 800);
        canvasWithoutKnowledge.image(i, 0, 0, 800, 800);
        saveCanvas(canvasWithoutKnowledge, imageFileName);
    }
}
document.getElementById("dl").addEventListener("click", downloadAsImage)
document.getElementById("download-btn").addEventListener("click", downloadAsImage);

//  ___ _  _   _   ___ ___   _    ___ _  _ _  __
// / __| || | /_\ | _ \ __| | |  |_ _| \| | |/ /
// \__ \ __ |/ _ \|   / _|  | |__ | || .` | ' < 
// |___/_||_/_/ \_\_|_\___| |____|___|_|\_|_|\_\
//
function shortShareLink() {
    const settingsArray = new Uint8Array([
        state.values.presence,
        state.values.embodiment,
        state.values.trasparency,
        state.values.freedom,
        state.values.space,
        state.values.mediation,
        state.values.camouflage,
        state.values.body,
        state.values.culturalKnowledge,
        state.values.workbasedKnowledge,
        (state.visualMediaAngle + Math.PI) / (Math.PI * 2),
        state.settings.elasticity,
        0, /* PLACE HOLDER FOR BOOLEAN SETTINGS */
    ].map(f => Math.max(Math.round(f * 255), 1)));

    settingsArray[12] = (
        state.settings.showVisualMedia +
        state.settings.showKnowledge * 2 +
        state.settings.darkMode * 4
    );

    const encoded = Base64url.encode(settingsArray);
    return encoded;
}

function updateShareLink() {
    const shortLink = shortShareLink();
    const url = window.location.href.split('?')[0].replace('#', '')
        //+ '?state=' + str +
        + '?s=' + shortLink +
        (state.settings.title ? '&title=' + encodeURIComponent(state.settings.title) : '');
    linkTextField.foundation.setValue(url);
}

function decodeState() {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    const shortState = params.get('s');
    if (shortState) {
        const stateAsIntArray = Base64url.decode(shortState);
        state.values.presence = stateAsIntArray[0] / 255;
        state.values.embodiment = stateAsIntArray[1] / 255;
        state.values.trasparency = stateAsIntArray[2] / 255;
        state.values.freedom = stateAsIntArray[3] / 255;
        state.values.space = stateAsIntArray[4] / 255;
        state.values.mediation = stateAsIntArray[5] / 255;
        state.values.camouflage = stateAsIntArray[6] / 255;
        state.values.body = stateAsIntArray[7] / 255;
        state.values.culturalKnowledge = stateAsIntArray[8] / 255;
        state.values.workbasedKnowledge = stateAsIntArray[9] / 255;
        state.visualMediaAngle = ((stateAsIntArray[10] / 255) * 2 * Math.PI) - Math.PI;
        state.settings.elasticity = stateAsIntArray[11] / 255;

        const booleanSettings = stateAsIntArray[12];
        //                                                  0b11111111
        state.settings.showVisualMedia = (booleanSettings & 0b00000001) > 0;
        switchControl.selected = state.settings.showVisualMedia;
        state.settings.showKnowledge = (booleanSettings & 0b00000010) > 0;
        kControl.selected = state.settings.showKnowledge;
        state.settings.darkMode = (booleanSettings & 0b00000100) > 0;
        darkControl.selected = state.settings.darkMode;
    }
    
    // ======= LEGACY CODE TO SUPPORT OLD LINKS STILL USING OLD INEFFICIENT BAD NOT GOOD STATE ENCODING ====
    if (stateParam) {
        let blob = atob(decodeURIComponent(stateParam));
        let ary_buf = new ArrayBuffer(blob.length);
        let dv = new DataView(ary_buf);
        for (let i = 0; i < blob.length; i++) dv.setUint8(i, blob.charCodeAt(i));

        let f32_ary = new Float32Array(ary_buf);
        state.values.presence = f32_ary[0];
        state.values.embodiment = f32_ary[1];
        state.values.trasparency = f32_ary[2];
        state.values.freedom = f32_ary[3];
        state.values.space = f32_ary[4];
        state.values.mediation = f32_ary[5];
        state.values.camouflage = f32_ary[6];
        state.values.body = f32_ary[7];
        state.values.culturalKnowledge = f32_ary[8];
        state.values.workbasedKnowledge = f32_ary[9];

        if (f32_ary.length > 10) {
            state.visualMediaAngle = f32_ary[10];
            state.settings.elasticity = f32_ary[11];
            state.settings.showVisualMedia = dv.getUint8(blob.length - 4) > 0;
            switchControl.selected = state.settings.showVisualMedia;
            state.settings.showKnowledge = dv.getUint8(blob.length - 3) > 0;
            kControl.selected = state.settings.showKnowledge;
            state.settings.darkMode = dv.getUint8(blob.length - 2) > 0;
            darkControl.selected = state.settings.darkMode;
        }
    }
    // =================================================================================================

    const title = params.get('title');
    if (title) {
        const decodedTitle = decodeURIComponent(title);
        titleTextField.value = decodedTitle;
        document.querySelector('h1').textContent = decodedTitle;
        state.settings.title = title;
    }
    if (!state.settings.darkMode) {
        document.body.classList.remove('dark');
    }
}
window.addEventListener('DOMContentLoaded', () => {
    decodeState();
});