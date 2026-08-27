/**
 * Section 3 — Does It Even Fit?
 * =============================
 * Bespoke figure: two matrices drawn as blocks whose width is their column
 * count and whose height is their row count. The student drags the teal handle
 * on A's right edge and the indigo handle under B; the blocks only dock when
 * A's columns equal B's rows, and only then does the product's shape appear.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    numberPropsFromDefinition,
} from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

const A_ROWS = 3; // fixed
const B_COLUMNS = 2; // fixed
const MIN_INNER = 1;
const MAX_INNER = 4;

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 290;
const UNIT = 26; // one cell
const A_LEFT = 116;
const CENTER_Y = 140;
const LABEL_Y = 216;
const VERDICT_Y = 252;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const ACCENT = "#62D0AD"; // A's columns — the inner number on the left
const ACCENT_TWO = "#8E90F5"; // B's rows — the inner number on the right

function BlockGrid({
    x,
    y,
    columns,
    rows,
    stroke,
}: {
    x: number;
    y: number;
    columns: number;
    rows: number;
    stroke: string;
}) {
    const cells: ReactElement[] = [];
    for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < columns; j += 1) {
            cells.push(
                <rect
                    key={`${i}-${j}`}
                    x={x + j * UNIT}
                    y={y + i * UNIT}
                    width={UNIT}
                    height={UNIT}
                    fill="none"
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                />,
            );
        }
    }
    return (
        <g>
            {cells}
            <rect
                x={x}
                y={y}
                width={columns * UNIT}
                height={rows * UNIT}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinejoin="round"
                rx="3"
            />
        </g>
    );
}

function DoesItFitFigure() {
    const setVar = useSetVar();
    const columnsOfA = useVar<number>("matrixAColumns", 3);
    const rowsOfB = useVar<number>("matrixBRows", 2);

    const [draggingHandle, setDraggingHandle] = useState<"" | "columns" | "rows">("");
    const [hoveredHandle, setHoveredHandle] = useState<"" | "columns" | "rows">("");
    const draggingRef = useRef<"" | "columns" | "rows">("");
    const svgRef = useRef<SVGSVGElement>(null);

    const fits = columnsOfA === rowsOfB;
    const gap = useSpring(fits ? 8 : 48, { stiffness: 180, damping: 20 });
    const productReveal = useSpring(fits ? 1 : 0, { stiffness: 200, damping: 24 });

    const columnsScale = useSpring(
        draggingHandle === "columns" || hoveredHandle === "columns" ? 1.15 : 1,
        { stiffness: 400, damping: 26 },
    );
    const rowsScale = useSpring(
        draggingHandle === "rows" || hoveredHandle === "rows" ? 1.15 : 1,
        { stiffness: 400, damping: 26 },
    );

    const aWidth = columnsOfA * UNIT;
    const aHeight = A_ROWS * UNIT;
    const aTop = CENTER_Y - aHeight / 2;
    const aRight = A_LEFT + aWidth;

    const bHeight = rowsOfB * UNIT;
    const bWidth = B_COLUMNS * UNIT;
    const bLeft = aRight + gap;
    const bTop = CENTER_Y - bHeight / 2;
    const bBottom = bTop + bHeight;

    const equalsX = bLeft + bWidth + 34;
    const productLeft = equalsX + 30;
    const productTop = CENTER_Y - (A_ROWS * UNIT) / 2;

    const svgPoint = (event: React.PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
        };
    };

    const handleMove = (event: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const point = svgPoint(event);
        if (draggingRef.current === "columns") {
            const next = Math.round((point.x - A_LEFT) / UNIT);
            setVar("matrixAColumns", clamp(next, MIN_INNER, MAX_INNER));
        } else {
            const next = Math.round(((point.y - CENTER_Y) * 2) / UNIT);
            setVar("matrixBRows", clamp(next, MIN_INNER, MAX_INNER));
        }
    };

    const startDrag = (which: "columns" | "rows") => (event: React.PointerEvent) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        draggingRef.current = which;
        setDraggingHandle(which);
    };
    const endDrag = () => {
        draggingRef.current = "";
        setDraggingHandle("");
    };

    return (
        <Figure
            id="does-it-fit"
            onReset={() => {
                setVar("matrixAColumns", 3);
                setVar("matrixBRows", 2);
            }}
            caption="A is 3 rows tall, B is 2 columns wide. Drag the teal handle on A's right edge and the indigo handle under B until the two inner numbers agree and the blocks dock."
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="Two matrix blocks that only dock together when the columns of A equal the rows of B"
            >
                <defs>
                    <filter id="fit-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Matrix A. */}
                <text x={A_LEFT} y={aTop - 14} fontSize="12" fill={INK_STRUCTURE}>
                    A
                </text>
                <BlockGrid x={A_LEFT} y={aTop} columns={columnsOfA} rows={A_ROWS} stroke={INK_STRUCTURE} />

                {/* Matrix B. */}
                <text x={bLeft} y={CENTER_Y - (MAX_INNER * UNIT) / 2 - 14} fontSize="12" fill={INK_STRUCTURE}>
                    B
                </text>
                <BlockGrid x={bLeft} y={bTop} columns={B_COLUMNS} rows={rowsOfB} stroke={INK_STRUCTURE} />

                {/* The seam: the two inner edges, in their own accents. */}
                <line
                    x1={aRight}
                    y1={aTop}
                    x2={aRight}
                    y2={aTop + aHeight}
                    stroke={ACCENT}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
                <line
                    x1={bLeft}
                    y1={bTop}
                    x2={bLeft}
                    y2={bBottom}
                    stroke={ACCENT_TWO}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />

                {/* Shape labels, directly under each block. */}
                <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <text x={A_LEFT + aWidth / 2} y={LABEL_Y} textAnchor="middle" fill={INK}>
                        <tspan>{A_ROWS}</tspan>
                        <tspan fill={INK_STRUCTURE}> × </tspan>
                        <tspan fill={ACCENT} fontWeight="600">{columnsOfA}</tspan>
                    </text>
                    <text x={bLeft + bWidth / 2} y={LABEL_Y} textAnchor="middle" fill={INK}>
                        <tspan fill={ACCENT_TWO} fontWeight="600">{rowsOfB}</tspan>
                        <tspan fill={INK_STRUCTURE}> × </tspan>
                        <tspan>{B_COLUMNS}</tspan>
                    </text>
                </g>

                {/* The product's shape — only exists when the inner numbers agree. */}
                <g opacity={productReveal}>
                    <text x={equalsX} y={CENTER_Y + 6} fontSize="18" fill={INK_STRUCTURE} textAnchor="middle">
                        =
                    </text>
                    <text x={productLeft} y={productTop - 14} fontSize="12" fill={INK_STRUCTURE}>
                        AB
                    </text>
                    <BlockGrid
                        x={productLeft}
                        y={productTop}
                        columns={B_COLUMNS}
                        rows={A_ROWS}
                        stroke={INK_STRUCTURE}
                    />
                    <text
                        x={productLeft + (B_COLUMNS * UNIT) / 2}
                        y={LABEL_Y}
                        textAnchor="middle"
                        fontSize="12"
                        fill={INK}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {`${A_ROWS} × ${B_COLUMNS}`}
                    </text>
                </g>

                {/* Verdict, beside the drawing rather than over it. */}
                <text
                    x={VIEW_WIDTH / 2}
                    y={VERDICT_Y}
                    textAnchor="middle"
                    fontSize="13"
                    fill={fits ? INK : INK_STRUCTURE}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {fits
                        ? `inner numbers agree: ${columnsOfA} = ${rowsOfB}, so the product exists`
                        : `inner numbers differ: ${columnsOfA} ≠ ${rowsOfB}, so there is no product`}
                </text>

                {/* Handle: A's columns. */}
                <g transform={`translate(${aRight} ${CENTER_Y}) scale(${columnsScale})`}>
                    <circle r="12" fill={ACCENT} filter="url(#fit-handle-shadow)" />
                </g>
                <circle
                    cx={aRight}
                    cy={CENTER_Y}
                    r="24"
                    fill="transparent"
                    style={{ cursor: draggingHandle === "columns" ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={startDrag("columns")}
                    onPointerMove={handleMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerEnter={() => setHoveredHandle("columns")}
                    onPointerLeave={() => setHoveredHandle("")}
                />

                {/* Handle: B's rows. */}
                <g transform={`translate(${bLeft + bWidth / 2} ${bBottom}) scale(${rowsScale})`}>
                    <circle r="12" fill={ACCENT_TWO} filter="url(#fit-handle-shadow)" />
                </g>
                <circle
                    cx={bLeft + bWidth / 2}
                    cy={bBottom}
                    r="24"
                    fill="transparent"
                    style={{ cursor: draggingHandle === "rows" ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={startDrag("rows")}
                    onPointerMove={handleMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerEnter={() => setHoveredHandle("rows")}
                    onPointerLeave={() => setHoveredHandle("")}
                />
            </svg>

            <InteractionHintSequence
                hintKey="does-it-fit-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal handle to change A's columns",
                        position: { x: "35%", y: "48%" },
                        dragPath: { type: "line", startOffset: { x: -26, y: 0 }, endOffset: { x: 26, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const doesItFitBlocks: ReactElement[] = [
    <StackLayout key="layout-fit-heading" maxWidth="xl">
        <Block id="fit-heading" padding="md">
            <EditableH2 id="h2-fit-heading" blockId="fit-heading">
                Does It Even Fit?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fit-setup" maxWidth="xl">
        <Block id="fit-setup" padding="sm">
            <EditableParagraph id="para-fit-setup" blockId="fit-setup">
                A row can only pair off with a column if they are the same length, so two
                matrices have to agree about the middle. Here A has{" "}
                <InlineScrubbleNumber
                    varName="matrixAColumns"
                    {...numberPropsFromDefinition(getVariableInfo("matrixAColumns"))}
                />{" "}
                columns waiting for B's rows. Drag the teal handle on A's right edge, or
                the indigo handle under B, until the two blocks dock.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fit-figure" maxWidth="xl">
        <Block id="fit-figure" padding="sm" hasVisualization>
            <DoesItFitFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fit-insight" maxWidth="xl">
        <Block id="fit-insight" padding="sm">
            <EditableParagraph id="para-fit-insight" blockId="fit-insight">
                When they lock, the two inner numbers cancel each other out and only the
                outer ones survive. A 3 by 3 meeting a 3 by 2 always leaves a 3 by 2
                answer, whatever the numbers inside happen to be.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fit-question-possible" maxWidth="xl">
        <Block id="fit-question-possible" padding="md">
            <EditableParagraph id="para-fit-question-possible" blockId="fit-question-possible">
                So a 3 by 2 matrix multiplied by another 3 by 2 matrix is{" "}
                <InlineFeedback
                    varName="answerFitPossible"
                    correctValue="not possible"
                    position="terminal"
                    successMessage="— right, 2 columns cannot pair off with 3 rows"
                    failureMessage="— have another look."
                    hint="Compare the inner pair of numbers: 2 and 3"
                    visualizationHint={{
                        blockId: "fit-figure",
                        hintKey: "fit-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: { matrixAColumns: 3, matrixBRows: 2 },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the teal handle until A has 2 columns — the blocks dock",
                                position: { x: "35%", y: "48%" },
                                completionVar: "matrixAColumns",
                                completionValue: 2,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag-vertical",
                                label: "Now drag the indigo handle to give B 3 rows — watch them break apart",
                                position: { x: "50%", y: "64%" },
                                completionVar: "matrixBRows",
                                completionValue: 3,
                                completionTolerance: 0.4,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerFitPossible"
                        correctAnswer="not possible"
                        options={["not possible", "possible, giving a 3 by 2 result", "possible, giving a 2 by 2 result"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerFitPossible"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fit-question-order" maxWidth="xl">
        <Block id="fit-question-order" padding="md">
            <EditableParagraph id="para-fit-question-order" blockId="fit-question-order">
                A 4 by 2 matrix multiplied by a 2 by 5 matrix does work, and the answer has
                order{" "}
                <InlineFeedback
                    varName="answerProductOrder"
                    correctValue={["4x5", "4×5", "4 by 5", "4*5", "4 x 5"]}
                    position="terminal"
                    successMessage="— exactly, the 2s cancel and the outer numbers stay"
                    failureMessage="— not that one."
                    hint="Write it as rows by columns, using the two outer numbers"
                    reviewBlockId="fit-figure"
                    reviewLabel="Back to the docking blocks"
                >
                    <InlineClozeInput
                        varName="answerProductOrder"
                        correctAnswer={["4x5", "4×5", "4 by 5", "4*5", "4 x 5"]}
                        {...clozePropsFromDefinition(getVariableInfo("answerProductOrder"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
