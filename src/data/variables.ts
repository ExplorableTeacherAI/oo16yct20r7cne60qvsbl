/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // SECTION 2 — Row meets column
    // ─────────────────────────────────────────
    productCellIndex: {
        defaultValue: 0,
        type: 'number',
        label: 'Result cell',
        description: 'Which cell of the cost matrix the selector sits on (0 top-left, 1 top-right, 2 bottom-left, 3 bottom-right)',
        min: 0,
        max: 3,
        step: 1,
        color: '#62D0AD',
    },
    rowColumnHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Row column highlight',
        description: 'Which part of the multiplication is highlighted: order-row or price-column',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    answerProductEntry: {
        defaultValue: '',
        type: 'text',
        label: 'Row times column answer',
        description: 'Student answer for one entry of a product matrix',
        placeholder: '???',
        correctAnswer: '23',
        color: '#62D0AD',
    },
    answerEntryMethod: {
        defaultValue: '',
        type: 'select',
        label: 'How one entry is made',
        description: 'Student choice for how a single entry of a product is built',
        placeholder: '???',
        correctAnswer: 'multiply a row by a column and add',
        options: ['multiply the matching entries', 'multiply a row by a column and add', 'add the two matrices'],
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 3 — Does it even fit?
    // ─────────────────────────────────────────
    matrixAColumns: {
        defaultValue: 3,
        type: 'number',
        label: 'Columns of A',
        description: 'Number of columns in the left matrix A',
        min: 1,
        max: 4,
        step: 1,
        color: '#62D0AD',
    },
    matrixBRows: {
        defaultValue: 2,
        type: 'number',
        label: 'Rows of B',
        description: 'Number of rows in the right matrix B',
        min: 1,
        max: 4,
        step: 1,
        color: '#8E90F5',
    },
    answerFitPossible: {
        defaultValue: '',
        type: 'select',
        label: 'Is the product possible',
        description: 'Student choice for whether a 3x2 times 3x2 product exists',
        placeholder: '???',
        correctAnswer: 'not possible',
        options: ['not possible', 'possible, giving a 3 by 2 result', 'possible, giving a 2 by 2 result'],
        color: '#8E90F5',
    },
    answerProductOrder: {
        defaultValue: '',
        type: 'text',
        label: 'Order of the product',
        description: 'Student answer for the order of a 4x2 times 2x5 product',
        placeholder: '???',
        correctAnswer: ['4x5', '4×5', '4 by 5', '4*5', '4 x 5'],
        color: '#62D0AD',
    },

    // ─────────────────────────────────────────
    // SECTION 4 — Why AB is not BA
    // ─────────────────────────────────────────
    stretchFactor: {
        defaultValue: 1,
        type: 'number',
        label: 'Stretch factor',
        description: 'How much the stretch matrix widens the shape along x',
        min: 1,
        max: 2.5,
        step: 0.1,
        color: '#62D0AD',
    },
    orderMattersHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Order matters highlight',
        description: 'Which of the two orderings is highlighted: stretch-first or rotate-first',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    answerCommute: {
        defaultValue: '',
        type: 'select',
        label: 'When matrices commute',
        description: 'Student choice for how often AB equals BA',
        placeholder: '???',
        correctAnswer: 'only in special cases',
        options: ['always', 'never', 'only in special cases'],
        color: '#8E90F5',
    },
    answerAbTopLeft: {
        defaultValue: '',
        type: 'text',
        label: 'Top-left entry of AB',
        description: 'Student answer for the top-left entry of AB',
        placeholder: '???',
        correctAnswer: '7',
        color: '#62D0AD',
    },

    // ─────────────────────────────────────────
    // SECTION 5 — The determinant
    // ─────────────────────────────────────────
    determinantColumn1X: {
        defaultValue: 2,
        type: 'number',
        label: 'First column, x',
        description: 'Top entry of the first column of the transforming matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    determinantColumn1Y: {
        defaultValue: 1,
        type: 'number',
        label: 'First column, y',
        description: 'Bottom entry of the first column of the transforming matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    determinantColumn2X: {
        defaultValue: 1,
        type: 'number',
        label: 'Second column, x',
        description: 'Top entry of the second column of the transforming matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    determinantColumn2Y: {
        defaultValue: 2,
        type: 'number',
        label: 'Second column, y',
        description: 'Bottom entry of the second column of the transforming matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    determinantHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Determinant highlight',
        description: 'Which element of the determinant figure is highlighted: area, column1, column2',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    answerDeterminantValue: {
        defaultValue: '',
        type: 'text',
        label: 'Determinant of a given matrix',
        description: 'Student answer for the determinant of a 2 by 2 matrix',
        placeholder: '???',
        correctAnswer: '2',
        color: '#62D0AD',
    },
    answerCollapsedDeterminant: {
        defaultValue: '',
        type: 'select',
        label: 'Determinant when columns line up',
        description: 'Student choice for the determinant when both columns lie on one line',
        placeholder: '???',
        correctAnswer: '0',
        options: ['0', '1', 'a negative number'],
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 6 — The undo matrix
    // ─────────────────────────────────────────
    inverseColumn1X: {
        defaultValue: 1,
        type: 'number',
        label: 'Undo matrix, first column x',
        description: 'Top entry of the first column of the student undo matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    inverseColumn1Y: {
        defaultValue: 0,
        type: 'number',
        label: 'Undo matrix, first column y',
        description: 'Bottom entry of the first column of the student undo matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },
    inverseColumn2X: {
        defaultValue: 0,
        type: 'number',
        label: 'Undo matrix, second column x',
        description: 'Top entry of the second column of the student undo matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    inverseColumn2Y: {
        defaultValue: 1,
        type: 'number',
        label: 'Undo matrix, second column y',
        description: 'Bottom entry of the second column of the student undo matrix',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#8E90F5',
    },
    inverseHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Inverse highlight',
        description: 'Which element of the undo figure is highlighted: target, moved',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.18)',
    },
    answerInverseMeaning: {
        defaultValue: '',
        type: 'select',
        label: 'What an inverse matrix is',
        description: 'Student choice for the meaning of an inverse matrix',
        placeholder: '???',
        correctAnswer: 'multiplies with it to give the identity',
        options: ['has one over each entry', 'multiplies with it to give the identity', 'swaps the rows and columns'],
        color: '#8E90F5',
    },
    answerInverseEntry: {
        defaultValue: '',
        type: 'text',
        label: 'Bottom-left entry of an inverse',
        description: 'Student answer for the bottom-left entry of the inverse of a 2 by 2 matrix',
        placeholder: '???',
        correctAnswer: ['-2', '−2'],
        color: '#62D0AD',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
