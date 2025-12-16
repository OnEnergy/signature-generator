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
const logoAsset = new URL("resources/Asset 1_375.png", publicBaseUrl).href;
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
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXcAAAB3CAYAAAD4twBKAAAACXBIWXMAAAcoAAAHKAGcLxdeAAAdUUlEQVR4nO2dbWxc2VnH//dlZq6dG8+wm0pBbJ0Uaauq2iQGqaiiycYFgbrdVOsiqnaVwHpL1YYNqAakphuB6qKybQSiXqREWwlRR03E8qHCSxK2VUE4SuhX7AQhJD5sbO2HlTbQsTOx78zcFz6Mj3M9vi/n3LdzZ/z8viWel9+ce85zXu65z1E8z8M2rQOzAKYBHAJBEAQxKKwAmIf5YJb9h+J5HtA60ACwCOCYJDGCIAgiPcsAJmE+aKpb/7EICuwEQRCDzjH04jnUraUYCuwEQRDDwTG0Dswq3sMn74PW2AmCIIaJFcV7+KQX/zqCIAhikFDjX0IQBEEMGhTcCYIghhAK7gRBEEOIHvaH995rwzD4Yn+n46HTcbheOzKiQdMUrtc+eNDBgQNVciAHYYfNTQeOE387SdMUjIxomX+/43jY3OQrg2pVQ7WafRmQw/A7WJaLgwdrgX8LDe6GoaLRqER+cKtlw7Y9jI3pMAy+H8neo+sKTDP067dfO+wOhqHFdqKD4tBsdgGgFA4f+EANuh7fQGzbQ6tlAwBXGce9xrJcWJaDWk3Fk0/ylQF7T1b1sQwO7LqSQ74OrL4HEf3OmC83TZ2rAflhsrbtodnsJvqMYXKwLHdoHOIqep4OrBGJOui6sv2eZrPL1aCCYJ2EYWjCDoahwjDU7frI09GV3SHJdSSHbB2Ea3GrZUPX40f1fpprHuavtrFwo7Prb2zqHDQ1b7cd1Gq7eybH8aAogKqGF9r0mRqmTwdPVxisYbORm0ijFi2H+6suZl/bwP0Vd9ffJo5q+PK0h1/8kC50Ef0O89faWLjeQXOtV56HD6mYPl3D5Il4P1aZ2OcldUhDGoc0nYKfRqOy3aBEfo9lubBtN3UZsPpoWe52YCCHwXPgnQnm6QAIBnc2KhBpRIu3u5j6wkOsrSfdTr87GPJw604Xc5cszL+xDxNHo3+maeo7eto4RIPJzPlHeP2yFek6f7WNv/yLUbz427qQw3/+l4Ppsw+xfM/u+0zgyrU2Xjpdw/wbJpenaepCFSmroJrWIW0j8sMaFO/nss4oyWg/jN6oTSGHEjnw1sckMTJrBwb38CiJ9NJdO2VgT8fyPRtTLz7cHs1GoesKDEPb7nXDYBWNtxxmX9uIDOyMtXUPX/7DR/jxvzrcDq1HwNSLuwO7nyvX2pg+2+JyBdgIOvtyEMEwVOi6CsuK7tizDux+WICPwrJc4VkGL/5OJgrWLofZwTT12PqYtwNPm8gjsIs6+OEqiaTSM+c3pAV2xsqqi5nzj7heq+tKZFAR7Tnvr7r45rc3uV8PAL/3yiNuh5nzj7CyGj+zuXKtjcXb0Q3UT9blkATWSMMc8gzsjKjAxrzyCCZ+ogIb61zyCCZlcogLbOQQTGzNtG1v+4NFWLpr49Yd/oCSJwvXd6/1h2EYKixr95alJOUg8r2MtXUPb/6wy+Ug8vnz19pCHmHlUFRAiXMwDL7ti+kdtMAOxrKc3AM7EN3RFukAPK5/5FBOh35ibZKO0u5zjCiLYm3dw9Jd/ulM0IgtSTkE3UDmet/1TqzD0l1baFYUdCM3jiCHoipxWRyCOpgiZg1lcwgavZNDeRyCiGwhbC94EkSCaRHwrLuHUeRIEQDeutnZ5dvvIPp77q/yPUARRdHlEEQRS0L98DamPAmbQZDD3nTQdSV29B4Z3NM0pDTBNA9EffwjxqQjxTQBdeFGJ9IhbgdQPyurbqJrkkU5pMXvkGbAkRR/Qyp6lMbwj97JgRx4Bhy5tdSkSxJ5UbTP0l2b62ZnGPNXo9fIG3UFJ4+LVaqyXROCIPIjNLh3Ol7iKfjcJStVYMsD0R0jDNtGonKYOb8h/B4/t+50t+9btNtu4Axq9sKI0GfOvraReEYV5lAkm5vJnoLNgkajwp0bJC9MU0e7LbddlcHBMDTYkld9y+LQ6YS354jgnmwKvnCjgz/6Ot/Ww6KZ+sJDoXsBpqljY8MWLofps61MdgotXO9sN6agpYjJExV841X+AL+y6mLyuXXhAG8YGrrd4pdD+h0cubEVjpOso88KXVfQ7SYfdGXlILujNwwVGxvF33vpd2i15CzJ+B2iEvRltiyzdNfG9NkWPvviw6w+MnPW1j380ifWemkAOGYWuq7AdfkD4cKNDiafW8cVwW2HYcxfa8c6zF4YxT/+/X4cGue7lMv3bEz8ahPz19rcQb73hJzs0Zp8B9t2pdxzKJuD68rt6MviUHYSdX3+XDG8W/JOHq9g6lQVE0f5Rx3vvLOBD31oVNhv8XYX89faoUtD3/z25o6Hi04er3DlovFzf9XF3KVNLN11uEfpL23lerm/4nA93LR8z+bqhKZOVTF1qoqluzaaax6aa16vDK62A6/NyqqLl8+28PLWv+tjCiZPVDBzzuDKRUMQRPkRDu5Ld3uP9POuqdfHFCy8uT9R0DjwcwqeeUb8fZMnKpi9MIq5SxbXEtGtO93tXDSLb4+hUY8eEcxfa2Pma4+495kfO6Jj4c39OLw1um6uedxPrs5d2sSXfofrpTt20EydqmL2wiimv9LCWzejb6SurXt462YHb93s4KuvGJi7uI/vCwmCKC1C87vmmicU2AFg8e0xaaPBmXMGvvsd/kC1fK+XCyeKxdtdvHy2JRTYF98e2w7sQG+nywvP8+V2TrPDpVHvday83wUAr1+2MPtaupvBBEHIRyi4z13aFArs33h1RHg/dtbMnDOEtgzeutONfFRfJAkXAMxdHA2cCUx9hi/grqy6+O//SffMwPz3+LJCMuYuWaV7ToEgCDEEg3t8dkM/02cModfnxfQZ/rV0IDxny+LtrlDnduyIHjprmTpVRX2M74bQP91MF2gbdQUvCdxPWFv3duyzt20vMnd+EbCcNjLhyVSZN6oa/2TiXnAg4gltLdXqzkdsm2uecIbHw5w7OILo5QqvZNKYJo6IbR1j++GbzS5GRrTtiiy6Tz7q5nGjrnCP3hduOqkbk+i1aK49LvdWy0alIju4O9DkZj6ApiEwkVmRVCqK1FQI7Mg42Q4jI1psKuI8sSwXphmfDjlvh2o1vFFEBHdlR0WWkStG17NpTKJLQ/5OLE1FjguoU6f4gvvDFvAPPxSbNWWN7MYk24F19DIpg0OrZaNWkzuDKoND74xTqQqwLCfyIG25JbTHEVmaufnjcqRPJghiMIgM7rKyn/kTlg27A+/9gH/+sS2lHPyJkXgy0Q2jgz9ZGc/JRMPq4M8KWgYHWdk6y+YQRkxwDz4sIW/8FXnYHXgfnFpb9/B3P5C7NFOG1LcyHGSkGS6jg6ysoGEOsgYbZXMII/ZKFd2YgiqxjAbdnzPCNHV0OtmPnCeO6typA370k2JH70HpTIueScl2CBohFT1qJYceQbGhDA5liJFBxEYVNnp1nPx7p7Aj3ESOlsqLPPNY8N5Yvf52F//7f+l3zvBg28EJqliOlyIcwqaeRc7mwkZIRXUwtu2F5pPZaw5AcDuU7RB35nARDkFwDRlNU8893WlUBWIOspcEqtV8pqQz5/gzO/7k39xCysF1PanXIq4+FDFiizqIoahOLmqURg7kEAV3tMpzvc+2PViWE/sdrEEP2wMUh8dVHDvCV77zV9uFBLa4jixPB976YJp6bg695yziv9+y8ptJ8ZzyQw75O9i2NzAOfqRvhbQsl6shMxqNCizLkf6kYNac+Tzf0gw7xIMFV5nlkEdn22rZ3PVB15XMHfyNiGfqyxp0ljMZ0Yach4NluYkcsqyPZXGwLP5DYsrgwJAW3FkFBsRnBez1sh+qyQJWDp/5NP+FY+kR2MWWWQ6ss03rwMrBMDTh+sAc0gY31rGINiLT1GEYWiadTK/Dlu8A7N5UwOPA3j9MDmnikywHIGE+9zSwXoiNupJiGCoMQ93x4wcpeX9/OTQawAvPV2PT8wJbKYfP9fL2lKEc+jtbEYes6oNp6jsGDCKflUXZMf9Wy96+Gc27bdC2ve2OKU0ZlMGB1UdykO+Qa3APGs0Zhpbp0VTss1ghlgk2rQwiqBymPsMX3NkhHjvSCMeUQxHLN0muRZb1wd9BiMwksqyPrKOLuvb9pO3YyIEcAj8n7A9ra90d09z33xffLfP++7tT51YqGndOhmbTBsB3qIVtA91udjt63n13c5fD+rrYtH9jw8b77wf/rVbToPZ15L/yy/yd07cuPsTsq7vX6cPKYWNDzH193d4uAyC/axFUDmGIOLTbLtcRiarKn4hLpMNwXaDd5iuDSoU/Zw45iDuI1MdBc3AcL7QjCA2z9Xplx5s+8E4XgNjZoE8/vTuPuH8aHr+OtImnnoreJsg/7RFzf/y9jx3GxjwA/Bf0iSeqePrp4GMCmXd/ObzwvMM1ev+XRRd/e+lx2bDKEFYOTzyxAd7ACABjY3pf2cdfiziHIMSmrfwOBw/yLbGIToHjvn9n/ebb4srek5XDzro1eA58sYHfQaQ+DppDVCdQ+Jo7W4vy30BL8kizf5fNIK21M9hFY+XAfsf0mRpXcF9ZdbF018ZHPqwmugGXJUnv5gO7p61JrydrRKIO/Us5vI26H9ZJJFlmYm2COSRtE8whSRmWySFtbCiDQ5r4lJWDtN0y/kYlusvBP9IaxMDuh5UD2+0hkinyr17vjcRlBvakuxr6MQw18TZX1gDSOjQale0dJyL4O7e0uVeS7oDyO6RtE2naZRYOaWNDGRyA9PEpjQNQgn3uvV5KE1r3TNqTlRm2la3VsrkP8bjxo67UcmB7kLN0YKNmkfqQZSfv3zvPA/PM8iE/1tHJdhDp6NishRzszOOTaIxkcBvkmX5A1xUu+aRTrUGBlcPnf4uvcq6te6kO0I4iLkma6NNyIvBW5jwdeIJrHg25TA68HR1zyKNdlsWBJ+VG3g6iAZ6rRrRadm55VRhxyXfyLDhe8sgK2Y+uK/jks1WMf5CvvPMK7qqqRF6LvNPPxtWHPAM7IyqohCW5y5qooEIOxTnEBdcyOPQTG0HYfmVNyz+ohmX7E8mElhdF7qE3DBWf/k2+4LlwvYPmWvZuuq4EXouiGjMQXh94DirIziE442BRuc2jOrkiHYDgNkAO5XHoJ9am6EMCgkZLMg4qCHLIe/bi5ytf5Ns+lufSTNC1KPrABtkOQR1MEbOGsjkEjZzJoTwOQUS2EP9pREXiP92kyFFaGDIcJo7q+OBTnEsz1/MJ7v2U4VrI6OjLkG5a1nGT5BDtUIYYGUZk9JB1tJe/Mck62ss/YpTl8Md/wDd6f+tmPkszQDnKwe8gozH5G1LRozSGf/RODuVxKEOMDGO49hMOGbxbIoH8bqwSBDGYhAb3TmfnMWsTR4vvnWwbmSwD3F8Vm8b5HyJqt93EPbPo9/ZzeFzFMx/l+/1zl/I9PDtNOWTF5qa8J3EbjUrup5HFYZo62m25SxLk0MMwNNhyV+pgGBo6nfAZe0Rw3zkFb9QV7icnGWmCWy91aTYP6SzdFbsKkycq2w6bm872MgD7f/7vTR8MXj5T43odyxQZhui1aNQfl7thaOh25awt+h0cubEVjpPNYCMpuq6g2w0+27ZIB9kdva4rUjt6AFvpfOUsC/kdOp3wRiEUOUWWCQBg/mq+o0leREe1Yb9z8kQFh8b5i2z5no3F2+kOsfji7xrcrw27sdpc84RuutbHejluGOx8SJmUwSHqTNe95OC6cjt6gg+hWjJ3cZ/Q6P2b394UHjVnzcKNDm7d4Q+wJ49XMH06fLQ8d3Gf0PfPnN9IdbOzUVfwyWf5LtP8teDMlzPnH2Ftnd9h5pyBRp0aL0EMMkLBvVFXsPj2mNDodfK59dSj16TMX2tj+ist7tcfO6Jj4c39ka+ZOlXF99/Ynco4jOV7NiafW08V4H/9Wb5Au3zP3tWZTp9t4UpI0A/iq68YmL0QnKaYIIjBQXjhbOKojqWfNjB3aRMLN7pYvhc9Ml9b9/DJT6/3RsRnajtOD4rjnXc8PPiZeMdwf9XF/NU294iduUWN2P1Mn65h8kQFs69tYPF2Fysx69nL92wc/ujPMH2m975GXcHhQxp3WfzaSRX1v3G5Rt9zly1Mn65h6a6DucubsW5Abxlm8kQFM+cM4fsKBEGUk0R3RRp1BbMXRjF74fH/Ld21MXfZCh0l3rrTFVoeecx6EsVIvvHqCKbPGEIdTT+Hx1XM+0bwzbXek6Jzl6zADm9t3cPrly28fvnx+v+hcRVzF/dh6lT0vYz9Zu8+AM8I/Mq1duzrDo2rmL0wiqlTVVp+IYghJbM7MxNHdcy/YQotWRRNfUzBf/x7HbMXRlMF9iAadaU3Yv5pHS9xzgBWVl189sWHmD4bvnRk2x5UVYntAHg5dqQ385o+XeMO7MxBJiynjUyiEpkVharGP5m4FxyIeEJbS7Wa7DHf6dM1fPc7Yjcdi2Lhzf1C+/WbzS5GRjThijz/homTx/mXN65ca4c+hNRq2ajVVJz6VEV4K2o/h8ZVLL49JjxaZw4yG7RlOdDkZj6ApiEwkVlR2LaHWk2VmgqhLA4jI+KHqmSJZbkwTf6c+3k5VKvhjSIiuAdnBeRh5pwhdNO1CF7aWicXJWlFnr3AlzqAMXP+UayD6FbU3U6jiZdhZDdoAFIbNOvoZcI6WXKQ79A741SqAizLQbUa3p5zK6GslhGyomgf0T3x7EzUKGZe4d/zHkTZrglBEPkRGX3SZGAr2406UR9/UqKk5XB4XGyk179dst/hIx9WE8+IDo2ria5JFuWQFr8DTza8rPEnKxM5/i5L/Bk5yaE8DrIyhvJkaI0J7sGHJfAgIxdNFGk6mzTlkBXMIenoW7SjiXKQiYzGJCvznx9ZGTnJIdpBxmCj3yGM2FJK2piy3o2ShvqYInwjtT9nRJJymDwhFhAOH3ocgIMcDEPD73+JbyfO7s8Wvx5hDkWO3mU7BI2Qih4xkkOPoE6WHMKJbfEixzr5mTiq49iRcozeRW5Ehk13kpTD9Bn+NfKTxyvbHWKYg2Go+IWfB579hHi58j6gxYhysG23kNFKlENRM4iwEVJRHYxte6H5ZPaaAxB81CY5BMM1nDNNHZblCDfouYvyH2Ovjync+WCiKjEgPno/PK7iqxw3QXuOo9wO3/qzmtC2yBeerwrtFMq6HJIQ51DEaCnqMIiiOrmoURo57C0H2/ZgWQ73EiH3XJ01aBH5yRMVfP8NM/X+7KSI7OvmLTgWVHjLYe7ivsgAXx/r5euZOKpzO5z4hIFLfz3CVa4vPF/F/Pf4HywTLYc8sCxXugPPKT9s0JPXiE3EIa+gItvBtj1y2HIQvfejzV4YnQ36Q9CU2DA0bGw4cF2+aQHQW575wud6SwJGTeHKdZKG+piCj3+sgplXRvDG6+aOdewwLMtFpxOco3p93cbY2O41X5Fy+NRv+EfOCizLw8c/1ss++eaV/Th8SNvuOHkdjj5TwYuf07BvnwpV3Vmuh8ZVTB6v4Ot/MoLv/PkoDIPvWok6GAbbd65klgK21bKhqgpGR3dftygHXVczeYrWtj2sr9uBDTno+6tVdbtDzOoAdcty0WqJOWxsOOh03KFz6HTcXd8V5yASnwbdIWrXjPDiba93ctFsdmGaOtcPOLyVQ8UP64kMQwuder/77iaeeir4YSA2ukuTLN/vILobwl8OPA6TJyqBSyNsVMBbln4OjVfxp1/Tt8phTOi9/Q5sVCDq0GhUhMohLwe2TJRmVwv7DNHf0ZuSK4mvo59mswvD0IQdTFNPVZfK6pCmXQ66Q5r4BCRMHGYY6tZJJL2RXlSA7ocFZV1XUgUD5sCm5WVwELmQ5JCtgz+wAGIBOol3P8w/SZtgjRgQ71jIYTdZxKcyOKRtE6m2s7DehPVSPCQZEUTBPqsMDiL3JMghewd/YxBZi8+yDJK0ibSNmByyc8i6Tch0CA3ua2td7h0Rtg10u3xb0yoVjTsnQ7NpA9gcGId224Xr8gU1csjXQeQwa956LtJhiNRHVVW4P5sc8nUQq4/yHRzHC+0IQj+iXq/E9h5ppxzx60jha+6MtMsyWTocPJhsOYIcsnHwT+vjXP2ILMvEfW4RyxHkkJ+D6LJMng48bSKqg0m0LOPfqia6RsnWotj6qMiPDnJIMn0po0PS9V5y6JFmrda/nAQkuymb5oZw/3JS0vpIDj2yiE9lcEgbn4Tf4W9Eae5E+y+k6AMxWdx0KZuDZTnCDkluHg6Cg+i+8aS7GvoxTd23vZMff+eWdvtbknsGQK8+DqNDmnY56A5p4hMgGNzT9CJh9HopTWjdcxgdWGARcWg0KkPpAIitg2fRkBmsQfEGtiy2YPZjGKqwQxadWxkdRDrbuK3Ve8WBwW2QdKrFg64rXEEl64Y86A55UAYH3s42TweewJZHQ07qkEd9LIMDb2e7FxxE035w1cq8KxDQk486o7KItKvkMDgOeQZ2RlSDZme65tkmgOg8PuSwtxx4B16M2OAukoUsLWHZ/sihR1GVeBAc4g4qyM4hONtfUXnFozq5veYABGdlJYdgYm2KPqggaLREDj2KPqiAHII7mCJmDeSwm6CRMzmEE9lCihwh+fGfbiLLwQ85lMdBxqlIso5S8yPriENyiHbwH8EoyyGMmOAu50grf2OS5eAfMZJDeRxkNCb/YKPoURrDP3Imh/I4yDqCkefAmvKchUcQBEFkRmhw73Q86VNw24Z0h3Y7OM87ORTP5ma6FM9paDQqQvlq8sA0dbTbcpckyKGHYWiw5a7UwTA0dDrhN1YjgrvcU8Z7aUO70h02Nx0pa2oMVpH3uoNhaHDkxlY4jtzBhq4r0jvZsjjI7OiB3rJIqyVnWcjv0OmENwpalik5uq5wZ1gcZgd2RqVMos50LQrXlXMDr2wORDwU3AmCIIYQCu4EQRBDCAV3giCIIYSCO0EQxBBCwb3k2LYHVZV784rlk9nrDlGJzPaSg6oqXLlNCLmEtpZqVe5jvr1TeSrSHUZGNKkVudWyUaupUh0sy0GlIrdBW5YDTe4jD9A0xD4VmCe27aFSUaQ71Gqq1HQMtu1hZEQ8v3mWWJYL0+TPd5+XQ7Ua3igigrvcSgQAui63MQGQXpHJ4TEyGzTr6GXCOnpykO/QO+NUqgIsy0G1Gj6rp2UZgiCIISQyuMvKhudPxiMrC5w/KRE5lMfBn8SrKPzJykSOnssSf0ZOciiPQxliZBiRwV1GQwJ2Niae7Gd5Qw7lcZDRmGRl/vMjKyMnOUQ7lCFGhhFbSkU3pqA0nuRQHoeiR++yHYJy2Bc9YiyDQ1AHRw7lcQgiNriLHOuUlrDDIMihPA4sx4tsh6JmEGEjxaI6GNv2QnPaFOkABB8xSQ7lceiHa35jmjosy8m1QUdV4jI55D1yJgc+hyJGS1GHQRTVyUWN0sihOAfb9mBZTqkd+uFevMozuPJKs6Ai04EFlWF1sCxXyCEPyuDAc8oPaxN5jdhkO9i2J+SQV5sogwPPUkgZYqQfoTsTeVQk3obMaDQqmTu0WjY5bDkAEHJoNrulcMiqQfEGEwbzzHImY1luKRwsiz9nOosN5CA/RjKEbzuzL0jboFgj8n+mLAfD0AbeIQ1+B9GdCKzSp3VgAS2pg2U5qR16HZX4IRCGocIwtEw6OvYb0jik7ejStMssHNLGhjI4AHJjJAAk2t/Vq0jq9hKJSINkvZCuK6lOMRl0B/aerBxYJRhUB8PQUjn0d3SmqXPddGJTbkA8oPphZcg6KV1XuBskq49ZOfiv6yA6pK2P/Q6DFhuyclC8h08Gdi3vvdfmlul0vMjjnvxUq1rkI7N+Hjzo4MCB6lA6jIxo0DRyyMthc9OB48SPmjRN4U4rIPL9juNxn7maV30khx6DFhtEHCzLxcGDtcC/hQZ3giAIYnCh3DIEQRBDCAV3giCIIYSCO0EQxBBCwZ0gCGIIoeBOEAQxhKgAVmRLEARBEJmyogKYk21BEARBZMqc4nke0DqwBOCYbBuCIAgiNcswH0ywNfdJAMsSZQiCIIj0LKMXz7duqJoPmjAfTAB4GRTkCYIgBo1lAC/DfDAB80ETAP4fQyYXnOpYWAcAAAAASUVORK5CYII=";
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
        <td style="height:8px; line-height:8px; font-size:0;">&nbsp;</td>
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
