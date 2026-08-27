/**
 * Section 4 — Why AB Is Not BA
 * ============================
 * Bespoke comparison figure: the same L-shape, the same stretch and the same
 * quarter turn, applied in the two possible orders side by side on one shared
 * grid. Dragging the teal handle widens the stretch; at a stretch of 1 the two
 * results coincide, and they separate the moment the handle moves.
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
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
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

type Matrix = [[number, number], [number, number]];
type Point = [number, number];

/** The asymmetric L, so a quarter turn is unmistakable. */
const SHAPE: Point[] = [
    [0, 0],
    [1, 0],
    [1, 0.35],
    [0.35, 0.35],
    [0.35, 1],
    [0, 1],
];

const TURN: Matrix = [
    [0, -1],
    [1, 0],
];
const stretchMatrix = (k: number): Matrix => [
    [k, 0],
    [0, 1],
];

const applyMatrix = (m: Matrix, p: Point): Point => [
    m[0][0] * p[0] + m[0][1] * p[1],
    m[1][0] * p[0] + m[1][1] * p[1],
];

const MIN_STRETCH = 1;
const MAX_STRETCH = 2.5;
const formatStretch = (v: number) => v.toFixed(1);

// ── View constants ───────────────────────────────────────────────────────────

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 324;
const UNIT = 34;
const ORIGIN_Y = 190;
const LEFT_ORIGIN_X = 170;
const RIGHT_ORIGIN_X = 440;
const TITLE_Y = 40;
const MATRIX_TOP = 226;
const VERDICT_Y = 294;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const ACCENT = "#62D0AD";

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

function polygonPoints(points: Point[], originX: number): string {
    return points
        .map(([x, y]) => `${originX + x * UNIT},${ORIGIN_Y - y * UNIT}`)
        .join(" ");
}

function MiniMatrix({
    centerX,
    entries,
    dimmed,
}: {
    centerX: number;
    entries: [string, string, string, string];
    dimmed: number;
}) {
    const top = MATRIX_TOP;
    const bottom = MATRIX_TOP + 46;
    return (
        <g opacity={dimmed} style={EASE_150}>
            <path
                d={`M ${centerX - 34} ${top} L ${centerX - 42} ${top} L ${centerX - 42} ${bottom} L ${centerX - 34} ${bottom}`}
                fill="none"
                stroke={INK_STRUCTURE}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={`M ${centerX + 34} ${top} L ${centerX + 42} ${top} L ${centerX + 42} ${bottom} L ${centerX + 34} ${bottom}`}
                fill="none"
                stroke={INK_STRUCTURE}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <g fontSize="13" fill={INK} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={centerX - 17} y={top + 18}>{entries[0]}</text>
                <text x={centerX + 17} y={top + 18}>{entries[1]}</text>
                <text x={centerX - 17} y={top + 40}>{entries[2]}</text>
                <text x={centerX + 17} y={top + 40}>{entries[3]}</text>
            </g>
        </g>
    );
}

function OrderMattersFigure() {
    const setVar = useSetVar();
    const stretch = useVar<number>("stretchFactor", 1);
    const highlight = useVar<string>("orderMattersHighlight", "");

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const stretched = SHAPE.map((p) => applyMatrix(stretchMatrix(stretch), p));
    const turned = SHAPE.map((p) => applyMatrix(TURN, p));
    const turnAfterStretch = stretched.map((p) => applyMatrix(TURN, p));
    const stretchAfterTurn = turned.map((p) => applyMatrix(stretchMatrix(stretch), p));

    const same = Math.abs(stretch - 1) < 0.001;

    const dim = (id: string) => (highlight && highlight !== id ? 0.3 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("orderMattersHighlight", id),
        onPointerLeave: () => setVar("orderMattersHighlight", ""),
    });

    const handleMove = (event: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        const mathX = (px - LEFT_ORIGIN_X) / UNIT;
        setVar("stretchFactor", clamp(Math.round(mathX * 10) / 10, MIN_STRETCH, MAX_STRETCH));
    };

    const axes = (originX: number, dimValue: number) => (
        <g opacity={dimValue} style={EASE_150}>
            <line
                x1={originX - 2.7 * UNIT}
                y1={ORIGIN_Y}
                x2={originX + 1.2 * UNIT}
                y2={ORIGIN_Y}
                stroke={INK_QUIET}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <line
                x1={originX}
                y1={ORIGIN_Y + 0.7 * UNIT}
                x2={originX}
                y2={ORIGIN_Y - 2.7 * UNIT}
                stroke={INK_QUIET}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </g>
    );

    const panel = (
        originX: number,
        id: string,
        intermediate: Point[],
        final: Point[],
    ) => {
        const active = isActive(id);
        return (
            <g {...hoverProps(id)}>
                {axes(originX, dim(id))}
                <g opacity={dim(id)} style={EASE_150}>
                    {/* the original L — the before-state reference */}
                    <polygon
                        points={polygonPoints(SHAPE, originX)}
                        fill="none"
                        stroke={INK_QUIET}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    {/* the halfway step */}
                    <polygon
                        points={polygonPoints(intermediate, originX)}
                        fill="none"
                        stroke={INK_STRUCTURE}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        strokeLinejoin="round"
                    />
                </g>
                {active && (
                    <polygon
                        points={polygonPoints(final, originX)}
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="9"
                        opacity="0.26"
                        strokeLinejoin="round"
                    />
                )}
                <polygon
                    points={polygonPoints(final, originX)}
                    fill={ACCENT}
                    fillOpacity={active ? 0.34 : 0.15}
                    stroke={ACCENT}
                    strokeWidth={active ? 4 : 3}
                    strokeLinejoin="round"
                    style={EASE_150}
                />
            </g>
        );
    };

    const handleX = LEFT_ORIGIN_X + stretch * UNIT;
    const handleY = ORIGIN_Y - 0.175 * UNIT;

    return (
        <Figure
            id="order-matters"
            onReset={() => {
                setVar("stretchFactor", 1);
                setVar("orderMattersHighlight", "");
            }}
            caption="The same L, the same stretch, the same quarter turn — only the order changes. Drag the teal handle to widen the stretch and watch the two results come apart."
        >
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="An L shape stretched then turned, beside the same L turned then stretched"
            >
                <defs>
                    <filter id="order-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                <g fontSize="12" fill={INK_STRUCTURE} style={EASE_150}>
                    <text x={LEFT_ORIGIN_X} y={TITLE_Y} textAnchor="middle" opacity={dim("stretchFirst")}>
                        stretch, then turn
                    </text>
                    <text x={RIGHT_ORIGIN_X} y={TITLE_Y} textAnchor="middle" opacity={dim("turnFirst")}>
                        turn, then stretch
                    </text>
                </g>

                {panel(LEFT_ORIGIN_X, "stretchFirst", stretched, turnAfterStretch)}
                {panel(RIGHT_ORIGIN_X, "turnFirst", turned, stretchAfterTurn)}

                <MiniMatrix
                    centerX={LEFT_ORIGIN_X}
                    dimmed={dim("stretchFirst")}
                    entries={["0.0", "−1.0", formatStretch(stretch), "0.0"]}
                />
                <MiniMatrix
                    centerX={RIGHT_ORIGIN_X}
                    dimmed={dim("turnFirst")}
                    entries={["0.0", `−${formatStretch(stretch)}`, "1.0", "0.0"]}
                />

                <text
                    x={VIEW_WIDTH / 2}
                    y={VERDICT_Y}
                    textAnchor="middle"
                    fontSize="13"
                    fill={INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {same
                        ? "with a stretch of 1.0 the two orders agree"
                        : `with a stretch of ${formatStretch(stretch)} the two orders give different matrices`}
                </text>

                {/* The one handle: the stretch, grabbed on the widened shape's edge. */}
                <g transform={`translate(${handleX} ${handleY}) scale(${handleScale})`}>
                    <circle r="12" fill={ACCENT} filter="url(#order-handle-shadow)" />
                </g>
                <circle
                    cx={handleX}
                    cy={handleY}
                    r="24"
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        draggingRef.current = true;
                        setDragging(true);
                    }}
                    onPointerMove={handleMove}
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
                    varName="stretchFactor"
                    label="Stretch"
                    {...numberPropsFromDefinition(getVariableInfo("stretchFactor"))}
                    formatValue={formatStretch}
                />
            </div>

            <InteractionHintSequence
                hintKey="order-matters-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal handle to widen the stretch",
                        position: { x: "36%", y: "56%" },
                        dragPath: { type: "line", startOffset: { x: -14, y: 0 }, endOffset: { x: 34, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const orderMattersBlocks: ReactElement[] = [
    <StackLayout key="layout-order-heading" maxWidth="xl">
        <Block id="order-heading" padding="md">
            <EditableH2 id="h2-order-heading" blockId="order-heading">
                Why AB Is Not BA
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-order-setup" maxWidth="xl">
        <Block id="order-setup" padding="sm">
            <EditableParagraph id="para-order-setup" blockId="order-setup">
                Stretching a shape is a matrix, and turning it a quarter circle is another,
                so doing one after the other is a product. With a stretch of{" "}
                <InlineScrubbleNumber
                    varName="stretchFactor"
                    {...numberPropsFromDefinition(getVariableInfo("stretchFactor"))}
                    formatValue={(v) => v.toFixed(1)}
                />
                , drag the teal handle wider and compare{" "}
                <InlineLinkedHighlight
                    varName="orderMattersHighlight"
                    highlightId="stretchFirst"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orderMattersHighlight"))}
                >
                    stretch, then turn
                </InlineLinkedHighlight>{" "}
                with{" "}
                <InlineLinkedHighlight
                    varName="orderMattersHighlight"
                    highlightId="turnFirst"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("orderMattersHighlight"))}
                >
                    turn, then stretch
                </InlineLinkedHighlight>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-order-figure" maxWidth="xl">
        <Block id="order-figure" padding="sm" hasVisualization>
            <OrderMattersFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-order-insight" maxWidth="xl">
        <Block id="order-insight" padding="sm">
            <EditableParagraph id="para-order-insight" blockId="order-insight">
                At a stretch of exactly 1 the two shapes land on top of each other, which
                is why this trap is so easy to fall into. Nudge the handle and they part
                company: the stretch has slipped into a different corner of the matrix, and
                AB and BA are simply not the same object.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-order-question-commute" maxWidth="xl">
        <Block id="order-question-commute" padding="md">
            <EditableParagraph id="para-order-question-commute" blockId="order-question-commute">
                So two matrices give the same answer in either order{" "}
                <InlineFeedback
                    varName="answerCommute"
                    correctValue="only in special cases"
                    position="terminal"
                    successMessage="— yes, agreement is the exception, not the rule"
                    failureMessage="— think again."
                    hint="One stretch value made them agree; every other one did not"
                    visualizationHint={{
                        blockId: "order-figure",
                        hintKey: "order-feedback-hint",
                        label: "Discover it yourself",
                        resetVars: { stretchFactor: 1 },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the teal handle out to a stretch of 2 — the shapes separate",
                                position: { x: "36%", y: "56%" },
                                completionVar: "stretchFactor",
                                completionValue: 2,
                                completionTolerance: 0.15,
                            },
                            {
                                gesture: "drag-horizontal",
                                label: "Now bring it back to 1 — they agree again, but only there",
                                position: { x: "31%", y: "56%" },
                                completionVar: "stretchFactor",
                                completionValue: 1,
                                completionTolerance: 0.05,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answerCommute"
                        correctAnswer="only in special cases"
                        options={["always", "never", "only in special cases"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerCommute"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-order-question-entry" maxWidth="xl">
        <Block id="order-question-entry" padding="md">
            <EditableParagraph id="para-order-question-entry" blockId="order-question-entry">
                Take A with rows (1, 2) and (0, 1), and B with rows (1, 0) and (3, 1). The
                top-left entry of AB is{" "}
                <InlineFeedback
                    varName="answerAbTopLeft"
                    correctValue="7"
                    position="terminal"
                    successMessage="— correct, 1 × 1 + 2 × 3 = 7, while BA has 1 sitting in that corner instead"
                    failureMessage="— close."
                    hint="Pair the first row of A with the first column of B, which is (1, 3)"
                    reviewBlockId="row-column-figure"
                    reviewLabel="Back to row meets column"
                >
                    <InlineClozeInput
                        varName="answerAbTopLeft"
                        correctAnswer="7"
                        {...clozePropsFromDefinition(getVariableInfo("answerAbTopLeft"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
