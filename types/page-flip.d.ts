declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, options: Partial<PageFlipOptions>);
    destroy(): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    flip(page: number, corner?: string): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
  }

  interface PageFlipOptions {
    width: number;
    height: number;
    size: "fixed" | "stretch";
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
  }
}
