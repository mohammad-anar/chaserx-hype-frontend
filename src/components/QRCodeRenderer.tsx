"use client";

import React from "react";

interface QRCodeRendererProps {
    value: string;
    size?: number;
    fgColor?: string;
    bgColor?: string;
    className?: string;
}

export default function QRCodeRenderer({
    value,
    size = 180,
    fgColor = "#2C120C",
    bgColor = "#FFFFFF",
    className = "",
}: QRCodeRendererProps) {
    // Generate clean SVG QR-code matrix from string hash
    // Generates standard QR visual blocks
    const generateMatrix = (str: string) => {
        const matrixSize = 25;
        const grid: boolean[][] = Array(matrixSize).fill(null).map(() => Array(matrixSize).fill(false));

        // Helper to draw Finder Patterns (7x7 corners)
        const drawFinder = (rowOffset: number, colOffset: number) => {
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
                    const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                    grid[rowOffset + r][colOffset + c] = isOuter || isInner;
                }
            }
        };

        // Draw 3 standard corner finder patterns
        drawFinder(0, 0); // Top-Left
        drawFinder(0, matrixSize - 7); // Top-Right
        drawFinder(matrixSize - 7, 0); // Bottom-Left

        // Timing patterns
        for (let i = 8; i < matrixSize - 8; i++) {
            grid[6][i] = i % 2 === 0;
            grid[i][6] = i % 2 === 0;
        }

        // Deterministic pseudo-random fill based on input value
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
        }

        for (let r = 0; r < matrixSize; r++) {
            for (let c = 0; c < matrixSize; c++) {
                // Skip finder pattern zones
                const inTopLeft = r < 8 && c < 8;
                const inTopRight = r < 8 && c >= matrixSize - 8;
                const inBottomLeft = r >= matrixSize - 8 && c < 8;
                const inTiming = (r === 6 && c < matrixSize - 8) || (c === 6 && r < matrixSize - 8);

                if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
                    const val = (hash ^ (r * 13 + c * 37 + (r ^ c))) & 0xffff;
                    grid[r][c] = val % 3 === 0 || val % 7 === 0;
                }
            }
        }

        return grid;
    };

    const grid = generateMatrix(value || "CH-0000-0000");
    const matrixLength = grid.length;
    const cellSize = size / matrixLength;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width={size} height={size} fill={bgColor} rx={8} />
            {grid.map((row, rIdx) =>
                row.map((filled, cIdx) => {
                    if (!filled) return null;
                    return (
                        <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx * cellSize}
                            y={rIdx * cellSize}
                            width={cellSize + 0.1}
                            height={cellSize + 0.1}
                            fill={fgColor}
                            rx={cellSize * 0.2}
                        />
                    );
                })
            )}
        </svg>
    );
}
