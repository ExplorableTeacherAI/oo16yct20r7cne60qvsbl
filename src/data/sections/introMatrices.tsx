/**
 * Section 1 — Multiplying Matrices (opening)
 * ==========================================
 * Text-only opening: the canteen hook, the promise, and the prior skills the
 * lesson builds on. No visual, no assessment.
 */

import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const introMatricesBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Multiplying Matrices
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Every lunchtime the school canteen holds two grids of numbers: what each
                student ordered, and what each item costs. Somewhere between those two
                grids is everybody's bill, and matrix multiplication is the machine that
                pulls it out in one move.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                You can already read a value from a row and a column, and add or scale a
                matrix. From here you will multiply two matrices, tell at a glance whether
                a product exists at all, and find the matrix that undoes another one. Three
                traps sit along the way, and each one is easier to feel than to be told.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
