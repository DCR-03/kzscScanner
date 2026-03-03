import type { QuaggaJSConfigObject } from "@ericblade/quagga2";

export function getQuaggaConfig(
  target: string | HTMLElement
): QuaggaJSConfigObject {
  return {
    inputStream: {
      type: "LiveStream",
      target,
      constraints: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      area: {
        top: "20%",
        right: "20%",
        left: "20%",
        bottom: "20%",
      },
    },
    decoder: {
      readers: ["ean_reader", "upc_reader", "ean_8_reader", "upc_e_reader"],
      multiple: false,
    },
    locate: true,
    frequency: 10,
  };
}

export function getDecodeSingleConfig(src: string) {
  return {
    inputStream: {
      type: "ImageStream" as const,
      size: 1280,
      src,
    },
    decoder: {
      readers: ["ean_reader", "upc_reader", "ean_8_reader", "upc_e_reader"],
      multiple: false,
    },
    locate: true,
  };
}
