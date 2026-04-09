import "@testing-library/jest-dom";

// Polyfill PointerEvent for base-ui components in jsdom
// base-ui's Checkbox/Radio use PointerEvent internally which jsdom doesn't support
if (!global.PointerEvent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).PointerEvent = class PointerEvent extends MouseEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.width = init.width ?? 1;
      this.height = init.height ?? 1;
      this.pressure = init.pressure ?? 0;
      this.tangentialPressure = init.tangentialPressure ?? 0;
      this.tiltX = init.tiltX ?? 0;
      this.tiltY = init.tiltY ?? 0;
      this.twist = init.twist ?? 0;
      this.pointerType = init.pointerType ?? "";
      this.isPrimary = init.isPrimary ?? false;
    }
  };
}

// Mock Tauri APIs for testing
Object.defineProperty(window, "__TAURI__", {
  value: {
    core: {
      invoke: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(window, "__TAURI_INTERNALS__", {
  value: {
    invoke: vi.fn(),
    transformCallback: vi.fn(),
    postMessage: vi.fn(),
  },
  writable: true,
});
