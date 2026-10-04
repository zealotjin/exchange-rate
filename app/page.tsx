"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type ItemType = "pin" | "task" | "asset" | "alert";

type PlacedItem = {
  id: string;
  label: string;
  type: ItemType;
  x: number;
  y: number;
};

const itemTypes: Array<{
  type: ItemType;
  label: string;
  shortLabel: string;
}> = [
  { type: "pin", label: "Location", shortLabel: "L" },
  { type: "task", label: "Task", shortLabel: "T" },
  { type: "asset", label: "Asset", shortLabel: "A" },
  { type: "alert", label: "Alert", shortLabel: "!" },
];

const starterItems: PlacedItem[] = [
  { id: "market-entry", label: "Market entry", type: "pin", x: 35, y: 36 },
  { id: "supply-hub", label: "Supply hub", type: "asset", x: 61, y: 48 },
  { id: "review-zone", label: "Review zone", type: "task", x: 48, y: 66 },
];

const storageKey = "atlas-board-items";

function clamp(value: number, min = 3, max = 97) {
  return Math.min(max, Math.max(min, value));
}

function getMapPoint(
  event: PointerEvent<HTMLElement>,
  element: HTMLElement | null,
) {
  if (!element) {
    return { x: 50, y: 50 };
  }

  const rect = element.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100),
  };
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<PlacedItem[]>(starterItems);
  const [selectedType, setSelectedType] = useState<ItemType>("pin");
  const [activeItemId, setActiveItemId] = useState<string | null>(
    starterItems[0].id,
  );
  const [labelDraft, setLabelDraft] = useState("New item");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    const savedItems = window.localStorage.getItem(storageKey);

    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems) as PlacedItem[];
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setItems(parsedItems);
          setActiveItemId(parsedItems[0].id);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, items],
  );

  const nextItemNumber = items.length + 1;

  function addItemAt(point: { x: number; y: number }) {
    const typeLabel =
      itemTypes.find((itemType) => itemType.type === selectedType)?.label ??
      "Item";
    const label = labelDraft.trim() || `${typeLabel} ${nextItemNumber}`;
    const item: PlacedItem = {
      id: `${selectedType}-${Date.now()}`,
      label,
      type: selectedType,
      x: point.x,
      y: point.y,
    };

    setItems((currentItems) => [...currentItems, item]);
    setActiveItemId(item.id);
    setLabelDraft("");
  }

  function placeAtCenter() {
    const offset = (items.length % 5) * 4;
    addItemAt({ x: 50 + offset, y: 50 - offset });
  }

  function updateActiveLabel(value: string) {
    if (!activeItemId) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === activeItemId ? { ...item, label: value } : item,
      ),
    );
  }

  function removeActiveItem() {
    if (!activeItemId) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== activeItemId),
    );
    setActiveItemId(null);
  }

  function moveItem(itemId: string, point: { x: number; y: number }) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, x: point.x, y: point.y } : item,
      ),
    );
  }

  function handleMapPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    addItemAt(getMapPoint(event, mapRef.current));
  }

  function handleItemPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedItemId(itemId);
    setActiveItemId(itemId);
  }

  function handleItemPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!draggedItemId) {
      return;
    }

    moveItem(draggedItemId, getMapPoint(event, mapRef.current));
  }

  function handleItemPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (draggedItemId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggedItemId(null);
  }

  return (
    <main className="workspace-shell">
      <section className="toolbar-panel" aria-label="Map item controls">
        <div>
          <p className="eyebrow">Placement map</p>
          <h1>Atlas Board</h1>
          <p className="intro">
            Drop items onto the map, drag them into position, and keep a small
            working inventory of what belongs where.
          </p>
        </div>

        <div className="control-group" aria-label="Item type">
          {itemTypes.map((itemType) => (
            <button
              className={
                selectedType === itemType.type
                  ? "type-button is-selected"
                  : "type-button"
              }
              key={itemType.type}
              onClick={() => setSelectedType(itemType.type)}
              type="button"
            >
              <span className={`type-swatch ${itemType.type}`}>
                {itemType.shortLabel}
              </span>
              {itemType.label}
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="item-label">
          Label for next item
        </label>
        <input
          className="text-field"
          id="item-label"
          onChange={(event) => setLabelDraft(event.target.value)}
          placeholder={`Item ${nextItemNumber}`}
          value={labelDraft}
        />

        <button className="primary-action" onClick={placeAtCenter} type="button">
          Place item
        </button>

        <div className="hint-line">Tip: click anywhere on the map to place.</div>

        <section className="item-list" aria-label="Placed items">
          <div className="list-header">
            <h2>Items</h2>
            <span>{items.length}</span>
          </div>

          {items.length === 0 ? (
            <p className="empty-state">No items yet. Add one to begin.</p>
          ) : (
            items.map((item) => (
              <button
                className={
                  activeItemId === item.id ? "list-item is-active" : "list-item"
                }
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                type="button"
              >
                <span className={`type-swatch ${item.type}`}>
                  {
                    itemTypes.find((itemType) => itemType.type === item.type)
                      ?.shortLabel
                  }
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>
                    {Math.round(item.x)}%, {Math.round(item.y)}%
                  </small>
                </span>
              </button>
            ))
          )}
        </section>

        <section className="editor-panel" aria-label="Selected item editor">
          <h2>Selected</h2>
          {activeItem ? (
            <>
              <label className="field-label" htmlFor="active-label">
                Item label
              </label>
              <input
                className="text-field"
                id="active-label"
                onChange={(event) => updateActiveLabel(event.target.value)}
                value={activeItem.label}
              />
              <button
                className="secondary-action"
                onClick={removeActiveItem}
                type="button"
              >
                Remove selected
              </button>
            </>
          ) : (
            <p className="empty-state">Select an item to edit it.</p>
          )}
        </section>

        <button
          className="ghost-action"
          onClick={() => {
            setItems(starterItems);
            setActiveItemId(starterItems[0].id);
          }}
          type="button"
        >
          Reset map
        </button>
      </section>

      <section className="map-stage" aria-label="Interactive placement map">
        <div
          className="map-canvas"
          onPointerDown={handleMapPointerDown}
          ref={mapRef}
        >
          <div className="map-background" aria-hidden="true">
            <div className="district district-one" />
            <div className="district district-two" />
            <div className="district district-three" />
            <div className="route route-one" />
            <div className="route route-two" />
            <div className="waterway" />
            <span className="map-label north">North yard</span>
            <span className="map-label east">East pier</span>
            <span className="map-label south">South gate</span>
          </div>

          {items.map((item) => (
            <button
              aria-label={`${item.label}, ${item.type}`}
              className={
                activeItemId === item.id
                  ? `map-item ${item.type} is-active`
                  : `map-item ${item.type}`
              }
              key={item.id}
              onPointerDown={(event) => handleItemPointerDown(event, item.id)}
              onPointerMove={handleItemPointerMove}
              onPointerUp={handleItemPointerUp}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              type="button"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
