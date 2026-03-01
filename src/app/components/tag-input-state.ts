/**
 * Encapsulates the UI state for tag autocomplete inputs on a list of items.
 * Instantiate one per component that needs per-item tag input tracking.
 */
export class TagInputState {
  visible: { [id: number]: boolean } = {};
  inputValue: { [id: number]: string } = {};
  dropdownOpen: { [id: number]: boolean } = {};

  open(id: number, event?: Event): void {
    if (event) event.stopPropagation();
    for (const key of Object.keys(this.visible)) {
      const numId = Number(key);
      if (numId !== id && this.visible[numId]) {
        this.visible[numId] = false;
        this.inputValue[numId] = '';
        this.dropdownOpen[numId] = false;
      }
    }
    this.visible[id] = true;
    this.dropdownOpen[id] = true;
  }

  closeAll(): void {
    for (const key of Object.keys(this.visible)) {
      this.visible[Number(key)] = false;
    }
  }

  onFocus(id: number): void {
    this.dropdownOpen[id] = true;
  }

  onChange(id: number): void {
    this.dropdownOpen[id] = true;
  }

  select(id: number): void {
    this.inputValue[id] = '';
    this.dropdownOpen[id] = false;
  }

  getFiltered(id: number, items: { id: number; tags: string[] }[], availableTags: string[]): string[] {
    const item = items.find(i => i.id === id);
    const searchTerm = this.inputValue[id]?.toLowerCase() || '';
    const itemTags = item?.tags || [];
    return availableTags.filter(tag =>
      !itemTags.includes(tag) &&
      tag.toLowerCase().includes(searchTerm)
    );
  }
}
