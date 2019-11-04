export declare const init: (
    canvas: HTMLCanvasElement,
    mapConfig: MapConfig & Setting,
    onLoaded:(destroy: ()=>void, settings: Setting)=>void
)=>void

export interface MapConfig{
    mapUrl: string,
    spritesheetUrl: string,
    rippleMaterialUrl: string,
    locations: Location[],
}
export interface Setting{
    userFootHeight: number,
    mapSize: number,
    cursorMaxHitDistance: number,
    metersPerSecond: number
}


export interface Location{
    model: string,
    position: [number, number, number],
    scale: [number, number, number],
    key: string,
    name: string,
    namePosition: [number, number, number],
    onclick: () => any
}
