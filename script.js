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
const logoAsset = new URL("resources/large-logo.png", publicBaseUrl).href;
const fallbackLogoDataUrl = buildFallbackLargeLogoDataUrl();
let logoDataUrl = null;
let logoReady = null;
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
    email: document.getElementById("email")
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

function getLogoSrc() {
    return logoDataUrl || logoAsset || fallbackLogoDataUrl;
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
        email: emailValue || defaultValues.email
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

function buildFallbackLargeLogoDataUrl() {
    return "data:image/png;base64,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";
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
    const logoSrc = getLogoSrc();
    return `
<table class="signature-export" cellpadding="0" cellspacing="0" role="presentation" style="font-family: 'Univers Next Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#000000; background:#ffffff; max-width:720px;">
    <tr>
        <td style="height:16px; line-height:16px; font-size:0;">&nbsp;</td>
    </tr>
    <tr>
        <td style="padding:0 0 8px 0;">
            <div style="font-size:14px; font-weight:700; line-height:1.3; padding:0 0 6px 0;">${escapeHtml(data.name)}</div>
            <div style="color:#7a7a7a; font-size:12px; font-weight:400; padding:0 0 18px 0;">${escapeHtml(data.title)}</div>
            <div style="font-size:12px; padding:0 0 0px 0;"><span style="font-weight:700;">P:</span> ${escapeHtml(data.phone)}</div>
            <div style="font-size:12px;"><span style="font-weight:700;">E:</span> <a href="mailto:${escapeHtml(data.email)}" style="color:#000000; text-decoration:none;">${escapeHtml(data.email)}</a></div>
        </td>
    </tr>
    <tr>
        <td style="padding:0px 0 0 0;">
            <img src="${logoSrc}" alt="ON.energy" style="display:block; width:100%; max-width:720px; height:auto; border-radius:18px;">
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

function preloadLogo() {
    if (logoReady) {
        return logoReady;
    }

    if (logoDataUrl) {
        logoReady = Promise.resolve(logoDataUrl);
        return logoReady;
    }

    let fetchPromise = Promise.reject();
    try {
        const logoUrl = new URL(logoAsset, publicBaseUrl);
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

    logoReady = fetchPromise
        .catch(() => loadLogoViaImage(logoAsset))
        .then(dataUrl => {
            logoDataUrl = dataUrl || fallbackLogoDataUrl;
            renderSignature();
            return logoDataUrl;
        })
        .catch(() => {
            logoDataUrl = fallbackLogoDataUrl;
            renderSignature();
            return logoDataUrl;
        });

    return logoReady;
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

    await preloadLogo().catch(() => null);
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
