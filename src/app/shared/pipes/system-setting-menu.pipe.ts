import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'systemSettingMenu'
})
export class SystemSettingMenuPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

}
