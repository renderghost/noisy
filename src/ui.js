// src/ui.js
// Robust slider panel for p5.js. Stores state so callers can omit args.
// Usage in sketch.js:
//   import { buildParamPanel, refreshPanelValues, togglePanel } from './ui.js';
//   buildParamPanel({ P, R, enforceCouplings });
//   // later: refreshPanelValues(); // P is remembered

let panelDiv = null;

// Default grouping. Any keys in P not listed here will appear under "— Other —".
const GROUPS = [
    ['— Motion —', ['speed', 'noiseScale', 'noiseTurn', 'strokeW']],
    [
        '— Lifecycle —',
        [
            'lifeMin',
            'lifeMax',
            'childMin',
            'childMax',
            'shorterBias',
            'shortMin',
            'shortMax',
            'longMin',
            'longMax',
            'jitterDeg',
        ],
    ],
    [
        '— Branching —',
        [
            'expChildren',
            'expSpreadDeg',
            'startAgents',
            'minAgents',
            'maxAgents',
        ],
    ],
    [
        '— PostFX: Distortion —',
        ['noiseEnabled', 'distortAmp', 'distortScale', 'distortSpeed'],
    ],
    ['— PostFX: Chroma —', ['chromaEnabled', 'chromaAmount', 'chromaRadius']],
    [
        '— PostFX: FBM —',
        [
            'fbmEnabled',
            'fbmAmp',
            'fbmScale',
            'fbmSpeed',
            'fbmOctaves',
            'fbmBlend',
        ],
    ],
];

// Keys treated as integers for slider stepping/rounding
const INT_KEYS = new Set([
    'lifeMin',
    'lifeMax',
    'childMin',
    'childMax',
    'expChildren',
    'startAgents',
    'minAgents',
    'maxAgents',
    'jitterDeg',
    'expSpreadDeg',
    'fbmOctaves',
]);

/**
 * Builds dynamic parameter control panel with grouped controls.
 *
 * @param {Object} options - Configuration options.
 * @param {Object} options.P - Parameters object to control.
 * @param {Object} [options.R] - Ranges object defining parameter bounds.
 * @param {Function} [options.enforceCouplings] - Function to enforce parameter constraints.
 * @param {Function} [options.onChange] - Callback for parameter changes.
 * @returns {p5.Element} Panel div element.
 */
export function buildParamPanel({
    P,
    R = null,
    enforceCouplings = () => {},
    onChange = null,
} = {}) {
    if (!P) throw new Error('buildParamPanel: P is required');

    if (panelDiv) panelDiv.remove();
    panelDiv = createDiv('');
    stylePanel(panelDiv);

    // Add panel title
    const title = createDiv('Parameters').parent(panelDiv);
    title.style('font-size', '16px');
    title.style('font-weight', 'bold');
    title.style('margin-bottom', '16px');
    title.style('padding-bottom', '12px');
    title.style('border-bottom', '1px solid #555');
    title.style('color', '#fff');

    // keep state so refreshPanelValues() can be called without args
    panelDiv._state = { P, R, enforceCouplings, onChange };
    panelDiv._ui = {}; // { key: { slider: p5.Element, span: p5.Element } }

    const rendered = new Set();

    // Render known groups first
    GROUPS.forEach(([title, keys]) => {
        const present = keys.filter(k =>
            Object.prototype.hasOwnProperty.call(P, k)
        );
        if (!present.length) return;

        addGroupHeader(panelDiv, title);
        present.forEach(key => {
            addRow(panelDiv, key, P, pickRange(key, P, R));
            rendered.add(key);
        });
    });

    // Render any remaining keys found in P but not in GROUPS
    const remaining = Object.keys(P).filter(k => !rendered.has(k));
    if (remaining.length) {
        addGroupHeader(panelDiv, '— Other —');
        remaining.forEach(key =>
            addRow(panelDiv, key, P, pickRange(key, P, R))
        );
    }

    // Hint
    const hint = createDiv(
        'Keys: r=reset, x=randomise, h=show/hide, s=save'
    ).parent(panelDiv);
    hint.style('margin-top', '20px');
    hint.style('padding-top', '16px');
    hint.style('border-top', '1px solid #333');
    hint.style('font-size', '10px');
    hint.style('color', '#777');
    hint.style('line-height', '1.4');

    // Wire inputs
    for (const k in panelDiv._ui) {
        const { slider, span } = panelDiv._ui[k];
        slider.elt.dataset.key = k;

        // Check if this is a checkbox (boolean) or slider (numeric)
        const isBoolean = typeof P[k] === 'boolean';

        if (isBoolean) {
            // Handle checkbox changes
            slider.changed(() => {
                const st = panelDiv?._state;
                if (!st) return;
                const { P, enforceCouplings } = st;
                const key = slider.elt.dataset.key;
                const oldValue = P[key];
                const value = slider.checked();

                // Update model immediately
                P[key] = value;

                // Apply couplings and refresh panel
                enforceCouplings(P);
                refreshPanelValues(P);

                // Verbose logging with timestamp and frame information
                console.log(
                    `[Param Update] ${new Date().toISOString()} | Checkbox Toggle | ${key}: ${oldValue} → ${value} | Frame: ${frameCount || 'N/A'}`
                );
            });
        } else {
            // Handle slider changes (existing logic)
            // Live input updates with real-time model synchronization
            slider.input(() => {
                const st = panelDiv?._state;
                if (!st) return;
                const { P, enforceCouplings } = st;
                const key = slider.elt.dataset.key;
                const raw = slider.value();
                const oldValue = P[key];
                const value = INT_KEYS.has(key) ? Math.round(raw) : Number(raw);

                // Update model immediately
                P[key] = value;

                // Auto-enable post-FX when their amplitude parameters are adjusted
                if (key === 'distortAmp' && value > 0 && !P.noiseEnabled) {
                    P.noiseEnabled = true;
                }
                if (key === 'chromaAmount' && value > 0 && !P.chromaEnabled) {
                    P.chromaEnabled = true;
                }
                if (key === 'fbmAmp' && value > 0 && !P.fbmEnabled) {
                    P.fbmEnabled = true;
                }

                // Apply couplings and refresh panel
                enforceCouplings(P);
                refreshPanelValues(P);

                // Verbose logging with timestamp and frame information
                console.log(
                    `[Param Update] ${new Date().toISOString()} | Slider Input | ${key}: ${oldValue} → ${value} | Frame: ${frameCount || 'N/A'}`
                );
            });

            // Apply couplings and refresh only after user finishes adjusting
            slider.changed(() => {
                const st = panelDiv?._state;
                if (!st) return;
                const { P, enforceCouplings, onChange } = st;
                const key = slider.elt.dataset.key;
                const raw = slider.value();
                P[key] = INT_KEYS.has(key) ? Math.round(raw) : Number(raw);
                enforceCouplings(P);
                refreshPanelValues(P);
                if (onChange) onChange(key, P[key]);
            });
        }
    }

    // Initial sync
    refreshPanelValues(P);
    return panelDiv;
}

/**
 * Synchronizes UI controls with current parameter values.
 *
 * @param {Object} [PArg] - Optional parameters object (uses stored state if omitted).
 */
export function refreshPanelValues(PArg) {
    if (!panelDiv) return;
    const st = panelDiv._state || {};
    const P = PArg || st.P;
    if (!P || !panelDiv._ui) return;

    for (const k in panelDiv._ui) {
        const { slider, span } = panelDiv._ui[k];
        if (Object.prototype.hasOwnProperty.call(P, k)) {
            // Check if this is a boolean (checkbox) or numeric (slider)
            if (typeof P[k] === 'boolean') {
                slider.checked(P[k]);
            } else {
                slider.value(P[k]);
            }
            span.html(formatVal(P[k]));
        }
    }
}

export function togglePanel(show) {
    if (!panelDiv) return;
    panelDiv.style('display', show ? 'block' : 'none');
}

// ---------- helpers ----------
function stylePanel(wrap) {
    wrap.style('position', 'fixed');
    wrap.style('top', '0');
    wrap.style('right', '0');
    wrap.style('bottom', '0');
    wrap.style('width', '360px');
    wrap.style('height', '100vh');
    wrap.style('overflow-y', 'auto');
    wrap.style('overflow-x', 'hidden');
    wrap.style('background', 'rgba(0,0,0,0.92)');
    wrap.style('color', '#fff');
    wrap.style('font-family', 'monospace');
    wrap.style('font-size', '12px');
    wrap.style('padding', '20px 16px');
    wrap.style('z-index', '9999');
    wrap.style('border-left', '2px solid #555');
    wrap.style('box-shadow', '-4px 0 12px rgba(0,0,0,0.5)');
    wrap.style('box-sizing', 'border-box');

    // Custom scrollbar styling via CSS class
    wrap.addClass('param-panel');
    
    // Inject CSS for scrollbar styling if not already present
    if (!document.getElementById('param-panel-styles')) {
        const style = document.createElement('style');
        style.id = 'param-panel-styles';
        style.textContent = `
            .param-panel::-webkit-scrollbar {
                width: 8px;
            }
            .param-panel::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.3);
            }
            .param-panel::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.2);
                border-radius: 4px;
            }
            .param-panel::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

function addGroupHeader(parent, title) {
    const h = createElement('div', title).parent(parent);
    h.style('margin', '16px 0 8px');
    h.style('font-size', '11px');
    h.style('font-weight', 'bold');
    h.style('text-transform', 'uppercase');
    h.style('letter-spacing', '0.5px');
    h.style('color', '#888');
}

function addRow(parent, key, P, range) {
    const row = createDiv('').parent(parent);
    row.style('margin', '12px 0');
    row.style('display', 'flex');
    row.style('flex-direction', 'column');
    row.style('gap', '4px');

    // Label and value on same line
    const labelRow = createDiv('').parent(row);
    labelRow.style('display', 'flex');
    labelRow.style('justify-content', 'space-between');
    labelRow.style('align-items', 'center');

    const label = createSpan(key).parent(labelRow);
    label.style('font-size', '11px');
    label.style('color', '#ccc');

    const val = createSpan(formatVal(P[key])).parent(labelRow);
    val.id(`${key}_value`);
    val.style('color', '#0f0');
    val.style('font-size', '11px');
    val.style('font-weight', 'bold');

    // Detect boolean values and render checkbox instead of slider
    if (typeof P[key] === 'boolean') {
        const checkbox = createCheckbox('', P[key]).parent(row);
        checkbox.style('margin-left', '6px');
        checkbox.style('transform', 'scale(1.2)');

        panelDiv._ui[key] = { slider: checkbox, span: val };
    } else {
        const [mn, mx, step] = range;
        const s = createSlider(mn, mx, P[key], step).parent(row);
        s.style('width', '100%');

        panelDiv._ui[key] = { slider: s, span: val };
    }
}

function pickRange(key, P, R) {
    // If R is provided and has the key, use it with validation
    if (R && Object.prototype.hasOwnProperty.call(R, key)) {
        const range = R[key];

        // Validate that range is an array
        if (!Array.isArray(range)) {
            throw new Error(
                `pickRange: R["${key}"] must be an array, got ${typeof range}`
            );
        }

        // Validate minimum length (must have at least min and max)
        if (range.length < 2) {
            throw new Error(
                `pickRange: R["${key}"] must have at least 2 elements [min, max], got ${range.length}`
            );
        }

        // Validate that min and max are numbers
        if (typeof range[0] !== 'number' || typeof range[1] !== 'number') {
            throw new Error(
                `pickRange: R["${key}"] min and max must be numbers, got [${typeof range[0]}, ${typeof range[1]}]`
            );
        }

        // Validate that min <= max
        if (range[0] > range[1]) {
            throw new Error(
                `pickRange: R["${key}"] min (${range[0]}) must be <= max (${range[1]})`
            );
        }

        // Handle 2-element case: default to a sensible step value
        if (range.length === 2) {
            const [min, max] = range;
            const diff = max - min;

            // Choose step based on range magnitude and whether it's an integer key
            let step;
            if (INT_KEYS.has(key)) {
                // For integer parameters, use step of 1
                step = 1;
            } else if (diff >= 100) {
                // Large ranges: step = 1% of range
                step = diff * 0.01;
            } else if (diff >= 10) {
                // Medium ranges: step = 0.1% of range
                step = diff * 0.001;
            } else {
                // Small ranges: step = 0.01% of range or minimum 0.001
                step = Math.max(diff * 0.0001, 0.001);
            }

            return [min, max, step];
        }

        // Handle 3+ element case: validate step if provided
        if (range.length >= 3) {
            if (typeof range[2] !== 'number') {
                throw new Error(
                    `pickRange: R["${key}"] step must be a number, got ${typeof range[2]}`
                );
            }

            if (range[2] <= 0) {
                throw new Error(
                    `pickRange: R["${key}"] step must be positive, got ${range[2]}`
                );
            }

            return [range[0], range[1], range[2]];
        }
    }

    // Generic fallback for all parameters
    return [0, 1, 0.01];
}

function formatVal(v) {
    if (typeof v === 'boolean') {
        return v ? 'true' : 'false';
    }
    return typeof v === 'number'
        ? Number.isInteger(v)
            ? String(v)
            : Number(v).toFixed(3)
        : String(v);
}
