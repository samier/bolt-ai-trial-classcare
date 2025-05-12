import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'systemSettingField'
})
export class SystemSettingFieldPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    return items.filter(item =>
      item.lable.toLowerCase().includes(searchText.toLowerCase())
    );
  }

}
