// flow-typed signature: 444a25501e6ea0d3c2a570b9d0825e15
// flow-typed version: <<STUB>>/react-dnd-html5-backend_v14.0.0/flow_v0.150.0
// @flow
/**
 * This is an autogenerated libdef stub for:
 *
 *   'react-dnd-html5-backend'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module "react-dnd-html5-backend" {
  declare export type Identifier = string | Symbol;
  declare export type SourceType = Identifier;
  declare export type TargetType = Identifier | Identifier[];
  declare export type Unsubscribe = () => void;
  declare export type Listener = () => void;
  declare export type XYCoord = {
    x: number,
    y: number,
  };

  declare export var HandlerRole: {|
    +SOURCE: "SOURCE", // "SOURCE"
    +TARGET: "TARGET", // "TARGET"
  |};
  declare export type Backend = {
    setup(): void,
    teardown(): void,
    connectDragSource(sourceId: any, node?: any, options?: any): Unsubscribe,
    connectDragPreview(sourceId: any, node?: any, options?: any): Unsubscribe,
    connectDropTarget(targetId: any, node?: any, options?: any): Unsubscribe,
    profile(): { [key: string]: number, ... },
  };
  declare export type DragDropMonitor = {
    subscribeToStateChange(
      listener: Listener,
      options?: {
        handlerIds: Identifier[] | void,
        ...
      }
    ): Unsubscribe,
    subscribeToOffsetChange(listener: Listener): Unsubscribe,
    canDragSource(sourceId: Identifier | void): boolean,
    canDropOnTarget(targetId: Identifier | void): boolean,

    /**
     * Returns true if a drag operation is in progress, and either the owner initiated the drag, or its isDragging()
     * is defined and returns true.
     */
    isDragging(): boolean,
    isDraggingSource(sourceId: Identifier | void): boolean,
    isOverTarget(
      targetId: Identifier | void,
      options?: {
        shallow?: boolean,
        ...
      }
    ): boolean,

    /**
     * Returns a string or a symbol identifying the type of the current dragged item. Returns null if no item is being dragged.
     */
    getItemType(): Identifier | null,

    /**
     * Returns a plain object representing the currently dragged item. Every drag source must specify it by returning an object
     * from its beginDrag() method. Returns null if no item is being dragged.
     */
    getItem(): any,
    getSourceId(): Identifier | null,
    getTargetIds(): Identifier[],

    /**
     * Returns a plain object representing the last recorded drop result. The drop targets may optionally specify it by returning an
     * object from their drop() methods. When a chain of drop() is dispatched for the nested targets, bottom up, any parent that
     * explicitly returns its own result from drop() overrides the child drop result previously set by the child. Returns null if
     * called outside endDrag().
     */
    getDropResult(): any,

    /**
     * Returns true if some drop target has handled the drop event, false otherwise. Even if a target did not return a drop result,
     * didDrop() returns true. Use it inside endDrag() to test whether any drop target has handled the drop. Returns false if called
     * outside endDrag().
     */
    didDrop(): boolean,
    isSourcePublic(): boolean | null,

    /**
     * Returns the { x, y } client offset of the pointer at the time when the current drag operation has started.
     * Returns null if no item is being dragged.
     */
    getInitialClientOffset(): XYCoord | null,

    /**
     * Returns the { x, y } client offset of the drag source component's root DOM node at the time when the current drag
     * operation has started. Returns null if no item is being dragged.
     */
    getInitialSourceClientOffset(): XYCoord | null,

    /**
     * Returns the last recorded { x, y } client offset of the pointer while a drag operation is in progress.
     * Returns null if no item is being dragged.
     */
    getClientOffset(): XYCoord | null,

    /**
     * Returns the projected { x, y } client offset of the drag source component's root DOM node, based on its position at the time
     * when the current drag operation has started, and the movement difference. Returns null if no item is being dragged.
     */
    getSourceClientOffset(): XYCoord | null,

    /**
     * Returns the { x, y } difference between the last recorded client offset of the pointer and the client offset when the current
     * drag operation has started. Returns null if no item is being dragged.
     */
    getDifferenceFromInitialOffset(): XYCoord | null,
  };
  declare type InternalDragSource = {
    beginDrag(monitor: DragDropMonitor, targetId: Identifier): void,
    endDrag(monitor: DragDropMonitor, targetId: Identifier): void,
    canDrag(monitor: DragDropMonitor, targetId: Identifier): boolean,
    isDragging(monitor: DragDropMonitor, targetId: Identifier): boolean,
  };
  declare type InternalDropTarget = {
    canDrop(monitor: DragDropMonitor, targetId: Identifier): boolean,
    hover(monitor: DragDropMonitor, targetId: Identifier): void,
    drop(monitor: DragDropMonitor, targetId: Identifier): any,
  };
  declare type HandlerRegistry = {
    addSource(type: SourceType, source: InternalDragSource): Identifier,
    addTarget(type: TargetType, target: InternalDropTarget): Identifier,
    containsHandler(handler: InternalDragSource | InternalDropTarget): boolean,
    getSource(
      sourceId: Identifier,
      includePinned?: boolean
    ): InternalDragSource,
    getSourceType(sourceId: Identifier): SourceType,
    getTargetType(targetId: Identifier): TargetType,
    getTarget(targetId: Identifier): InternalDropTarget,
    isSourceId(handlerId: Identifier): boolean,
    isTargetId(handlerId: Identifier): boolean,
    removeSource(sourceId: Identifier): void,
    removeTarget(targetId: Identifier): void,
    pinSource(sourceId: Identifier): void,
    unpinSource(): void,
  };
  declare export type Action<Payload> = {
    type: Identifier,
    payload: Payload,
  };
  declare export type SentinelAction = {
    type: Identifier,
  };
  declare export type ActionCreator<Payload> = (args: any[]) => Action<Payload>;
  declare export type BeginDragOptions = {
    publishSource?: boolean,
    clientOffset?: XYCoord,
    getSourceClientOffset?: (sourceId: Identifier) => XYCoord,
  };
  declare export type InitCoordsPayload = {
    clientOffset: XYCoord | null,
    sourceClientOffset: XYCoord | null,
  };
  declare export type BeginDragPayload = {
    itemType: Identifier,
    item: any,
    sourceId: Identifier,
    clientOffset: XYCoord | null,
    sourceClientOffset: XYCoord | null,
    isSourcePublic: boolean,
  };
  declare export type HoverPayload = {
    targetIds: Identifier[],
    clientOffset: XYCoord | null,
  };
  declare export type HoverOptions = {
    clientOffset?: XYCoord,
  };
  declare export type DropPayload = {
    dropResult: any,
  };
  declare export type TargetIdPayload = {
    targetId: Identifier,
  };
  declare export type SourceIdPayload = {
    sourceId: Identifier,
  };
  declare export type DragDropActions = {
    beginDrag(
      sourceIds?: Identifier[],
      options?: any
    ): Action<BeginDragPayload> | void,
    publishDragSource(): SentinelAction | void,
    hover(targetIds: Identifier[], options?: any): Action<HoverPayload>,
    drop(options?: any): void,
    endDrag(): SentinelAction,
  };
  declare export type DragDropManager = {
    getMonitor(): DragDropMonitor,
    getBackend(): Backend,
    getRegistry(): HandlerRegistry,
    getActions(): DragDropActions,
    dispatch(action: any): void,
  };
  declare export type BackendFactory = (
    manager: DragDropManager,
    globalContext?: any,
    configuration?: any
  ) => Backend;
  declare export var HTML5Backend: BackendFactory;
}