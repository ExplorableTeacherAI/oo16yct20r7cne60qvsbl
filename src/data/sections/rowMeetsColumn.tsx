/**
 * Section 2 — Row Meets Column
 * ============================
 * Bespoke figure: the canteen orders grid (A), the shop prices grid (B) and the
 * bills grid (C = AB) laid out so that a row of A and a column of B literally
 * cross at the cell they produce. The student drags a teal selector across the
 * bills grid; each visited cell reveals itself and its two-product working.
 */

import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

/** Orders: rows are students (Maya, Sam), columns are items (samosa, juice). */
const ORDERS = [
    [3, 2],
    [1, 4],
];
/** Prices: rows are items (samosa, juice), columns are shops (X, Y). */
const PRICES = [
    [2, 3],
    [5, 4],
];
const BILLS = ORDERS.map((row) => PRICES[0].map((_, j) => row[0] * PRICES[0][j] + row[1] * PRICES[1][j]));

const CELL_NAMES = ["Maya at Shop X", "Maya at Shop Y", "Sam at Shop X", "Sam at Shop Y"];

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 280;
const CELL_W = 50;
const CELL_H = 42;
const A_X = 64;
const A_Y = 146;
const B_X = 196;
const B_Y = 50;
const C_X = 196;
const C_Y = 146;
const WORK_X = 320;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const ACCENT = "#62D0AD"; // the order row — the manipulated pairing
const ACCENT_TWO = "#8E90F5"; // the price column — its covariation partner

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

function MatrixGrid({
    x,
    y,
    values,
    valueFor,
    color = INK,
}: {
    x: number;
    y: number;
    values: number[][];
    valueFor?: (row: number, col: number) => string;
    color?: string;
}) {
    return (
        <g>
            {values.map((row, i) =>
                row.map((value, j) => (
                    <g key={`${i}-${j}`}>
                        <rect
                            x={x + j * CELL_W}
                            y={y + i * CELL_H}
                            width={CELL_W}
                            height={CELL_H}
                            fill="none"
                            stroke={INK_QUIET}
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                        <text
                            x={x + j * CELL_W + CELL_W / 2}
                            y={y + i * CELL_H + CELL_H / 2 + 6}
                            textAnchor="middle"
                            fontSize="17"
                            fill={color}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {valueFor ? valueFor(i, j) : value}
                        </text>
                    </g>
                )),
            )}
        </g>
    );
}

function RowMeetsColumnFigure() {
    const setVar = useSetVar();
    const index = useVar<number>("productCellIndex", 0);
    const highlight = useVar<string>("rowColumnHighlight", "");

    const [visited, setVisited] = useState<number[]>([0]);
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const row = Math.floor(index / 2);
    const col = index % 2;

    useEffect(() => {
        setVisited((seen) => (seen.includes(index) ? seen : [...seen, index]));
    }, [index]);

    const knobScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });
    const selectorX = useSpring(C_X + col * CELL_W, { stiffness: 260, damping: 24 });
    const selectorY = useSpring(C_Y + row * CELL_H, { stiffness: 260, damping: 24 });

    const pickCell = (event: React.PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        const py = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        const nextCol = clamp(Math.floor((px - C_X) / CELL_W), 0, 1);
        const nextRow = clamp(Math.floor((py - C_Y) / CELL_H), 0, 1);
        setVar("productCellIndex", nextRow * 2 + nextCol);
    };

    // Linked-highlight contract: pop the target, recede everything else.
    const dim = (id: string) => (highlight && highlight !== id ? 0.32 : 1);
    const rowActive = highlight === "orderRow";
    const columnActive = highlight === "priceColumn";
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("rowColumnHighlight", id),
        onPointerLeave: () => setVar("rowColumnHighlight", ""),
    });

    const firstProduct = ORDERS[row][0] * PRICES[0][col];
    const secondProduct = ORDERS[row][1] * PRICES[1][col];

    return (
        <Figure
            id="row-meets-column"
            onReset={() => {
                setVar("productCellIndex", 0);
                setVar("rowColumnHighlight", "");
                setVisited([0]);
            }}
            caption="Orders on the left, prices on top, bills in the corner. Drag the teal selector across the bills grid — the row and the column that produce each bill light up as you go."
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="Order matrix multiplied by price matrix, with a draggable selector over the resulting bills"
            >
                <defs>
                    <filter id="row-column-knob-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Bands: the row of orders and the column of prices, crossing at the selected bill. */}
                <g style={EASE_150}>
                    <rect
                        x={A_X}
                        y={C_Y + row * CELL_H}
                        width={C_X + 2 * CELL_W - A_X}
                        height={CELL_H}
                        fill={ACCENT}
                        opacity={rowActive ? 0.34 : columnActive ? 0.06 : 0.16}
                        rx="6"
                        {...hoverProps("orderRow")}
                    />
                    <rect
                        x={B_X + col * CELL_W}
                        y={B_Y}
                        width={CELL_W}
                        height={C_Y + 2 * CELL_H - B_Y}
                        fill={ACCENT_TWO}
                        opacity={columnActive ? 0.34 : rowActive ? 0.06 : 0.16}
                        rx="6"
                        {...hoverProps("priceColumn")}
                    />
                </g>

                {/* Direct labels. */}
                <g fontSize="13" fill={INK_STRUCTURE} style={EASE_150}>
                    <text x={B_X + CELL_W / 2} y={40} textAnchor="middle" opacity={dim("priceColumn")}>
                        Shop X
                    </text>
                    <text x={B_X + CELL_W + CELL_W / 2} y={40} textAnchor="middle" opacity={dim("priceColumn")}>
                        Shop Y
                    </text>
                    <text x={A_X + CELL_W / 2} y={138} textAnchor="middle" opacity={dim("orderRow")}>
                        samosa
                    </text>
                    <text x={A_X + CELL_W + CELL_W / 2} y={138} textAnchor="middle" opacity={dim("orderRow")}>
                        juice
                    </text>
                    <text x={A_X - 8} y={A_Y + 26} textAnchor="end" opacity={dim("orderRow")}>
                        Maya
                    </text>
                    <text x={A_X - 8} y={A_Y + CELL_H + 26} textAnchor="end" opacity={dim("orderRow")}>
                        Sam
                    </text>
                    <text x={C_X + CELL_W} y={252} textAnchor="middle" opacity={dim("")}>
                        what each student pays at each shop
                    </text>
                </g>

                {/* The three grids. */}
                <g opacity={dim("orderRow")} style={EASE_150}>
                    <MatrixGrid x={A_X} y={A_Y} values={ORDERS} />
                </g>
                <g opacity={dim("priceColumn")} style={EASE_150}>
                    <MatrixGrid x={B_X} y={B_Y} values={PRICES} />
                </g>
                <MatrixGrid
                    x={C_X}
                    y={C_Y}
                    values={BILLS}
                    color={INK}
                    valueFor={(i, j) => (visited.includes(i * 2 + j) ? String(BILLS[i][j]) : "?")}
                />

                {/* The working for the selected bill — beside the drawing, never over it. */}
                <g style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                    <text x={WORK_X} y={160} fontSize="13" fill={INK_STRUCTURE}>
                        {CELL_NAMES[index]}
                    </text>
                    <text x={WORK_X} y={194} fontSize="17" fill={INK}>
                        <tspan fill={ACCENT}>{ORDERS[row][0]}</tspan>
                        {" × "}
                        <tspan fill={ACCENT_TWO}>{PRICES[0][col]}</tspan>
                        {`  +  `}
                        <tspan fill={ACCENT}>{ORDERS[row][1]}</tspan>
                        {" × "}
                        <tspan fill={ACCENT_TWO}>{PRICES[1][col]}</tspan>
                    </text>
                    <text x={WORK_X} y={224} fontSize="17" fill={INK} fontWeight="600">
                        {`= ${firstProduct} + ${secondProduct} = ${BILLS[row][col]}`}
                    </text>
                </g>

                {/* The selector: ring + halo + grab knob, spring-eased between cells. */}
                <g>
                    <rect
                        x={selectorX}
                        y={selectorY}
                        width={CELL_W}
                        height={CELL_H}
                        rx="6"
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="9"
                        opacity="0.26"
                    />
                    <rect
                        x={selectorX}
                        y={selectorY}
                        width={CELL_W}
                        height={CELL_H}
                        rx="6"
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="3.5"
                    />
                    <g transform={`translate(${selectorX} ${selectorY}) scale(${knobScale})`}>
                        <circle r="12" fill={ACCENT} filter="url(#row-column-knob-shadow)" />
                    </g>
                </g>

                {/* Oversized pointer surface over the bills grid. */}
                <rect
                    x={C_X - 16}
                    y={C_Y - 16}
                    width={2 * CELL_W + 32}
                    height={2 * CELL_H + 32}
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        draggingRef.current = true;
                        setDragging(true);
                        pickCell(event);
                    }}
                    onPointerMove={(event) => {
                        if (!draggingRef.current) return;
                        pickCell(event);
                    }}
                    onPointerUp={() => {
                        draggingRef.current = false;
                        setDragging(false);
                    }}
                    onPointerCancel={() => {
                        draggingRef.current = false;
                        setDragging(false);
                    }}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                />
            </svg>

            <div className="px-6 pb-5">
                <FigureSlider
                    varName="productCellIndex"
                    label="Bill shown"
                    {...numberPropsFromDefinition(getVariableInfo("productCellIndex"))}
                    formatValue={(v) => CELL_NAMES[clamp(Math.round(v), 0, 3)]}
                />
            </div>

            <InteractionHintSequence
                hintKey="row-meets-column-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal selector to another bill",
                        position: { x: "37%", y: "56%" },
                        dragPath: { type: "line", startOffset: { x: -18, y: -12 }, endOffset: { x: 18, y: 12 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const rowMeetsColumnBlocks: ReactElement[] = [
    <StackLayout key="layout-row-column-heading" maxWidth="xl">
        <Block id="row-column-heading" padding="md">
            <EditableH2 id="h2-row-column-heading" blockId="row-column-heading">
                Row Meets Column
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-setup" maxWidth="xl">
        <Block id="row-column-setup" padding="sm">
            <EditableParagraph id="para-row-column-setup" blockId="row-column-setup">
                Maya and Sam's orders sit on the left, and the two shops' prices sit on
                top. A single bill appears where one{" "}
                <InlineLinkedHighlight
                    varName="rowColumnHighlight"
                    highlightId="orderRow"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("rowColumnHighlight"))}
                >
                    row of orders
                </InlineLinkedHighlight>{" "}
                crosses one{" "}
                <InlineLinkedHighlight
                    varName="rowColumnHighlight"
                    highlightId="priceColumn"
                    color="#8E90F5"
                    bgColor="rgba(142, 144, 245, 0.18)"
                >
                    column of prices
                </InlineLinkedHighlight>
                . Drag the teal selector over the three hidden bills and watch the working
                build itself.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-figure" maxWidth="xl">
        <Block id="row-column-figure" padding="sm" hasVisualization>
            <RowMeetsColumnFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-insight" maxWidth="xl">
        <Block id="row-column-insight" padding="sm">
            <EditableParagraph id="para-row-column-insight" blockId="row-column-insight">
                Every bill is two multiplications added together, never one, which is
                exactly why two matrices cannot be multiplied cell by cell. The same rule
                applies whether the elements are positive or negative, since a negative
                element simply pulls the total down instead of pushing it up.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-formula" maxWidth="xl">
        <Block id="row-column-formula" padding="lg">
            <FormulaBlock
                latex="c_{ij} = \clr{row}{a_{i1}}\,\clr{col}{b_{1j}} + \clr{row}{a_{i2}}\,\clr{col}{b_{2j}}"
                colorMap={{ row: "#62D0AD", col: "#8E90F5" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-question-method" maxWidth="xl">
        <Block id="row-column-question-method" padding="md">
            <EditableParagraph id="para-row-column-question-method" blockId="row-column-question-method">
                So to build one entry of a product you{" "}
                <InlineFeedback
                    varName="answerEntryMethod"
                    correctValue="multiply a row by a column and add"
                    position="terminal"
                    successMessage="— yes, one row, one column, pair them off and add"
                    failureMessage="— not quite."
                    hint="Look again at how a single bill was built in the grid above"
                    reviewBlockId="row-column-figure"
                    reviewLabel="Back to the bills grid"
                >
                    <InlineClozeChoice
                        varName="answerEntryMethod"
                        correctAnswer="multiply a row by a column and add"
                        options={["multiply the matching entries", "multiply a row by a column and add", "add the two matrices"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerEntryMethod"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-question-entry" maxWidth="xl">
        <Block id="row-column-question-entry" padding="md">
            <EditableParagraph id="para-row-column-question-entry" blockId="row-column-question-entry">
                A different shop, a different order. When the row (2, 5) meets the column
                (4, 3), the entry they produce is{" "}
                <InlineFeedback
                    varName="answerProductEntry"
                    correctValue="23"
                    position="terminal"
                    successMessage="— exactly, 2 × 4 = 8 and 5 × 3 = 15, and the entry is the total, 23"
                    failureMessage="— almost."
                    hint="Two products are needed here, and then they are added"
                    visualizationHint={{
                        blockId: "row-column-figure",
                        hintKey: "row-column-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: { productCellIndex: 0 },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the selector down to Sam at Shop X — watch two products appear",
                                position: { x: "37%", y: "62%" },
                                completionVar: "productCellIndex",
                                completionValue: 2,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag",
                                label: "Now slide it right to Sam at Shop Y — the two products are added, never one alone",
                                position: { x: "45%", y: "62%" },
                                completionVar: "productCellIndex",
                                completionValue: 3,
                                completionTolerance: 0.4,
                            },
                        ],
                    }}
                >
                    <InlineClozeInput
                        varName="answerProductEntry"
                        correctAnswer="23"
                        {...clozePropsFromDefinition(getVariableInfo("answerProductEntry"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
