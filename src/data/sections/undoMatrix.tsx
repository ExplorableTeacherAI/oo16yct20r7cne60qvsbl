/**
 * Section 6 — The Inverse Matrix
 * ==============================
 * Bespoke figure: M has already pushed an L away from home, and the student
 * drags the two columns of their own matrix N until N × M puts it back. A
 * quiet control offers the tempting wrong answer — one over each entry — and
 * lets the student watch it fail.
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
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ── Domain model ─────────────────────────────────────────────────────────────

type Point = [number, number];

const SHAPE: Point[] = [
    [0, 0],
    [1, 0],
    [1, 0.35],
    [0.35, 0.35],
    [0.35, 1],
    [0, 1],
];

/** The matrix that pushed the shape away. Its determinant is 1. */
const M = [
    [2, 1],
    [1, 1],
];

const applyPair = (m: number[][], p: Point): Point => [
    m[0][0] * p[0] + m[0][1] * p[1],
    m[1][0] * p[0] + m[1][1] * p[1],
];

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 330;
const UNIT = 34;
const ORIGIN_X = 186;
const ORIGIN_Y = 168;
const RANGE = 3.5;
const RAIL_X = 344;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const GRID = "#F1F5F9";
const ACCENT = "#62D0AD";
const ACCENT_TWO = "#8E90F5";

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const fmtEntry = (v: number) => v.toFixed(1);
const toScreenX = (x: number) => ORIGIN_X + x * UNIT;
const toScreenY = (y: number) => ORIGIN_Y - y * UNIT;
const polygonPoints = (points: Point[]) =>
    points.map(([x, y]) => `${toScreenX(x)},${toScreenY(y)}`).join(" ");

function UndoMatrixFigure() {
    const setVar = useSetVar();
    const n11 = useVar<number>("inverseColumn1X", 1);
    const n21 = useVar<number>("inverseColumn1Y", 0);
    const n12 = useVar<number>("inverseColumn2X", 0);
    const n22 = useVar<number>("inverseColumn2Y", 1);
    const highlight = useVar<string>("inverseHighlight", "");

    const [dragging, setDragging] = useState<"" | "column1" | "column2">("");
    const [hovered, setHovered] = useState<"" | "column1" | "column2">("");
    const draggingRef = useRef<"" | "column1" | "column2">("");
    const svgRef = useRef<SVGSVGElement>(null);

    const N = [
        [n11, n12],
        [n21, n22],
    ];
    // The combined matrix N × M — what the shape has actually been through.
    const combined = [
        [N[0][0] * M[0][0] + N[0][1] * M[1][0], N[0][0] * M[0][1] + N[0][1] * M[1][1]],
        [N[1][0] * M[0][0] + N[1][1] * M[1][0], N[1][0] * M[0][1] + N[1][1] * M[1][1]],
    ];
    const home =
        Math.abs(combined[0][0] - 1) < 0.06 &&
        Math.abs(combined[0][1]) < 0.06 &&
        Math.abs(combined[1][0]) < 0.06 &&
        Math.abs(combined[1][1] - 1) < 0.06;

    const movedShape = SHAPE.map((p) => applyPair(combined, p));

    const dim = (id: string) => (highlight && highlight !== id ? 0.3 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("inverseHighlight", id),
        onPointerLeave: () => setVar("inverseHighlight", ""),
    });

    const handleMove = (event: React.PointerEvent) => {
        const which = draggingRef.current;
        if (!which) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        const py = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        const mx = clamp(Math.round(((px - ORIGIN_X) / UNIT) * 10) / 10, -3, 3);
        const my = clamp(Math.round(((ORIGIN_Y - py) / UNIT) * 10) / 10, -3, 3);
        if (which === "column1") {
            setVar("inverseColumn1X", mx);
            setVar("inverseColumn1Y", my);
        } else {
            setVar("inverseColumn2X", mx);
            setVar("inverseColumn2Y", my);
        }
    };

    const startDrag = (which: "column1" | "column2") => (event: React.PointerEvent) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        draggingRef.current = which;
        setDragging(which);
    };
    const endDrag = () => {
        draggingRef.current = "";
        setDragging("");
    };

    const gridLines: ReactElement[] = [];
    for (let i = -3; i <= 3; i += 1) {
        gridLines.push(
            <line key={`v${i}`} x1={toScreenX(i)} y1={toScreenY(RANGE)} x2={toScreenX(i)} y2={toScreenY(-RANGE)} stroke={GRID} strokeWidth="1" />,
            <line key={`h${i}`} x1={toScreenX(-RANGE)} y1={toScreenY(i)} x2={toScreenX(RANGE)} y2={toScreenY(i)} stroke={GRID} strokeWidth="1" />,
        );
    }

    const columnArrow = (x: number, y: number, color: string, id: "column1" | "column2") => {
        const scale = dragging === id || hovered === id ? 1.15 : 1;
        return (
            <g>
                <line
                    x1={toScreenX(0)}
                    y1={toScreenY(0)}
                    x2={toScreenX(x)}
                    y2={toScreenY(y)}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                />
                <g transform={`translate(${toScreenX(x)} ${toScreenY(y)}) scale(${scale})`}>
                    <circle r="11" fill={color} filter="url(#undo-handle-shadow)" />
                </g>
                <circle
                    cx={toScreenX(x)}
                    cy={toScreenY(y)}
                    r="24"
                    fill="transparent"
                    style={{ cursor: dragging === id ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={startDrag(id)}
                    onPointerMove={handleMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerEnter={() => setHovered(id)}
                    onPointerLeave={() => setHovered("")}
                />
            </g>
        );
    };

    return (
        <Figure
            id="undo-matrix"
            onReset={() => {
                setVar("inverseColumn1X", 1);
                setVar("inverseColumn1Y", 0);
                setVar("inverseColumn2X", 0);
                setVar("inverseColumn2Y", 1);
                setVar("inverseHighlight", "");
            }}
            caption="M has pushed the L away from the dashed outline it started in. Drag the teal and indigo arrow tips until the shape lands back home and N × M becomes the identity."
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="A transformed L shape and two draggable arrows for the undo matrix"
            >
                <defs>
                    <filter id="undo-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                    <clipPath id="undo-plot-clip">
                        <rect x="48" y="38" width="272" height="256" />
                    </clipPath>
                </defs>

                <g clipPath="url(#undo-plot-clip)">
                    {gridLines}
                    <line x1={toScreenX(-RANGE)} y1={toScreenY(0)} x2={toScreenX(RANGE)} y2={toScreenY(0)} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                    <line x1={toScreenX(0)} y1={toScreenY(RANGE)} x2={toScreenX(0)} y2={toScreenY(-RANGE)} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />

                    {/* Home: where the L started, and where it has to come back to. */}
                    <g opacity={dim("target")} style={EASE_150} {...hoverProps("target")}>
                        {isActive("target") && (
                            <polygon points={polygonPoints(SHAPE)} fill="none" stroke={INK_STRUCTURE} strokeWidth="9" opacity="0.2" strokeLinejoin="round" />
                        )}
                        <polygon
                            points={polygonPoints(SHAPE)}
                            fill="none"
                            stroke={INK_STRUCTURE}
                            strokeWidth={isActive("target") ? 3 : 2}
                            strokeDasharray="5 4"
                            strokeLinejoin="round"
                            style={EASE_150}
                        />
                    </g>

                    {/* Where the shape is right now, after N × M. */}
                    <g opacity={dim("shape")} style={EASE_150} {...hoverProps("shape")}>
                        {isActive("shape") && (
                            <polygon points={polygonPoints(movedShape)} fill="none" stroke={ACCENT} strokeWidth="10" opacity="0.26" strokeLinejoin="round" />
                        )}
                        <polygon
                            points={polygonPoints(movedShape)}
                            fill={ACCENT}
                            fillOpacity={home ? 0.32 : 0.15}
                            stroke={ACCENT}
                            strokeWidth={isActive("shape") ? 4 : 3}
                            strokeLinejoin="round"
                            style={EASE_150}
                        />
                    </g>

                    {columnArrow(n11, n21, ACCENT, "column1")}
                    {columnArrow(n12, n22, ACCENT_TWO, "column2")}
                </g>

                {/* Readouts in the rail beside the drawing. */}
                <g style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                    <text x={RAIL_X} y={70} fontSize="13" fill={INK_STRUCTURE}>
                        your matrix N
                    </text>
                    <text x={RAIL_X} y={100} fontSize="13" fill={ACCENT}>
                        first column
                    </text>
                    <text x={RAIL_X} y={124} fontSize="15" fill={ACCENT}>
                        {`(${fmtEntry(n11)}, ${fmtEntry(n21)})`}
                    </text>
                    <text x={RAIL_X} y={156} fontSize="13" fill={ACCENT_TWO}>
                        second column
                    </text>
                    <text x={RAIL_X} y={180} fontSize="15" fill={ACCENT_TWO}>
                        {`(${fmtEntry(n12)}, ${fmtEntry(n22)})`}
                    </text>

                    <text x={RAIL_X} y={214} fontSize="13" fill={INK_STRUCTURE}>
                        N × M
                    </text>
                    <path d={`M ${RAIL_X + 33} 226 L ${RAIL_X + 25} 226 L ${RAIL_X + 25} 276 L ${RAIL_X + 33} 276`} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={`M ${RAIL_X + 137} 226 L ${RAIL_X + 145} 226 L ${RAIL_X + 145} 276 L ${RAIL_X + 137} 276`} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <g fontSize="15" fill={INK} textAnchor="middle">
                        <text x={RAIL_X + 55} y={246}>{fmtEntry(combined[0][0])}</text>
                        <text x={RAIL_X + 115} y={246}>{fmtEntry(combined[0][1])}</text>
                        <text x={RAIL_X + 55} y={270}>{fmtEntry(combined[1][0])}</text>
                        <text x={RAIL_X + 115} y={270}>{fmtEntry(combined[1][1])}</text>
                    </g>

                    <text x={RAIL_X} y={300} fontSize="14" fill={INK} fontWeight={home ? "600" : "400"}>
                        {home ? "N × M is the identity" : "not the identity yet"}
                    </text>
                </g>
            </svg>

            <div className="flex justify-center px-6 pb-5">
                <button
                    type="button"
                    className="rounded-lg px-3 py-1.5 text-[14px] text-[#64748B] transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    onClick={() => {
                        setVar("inverseColumn1X", 0.5);
                        setVar("inverseColumn1Y", 1);
                        setVar("inverseColumn2X", 1);
                        setVar("inverseColumn2Y", 1);
                    }}
                >
                    Try one over each entry of M
                </button>
            </div>

            <InteractionHintSequence
                hintKey="undo-matrix-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal arrow tip below the axis",
                        position: { x: "40%", y: "51%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: -14 }, endOffset: { x: 0, y: 24 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const undoMatrixBlocks: ReactElement[] = [
    <StackLayout key="layout-undo-heading" maxWidth="xl">
        <Block id="undo-heading" padding="md">
            <EditableH2 id="h2-undo-heading" blockId="undo-heading">
                The Inverse Matrix
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-setup" maxWidth="xl">
        <Block id="undo-setup" padding="sm">
            <EditableParagraph id="para-undo-setup" blockId="undo-setup">
                Any matrix that has not squashed a shape flat can be undone, and the
                undoing is a matrix too. M has pushed the L out of the{" "}
                <InlineLinkedHighlight
                    varName="inverseHighlight"
                    highlightId="target"
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.16)"
                >
                    dashed outline it started in
                </InlineLinkedHighlight>
                , so drag the two arrows until the{" "}
                <InlineLinkedHighlight
                    varName="inverseHighlight"
                    highlightId="shape"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("inverseHighlight"))}
                >
                    teal shape
                </InlineLinkedHighlight>{" "}
                is home. Before that, try the tempting shortcut under the figure.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-figure" maxWidth="xl">
        <Block id="undo-figure" padding="sm" hasVisualization>
            <UndoMatrixFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-insight" maxWidth="xl">
        <Block id="undo-insight" padding="sm">
            <EditableParagraph id="para-undo-insight" blockId="undo-insight">
                One over each entry lands nowhere near home, because undoing a matrix was
                never about single entries. The inverse is whichever matrix multiplies with
                M to give the identity, and for a 2 by 2 the determinant hands it to you
                directly.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-formula" maxWidth="xl">
        <Block id="undo-formula" padding="lg">
            <FormulaBlock
                latex="M^{-1} = \frac{1}{\clr{det}{ad - bc}} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}, \qquad M M^{-1} = I"
                colorMap={{ det: "#62D0AD" }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-question-meaning" maxWidth="xl">
        <Block id="undo-question-meaning" padding="md">
            <EditableParagraph id="para-undo-question-meaning" blockId="undo-question-meaning">
                So the inverse of a matrix is the matrix that{" "}
                <InlineFeedback
                    varName="answerInverseMeaning"
                    correctValue="multiplies with it to give the identity"
                    position="terminal"
                    successMessage="— exactly, and the identity is the matrix that leaves every point where it is"
                    failureMessage="— not quite."
                    hint="One over each entry was the guess that failed in the figure"
                    visualizationHint={{
                        blockId: "undo-figure",
                        hintKey: "undo-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: {
                            inverseColumn1X: 1,
                            inverseColumn1Y: 0,
                            inverseColumn2X: 0,
                            inverseColumn2Y: 1,
                        },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the teal arrow tip down to one square below the axis",
                                position: { x: "40%", y: "51%" },
                                completionVar: "inverseColumn1Y",
                                completionValue: -1,
                                completionTolerance: 0.2,
                            },
                            {
                                gesture: "drag",
                                label: "Now pull the indigo tip left and up — the shape drops into the dashed outline",
                                position: { x: "31%", y: "40%" },
                                completionVar: "inverseColumn2X",
                                completionValue: -1,
                                completionTolerance: 0.2,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerInverseMeaning"
                        correctAnswer="multiplies with it to give the identity"
                        options={["has one over each entry", "multiplies with it to give the identity", "swaps the rows and columns"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerInverseMeaning"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-undo-question-entry" maxWidth="xl">
        <Block id="undo-question-entry" padding="md">
            <EditableParagraph id="para-undo-question-entry" blockId="undo-question-entry">
                Take the matrix with rows (3, 1) and (2, 1), whose determinant is 1. The
                bottom-left entry of its inverse is{" "}
                <InlineFeedback
                    varName="answerInverseEntry"
                    correctValue={["-2", "−2"]}
                    position="terminal"
                    successMessage="— correct, the c entry changes sign, so 2 becomes −2"
                    failureMessage="— have another go."
                    hint="The formula swaps a and d, and reverses the sign of b and c"
                    reviewBlockId="undo-formula"
                    reviewLabel="Back to the inverse formula"
                >
                    <InlineClozeInput
                        varName="answerInverseEntry"
                        correctAnswer={["-2", "−2"]}
                        {...clozePropsFromDefinition(getVariableInfo("answerInverseEntry"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
