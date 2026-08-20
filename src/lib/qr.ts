import QRCode from "qrcode";

/** Devuelve el QR como data URL (PNG) para incrustar en <img> o email. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/** Devuelve el QR como SVG string. */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 1, width: 320 });
}
