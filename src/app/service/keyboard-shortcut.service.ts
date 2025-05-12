import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutService {
  private subscriptions: Subscription[] = [];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Registers a shortcut with a dynamic key combination.
   * @param combo The key combination string (e.g., 'alt+q', 'meta+shift+x').
   * @param callback The function to execute when the shortcut is triggered.
   */
  
  onShortcut(combo: string, callback: () => void) {
    const keys = combo.toLowerCase().split('+');

    const sub = fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(
        filter(event => {
          return keys.every(key => this.checkKeyMatch(event, key));
        })
      )
      .subscribe(event => {
        event.preventDefault();
        callback();
      });

    this.subscriptions.push(sub);
  }

  /**
   * Helper function to check if the event matches a given key.
   */
  private checkKeyMatch(event: KeyboardEvent, key: string): boolean {
    switch (key) {
      case 'alt': return event.altKey;
      case 'meta': return event.metaKey; // Cmd on Mac, Win on Windows
      case 'ctrl': return event.ctrlKey;
      case 'shift': return event.shiftKey;
      default: return event.key.toLowerCase() === key;
    }
  }

  /**
   * Unsubscribes all registered shortcuts to prevent memory leaks.
   */
  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}
