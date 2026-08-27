/**
 * Section 5 — The Determinant
 * ===========================
 * Bespoke figure: the unit square, and the parallelogram the matrix sweeps it
 * into. The two columns of the matrix are draggable arrows; the area of the
 * parallelogram they span IS the determinant, and it collapses to zero the
 * moment the two arrows line up.
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
    scrubVarsFromDefinitions,
} from "../variables";

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 330;
const UNIT = 40;
const ORIGIN_X = 190;
const ORIGIN_Y = 168;
const RANGE = 3;
const RAIL_X = 342;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const GRID = "#F1F5F9";
const ACCENT = "#62D0AD"; // first column
const ACCENT_TWO = "#8E90F5"; // second column

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const fmtEntry = (v: number) => v.toFixed(1);
const fmtArea = (v: number) => v.toFixed(2);

const toScreenX = (x: number) => ORIGIN_X + x * UNIT;
const toScreenY = (y: number) => ORIGIN_Y - y * UNIT;

function DeterminantFigure() {
    const setVar = useSetVar();
    const a = useVar<number>("determinantColumn1X", 2);
    const c = useVar<number>("determinantColumn1Y", 1);
    const b = useVar<number>("determinantColumn2X", 1);
    const d = useVar<number>("determinantColumn2Y", 2);
    const highlight = useVar<string>("determinantHighlight", "");

    const [dragging, setDragging] = useState<"" | "column1" | "column2">("");
    const [hovered, setHovered] = useState<"" | "column1" | "column2">("");
    const draggingRef = useRef<"" | "column1" | "column2">("");
    const svgRef = useRef<SVGSVGElement>(null);

    const determinant = a * d - b * c;
    const flat = Math.abs(determinant) < 0.05;

    const dim = (id: string) => (highlight && highlight !== id ? 0.3 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("determinantHighlight", id),
        onPointerLeave: () => setVar("determinantHighlight", ""),
    });

    const handleMove = (event: React.PointerEvent) => {
        const which = draggingRef.current;
        if (!which) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        const py = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        const mx = clamp(Math.round(((px - ORIGIN_X) / UNIT) * 10) / 10, -RANGE, RANGE);
        const my = clamp(Math.round(((ORIGIN_Y - py) / UNIT) * 10) / 10, -RANGE, RANGE);
        if (which === "column1") {
            setVar("determinantColumn1X", mx);
            setVar("determinantColumn1Y", my);
        } else {
            setVar("determinantColumn2X", mx);
            setVar("determinantColumn2Y", my);
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
    for (let i = -RANGE; i <= RANGE; i += 1) {
        gridLines.push(
            <line
                key={`v${i}`}
                x1={toScreenX(i)}
                y1={toScreenY(RANGE)}
                x2={toScreenX(i)}
                y2={toScreenY(-RANGE)}
                stroke={GRID}
                strokeWidth="1"
            />,
            <line
                key={`h${i}`}
                x1={toScreenX(-RANGE)}
                y1={toScreenY(i)}
                x2={toScreenX(RANGE)}
                y2={toScreenY(i)}
                stroke={GRID}
                strokeWidth="1"
            />,
        );
    }

    const parallelogram = [
        [0, 0],
        [a, c],
        [a + b, c + d],
        [b, d],
    ]
        .map(([x, y]) => `${toScreenX(x)},${toScreenY(y)}`)
        .join(" ");

    const arrow = (
        x: number,
        y: number,
        color: string,
        id: string,
        label: string,
    ) => {
        const active = isActive(id);
        const scale = dragging === id || hovered === id ? 1.15 : 1;
        return (
            <g style={EASE_150} opacity={dim(id)}>
                {active && (
                    <line
                        x1={toScreenX(0)}
                        y1={toScreenY(0)}
                        x2={toScreenX(x)}
                        y2={toScreenY(y)}
                        stroke={color}
                        strokeWidth="10"
                        opacity="0.26"
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={toScreenX(0)}
                    y1={toScreenY(0)}
                    x2={toScreenX(x)}
                    y2={toScreenY(y)}
                    stroke={color}
                    strokeWidth={active ? 4.5 : 3}
                    strokeLinecap="round"
                    style={EASE_150}
                />
                <g transform={`translate(${toScreenX(x)} ${toScreenY(y)}) scale(${scale})`}>
                    <circle r="11" fill={color} filter="url(#determinant-handle-shadow)" />
                </g>
                <circle
                    cx={toScreenX(x)}
                    cy={toScreenY(y)}
                    r="24"
                    fill="transparent"
                    style={{ cursor: dragging === id ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={startDrag(id as "column1" | "column2")}
                    onPointerMove={handleMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerEnter={() => {
                        setHovered(id as "column1" | "column2");
                        setVar("determinantHighlight", id);
                    }}
                    onPointerLeave={() => {
                        setHovered("");
                        setVar("determinantHighlight", "");
                    }}
                >
                    <title>{label}</title>
                </circle>
            </g>
        );
    };

    return (
        <Figure
            id="determinant-area"
            onReset={() => {
                setVar("determinantColumn1X", 2);
                setVar("determinantColumn1Y", 1);
                setVar("determinantColumn2X", 1);
                setVar("determinantColumn2Y", 2);
                setVar("determinantHighlight", "");
            }}
            caption="The pale square is one unit of area. Drag either arrow tip — the two columns of the matrix — and the area of the parallelogram they span is the determinant."
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="A unit square swept into a parallelogram by two draggable column vectors"
            >
                <defs>
                    <filter id="determinant-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {gridLines}

                {/* Axes. */}
                <line
                    x1={toScreenX(-RANGE)}
                    y1={toScreenY(0)}
                    x2={toScreenX(RANGE)}
                    y2={toScreenY(0)}
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <line
                    x1={toScreenX(0)}
                    y1={toScreenY(RANGE)}
                    x2={toScreenX(0)}
                    y2={toScreenY(-RANGE)}
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />

                {/* The original unit square — the before-state reference. */}
                <rect
                    x={toScreenX(0)}
                    y={toScreenY(1)}
                    width={UNIT}
                    height={UNIT}
                    fill="none"
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />

                {/* The swept parallelogram — its area is the determinant. */}
                <polygon
                    points={parallelogram}
                    fill={ACCENT}
                    fillOpacity={isActive("area") ? 0.35 : 0.15}
                    stroke={ACCENT}
                    strokeWidth={isActive("area") ? 4 : 2.5}
                    strokeLinejoin="round"
                    opacity={dim("area")}
                    style={EASE_150}
                    {...hoverProps("area")}
                />

                <g {...hoverProps("column1")}>{arrow(a, c, ACCENT, "column1", "First column")}</g>
                <g {...hoverProps("column2")}>{arrow(b, d, ACCENT_TWO, "column2", "Second column")}</g>

                {/* Readouts, in a rail beside the drawing. */}
                <g style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                    <text x={RAIL_X} y={96} fontSize="11" fill={ACCENT} opacity={dim("column1")}>
                        {`first column  (${fmtEntry(a)}, ${fmtEntry(c)})`}
                    </text>
                    <text x={RAIL_X} y={120} fontSize="11" fill={ACCENT_TWO} opacity={dim("column2")}>
                        {`second column  (${fmtEntry(b)}, ${fmtEntry(d)})`}
                    </text>
                    <text x={RAIL_X} y={168} fontSize="12" fill={INK_STRUCTURE} opacity={dim("area")}>
                        {`${fmtEntry(a)} × ${fmtEntry(d)} − ${fmtEntry(b)} × ${fmtEntry(c)}`}
                    </text>
                    <text x={RAIL_X} y={200} fontSize="17" fill={INK} fontWeight="600" opacity={dim("area")}>
                        {`det = ${fmtArea(determinant)}`}
                    </text>
                    <text x={RAIL_X} y={228} fontSize="12" fill={INK_STRUCTURE} opacity={dim("area")}>
                        {flat
                            ? "squashed flat, no area left"
                            : `area = ${fmtArea(Math.abs(determinant))} squares`}
                    </text>
                    {determinant < -0.05 && (
                        <text x={RAIL_X} y={252} fontSize="12" fill={INK_STRUCTURE} opacity={dim("area")}>
                            flipped over, so it counts as negative
                        </text>
                    )}
                </g>
            </svg>

            <InteractionHintSequence
                hintKey="determinant-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the indigo arrow tip",
                        position: { x: "41%", y: "27%" },
                        dragPath: { type: "arc", startAngle: -60, endAngle: 20, radius: 34 },
                    },
                ]}
            />
        </Figure>
    );
}

export const determinantBlocks: ReactElement[] = [
    <StackLayout key="layout-determinant-heading" maxWidth="xl">
        <Block id="determinant-heading" padding="md">
            <EditableH2 id="h2-determinant-heading" blockId="determinant-heading">
                The Determinant
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-setup" maxWidth="xl">
        <Block id="determinant-setup" padding="sm">
            <EditableParagraph id="para-determinant-setup" blockId="determinant-setup">
                A matrix does not only move a shape, it changes how much room the shape
                takes up. The pale square holds one unit of area, and the{" "}
                <InlineLinkedHighlight
                    varName="determinantHighlight"
                    highlightId="column1"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("determinantHighlight"))}
                >
                    first column
                </InlineLinkedHighlight>{" "}
                and{" "}
                <InlineLinkedHighlight
                    varName="determinantHighlight"
                    highlightId="column2"
                    color="#8E90F5"
                    bgColor="rgba(142, 144, 245, 0.18)"
                >
                    second column
                </InlineLinkedHighlight>{" "}
                sweep it into a parallelogram. Drag either arrow tip and watch the area
                follow.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-figure" maxWidth="xl">
        <Block id="determinant-figure" padding="sm" hasVisualization>
            <DeterminantFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-formula" maxWidth="xl">
        <Block id="determinant-formula" padding="lg">
            <FormulaBlock
                latex="\det = \scrub{determinantColumn1X} \times \scrub{determinantColumn2Y} - \scrub{determinantColumn2X} \times \scrub{determinantColumn1Y}"
                variables={scrubVarsFromDefinitions([
                    "determinantColumn1X",
                    "determinantColumn2Y",
                    "determinantColumn2X",
                    "determinantColumn1Y",
                ])}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-insight" maxWidth="xl">
        <Block id="determinant-insight" padding="sm">
            <EditableParagraph id="para-determinant-insight" blockId="determinant-insight">
                That area is the determinant, and it has a breaking point. Swing one arrow
                until it lies along the other and the parallelogram flattens to a line:
                area zero, determinant zero, and a whole plane crushed onto a single
                stroke.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-question-value" maxWidth="xl">
        <Block id="determinant-question-value" padding="md">
            <EditableParagraph id="para-determinant-question-value" blockId="determinant-question-value">
                A matrix with rows (3, 4) and (1, 2) has determinant{" "}
                <InlineFeedback
                    varName="answerDeterminantValue"
                    correctValue="2"
                    position="terminal"
                    successMessage="— exactly, 3 × 2 − 4 × 1 = 2, so it doubles every area"
                    failureMessage="— not yet."
                    hint="Multiply along the main diagonal first, then subtract the other diagonal"
                    reviewBlockId="determinant-formula"
                    reviewLabel="Back to the formula"
                >
                    <InlineClozeInput
                        varName="answerDeterminantValue"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo("answerDeterminantValue"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-question-collapse" maxWidth="xl">
        <Block id="determinant-question-collapse" padding="md">
            <EditableParagraph id="para-determinant-question-collapse" blockId="determinant-question-collapse">
                And when both columns point along the same line, the determinant has to be{" "}
                <InlineFeedback
                    varName="answerCollapsedDeterminant"
                    correctValue="0"
                    position="terminal"
                    successMessage="— right, a flattened parallelogram has no area at all"
                    failureMessage="— try it out."
                    hint="Picture the parallelogram when the two arrows overlap"
                    visualizationHint={{
                        blockId: "determinant-figure",
                        hintKey: "determinant-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: {
                            determinantColumn1X: 2,
                            determinantColumn1Y: 1,
                            determinantColumn2X: 1,
                            determinantColumn2Y: 2,
                        },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the indigo arrow tip out to the right, level with the teal one",
                                position: { x: "41%", y: "27%" },
                                completionVar: "determinantColumn2X",
                                completionValue: 2,
                                completionTolerance: 0.35,
                            },
                            {
                                gesture: "drag",
                                label: "Now drop it right on top of the teal arrow and read the determinant",
                                position: { x: "48%", y: "39%" },
                                completionVar: "determinantColumn2Y",
                                completionValue: 1,
                                completionTolerance: 0.35,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerCollapsedDeterminant"
                        correctAnswer="0"
                        options={["0", "1", "a negative number"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerCollapsedDeterminant"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
