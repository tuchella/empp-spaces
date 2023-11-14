
const MDCSwitch = mdc.switchControl.MDCSwitch;
const MDCSlider = mdc.slider.MDCSlider;
const MDCDrawer = mdc.drawer.MDCDrawer;
const MDCList = mdc.list.MDCList;
const MDCTextField = mdc.textField.MDCTextField;
//const MDCButton = mdc.button.MDCButton;

/*
new ClipboardJS('#copy-btn', {
    text: function (trigger) {
        //return document.querySelector('#json-code-container textarea');
        return myCodeMirror.getValue();
    }
});*/
new ClipboardJS('#copy-link-btn', {
    target: function (trigger) {
        //return document.querySelector('#json-code-container textarea');
        updateShareLink();
        return linkTextField.input;
    }
});


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


mdc.autoInit();

const linkTextField = new MDCTextField(document.getElementById("link-text-field"));

const DEFAULT_TITLE = document.querySelector('h1').textContent;
const titleTextField = new MDCTextField(document.getElementById("title-input"));
titleTextField.input.addEventListener('input', (e) => {
    const val = titleTextField.value.trim();
    if (val.length < 1) {
        document.querySelector('h1').textContent = DEFAULT_TITLE;
        delete state.settings.title;
    } else {
        console.log('title change', val);
        document.querySelector('h1').textContent = val;
        state.settings.title = val;
    }
})

let elasticityControl;
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const switchControl = new MDCSwitch(document.querySelector('#basic-switch'));
document.querySelector('#basic-switch').addEventListener('click', (e) => {
    state.settings.showVisualMedia = document.querySelector('#basic-switch').ariaChecked == "true";
});
const kControl = new MDCSwitch(document.querySelector('#knowledge-switch'));
document.querySelector('#knowledge-switch').addEventListener('click', (e) => {
    state.settings.showKnowledge = document.querySelector('#knowledge-switch').ariaChecked == "true";
});
const darkControl = new MDCSwitch(document.querySelector('#darkmode-switch'));
document.querySelector('#darkmode-switch').addEventListener('click', (e) => {
    state.settings.darkMode = document.querySelector('#darkmode-switch').ariaChecked == "true";
    if (state.settings.darkMode) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});
//mdc.ripple.MDCRipple.attachTo(document.querySelector('#copy-btn'));
//mdc.ripple.MDCRipple.attachTo(document.querySelector('#paste-btn'));

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

    const encodeBase64 = (input) => {
        let unencoded = input
        const CHUNK_SIZE = 0x8000
        const arr = []
        for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
            // @ts-expect-error
            arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)))
        }
        return btoa(arr.join(''))
    }

    const encode = (input) => {
        return encodeBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    }

    const decodeBase64 = (encoded) => {
        const binary = atob(encoded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes
    }

    const decode = (input) => {
        let encoded = input
        encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
        try {
            return decodeBase64(encoded)
        } catch {
            throw new TypeError('The input to be decoded is not correctly encoded.')
        }
    }

    console.log(settingsArray);
    const encoded = encode(settingsArray);
    console.log(encoded);
    const decoded = decode(encoded);
    console.log(decoded);
    return encoded;
}

function updateShareLink() {
    const shortLink = shortShareLink();
    // this is still a very inefficient encoding but we should be well below the 2048 character limit for URLs still...
    const fary = new Float32Array([
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
        state.visualMediaAngle,
        state.settings.elasticity,
        0, /* PLACE HOLDER FOR BOOLEAN SETTINGS */
    ]);
    let uint = new Uint8Array(fary.buffer);
    uint[uint.length - 4] = state.settings.showVisualMedia;
    uint[uint.length - 3] = state.settings.showKnowledge;
    uint[uint.length - 2] = state.settings.darkMode;
    uint[uint.length - 1] = false;
    let str = btoa(String.fromCharCode.apply(null, uint));
    str = encodeURIComponent(str);

    const url = window.location.href.split('?')[0].replace('#', '')
        //+ '?state=' + str +
        + '?s=' + shortLink +
        (state.settings.title ? '&title=' + encodeURIComponent(state.settings.title) : '');
    linkTextField.foundation.setValue(url);
}

document.body.addEventListener('MDCDrawer:opened', () => {
    const elasticitySlider = document.querySelector('#elasticity-slider');
    if (!elasticityControl) {
        elasticityControl = new MDCSlider(elasticitySlider);
        elasticityControl.foundation.setValue(state.settings.elasticity * 100);
        elasticitySlider.addEventListener('MDCSlider:change', (e) => {
            state.settings.elasticity = e.detail.value / 100;
        });
    }
    updateShareLink();

    /*
    window.myCodeMirror = CodeMirror(document.getElementById("json-code-container"), {
        value: JSON.stringify(state, null, 1),
        mode: "javascript"
    });
    console.log("codeMirror", myCodeMirror);
    */



    //codeBlock.innerHTML = JSON.stringify(state, null, 1);
    //document.querySelector("#paste-output").textContent = 
    //hljs.highlightElement(codeBlock);
});

function decodeState() {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');
    const shortState = params.get('s');
    console.log(params);
    if (shortState) {
        const decodeBase64 = (encoded) => {
            const binary = atob(encoded)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }
            return bytes
        }

        const decode = (input) => {
            let encoded = input
            encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
            try {
                return decodeBase64(encoded)
            } catch {
                throw new TypeError('The input to be decoded is not correctly encoded.')
            }
        }

        const stateAsIntArray = decode(shortState);
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
        console.log(state.visualMediaAngle);
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