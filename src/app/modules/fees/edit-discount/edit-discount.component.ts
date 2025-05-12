import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-edit-discount',
  templateUrl: './edit-discount.component.html',
  styleUrls: ['./edit-discount.component.scss']
})
export class EditDiscountComponent implements OnInit{
  URLConstants = URLConstants;
  selectedItems:any = [];
  Authority: any = [
    {id:1,name:"Authority 1"},
    {id:2,name:"Authority 2"},
    {id:3,name:"Authority 3"},
  ];
  ngOnInit() {
    this.selectedItems = [
    ];    
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}
