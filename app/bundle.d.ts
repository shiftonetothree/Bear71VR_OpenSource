export declare const init: (
    canvas: HTMLCanvasElement,
    mapConfig: {
        mapUrl: string,
        spritesheetUrl: string,
        rippleMaterialUrl: string,
        locations: Location[],
    },
    onLoaded:(destroy: ()=>void)=>void
)=>void


export interface Location{
    model: string,
    position: [number, number, number],
    scale: [number, number, number],
    key: string,
    name: string,
    namePosition: [number, number, number],
    onclick: () => any
}
