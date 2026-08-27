/**
 * Section 7 — Wrapping Up (closing)
 * =================================
 * Text-only close: the promise kept, the one idea worth carrying away, and
 * where matrices lead next. No new terms, no questions.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const wrappingUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrap-heading" maxWidth="xl">
        <Block id="wrap-heading" padding="md">
            <EditableH2 id="h2-wrap-heading" blockId="wrap-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrap-takeaway" maxWidth="xl">
        <Block id="wrap-takeaway" padding="sm">
            <EditableParagraph id="para-wrap-takeaway" blockId="wrap-takeaway">
                A matrix product was never a grid of little multiplications sitting side by
                side. Every entry is one row meeting one column, and that single rule is
                what forces the middle numbers to agree, what makes the order matter, and
                what puts the determinant at the heart of undoing a matrix.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrap-next" maxWidth="xl">
        <Block id="wrap-next" padding="sm">
            <EditableParagraph id="para-wrap-next" blockId="wrap-next">
                The same rule is quietly at work when a phone rotates a photograph and when
                a game moves every point of a character in one go. It also solves
                simultaneous equations: write them as a single matrix, and the inverse matrix
                you dragged into place is what finishes the job in one step.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
