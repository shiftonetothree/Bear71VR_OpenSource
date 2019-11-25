export declare const init: (
    canvas: HTMLCanvasElement,
    mapConfig: MapConfig & Setting,
    onLoaded:(destroy: ()=>void, settings: Setting, map: Map)=>void
)=>void

export interface MapConfig{
    mapUrl: string,
    spritesheetUrl: string,
    rippleMaterialUrl: string,
    locations: Location[],
    carLikes: Location[],
    carLikeG: {[key: number]: string}
    showAxesHelper?: boolean,
    onMove?: (x: number, y: number, rotate: number) => any
}
export interface Setting{
    userFootHeight?: number,
    mapSize?: number,
    cursorMaxHitDistance?: number,
    metersPerSecond?: number,
}


export interface Location{
    model: string,
    position: [number, number, number],
    scale: [number, number, number],
    key: string,
    name: string,
    category: string,
    namePosition: [number, number, number],
    onclick: () => any
}

export type CarLike = Omit<Location,"position"> &{
    g: number;
}

export interface Map{
    moveCamera(location: [number,number], duration?: number, onComplete?: ()=>any, height?:number, white?: boolean): void;
    changeSpritesheet(url: string): void;
    updateSectionOffset(offset: number): void;
}