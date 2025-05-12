import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMenu'
})
export class FilterMenuPipe implements PipeTransform {

  transform(menuItems: any[], searchTerm: string): any[] {
    // If no search term , return an empty array.
    if (!searchTerm) {
      return [];
    }

    // Otherwise, proceed with the filtering logic
    const keyword = searchTerm.toLowerCase().trim();

    return menuItems
      .map(item => this.filterItem(item, keyword))
      .filter(Boolean); // Filter out null/undefined items
  }

  private filterItem(item: any, keyword: string): any {
    if (!item || !item.title || !item.show) return null; // If item doesn't have a title, skip it

    const matched = item.title.toLowerCase().includes(keyword); // Check if title matches keyword
    const filteredChildren = item.children
      ?.map((child: any) => this.filterItem(child, keyword)) // Recursively filter children
      .filter(Boolean); // Filter out empty results

    if (matched && (!item.children || item.children.length === 0)) {
      return { ...item }; // Return the item if it matches and has no children
    } else if (filteredChildren?.length) {
      return { ...item, children: filteredChildren }; // Return the item with filtered third-level children
    }

    return null;
  }



}
