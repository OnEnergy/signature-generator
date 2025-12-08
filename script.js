const form = document.getElementById("signature-form");
const preview = document.getElementById("signature-preview");
const copyButton = document.getElementById("copy-html");
const feedback = document.getElementById("copy-feedback");
const phoneError = document.getElementById("phone-error");
const publicBaseUrl = (() => {
    const scriptUrl = document.currentScript ? new URL(document.currentScript.src) : new URL(window.location.href);
    scriptUrl.search = "";
    scriptUrl.hash = "";
    scriptUrl.pathname = scriptUrl.pathname.replace(/[^/]*$/, "");
    const base = new URL("./", scriptUrl.href).href;
    return base.endsWith("/") ? base : `${base}/`;
})();
const logoAssets = {
    yellow: new URL("resources/on-yellow-profile.png", publicBaseUrl).href,
    black: new URL("resources/on-black-profile.png", publicBaseUrl).href
};
const fallbackLogoDataUrls = {
    yellow: buildFallbackLogoDataUrlYellow(),
    black: buildFallbackLogoDataUrlBlack()
};
const logoDataUrls = { yellow: null, black: null };
const logoReady = { yellow: null, black: null };
let validationState = { isPhoneValid: false, hasCustomInfo: false, phoneIsDefault: true };
let phoneTouched = false;

const DEFAULT_PHONE_DIGITS = "5558675309";
const DEFAULT_DIGIT_RANGE = { min: 7, max: 11 };
const REGION_DIGIT_OVERRIDES = {
    us: 10,
    ca: 10,
    pr: 10,
    ag: 10,
    ai: 10,
    bs: 10,
    bb: 10,
    bm: 10,
    dm: 10,
    do: 10,
    gd: 10,
    jm: 10,
    kn: 10,
    lc: 10,
    mf: 10,
    vc: 10,
    sx: 10,
    tt: 10,
    tc: 10,
    vi: 10,
    mx: 10,
    ar: 10,
    bo: 8,
    br: [10, 11],
    cl: 9,
    co: 10,
    cr: 8,
    ec: 9,
    sv: 8,
    fk: [5, 6],
    gf: 9,
    gl: [6, 7],
    gt: 8,
    gy: [7, 8],
    ht: 8,
    hn: 8,
    ni: 8,
    pa: 8,
    py: 9,
    pe: 9,
    sr: [7, 8],
    uy: 8,
    ve: 10
};
const DIGIT_GROUPS = {
    5: [2, 3],
    6: [3, 3],
    7: [3, 4],
    8: [4, 4],
    9: [3, 3, 3],
    10: [3, 3, 4],
    11: [3, 4, 4]
};

const PHONE_REGION_FORMATS = {
    NANP: "($1) $2-$3",
    LATAM: "$1 $2 $3"
};

const phoneRegionsConfig = [
    { value: "us", label: "United States (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ca", label: "Canada (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "mx", label: "Mexico (+52)", code: "+52", format: PHONE_REGION_FORMATS.LATAM },
    { value: "ag", label: "Antigua & Barbuda (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ai", label: "Anguilla (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ar", label: "Argentina (+54)", code: "+54", format: PHONE_REGION_FORMATS.LATAM },
    { value: "aw", label: "Aruba (+297)", code: "+297", format: PHONE_REGION_FORMATS.LATAM },
    { value: "bs", label: "Bahamas (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "bb", label: "Barbados (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "bz", label: "Belize (+501)", code: "+501", format: PHONE_REGION_FORMATS.LATAM },
    { value: "bm", label: "Bermuda (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "bo", label: "Bolivia (+591)", code: "+591", format: PHONE_REGION_FORMATS.LATAM },
    { value: "bq", label: "Bonaire (+599)", code: "+599", format: PHONE_REGION_FORMATS.LATAM },
    { value: "br", label: "Brazil (+55)", code: "+55", format: PHONE_REGION_FORMATS.LATAM },
    { value: "ky", label: "Cayman Islands (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "cl", label: "Chile (+56)", code: "+56", format: PHONE_REGION_FORMATS.LATAM },
    { value: "co", label: "Colombia (+57)", code: "+57", format: PHONE_REGION_FORMATS.LATAM },
    { value: "cr", label: "Costa Rica (+506)", code: "+506", format: PHONE_REGION_FORMATS.LATAM },
    { value: "cu", label: "Cuba (+53)", code: "+53", format: PHONE_REGION_FORMATS.LATAM },
    { value: "cw", label: "Curaçao (+599)", code: "+599", format: PHONE_REGION_FORMATS.LATAM },
    { value: "dm", label: "Dominica (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "do", label: "Dominican Republic (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ec", label: "Ecuador (+593)", code: "+593", format: PHONE_REGION_FORMATS.LATAM },
    { value: "sv", label: "El Salvador (+503)", code: "+503", format: PHONE_REGION_FORMATS.LATAM },
    { value: "fk", label: "Falkland Islands (+500)", code: "+500", format: PHONE_REGION_FORMATS.LATAM },
    { value: "gf", label: "French Guiana (+594)", code: "+594", format: PHONE_REGION_FORMATS.LATAM },
    { value: "gl", label: "Greenland (+299)", code: "+299", format: PHONE_REGION_FORMATS.LATAM },
    { value: "gd", label: "Grenada (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "gp", label: "Guadeloupe (+590)", code: "+590", format: PHONE_REGION_FORMATS.LATAM },
    { value: "gt", label: "Guatemala (+502)", code: "+502", format: PHONE_REGION_FORMATS.LATAM },
    { value: "gy", label: "Guyana (+592)", code: "+592", format: PHONE_REGION_FORMATS.LATAM },
    { value: "ht", label: "Haiti (+509)", code: "+509", format: PHONE_REGION_FORMATS.LATAM },
    { value: "hn", label: "Honduras (+504)", code: "+504", format: PHONE_REGION_FORMATS.LATAM },
    { value: "jm", label: "Jamaica (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ms", label: "Montserrat (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "ni", label: "Nicaragua (+505)", code: "+505", format: PHONE_REGION_FORMATS.LATAM },
    { value: "pa", label: "Panama (+507)", code: "+507", format: PHONE_REGION_FORMATS.LATAM },
    { value: "py", label: "Paraguay (+595)", code: "+595", format: PHONE_REGION_FORMATS.LATAM },
    { value: "pe", label: "Peru (+51)", code: "+51", format: PHONE_REGION_FORMATS.LATAM },
    { value: "pr", label: "Puerto Rico (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "kn", label: "Saint Kitts & Nevis (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "lc", label: "Saint Lucia (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "mf", label: "Saint Martin (+590)", code: "+590", format: PHONE_REGION_FORMATS.LATAM },
    { value: "vc", label: "Saint Vincent & the Grenadines (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "sx", label: "Sint Maarten (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "sr", label: "Suriname (+597)", code: "+597", format: PHONE_REGION_FORMATS.LATAM },
    { value: "tt", label: "Trinidad & Tobago (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "tc", label: "Turks & Caicos Islands (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "vi", label: "U.S. Virgin Islands (+1)", code: "+1", format: PHONE_REGION_FORMATS.NANP },
    { value: "uy", label: "Uruguay (+598)", code: "+598", format: PHONE_REGION_FORMATS.LATAM },
    { value: "ve", label: "Venezuela (+58)", code: "+58", format: PHONE_REGION_FORMATS.LATAM }
];

const phoneRegions = phoneRegionsConfig.reduce((map, region) => {
    map[region.value] = {
        code: region.code,
        format: region.format,
        digits: resolveRegionDigits(region),
        label: region.label
    };
    return map;
}, {});

function normalizeDigitRange(value) {
    if (Array.isArray(value) && value.length) {
        const min = Math.max(1, Number(value[0]) || DEFAULT_DIGIT_RANGE.min);
        const max = Math.max(min, Number(value[1]) || min);
        return { min, max };
    }
    if (typeof value === "object" && value !== null && "min" in value) {
        const min = Math.max(1, Number(value.min) || DEFAULT_DIGIT_RANGE.min);
        const max = Math.max(min, Number(value.max) || min);
        return { min, max };
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        const normalized = Math.round(parsed);
        return { min: normalized, max: normalized };
    }
    return { ...DEFAULT_DIGIT_RANGE };
}

function resolveRegionDigits(region) {
    const override = REGION_DIGIT_OVERRIDES[region.value];
    if (typeof override !== "undefined") {
        return normalizeDigitRange(override);
    }
    if (region.code === "+1") {
        return normalizeDigitRange(10);
    }
    return normalizeDigitRange(DEFAULT_DIGIT_RANGE);
}

function getRegionDigits(regionKey) {
    const region = phoneRegions[regionKey] || phoneRegions.us;
    return region.digits || normalizeDigitRange(DEFAULT_DIGIT_RANGE);
}

function formatExpectedLengthText(digitsRange) {
    return digitsRange.min === digitsRange.max
        ? `${digitsRange.min}`
        : `${digitsRange.min}-${digitsRange.max}`;
}

function populateRegionOptions() {
    inputs.phoneRegion.innerHTML = "";
    phoneRegionsConfig.forEach(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        inputs.phoneRegion.append(option);
    });
}

const defaultValues = {
    name: "Sterling Archer",
    title: "World's Greatest Secret Agent",
    phone: formatInternationalNumber(phoneRegions.us, DEFAULT_PHONE_DIGITS),
    email: "sterling.archer@on.energy"
};

const inputs = {
    name: document.getElementById("name"),
    title: document.getElementById("title"),
    phoneRegion: document.getElementById("phone-region"),
    phoneNumber: document.getElementById("phone-number"),
    email: document.getElementById("email"),
    logoStyle: document.getElementById("logo-style")
};

populateRegionOptions();
inputs.phoneRegion.value = "us";
inputs.phoneNumber.value = "";
applyPhoneConstraints(inputs.phoneRegion.value);
inputs.phoneNumber.addEventListener("input", () => {
    phoneTouched = true;
    const digitsRange = getRegionDigits(inputs.phoneRegion.value);
    const digitsOnly = inputs.phoneNumber.value.replace(/\D/g, "").slice(0, digitsRange.max);
    if (inputs.phoneNumber.value !== digitsOnly) {
        inputs.phoneNumber.value = digitsOnly;
    }
    renderSignature();
});
inputs.phoneRegion.addEventListener("change", () => {
    applyPhoneConstraints(inputs.phoneRegion.value);
    const digitsRange = getRegionDigits(inputs.phoneRegion.value);
    const digitsOnly = inputs.phoneNumber.value.replace(/\D/g, "").slice(0, digitsRange.max);
    if (inputs.phoneNumber.value !== digitsOnly) {
        inputs.phoneNumber.value = digitsOnly;
    }
    renderSignature();
});
inputs.email.addEventListener("input", () => {
    const normalized = inputs.email.value.toLowerCase();
    if (inputs.email.value !== normalized) {
        inputs.email.value = normalized;
    }
});
inputs.logoStyle.addEventListener("change", renderSignature);

function applyPhoneConstraints(regionKey) {
    const digitsRange = getRegionDigits(regionKey);
    const pattern = digitsRange.min === digitsRange.max
        ? `\\d{${digitsRange.min}}`
        : `\\d{${digitsRange.min},${digitsRange.max}}`;

    inputs.phoneNumber.maxLength = String(digitsRange.max);
    inputs.phoneNumber.pattern = pattern;
    const hint = digitsRange.min === digitsRange.max
        ? `${digitsRange.min}-digit phone number`
        : `${digitsRange.min} to ${digitsRange.max}-digit phone number`;
    inputs.phoneNumber.title = `Enter a ${hint}.`;
}

function getCurrentLogoKey() {
    return inputs.logoStyle && inputs.logoStyle.checked ? "black" : "yellow";
}

function getLogoSrc(logoKey = "yellow") {
    const key = logoKey === "black" ? "black" : "yellow";
    return logoDataUrls[key] || logoAssets[key] || fallbackLogoDataUrls[key];
}

// Escape HTML entities so users cannot inject markup into the signature
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getSignatureData() {
    const regionKey = inputs.phoneRegion.value;
    const digitsRange = getRegionDigits(regionKey);
    const cleanNumber = inputs.phoneNumber.value.replace(/\D/g, "").slice(0, digitsRange.max);
    const region = phoneRegions[regionKey] || phoneRegions.us;
    const isPhoneValid = cleanNumber.length >= digitsRange.min && cleanNumber.length <= digitsRange.max;
    const phoneIsDefault = cleanNumber === DEFAULT_PHONE_DIGITS;
    const phoneValue = isPhoneValid
        ? formatInternationalNumber(region, cleanNumber)
        : formatPartialNumber(region, cleanNumber);

    const nameValue = inputs.name.value.trim();
    const titleValue = inputs.title.value.trim();
    const emailValue = (inputs.email.value.trim() || "").toLowerCase();
    const hasCustomInfo = Boolean(nameValue && titleValue && emailValue)
        && nameValue !== defaultValues.name
        && titleValue !== defaultValues.title
        && emailValue !== defaultValues.email;

    if (isPhoneValid) {
        inputs.phoneNumber.removeAttribute("aria-invalid");
        phoneError.textContent = "";
    } else if (phoneTouched) {
        inputs.phoneNumber.setAttribute("aria-invalid", "true");
        const expectedLengthText = formatExpectedLengthText(digitsRange);
        phoneError.textContent = cleanNumber.length === 0
            ? "Phone number is required."
            : `Enter a ${expectedLengthText}-digit phone number.`;
    } else {
        inputs.phoneNumber.removeAttribute("aria-invalid");
        phoneError.textContent = "";
    }

    validationState = { isPhoneValid, hasCustomInfo, phoneIsDefault };
    toggleCopyState(isPhoneValid && hasCustomInfo && !phoneIsDefault, validationState);

    return {
        name: nameValue || defaultValues.name,
        title: titleValue || defaultValues.title,
        phone: phoneValue || defaultValues.phone,
        email: emailValue || defaultValues.email,
        logoKey: getCurrentLogoKey()
    };
}

function formatInternationalNumber(region, digits) {
    if (!digits) {
        return `${region.code}`.trim();
    }
    const grouped = formatDigitsWithGrouping(region, digits);
    return `${region.code} ${grouped}`.trim();
}

function formatPartialNumber(region, digits) {
    if (!digits) {
        return "";
    }
    const grouped = formatDigitsWithGrouping(region, digits);
    return `${region.code} ${grouped}`.trim();
}

function formatDigitsWithGrouping(region, digits) {
    const digitsLength = digits.length;
    if (region.format === PHONE_REGION_FORMATS.NANP && digitsLength === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    const defaultGroups = region.digits ? DIGIT_GROUPS[region.digits.max] : undefined;
    const groupPlan = region.groups
        || DIGIT_GROUPS[digitsLength]
        || defaultGroups
        || [digitsLength];

    const parts = [];
    let cursor = 0;
    for (const size of groupPlan) {
        if (cursor >= digitsLength) {
            break;
        }
        const next = Math.min(cursor + size, digitsLength);
        parts.push(digits.slice(cursor, next));
        cursor = next;
    }
    return parts.join(" ");
}

function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return window.btoa(binary);
}

function buildFallbackLogoDataUrlYellow() {
    return ("data:image/png;base64," +
    "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" +
    "IAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEA" +
    "ACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELAB" +
    "AAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABgAQArJ6ADQAAABkI" +
    "2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZ" +
    "CNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAA" +
    "GQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAA" +
    "ABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0A" +
    "AAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYAN" +
    "AAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGA" +
    "DQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCB" +
    "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"
    );
}



function toggleCopyState(isReady, state = validationState) {
    copyButton.disabled = !isReady;
    if (isReady) {
        copyButton.removeAttribute("aria-disabled");
        copyButton.removeAttribute("title");
        return;
    }

    copyButton.setAttribute("aria-disabled", "true");
    let reason;
    if (!state.hasCustomInfo) {
        reason = "Replace the sample name, title, and email with your own details.";
    } else if (!state.isPhoneValid) {
        reason = "Add a 10-digit phone number.";
    } else if (state.phoneIsDefault) {
        reason = "Update the phone number so it is no longer the placeholder.";
    } else {
        reason = "Fill in all required details.";
    }
    copyButton.title = reason;
}

function buildSignatureHtml(data) {
    const logoSrc = getLogoSrc(data.logoKey);
    const logoBackground = data.logoKey === "black" ? "#000000" : "#ffeb00";
    return `
<table class="signature-export" cellpadding="0" cellspacing="0" role="presentation" style="font-family: 'Univers Next Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#000000; background:#ffffff; max-width:460px;">
    <tr>
        <td style="padding:0;">
            <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%; font-size:14px; line-height:1.6;">
                <tr>
                    <td style="vertical-align:top; padding:0 16px 0 0; width:120px;">
                        <img src="${logoSrc}" alt="ON.energy" width="96" style="display:block; border-radius:16px; background:${logoBackground};">
                    </td>
                    <td style="vertical-align:top; padding:0;">
                        <div style="font-size:18px; font-weight:600; padding-bottom:4px;">${escapeHtml(data.name)}</div>
                        <div style="color:#8f8f8f; font-size:14px; padding-bottom:12px;">${escapeHtml(data.title)}</div>
                        <div style="padding-bottom:4px;"><span style="font-weight:600;">P:</span> ${escapeHtml(data.phone)}</div>
                        <div><span style="font-weight:600;">E:</span> <a href="mailto:${escapeHtml(data.email)}" style="color:#000000; text-decoration:none;">${escapeHtml(data.email)}</a></div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;
}

function renderSignature() {
    const data = getSignatureData();
    const html = buildSignatureHtml(data);
    preview.innerHTML = html;
    return html;
}

function clearFeedbackLater() {
    setTimeout(() => {
        feedback.textContent = "";
        feedback.style.color = "";
    }, 4000);
}

function loadLogoViaImage(assetUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        try {
            const logoUrl = new URL(assetUrl, publicBaseUrl);
            const isRemote = logoUrl.protocol === "http:" || logoUrl.protocol === "https:";
            if (isRemote && logoUrl.origin !== window.location.origin) {
                image.crossOrigin = "anonymous";
            }
        } catch (error) {
            // Ignore URL parsing issues and fall back to default image settings.
        }
        image.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const context = canvas.getContext("2d");
                if (!context) {
                    reject(new Error("Canvas context unavailable"));
                    return;
                }
                context.drawImage(image, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } catch (error) {
                reject(error);
            }
        };
        image.onerror = () => reject(new Error("Logo image load failed"));
        image.src = assetUrl;
    });
}

function preloadLogo(logoKey = "yellow") {
    const key = logoKey === "black" ? "black" : "yellow";
    if (logoReady[key]) {
        return logoReady[key];
    }

    if (logoDataUrls[key]) {
        logoReady[key] = Promise.resolve(logoDataUrls[key]);
        return logoReady[key];
    }

    const logoAssetUrl = logoAssets[key] || logoAssets.yellow;
    const fallbackLogoDataUrl = fallbackLogoDataUrls[key] || fallbackLogoDataUrls.yellow;
    let fetchPromise = Promise.reject();
    try {
        const logoUrl = new URL(logoAssetUrl, publicBaseUrl);
        const isHttp = logoUrl.protocol === "http:" || logoUrl.protocol === "https:";
        if (isHttp && window.fetch && window.FileReader) {
            const mode = logoUrl.origin === window.location.origin ? "same-origin" : "cors";
            fetchPromise = fetch(logoUrl.href, { mode })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to load logo");
                    }
                    return response.blob();
                })
                .then(blob => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error("Failed to read logo"));
                    reader.readAsDataURL(blob);
                }));
        } else if (logoUrl.protocol === "file:" && typeof window.XMLHttpRequest !== "undefined") {
            fetchPromise = new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", logoUrl.href, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                    const status = xhr.status;
                    if (status && status !== 200) {
                        reject(new Error("Failed to load logo"));
                        return;
                    }
                    try {
                        const base64 = arrayBufferToBase64(xhr.response);
                        resolve(`data:image/png;base64,${base64}`);
                    } catch (conversionError) {
                        reject(conversionError);
                    }
                };
                xhr.onerror = () => reject(new Error("Failed to load logo"));
                xhr.send();
            });
        }
    } catch (error) {
        fetchPromise = Promise.reject(error);
    }

    logoReady[key] = fetchPromise
        .catch(() => loadLogoViaImage(logoAssetUrl))
        .then(dataUrl => {
            logoDataUrls[key] = dataUrl || fallbackLogoDataUrl;
            renderSignature();
            return logoDataUrls[key];
        })
        .catch(() => {
            logoDataUrls[key] = fallbackLogoDataUrl;
            renderSignature();
            return logoDataUrls[key];
        });

    return logoReady[key];
}

async function handleCopy() {
    const { hasCustomInfo, isPhoneValid, phoneIsDefault } = validationState;

    if (!hasCustomInfo || !isPhoneValid || phoneIsDefault) {
        let message;
        if (!hasCustomInfo) {
            message = "Replace the sample name, title, and email with your own details before copying.";
        } else if (!isPhoneValid) {
            message = phoneError.textContent || "Add a complete 10-digit phone number before copying.";
        } else {
            message = "Update the phone number so it is no longer the placeholder before copying.";
        }
        feedback.textContent = message;
        feedback.style.color = "#c62020";
        clearFeedbackLater();
        return;
    }

    const logoKey = getCurrentLogoKey();
    await preloadLogo(logoKey).catch(() => null);
    const html = renderSignature();
    const signatureNode = preview.querySelector(".signature-export");
    let copySucceeded = false;

    if (signatureNode && typeof document.execCommand === "function") {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(signatureNode);
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            copySucceeded = document.execCommand("copy");
        } catch (error) {
            copySucceeded = false;
        }
        selection.removeAllRanges();
    }

    if (!copySucceeded && navigator.clipboard && window.ClipboardItem) {
        try {
            const blob = new Blob([html], { type: "text/html" });
            const clipboardItem = new ClipboardItem({
                "text/html": blob,
                "text/plain": new Blob([html], { type: "text/plain" })
            });
            await navigator.clipboard.write([clipboardItem]);
            copySucceeded = true;
        } catch (error) {
            copySucceeded = false;
        }
    }

    if (!copySucceeded && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(html);
            copySucceeded = true;
        } catch (error) {
            copySucceeded = false;
        }
    }

    if (copySucceeded) {
        feedback.style.color = "";
        feedback.textContent = "Signature copied to clipboard.";
        clearFeedbackLater();
    } else {
        feedback.textContent = "Copy failed. Please highlight the preview and copy manually.";
        feedback.style.color = "#c62020";
    }
}

form.addEventListener("input", renderSignature);
copyButton.addEventListener("click", handleCopy);

// Initialize the preview with defaults
renderSignature();
preloadLogo();

function buildFallbackLogoDataUrlBlack() {
    return "data:image/png;base64,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AABYu3EVbAAAAMjALuIAAACwdmMbev/x5wQAAACsiRZxAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyEDABgAAgAwEbAAAAMhAwAYAAIAMBGwAAADIQMAGAACADARsAAAAyOCWBLBC43dvTBPbb0njd21MY2Mb09atG9JY76Iesxf+nC70rtnZT9PMb/vX9LufJGhNjvFu/vdp+r2rc//d92n44rPc8cDm3ueXPvdZGu+AnARs4KZiUrL7kc1p187NaeLeW4Tphk29eWUuIJw+8/HcX0Ntdnz7S+nBB26Z+7me490gZJ949XKaeuuTNHP+aiKvtX6WMcad6302p3rjncANLFeMNH9OADeIt/v7HuuH6picwI2iynP0pYvp9NkrwgFFi/HuwA9vTbuvvUQchQhzEbYnexerN/gs9+3ZMvdyOJcY7448/5GXIcBNCdjA5wwmJwf336ZSzbJFKDjywkUTT4rSxfFuEOQE7ZUZ5mdpvAOWImADnznw1JZ0+LnbBWtW7XAvGMTEE7qu6+OdoL08o3pJEi3+0cFjvANuJGADafzuTemVn96hFZwsIhg89N0PVXfopBjvXn/tK2li+6ZUAtXSxUU7f3yWsQHdqBjvgBs5pgsaF6H67V9tFa7JJia77//zWDr07G0JuiSq1jHelRKuw749t6Y3fvZVY/QNBp/lKMN1GIx3B3v/ewBCPGEOJ6BJMUH5L5NfSVu2aAknvwgE0b75i1/abZzRO/Ts7enH/+ftRY530focQTvErtate/HHt8+193fJw3+7ee6nzwcQsKFRg8kmrKdvfuOWuZbcONYLRuWVn345HdxffoVxUMVuOcTFZ/nk/97NzzI+H+MdIGBDgyJcH35O+y7DEeskTToZlah2djWQrUbLITvC9b7Hb01dZrwDBGxoTLSFq1wzbDHp1C7OsMXLxGf+j/peJkbIvnDhz+nX/9ROyC7pRcngLHXt4tAmARsaEg/9U699JcEoRLt4a6GA0an9ZWKs+T199kr613/7NNWuxBclLb4EAfoc0wWNiJa12Il21Duu0rY4OzaOtJl+16ST9RPjXeww3dUzrnOJI6Lu/9aF3veq3pAdn2Xs0l2iGO/u/+sLjvCCxphpQyPiyCThmlGLwBPrKGE9xcvE2sN1iDH9UOX7acRnWar+eHdHAtpitg0NmLh302dHvMCoxf1okz3WS4x1Lb1MjPOXaz0jO1rDS/8s47NxRja0RYs4NOD932xTvaZTonXynq/PVt3ayvDFRnrRGt7aeDf15pW5pRc1qWlZk/EO2mLGDZVrrZpDGaJ18uB+XRXkte+xzU2Od1Elra2KXdOyJuMdtEUFGyr3xs+29iZetyToGlUdcmu5W6emKnaNm3Ia76AdylpQsTiWS7imq6Kqs+9xVR3yaL1bp6Yq9o4Hbqnus4zxzvMY2iBgQ8UO2FiFjtv1SJ2bMzF8e/cY72oJcAeeqnMTRM9kaIMWcaiYzc0owbY7P9A2yZpEdfCD3/1Fal20IW+78/epZCWfe70cxjuon5k3VCraw4VrSqBNnLWq9Ziqleq3IZf9ZxHt4TXb/b3NCaib2TdUylovSnHf9k0J1kLAvm73zrID3K7C//ffzITxDqonYEOlHnzAhJMyCEes1X3bvVAc2Lvn1l4lu9zp3fhddQfQB413UD0BGypV8gSLtsRSBvcrazFxr6rgQLSJl9yGXPtnaekW1M+3HCplwklJxurd04h1FoEyLq7b+1iZATv2Dqld3Kvjd5t+Q818w6FSJpyUpPa2UNZP7DrN58WyixK7Qlp5bunYgbr5hkOFtKBRGiGJ1fIycWEH99udv6vcs1A3s3AAgMqUuNGlThagBgI2AEBlok28tB36Zy98mlqggg11E7ChQmNjvtoArdvx7bI2DZu98OfUAs9oqJtvOFTI23FKY98AVktb8eIOPHVbKsnM+aupBZ7RUDczGqiQCSeluVvAZpUcebS4CHIltYm3UsH2QhHq5hsOFTLhpDQmnKzWfdu9UFzK3j3l7CYeAXvmfP3rsI13UDffcKhQibvH0raJe8taK0p36NhZ2u6dm4s6d3n6vU9S7e4z3kHVBGyo0MS9JpyUJVpZhWxWqn/fGO+WEn9Gu7+3OZXi3FtXUu2igq3TDOrl2w2ViZBiAxVKVNqRQoyee2Z59j5WTsCefreNjc527yyndR9YGQEbKrOvoPV2MN+uR4QlVmbXznKC4yjFi4hS2sSn3rzSxGZnxjuol4ANlTHhpFQlhQC6YbfxbtkO7i/n5eux45dS7frdZsY7qJFvNlQkAordSSlZSSGA0YpuHcthlq+kzS+PvnQx1S7uXeMd1MlMHCpS0nEssJADT92mqsOyHHru9sTyxQvYUtasR4v41Jv17ya+d8+WBNTHLAYqMX73JuuvKZ6qDssRY51unZXb8e1yduo/8sJHqXZxD3tuQ32it6r+nSSgAa+8/GUPaqoQ1at7vj7b+/lpgoW8/5ttAvYqxHdr252/T6U4+pM70oGn6q7yzvz203T/ty4Y76Aink5QgQjWwjW1iCr2oeduS7CQCFzC9erEd6uko80OP/9R9TuKx72sawfqooINhYvW8Dd+9lUTTqrz0Hc/nDuyBwZivHv7V1ttbrYGk69eTk88+cdUitgp/vXXvpJqd/9fX0jT79a/7hxaYEYOhTv07G3CNVWKZQ82PGO+CFrC9dpEYC3pe3XqzMdNHNvVv7eNd1AD32Qo2KFnb9caTrXixdHrr305QYjxbmL7psTaxAuK3d8r6/zwaBWvvbob492LP7EzPtQgnlSHE1CcqEK8fOyOBDWLluCxsY3pF7/UKt6yCNeHrcvPJkL2iVcvp1Jc6v1PjTFg9/fqPvt84t7+Lu/n3tIqDiUTsKFA8RCOdrItW7RKUr9vfsOks2V799w6t5s0+cSLq2PHL/eCaznb8MRmZ6fPfFx9yB5sQme8g3IJ2FCYePj+/PWvWodIU+K+V8luT+wY/vIxywTWw+VeuJ56s6wQJ2QDJbAGGwoSk83YMVy4pkUHr93/UX2jftEWrnK9fh58oJzjuubrnxs9W1SL+2ocfu52G59BoRzTBQWIyt2hZ7akg/utQYSYYMcxQ47wqlO8QHnlp3cUdV5zqUo/Ci9CaJykUbMY7+Jzmjl/NQFl0CIOHTdoCX/4b8va9RXWS3RwxO758eLpv/2PT+faRqlDbN4Y491f/QddCsNw/rdXi2sTny9eDkQlO17K1HrPxHgX3Tvhnfc+LWrdPLRKBRs6KiYML/749rkJJ7CwqO4cef6jNFl5u2jt4kViVCJVrYcrXk5tu/P3qQbx0u1Qr6Idx13VyngHZRCwoWNighm75jrfGpYvJp5HX7qYTp+9opWyIIL16JXeJn6jeHbu3bOld0/dkmo1CNpTb31ivIMOErChA6LVdd9jm9OuXrXaRBPWZtA2avLZTeN3b0x7H7t1bqwz3o1eVENjT4PaRCW7/8K67rB96szHczurG++gOwRsGLKYXMauoBPbb0n33bsp7XjgS2ni3nLXjs2c/zRRp7GxDcXvWB+Vnul3P0nvvHd17me0xPav6/ete3j9DMa7HQ/EeHfL3HgXv1aquXtn9vq0qeTfy0D8nu75+uznvhM1irA9sX3T3PKru+/q35cxvs0f40r/PKffvdob864a72DEBGzIJB7MOx7YPBea44EdAfrGcFL6xDIqg+d611xoee8TD+pGxH07ftemucnpg9eqjrUdFRf3d0xI496Oe3z62gSVhd1svCv95Uz/frjaqwxe/my8i2B944Z6cYzYgWsbUJXsiR/+KU2evJTobyo20XsZNBjv4q9rW9d943in+g15CdiwBhE0oq179yObq6hk3CgewtFqGy1ojkRivrj3Y61jTEBr3VQoJp9x3x954aLJZ7o+3s3t4F7ZC5awmvEu/kzibPbSxe831mKzsOgyO/jUbdWPd3HvHzt+yXgHayRgwwrFeukDP7w17Xt8S7UP2phoxkM2No1yBBI308LuvYN13a3t3jsY7w7uv63KUB3WOt598Lu/qOLPZtudH1TfJp5DK+NdvFj0Yh1WR8CGZTLRhKW1ckxObAhV+8TTeLd8h3v3fOyEXrojL3yUDj9/MbE8rQTtWD6gog0rI2DDMkQb4Csvf7nqB2m0hkVwEKxZiwhjEThqWJe6lKhk19o6vnvn5vTiT+6oeryLYH34+Y+yjHfx5/T+b7al0mkTX7mWxrunf/SRDgdYJgEblhBVnEPPbJmr4tQqJpgRFKKKA7m08FKqtmp2jHcvvnB72vf4ralWMd49/Uxs6JW31f+Nn22t4iio2s7EHpZWxru4P1Sz4ebqHQlgjeIoj7d/tbXqcD33wPzOBeGa7OaqYb17K+6xWsVkOja4qqE9eDDe1Ryu4168/1uz2cN1OH22jrX5NZ8XvZ5aGe/e/+exdLDyaj3koIINC4hjOV5/7Sv1v42ufELA6EULZYTQ+E7VLNqNoxOkRPHZxGdU61rrEMeuPfr9D9dtvIs/u2gTL/3PMCr82+78fWJ14vN//bWvVv+iouTxDoZhU+86nIDPDCabX/tL4RrW6lKvsPd3//lyb8JZ51F2A9EiGs69VdbZ2Xv33Jr+y+RXqg/XMd7967+vXz0h7vOH/6b8e3zLlg1z97Bnw+rEfRCnDRjvoG0CNswTbZL/3/+7terJpnDNKJw+83EvgHyp6hdXpU0642Vi7eE6xrnvPPrhuobrgfO9/1+xs3QN4vvK6hnvoG1axOGaCNdRua65LTza/2INonDNKMytWf751qq/Y+HpH/0pHT1+KXVZC+PdsF8m1tQmfs/XZ+0YvUatjHf7nvzjXNUeuM4mZ3BN7ZPNMHeskHDNiAx23a5dnI3b5TXnsVt4C+NdvOgY5ngXwbSGoBEvCHZ/b3NibVoZ747GkX53b0rAdQI29Bx69vbqJ5txjqXdwhm12G239s1x+hsdRet1N8eUOHqw9vEuzrk+NYI251OVtFbvfUzAziHGu2Md72ZZqxjvXvnpHQm4Tos4zYs3r3H0RM2su6ZLYkL29n8da6Bj5KN0+PluvUzYvXPzXPiv2eA4rqgoj8L7/7ytig2utt35gTbxDFoZ70pYGgPDooJN86JVsnbxBl24pisi+LTQOnngqds61zr54k/qrzQdef6jkYXrcOLv61iPenB/vWeiD1Mr410sjelq1w4Mm28CTYsdX2t/qxzBWms4XROtk1Nv1r37bFSuDj17W+qKVsa7yRGvg548WUcV78EHvpTIo5XxzksZ6BOwaVq8ca1dVHOgi6KFunYRartS1THeDUeE/BrCVBzDNDiKibVrYbyLrh1VbBCwaVisRay9mhOtaafOXEnQRVHVGWUr77B0oaqjej1cp8/W0Sa+49vd3Q2/NC2Md6rY0Cdg06y9e+p/CMSOtjapoctq32E3RFVn1Pbu2ZJqFwGmKyZPXq4iTHXh3q2J8Q7aIGDTpNh4KCrYtavhTFbqVst61aVEVWeUrbYx3rVQiexSeIlwPf3u1VS6Ud+7tTHeQRsEbJq044H6J5sxwetSRQcWEm29M+fr77IY5Qu93Tvrn+zGfTT9brfWPdey5raFbq9haWW8s7SA1gnYNOnBBt6udm2yCYs5ffbjVLtdIwzYux6pPyB18WViLWtu4+WQjavyOfdW/S++7UBP64yYNGlie/1vV8+9JWBThhpaaW8mNhgbVUiZuLdbZ3Gvh3fe6+Y9VMMynWj53f29+pdUDcv0e/U/m6NF3EsZWubupzkxWWhhwqmCTSlamHCGUbRNTtx7y9yYV7uujnex0WQN9j4mYOdS+3nYA+N3ixi0y91Pc2LC2YJY6wUlmDlffwU7xGZjQ///WfnRXANd7YKINvEaOjRUJPOZnW3j2dzKXAsWYrSkOS1Uc0ILG6lQh1in2sJ52KMIu61Ukbp8HGEteww43ziPVl5+t/JyDxbi7qc5JpzQPbOz9QfsrSN4uddC1bHrgeXoSxdTDWxclU8LL8BbKWbAQgRsmqPNDWiFKtLo9Y9MLH/dbbSJO9+Y5doqYNMwT14AgHV0+mz5u4mHUZ7nDlAKARsAYB1NnrxcxT4De/dYhw1wMwI2AMA66reJX0mli3W12sQBliZgAwCss2PHL6UaqGIDLE3ABgBYZ1HBrqFNPNZh2ywUYHFGSACAITjxavmbnUWb+L7HVbEBFiNgAwAMwakzH6ca7HrEOmyAxQjYAABDEG3itZyJrU0cYGFGRwCAITn3Vvm7iYeD+7WJAyxEwAYAGJKjL11MNXjwAW3iAAsRsAEAhqR/JnYdbeLOxAb4IgEbAGCITp8tfzfxEEd2AfB5AjYAwBBNnrxcxZnYe/dYhw1wIwEbAGCIIlyfruDIrjgTW5s4wOcJ2AAAQzb5ah1t4qrYAJ8nYAMADFmciV1Dm3isw3YmNsB1RkQAgBE4dvxSKl20ie97XBUbYEDABgAYgahi12DXI9ZhAwwI2AAAIxABu5YzsbWJA/QZDQEARuTcW3VUsQ/u1yYOEARsAIAROfrSxVSDBx/QJg4QBGwAgBGJncRraRN3JjaAgA0AMFInKjkTO47sAmidgA0AMEKnzlyu4kzsvXuswwYQsAEARijCdQ1V7DgTW5s40DoBGwBgxE6d+TjVQBUbaJ2ADQAwYnEmdg1t4rEO25nYQMuMgAAAHXDs+KVUumgT3/e4KjbQLgEbAKADoopdg12PWIcNtEvABgDogAjYtZyJrU0caJXRDwCgI06freNM7IP7tYkDbRKwAQA6YvJkHQH7wQe0iQNtErABADoidhKvpU3cmdhAiwRsAIAOOXb8YqpBHNkF0BoBGwCgQ2o5E3vvHuuwgfYI2AAAHRLh+sSr5a/FjjOxtYkDrRGwAQA65tSZj1MNVLGB1gjYAAAdU0ubeKzDdiY20BIjHgBABx07fimVLtrE9z2uig20Q8AGAOigyZPlB+yw6xHrsIF2CNgAAB0089tPqzkTW5s40AqjHQBAR50+W/5u4uHgfm3iQBsEbACAjpo8WUfAfvABbeJAGwRsAICOip3Ea2kTdyY20AIBG4CRi7WmwMKOvPBRqkEc2QVQOwEbAKDDpt/9pIozsffusQ4bqJ+ADQDQYRGuT7xa/lrsOBNbmzhQOwEbAKDjTp35ONVAFRuonYANANBxU29eSTPny9+rINZhOxMbqJkRDgCgACf+vo428X2Pq2ID9RKwAQAKMHnyUqrBrkeswwbqJWADABQgjrOr5UxsbeJArYxuAACFOH22/DbxcHC/NnGgTgI2AEAhJk9eruJM7Acf0CYO1EnABgAoRITr6XevptJFm7gzsYEaCdgAAAU58sJHqQZxZBdAbQRsAICCxJnYNbSJ791jHTZQHwEbAKAwJ16t40xsbeJAbQRsAIDCnDrzcaqBKjZQGwEbAKAw0SY+c/7TVLpYh+1MbKAmRjQAgAKd+Ps62sT3Pa6KDdRDwAYAKNDRly6mGux6xDpsoB4CNgBAgWIn8ak3P0mli43OtIkDtTCaAQAU6vTZ8tvEw8H92sSBOgjYAACFmjx5uYozsXftFLCBOgjYAACF6reJX0mlm9i+yZnYQBUEbACAgh07finVII7sAiidgA0AULCoYNfQJr53jzZxoHwCNgBA4U68WseZ2NrEgdIJ2AAAhTt15uNUgwNPbUkAJROwAQAKF23izsQGGD0jGABABc69Vf5u4tEmvu9xa7GBcgnYAAAVOPrSxVSDXY9Yhw2US8AGAKhA/0xsbeJdV8OO78DiBGwAgEqcPlv+buLh4P5628QFbKibgA0AUInJk5erCHC7dlqHDZRJwAYAqESE69MVHNk1sX2TM7GBIgnYAAAVmXy1jjbx3Ts3J4DSCNgAABWJM7FraBPfu0ebOFAeARsAoDLHjl9KpYszsbWJA6URsAEAKhNV7BoceGpLAiiJgA0AUJkI2M7EBhg+IxYAQIXOvVV+FTvaxPc9bi020F0CNgBQrAhcLM/kyfIDdtj1iHXYQHcJ2ABAsQTs5YudxLWJA6wvoxMAQCOOHb+YanBwvzZxoJsEbACARtRyJvaunQI20E0CNgBAIyJcn3i1/LXYE9s3ORMb6CQBGwCgIafOfJxqsHvn5gTQNQI2AEBDamkT37tHmzjQPQI2AEBjjh2/lEoXO8hrEwe6RsAGAGjMqX+o40zsA09tSQBdImADADRm+r2rzsQGWAdGJACABp0+W34VO9rE9z1uLTbQHQI2AECDJk/W0Sa+6xHrsIHuELABABoUO4lrEwfIy2gEANCoIy98lGpwcL82caAbBGwAgEZNv/tJFWdi79opYAPdIGADADQqwvWJV8tfiz2xfZMzsYFOELABABp26szHqQa7d25OAKMmYAMANGzqzStVtInv3aNNHBg9ARsAoHHHjl9KpYszsbWJA6MmYEOlHFkCwHJNniw/YIcDT21JAKNkBk5zZi98mlowNpaAxs38to3xjrWLe8WZ2ORy3thDw4xANGd2NgEdE62dtRvFhLOZF4oCVRanz5a/m3iMJfse7/Za7PG76r9fa1jTD6vliURzpt8r/w39ckxsvyVBKcbvrv9xNIpqcisvFHXs5DF58nIdZ2I/0u112E2Md+evJmiVgE1zWhn0x+/elKAEUXFqoYI9irFn6s06jl+6GS8U84hwPf1u+c/ILreJtzDWBctTaJmATXNiAjFzvv6Bv4UWNOowcW8b4WgUwSUmuS20anqhmM+RFz5KNTi4v5tt4u2Md210C8JCzMBp0rm3rqTaPeioEgoxcW/94Wj6vasjWw9dQ0XyZrreElySCEZVtInv7GrArn+8i3PVoWUCNk2qYafUm5nYvsnGPxThwQfqD0fnRjjhbOGFYitVwWGIcH3i1fI3O4tnYBfPxN71SLc3YMvh9FkBm7aZfdOkU2fKnzwsx+7vbU7QdV2cBOd26szo1kLXcr7xUmJdawv30bCM8n7NaffObj0D+/dp/S+DTv1DG3MsWIyATZPiDX0LVey9jwnYdFtMgGvf9Kd/vvDoKjq1nG98M10LUyWL+7WGvUr27ulWtbiFezSWw9jgjNYJ2DSrlo1cltLlnVQh7Gpgwnnk+dGPNTWcb3wzEaaMd/mc+Ps6zsTuUmdDC+PdsZcuJmidJxHNijf0LWz+09WdVCF2ft7XsQpTbqOuXg/Ucr7xUiJM7XvceJfL0UqC0qFnb0tdEONd7RXsGO8mK1i/D2slYNO0Y8frf9N64KnbVHXopK5MfNfTiVcvdaJdMsL1seP1r8U+8NSWRB61LKWKDfC68AxsZbwDUoqzAg4naFSsFdrx7c29N8v1BtAtWzaky5fbWHNOOaKaM/nyl1PNIlg//aM/daZyHMcvff8/3lr1mvf4vV3o/Xn/+p+MdzlsG9uQHv6bsquu8Qz8t38f7T3Rynj36A/+kAAVbGhiLXZUseMBD13RQjUn1l53abOfCPoR+Gt36Lnbde1kUsvSglGfk97KeAf0eQLRvFgfWXvrZFR1XvnpHQm6IDYdqn3tdaxD7OJaxDh+qZYjmBYT492h5+oPNMMQ4bqGvUpGueFnjHXGO2iLFnHoidaxh//mS+lrf1nvO6eoYGudZNTiPnz9ta9U3aYcVesnnvxjZyt/v/jllepbxb/5jVvSO+9dTf/y3+vfyHK9ne/dzzUExFEslYrx7pWXv2y8g8bEN943AnrG79qY3vj51rmfNbv/ry/MrcWEUYjJZu3VnPu/NTu3v0OXTdy7Kb3xs61VT/xjwh/j3cx5IXutPvjdXxR/r0QQvOfrH6RhipeJNe8cPvcd6413zr2Gz9MiDtf0N+j4sPq3sPHAtx6bUTj07O3Vh+unn/mo8+E6RNtv7euxIxC+8bOvWo+dwYkK2n/j5fkwz8SO8a72Y7mefuZPwjUswFMH5olJ50PfvVB1yJ6r1PcmnUI2wxSTzcOVr4uNDRNLOjs41kxGa2fNBuOdkL02tazbH1bgbWG8e+KHf5zbBA/4Ii3isIBon3z9ta9W3S4eb50f+u6H2idZdyab3RZdBa9UfoRQvDx99LE/GO/W4O1fjc09G0sWL8+33fn7tJ6Md4BXurCAuUr2dy5U3fo0qOxM3HtLgvVS+2QzJuzxoqrkyWZUsu//67rXUfbXnOvcWYvTZ8uvYseygfVsE699vIsxItZcC9ewNAEbFjF4kNSw9mwxEbLf/tXWdPCpLQlyGhvbmF756ZernmzGjsQxRsRRf6UbvFQc9i7LwzR4qVj7PgDrpaTlD0tZjzOpY7yL/U1qH+9ijChhjwkYNcd0wRIuXe6vPYtjSqLSW+uOuw//7ea5yk4ca+OoDdYqKkQ/f/2rQ91QaJjiO/Ls4YvphwfrOpomfi/xQjGO8/ur/6XO8S5+T7EO13i3cvE83PHt+LMruzYTYfjv/tPl3u8nz2c/GO/iaLga1TrewXoSsGEZ4o1tTDwvX+6fa1njxDNeIERlZ0uvuHPuLcd4sXIxcX3h8G3p5WP1nvt67Pil9OgP/lBF1Xoxv/6nT9Lp3ovFbb3Ps9YlJPH7iqAdLxNU5JZv29iG9PDflL0z9pYtG9K//fuf5+7ztTDeAYuxyRmsULQZ7v7e5nTgqduq3QQt2uOPPP9RmuoFbZsCcTMx0Tzww1vTwf23VTnRjKpNTDSjRba1Ck6McYefuz092KvS1T7eTVa8HCiX+H6//5ttxX/PIzDG3gmrYbwDbkbAhjWI1rCo+tY8+YxJZ1TvvcHmRnH/7+pVAeM7UNtEMyaWsTwkKrlx75to9ncbj887Pvcag0UE7fisI1xMv6uLZzGTL3857a1gHfu2Oz/ofa+Xv7Ff7eNd3Punz1zpjXuXjXewRgI2ZBK71E5sv2Wu9fC+7f31i4OH8NjYhuIfyIMH8LneFS2VM7/tXefr3XWYL4q1lzse2Jzu693rpU8y436enb3++Jt+75O5vRaiY2PqrStzm36xuAgbE9s3zS2ZGYx3cX/UEjwGYfudXtCO8S6u2VnjXYjPPjaLK12cW3/4+cU3bqtpvBsYPLPj/o5n+OD+9gId8hKwYcjioT1+16a5yWmE8dKr3zcL2fEQr8lcMKvo7f75RY5m2jrvBVG8OCoxPA2q0DGJjAllhOgI1aozw3E9dG+cG+9irIsxr9TxbvBS5sYxLe6t+B5ND+6zBqrfH/zuL6p4aRzdCqGW8W7wEtx4B6MlYEMHzK3r3rk5Hdhf77puGIbBpDkmmqoy3TQxVxHcMtduW+N4d73d9uN06uyVKivfR39yRzrgeMeRM95BNwnY0DGDdd01rHGDYYkzWqPl0ySzLDHeHXr29t7POncrD7GPxZEXLla1YWQtbeKlMt5BtwnY0FGD3XsFbViciWYdYrx7/bWvzlW3a1Vb0H7jZ1urfjHSRcY7KINzsKGjButHY21frFus9ZxNWI34fjx7+GL64cE/zq03pGzxef7df75U9XgXv6+DT22Z2xjundg0rfC1sff0fh9RyWb9Ge+gLCrYUADVbLgudr199PsfmmhWKsa7V17+StXV0bh3n/7Rn+ZeopYqXoLEZmesL+MdlEcFGwowqGZv2LBBxYCmxYY+j/7gD3bGrVh8tidevVz1eBfh9Pv/sf/C9NxbZe46fulyrMXePLfjNuvDeAdlErChILHuKlooY8dxaE2sPXzm0EeJNsR4V/tLxfi9Rcv46UIr2Rt6/+d5tD6Md1AuLeJQoNhl/JWXv5ygFTHZPPz8xUR7Whjvpt+9mh767oe9SmVZbcBRiX//N9vsEZKZ8Q7KpoINBYo1WSrZtMJks20x3tVeyf7aX25M3/zGLXOt8SWJNvH/9T9smtvAjTyMd1A+ARsK1cKkE2INojZJol1821g/hNYqWsXHer/HX/yyrCOYYn3wPhtwZmG8gzpoEYfCOYuUWsWuufd/a9YGP3ymhfEudhc/2gtaJYndxLWJr02Md/d8/YMElM/Wj1C4R3/woQBClR76zgX3Np/zxJP176h86Lnbi2u5PlbYC4EuivEOqIOADYWLyeYTT/4xQU1iHaJzX7lR3BNHnq+7hTYqwS/++PZUkmjhZ/WMd1AXLeJQCa3i1EKrJDfz9q+2Vr+xVmmt4p5Bq2O8g/qoYEMl4g041KD2CiVr9/Qz9d8j0So+trWcadrps2XtgN4Vxjuoj4ANlYgWvak3P0lQsqjmTBZ2VBHD18J4F63iB/eXszv35Enf25Uy3kGdBGyoiCo2pVPNYblaqJgeeOq2VIrYD8RL3pUx3kGdBGyoSFR17LpMyWyWxHJFxbT28S6q2Du+/aVUihOqsStivIM6CdhQGRMcShWTTTvpslwRrk+f+TjV7tCz5VSxT52p/6VHLnHvGu+gTgI2VOZUAxNO6uTlECvVQkty7JZeymZnEa59j5fHsxrqJWBDZbSJU6rp964mWImomNYu2sQn7t2USiE4Lo/2cKiXgA0Vmn5XUKEs8VJo+l0bJLEycd/MnK+/zXb3zs2pFF7y3ly8TNQeDvUSsKFC77wnqFAW4ZrVOvdW/ZXA8bvKmq4dO34psbjz570Eh5oJ2FAhFWxK8472cFaphUrgfffekkpy6h+sw16K5TBQNwEbKjR7QesZZdFSymq10CJeWgU7AqQzsRenPRzqJmBDhTy8KY17ltVq5YXi+N1lTdlOn1XFXszsrPEOaiZgQ4U8vIFW6H7opsmTAvZi3LNQNwEbAICsIkRqEwdaJGADMHIzdtWF6hx54aME0BoBGyqk/QxoRSsvZ2ZnU3Hi+D3Poy/yZwJ1E7ChQvHw9gCnJDO/VcGGpZS4mVs8h068ai32jVrY+R5aJmBDpWZnBWzKYcLJasUO9LW/UCz53ORTZz5OXNd/AW68g5oJ2FCpc29dSVCCksMD3VD7C5rzBbfBT715RUfVPNE2D9RNwIZKTb/nIU4ZTDhZq9pfKJb+EurY8UuJvne8UITqCdhQqel3PcQpw7k3dVuwNrWPd1OFf0cmTwrYA6V/lsDNbehd+nagUh/87i/S2NYNCbrsnq9/MLeOFlYrxrkY72oU7dXb7vx9Kt0bP9uadnz7ltS6bXd+YA02VE4FGypm91a6Lqo5wjVrFSF06s06lxrUsknY6bOeR/316MY7qJ2ADRWzeytd5yUQudR6L9Xy+5o8ebn5zc6Md9AGARsqFm/La63qUL6oXJ86Yz0ieZw6U1+Ai+9ILWt2Wz8TOz7LSQEbmiBgQ+VOvGpzGbpJuyQ5RYCrbbfqI89/lGpy9KWLqVXHGv69Q2tscgYNeP8329L4Xd6n0R1RzXnoOxesvyar2OwsxrsaNneM70ZsAFibyZe/nPbuuTW1xHgHbTHjhgY88eQfE3RJdFaYbJJbVLFrqfrWVr0eONz7fbW2Fjs+S+MdtEMFGxrx+mtfSbt3bk4warVW5uiO0o+EirW6Nb8YPfjUlvTiT+5ILTDeQXsEbGhETa2TlM2516y3WBLz9n8dK3K8a6WduIVzsaNSf/+3Zo130Bgt4tCIeNA/+oM/JBilIy9olWT9xT1Waov10z/6UxPfkSee/EP1v88jL1w03kGDNvWuwwloQjzoN2zY0KsafCnBsMUOz88cqnNdKd3z63/6JG0b25i++Y1yqqTxAurl/9TGUU7x0vfcW1fSk//bllSj+Cx//H/ZORxaJGBDY+JoJCGbYYvzb588+KcEw/SPv7yS7rl7U5q4t/shOwLZ4efbCmT/+m9/Tud7L35r2x8kxruDP/IyEVolYEODhGyGKSab++xkz4icOvNx50N2i+F6YPq9q1WFbOMdIGBDo4RshsFkky6IkN3V8a7lcD0QIfud3vXw325OW7aUuxFnLIPRqQMI2NCwCNlROYhJZ8mTGrrp6Wc+suaazujaS8VYg/zDp/+Ujr50KZHSv/z3q+n//n8up93fu7XI3d9jvDtc6dnlwMo4pguYO9LmjZ9vnfsJaxWb6cUZvhFooGu6MN5NvflJE7tor0aE66M/uSPt3XNrKkF8ho9+/8O5KjxAMJsG5iYIcTZxK8fDsD6iIhfH0sS5r8I1XTUY7+JeHbb4jkSl86Hv1n/O9WrFn1EsK4ljJbv8ZzR/vBOugflUsIHPiarO4eduT7t2bi6yTY/RmHz18ty5w0IDJRmMd+tdLY0wFutzj750ce6vWb59vc/mUO8z6kqHlc8SuBkBG1hQTGZirWKXJjZ0i4kmtViv8S5aweOsZ9+RtYugvXfPlt7nNJrd4I13wHIJ2MBNTdy7Ke3eeWt68IEvjWxyQzdMv3t1LjDErszawKlRBO04Muq+7beseLyL4DX4jsT3w3ckv8HLkOiyip/r2Wk1eEHiswRWQsAGViwC9/hd18+VvVuFu0oXemEhAsPM+U/T9HtX5n6q3NCapca7OIVhdja+F2nuOxLhmuGKz2ds68Y0sb33c2zjqp9HF+bGuquffZbGO2C1BGwAAADIQNkJAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhAwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABAAAgAwEbAAAAMhCwAQAAIAMBGwAAADIQsAEAACADARsAAAAyELABgAQArJ6ADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGQjYAAAAkIGADQAAABkI2AAAAJCBgA0AAAAZCNgAAACQgYANAAAAGUTAnkkAAADAWsyoYAMAAEAGEbBnEwAAALAWswI2AAAArN1cwD6fAAAAgLW4YA02AAAArN2MXcQBAABg7WYFbAAAAFg7FWwAAADIQMAGAACADGY2XPuLD3rXWAIAAABWY8NgF3FnYQMAAMDqTMd/DAL2uQQAAACsxvn4j0HAnkkAAADAanyugj2dAAAAgNUQsAEAACCDuUy9Yd4v2EkcAAAAViY2Dd8Wf7Fx3i9OJQAAAGAlPts0fONCvwgAAAAsy9TgL+YHbOuwAQAAYGU+y9Ibbvgb1mEDAADA8ny2/jpsvOFvqmIDAADA8nwuQ98YsE8nAAAAYDlOzP8vN7aIj/eu9xMAAABwM/f0rpnBf7mxgj0z/28CAAAAC5pJN+TnjQv8QycSAAAAsJQvLLFeKGBPJQAAAGApp278hQ2L/IOO6wIAAICFzaT++uvP2bjIP3wsAQAAAAtZ8ASuxQL2VAIAAAAWcnShX1wqYE8lAAAAYL7ptMjpWxuX+JdOJwAAAGC+RZdUb1jiX4pNzt5PNjsDAACAgdjcbGahv7FUBXs2ORMbAAAABibTIuE6LFXBDjt61xsJAAAAWLR6HZaqYIepZLMzAAAAmEpLhOtws4AdjiQAAABo27Gb/QM3axEfiDbxHQkAgARAc2ZSvz18ScupYAdVbAAAAFq1rEy83Ap2iCO7xhMAAAC0YyYto3odllvBDk8kAAAAaMuyO7pXUsEO1mIDAADQipm0zOp1WEkFO1iLDQAAQCueXsk/vNKAPZWciw0AAED9JnvXqZX8CyttEQ/jqb/hGQAAANQqWsNnVvIvrLSCna79P7jpAdsAAABQqMi8M2mFVlPBDmOpX8UeSwAAAFCPmd71UFpFwF5NBTvMJsd2AQAAUJ/Y3HsmrcJqK9gDju0CAACgFpNpDcXktQbs8d71dtIqDgAAQNlm0ipbwwc2pbWJVvHLvevhBAAAAOWKM6+n0hqstYI98Hrv2p0AAACgPJMpwz5juQJ2tIhHq/h4AgAAgHLMpDW2hg+sdhfxG9lVHAAAgBJFlp1JGax1DfZ8M6lfEd+RAAAAoPviSK7JlEmuFvH5HN0FAABA153qXY+mjNYjYFuPDQAAQJfNpEzrrudbj4AdxpPzsQEAAOie2EPs/pQ5XIdcm5zdaCbZ9AwAAIDuybap2Y1ybnJ2o3/pXRd618MJAAAARi82NXs5rZP1DNjh18nO4gAAAIxehOvDaR2td8AOU73rnt41kQAAAGD4jvWuZ9I6G0bADrH9uZANAADAsJ3oXU+mIVivXcQX44xsAAAAhiX7WddLGXbAjmO7ImSrZAMAALCeplP/rOvZNCTrdUzXYgbnjZ1IAAAAsD4icw41XIdhrcG+kTXZAAAArIcI1/t616U0ZKMK2CFCtiO8AAAAyCV2Cx/KhmYLGWXADlNJyAYAAGDt4pzrdT+KaymjDthhqndd6F0PJwAAAFi5J3rX0TRiw95FfCmxHvv13jWeAAAA4OZmUv8YrunUAV0K2GE89Y/xGk8AAACwuAjVEa5nUkcM+5ium5lJ/d3FjyUAAABYWGTGOIZrJnVIF9ZgL+QfU39d9jd715YEAAAA/XOtn+1dh9MIjuG6ma61iN9oPGkZBwAAoIMt4TfqWov4jWZSv2X8SAIAAKBV0RJ+f+pwuA5dr2DPN55UswEAAFoyk/pHcE2lAnS9gj3fTFLNBgAAaEVkv6haT6VClFTBnm889c/MnkgAAADUZKp3PZ06crb1SpRUwZ5vJvXfZDyROt6DDwAAwLLEDuGR8eL4reLCdejqMV3LFX/oJ3rX5d61IwEAAFCaCNY/6V0/6F2/TgUrPWCHOPtsKvWD9rakbRwAAKAUsTt4HL31j6mD51qvVKlrsJcynvqHju9NAAAAdNFk6m9iNpMqUmPAHhhPgjYAAEBXRCt4VKyPXvvr6tQcsAfGU3999qHkDG0AAIBhqz5YD7QQsOfbl/oV7R0JAACA9TSV+m3gU6kRrQXsgfF0PWyPJwAAAHKYSf0NqKuvVi+k1YA9347UD9sPJmEbAABgpSJIR6g+lRqqVi9EwP68OOJrX+qHbcd9AQAALGyqd5279nMqMUfAXtx46ofs3b3rviRwAwAA7ZrpXad713TqV6qba/9eDgF7+cZTP2TvSNcD91gCAACoS4Tnqd51Pl2vUAvUyyBgr00E7Ilr13jqB++xa38tfAMAAF01e+2KinQE6Zlr1/S1n6yCgL1+xtL1sJ0W+AkAALDeZq79HATqmXl/TWb/Ey4zkFnVVyiSAAAAAElFTkSuQmCC";
}
