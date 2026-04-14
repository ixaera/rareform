import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-management.html',
  styleUrl: './tag-management.css'
})
export class TagManagementComponent {
  @Input() tags: string[] = [];
  @Output() tagRenamed = new EventEmitter<{oldTag: string, newTag: string}>();
  @Output() tagDeleted = new EventEmitter<string>();
  @Output() tagAdded = new EventEmitter<string>();

  newTagInput = '';
  editingTag: string | null = null;
  editTagInput: { [tag: string]: string } = {};

  createTag(): void {
    const tag = this.newTagInput.trim();
    if (this.isValidTag(tag) && !this.tags.includes(tag)) {
      this.tagAdded.emit(tag);
      this.newTagInput = '';
    }
  }

  startEditTag(tag: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingTag = tag;
    this.editTagInput[tag] = tag;
  }

  saveTagEdit(oldTag: string): void {
    const newTag = this.editTagInput[oldTag]?.trim();
    if (newTag && this.isValidTag(newTag) && newTag !== oldTag) {
      this.tagRenamed.emit({ oldTag, newTag });
    }
    this.editingTag = null;
  }

  private isValidTag(tag: string): boolean {
    return tag.length > 0 && tag.length <= 15;
  }

  cancelEdit(): void {
    this.editingTag = null;
  }

  deleteTag(tag: string): void {
    if (confirm(`Delete tag "${tag}" from all goals?`)) {
      this.tagDeleted.emit(tag);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
