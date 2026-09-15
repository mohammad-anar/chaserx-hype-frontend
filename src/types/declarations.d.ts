declare module "qrcode.react" {
    import * as React from "react";

    export interface BaseQRCodeProps {
        value: string;
        size?: number;
        bgColor?: string;
        fgColor?: string;
        level?: "L" | "M" | "Q" | "H";
        includeMargin?: boolean;
        imageSettings?: {
            src: string;
            height: number;
            width: number;
            excavate: boolean;
            x?: number;
            y?: number;
        };
        className?: string;
        style?: React.CSSProperties;
    }

    export const QRCodeSVG: React.FC<BaseQRCodeProps>;
    export const QRCodeCanvas: React.FC<BaseQRCodeProps>;
}

declare module "html5-qrcode" {
    export class Html5Qrcode {
        constructor(elementId: string, verbose?: boolean);
        start(
            cameraIdOrConfig: any,
            configuration: any,
            qrCodeSuccessCallback: (decodedText: string, result: any) => void,
            qrCodeErrorCallback?: (errorMessage: string) => void
        ): Promise<any>;
        stop(): Promise<void>;
        clear(): void;
    }
}
